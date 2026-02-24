// src/pages/user/map/Map.tsx
// Composition root — zero logic, delegates to hooks and sub-components.
import { useState } from "react";

import { useMapData } from "./hooks/use-map-data";
import { useMapNavigation } from "./hooks/use-map-navigation";
import { useNavigation } from "./hooks/use-navigation";
import { TILE_URLS, TILE_ATTRIBUTIONS } from "./constants";
import type { RiskZone } from "./types";

import { MapView } from "./components/map-view";
import { MapOverlays } from "./components/map-overlays";
import { LayersSheet } from "./components/layers-sheet";
import { ZoneDialog } from "./components/zone-dialog";

const Map = () => {
  const data = useMapData();
  const nav = useMapNavigation(data.userPosition, data.zones, data.stations);
  const navigation = useNavigation(data.userPosition, nav.destination, nav.routeInfo);
  const [layersOpen, setLayersOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<RiskZone | null>(null);

  const tileUrl = data.isDarkMode ? TILE_URLS.dark : TILE_URLS.light;
  const tileAttr = data.isDarkMode ? TILE_ATTRIBUTIONS.dark : TILE_ATTRIBUTIONS.light;

  return (
    <div className="fixed inset-0 flex flex-col">
      <div className="flex-1 relative">
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
      />
    </div>
  );
};

export default Map;