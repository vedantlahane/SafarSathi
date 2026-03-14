// src/pages/user/map/Map.tsx
// Composition root — zero logic, delegates to hooks and sub-components.
import { useEffect, useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";

import { fetchRealTimeSafety } from "@/lib/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useMapData } from "./hooks/use-map-data";
import { useMapNavigation } from "./hooks/use-map-navigation";
import { useNavigation } from "./hooks/use-navigation";
import { TILE_URLS, TILE_ATTRIBUTIONS } from "./constants";
import type { RiskZone } from "./types";

import { MapView } from "./components/map-view";
import { MapOverlays } from "./components/map-overlays";
import { LayersSheet } from "./components/layers-sheet";
import { ZoneDialog } from "./components/zone-dialog";

const AI_RISK_ALERT_THRESHOLD = 0.75;
const AI_CHECK_INTERVAL_MS = 12_000;
const AI_CHECK_MOVE_METERS = 35;

type LocationPoint = {
  lat: number;
  lon: number;
};

function haversineMeters(a: LocationPoint, b: LocationPoint): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusMeters = 6371000;
  const latDelta = toRad(b.lat - a.lat);
  const lonDelta = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(lonDelta / 2) ** 2;

  return 2 * earthRadiusMeters * Math.asin(Math.sqrt(h));
}

const Map = () => {
  const data = useMapData();
  const nav = useMapNavigation(data.userPosition, data.zones, data.stations);
  const navigation = useNavigation(data.userPosition, nav.destination, nav.routeInfo);
  const [layersOpen, setLayersOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<RiskZone | null>(null);
  const [showHighRiskAlert, setShowHighRiskAlert] = useState(false);
  const [highRiskScore, setHighRiskScore] = useState<number | null>(null);

  const lastAiCheckRef = useRef<{
    at: number;
    location: LocationPoint;
    score: number | null;
  } | null>(null);
  const alertTimeoutRef = useRef<number | null>(null);

  const tileUrl = data.isDarkMode ? TILE_URLS.dark : TILE_URLS.light;
  const tileAttr = data.isDarkMode ? TILE_ATTRIBUTIONS.dark : TILE_ATTRIBUTIONS.light;

  useEffect(() => {
    return () => {
      if (alertTimeoutRef.current !== null) {
        window.clearTimeout(alertTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!data.userPosition) {
      return;
    }

    const [lat, lon] = data.userPosition;
    const currentLocation: LocationPoint = { lat, lon };
    const lastCheck = lastAiCheckRef.current;

    if (lastCheck) {
      const elapsed = Date.now() - lastCheck.at;
      const movedMeters = haversineMeters(lastCheck.location, currentLocation);
      if (elapsed < AI_CHECK_INTERVAL_MS && movedMeters < AI_CHECK_MOVE_METERS) {
        return;
      }
    }

    lastAiCheckRef.current = {
      at: Date.now(),
      location: currentLocation,
      score: lastCheck?.score ?? null,
    };

    let cancelled = false;

    void (async () => {
      const result = await fetchRealTimeSafety(lat, lon);
      if (cancelled) {
        return;
      }

      const score = Math.max(0, Math.min(1, result.dangerScore ?? 0));
      const previousScore = lastAiCheckRef.current?.score ?? null;

      lastAiCheckRef.current = {
        at: Date.now(),
        location: currentLocation,
        score,
      };

      if (score > AI_RISK_ALERT_THRESHOLD && (previousScore === null || previousScore <= AI_RISK_ALERT_THRESHOLD)) {
        setHighRiskScore(score);
        setShowHighRiskAlert(true);

        if (alertTimeoutRef.current !== null) {
          window.clearTimeout(alertTimeoutRef.current);
        }

        alertTimeoutRef.current = window.setTimeout(() => {
          setShowHighRiskAlert(false);
        }, 8000);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [data.userPosition]);

  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="flex-1 relative">
        {showHighRiskAlert && (
          <div className="pointer-events-none absolute top-20 left-4 right-4 z-1002 animate-in fade-in slide-in-from-top-2 duration-300">
            <Alert className="border-red-200 bg-red-50/95 shadow-xl backdrop-blur-sm">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-700">AI High-Risk Zone Alert</AlertTitle>
              <AlertDescription className="text-red-700/90">
                <p>High-Risk Zone detected via AI history. Stay vigilant.</p>
                {highRiskScore !== null && (
                  <p className="text-xs">AI danger score: {Math.round(highRiskScore * 100)}%</p>
                )}
              </AlertDescription>
            </Alert>
          </div>
        )}

        <MapView
          tileUrl={tileUrl}
          tileAttr={tileAttr}
          data={data}
          nav={nav}
          onZoneClick={setSelectedZone}
          onLayersOpen={() => setLayersOpen(true)}
        />
        <MapOverlays
          isOnline={data.isOnline}
          routeInfo={nav.routeInfo}
          showRoutes={data.showLayers.routes}
          destination={nav.destination}
          nearestStation={data.nearestStation}
          nearestHospital={data.nearestHospital}
          onClearDestination={nav.clearDestination}
          navigation={{
            active: navigation.active,
            distanceRemaining: navigation.distanceRemaining,
            etaMinutes: navigation.etaMinutes,
            safetyScore: navigation.safest?.safetyScore ?? null,
            isDeviation: navigation.isDeviation,
            hasArrived: navigation.hasArrived,
            dismissArrival: navigation.dismissArrival,
            acknowledgeDeviation: navigation.acknowledgeDeviation,
          }}
          onRecalculateRoutes={nav.recalculateRoutes}
        />
      </div>

      <LayersSheet
        open={layersOpen}
        onOpenChange={setLayersOpen}
        userInZone={data.userInZone}
        zoneName={data.currentZoneName}
        riskFilter={data.riskFilter}
        setRiskFilter={data.setRiskFilter}
        showLayers={data.showLayers}
        setShowLayers={data.setShowLayers}
        zoneCount={data.zones.length}
        stationCount={data.stations.length}
        hospitalCount={data.hospitals.length}
        isDarkMode={data.isDarkMode}
      />

      <ZoneDialog
        zone={selectedZone}
        onClose={() => setSelectedZone(null)}
        onFlyTo={(p) => data.setFlyTo(p)}
        userPosition={data.userPosition}
        nearestStation={data.nearestStation}
        nearestHospital={data.nearestHospital}
      />
    </div>
  );
};

export default Map;