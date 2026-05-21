// src/pages/user/map/Map.tsx
// Composition root — zero logic, delegates to hooks and sub-components.
import { useEffect, useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useMapData } from "./hooks/use-map-data";
import { useMapNavigation } from "./hooks/use-map-navigation";
import { useNavigation } from "./hooks/use-navigation";
import type { RiskZone, MapboxConfig } from "./types";
import { MapView } from "./components/map-view";
import { MapOverlays } from "./components/map-overlays";
import { LayersSheet } from "./components/layers-sheet";
import { ZoneDialog } from "./components/zone-dialog";

import { fetchRealTimeSafety } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

const Map = () => {
  const data = useMapData();
  const nav = useMapNavigation(data.userPosition, data.zones, data.stations);
  const navigation = useNavigation(data.userPosition, nav.destination, nav.routeInfo);
  const [layersOpen, setLayersOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<RiskZone | null>(null);
  const [showHighRiskAlert, setShowHighRiskAlert] = useState(false);
  const [highRiskScore, setHighRiskScore] = useState<number | null>(null);

  const [mapboxConfig, setMapboxConfig] = useState<MapboxConfig>({
    show3dBuildings: true,
    showPointOfInterestLabels: true,
    showTransitLabels: true,
    lightPreset: data.isDarkMode ? "night" : "day",
  });

  // Sync preset if system dark mode changes, only if we haven't manually overriden to dusk/dawn maybe?
  // Let's just rely on initial state and manual overrides for now.
  const alertTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (alertTimeoutRef.current !== null) {
        window.clearTimeout(alertTimeoutRef.current);
      }
    };
  }, []);

  const { data: realTimeSafety } = useQuery({
    queryKey: ["realtimeSafety", data.userPosition?.[0], data.userPosition?.[1]],
    queryFn: () => fetchRealTimeSafety(data.userPosition![0], data.userPosition![1]),
    enabled: !!data.userPosition,
  });

  useEffect(() => {
    if (realTimeSafety?.dangerScore) {
      const score = Math.max(0, Math.min(1, realTimeSafety.dangerScore));
      
      if (score > 0.75 && (highRiskScore === null || highRiskScore <= 0.75)) {
        setHighRiskScore(score);
        setShowHighRiskAlert(true);

        if (alertTimeoutRef.current !== null) {
          window.clearTimeout(alertTimeoutRef.current);
        }

        alertTimeoutRef.current = window.setTimeout(() => {
          setShowHighRiskAlert(false);
        }, 8000);
      } else if (score <= 0.75) {
        setHighRiskScore(score);
      }
    }
  }, [realTimeSafety, highRiskScore]);

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
                  <p className="text-xs">AI safety score: {Math.max(0, 100 - Math.round(highRiskScore * 100))}/100</p>
                )}
              </AlertDescription>
            </Alert>
          </div>
        )}

        <MapView
          data={data}
          mapboxConfig={mapboxConfig}
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
            startNavigation: navigation.startNavigation,
            stopNavigation: navigation.stopNavigation,
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
        poiCount={data.pois.length}
        isDarkMode={data.isDarkMode}
        mapboxConfig={mapboxConfig}
        setMapboxConfig={setMapboxConfig}
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