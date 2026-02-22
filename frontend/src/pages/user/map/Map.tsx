// src/pages/user/map/Map.tsx
import { useState, Suspense } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { useMapData } from "./hooks/use-map-data";
import { useMapNavigation } from "./hooks/use-map-navigation";
import { MAP_DEFAULTS, TILE_URLS, TILE_ATTRIBUTIONS } from "./constants";
import type { RiskZone } from "./types";

import { FlyToLocation } from "./components/fly-to-location";
import { SearchControl } from "./components/search-control";
import { StatsPill } from "./components/stats-pill";
import { MapControls } from "./components/map-controls";
import { ZoneOverlay } from "./components/zone-overlay";
import { StationMarkers } from "./components/station-markers";
import { HospitalMarkers } from "./components/hospital-markers";
import { UserMarker } from "./components/user-marker";
import { DestinationMarker } from "./components/destination-marker";
import { RouteLines } from "./components/route-lines";
import { RouteInfoPanel } from "./components/route-info-panel";
import { DestinationBar, NearestStationBar, NearestHospitalBar } from "./components/bottom-cards";
import { LayersSheet } from "./components/layers-sheet";
import { ZoneDialog } from "./components/zone-dialog";
import { OfflineMapBanner } from "./components/offline-map-banner";
import { MapLoading } from "./components/map-loading";

const Map = () => {
  const data = useMapData();
  const nav = useMapNavigation(data.userPosition, data.zones, data.stations);
  const [layersOpen, setLayersOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<RiskZone | null>(null);

  const tileUrl = data.isDarkMode ? TILE_URLS.dark : TILE_URLS.light;
  const tileAttr = data.isDarkMode ? TILE_ATTRIBUTIONS.dark : TILE_ATTRIBUTIONS.light;

  return (
    <div className="fixed inset-0 flex flex-col">
      <Suspense fallback={<MapLoading />}>
        <div className="flex-1 relative">
          <MapContainer
            center={data.position}
            zoom={MAP_DEFAULTS.zoom}
            minZoom={MAP_DEFAULTS.minZoom}
            maxZoom={MAP_DEFAULTS.maxZoom}
            scrollWheelZoom
            zoomControl={false}
            style={{ height: "100%", width: "100%" }}
            className="z-0"
          >
            <TileLayer attribution={tileAttr} url={tileUrl} />
            <FlyToLocation position={data.flyTo} zoom={16} />
            <SearchControl onSelectDestination={nav.handleSelectDestination} />
            <StatsPill
              zones={data.zones.length}
              stations={data.stations.length}
              hospitals={data.hospitals.length}
              userInZone={data.userInZone}
              zoneName={data.currentZoneName}
              onPress={() => setLayersOpen(true)}
            />
            <MapControls
              onLocate={data.handleLocate}
              locating={data.locating}
              bearing={data.bearing}
              onResetBearing={data.resetBearing}
            />

            <ZoneOverlay zones={data.zones} onZoneClick={setSelectedZone} />
            <StationMarkers stations={data.stations} />
            <HospitalMarkers hospitals={data.hospitals} />
            <RouteLines
              routes={nav.routeInfo.routes}
              visible={data.showLayers.routes}
            />

            {data.userPosition && (
              <UserMarker
                position={data.userPosition}
                accuracy={data.accuracy}
                heading={data.heading}
                speed={data.speed}
              />
            )}

            {nav.destination && (
              <DestinationMarker
                destination={nav.destination}
                onClear={nav.clearDestination}
              />
            )}
          </MapContainer>

          {/* Overlay panels */}
          <OfflineMapBanner isOnline={data.isOnline} />

          <RouteInfoPanel
            routeInfo={nav.routeInfo}
            visible={data.showLayers.routes && !!nav.destination}
          />

          {nav.destination ? (
            <DestinationBar
              destination={nav.destination}
              routeInfo={nav.routeInfo}
              onClear={nav.clearDestination}
            />
          ) : (
            data.nearestStation && (
              <NearestStationBar station={data.nearestStation} />
            )
          )}

          {!nav.destination && data.nearestHospital && (
            <NearestHospitalBar hospital={data.nearestHospital} />
          )}
        </div>
      </Suspense>

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