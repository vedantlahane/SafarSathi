// src/pages/user/map/components/map-view.tsx
import { Suspense } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { MAP_DEFAULTS } from "../constants";
import type {
    Destination,
    Hospital,
    LayerVisibility,
    PoliceStation,
    RiskZone,
    RouteInfo,
} from "../types";

import { FlyToLocation } from "./fly-to-location";
import { SearchControl } from "./search-control";
import { StatsPill } from "./stats-pill";
import { MapControls } from "./map-controls";
import { ZoneOverlay } from "./zone-overlay";
import { StationMarkers } from "./station-markers";
import { HospitalMarkers } from "./hospital-markers";
import { UserMarker } from "./user-marker";
import { DestinationMarker } from "./destination-marker";
import { RouteLines } from "./route-lines";
import { MapLoading } from "./map-loading";

interface MapViewProps {
    /** Computed tile URL (light/dark). */
    tileUrl: string;
    /** Computed tile attribution. */
    tileAttr: string;
    /** Map data from useMapData. */
    data: {
        position: [number, number];
        flyTo: [number, number] | null;
        zones: RiskZone[];
        stations: PoliceStation[];
        hospitals: Hospital[];
        userPosition: [number, number] | null;
        accuracy: number | null;
        heading: number | null;
        speed: number | null;
        userInZone: boolean;
        currentZoneName: string | null;
        showLayers: LayerVisibility;
        handleLocate: () => void;
        locating: boolean;
        bearing: number;
        resetBearing: () => void;
    };
    /** Navigation state from useMapNavigation. */
    nav: {
        destination: Destination | null;
        routeInfo: RouteInfo;
        handleSelectDestination: (name: string, lat: number, lng: number) => void;
        clearDestination: () => void;
    };
    onZoneClick: (zone: RiskZone) => void;
    onLayersOpen: () => void;
}

export function MapView({
    tileUrl,
    tileAttr,
    data,
    nav,
    onZoneClick,
    onLayersOpen,
}: MapViewProps) {
    return (
        <Suspense fallback={<MapLoading />}>
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
                <SearchControl
                    onSelectDestination={nav.handleSelectDestination}
                />
                <StatsPill
                    zones={data.zones.length}
                    stations={data.stations.length}
                    hospitals={data.hospitals.length}
                    userInZone={data.userInZone}
                    zoneName={data.currentZoneName}
                    onPress={onLayersOpen}
                />
                <MapControls
                    onLocate={data.handleLocate}
                    locating={data.locating}
                    bearing={data.bearing}
                    onResetBearing={data.resetBearing}
                />

                <ZoneOverlay zones={data.zones} onZoneClick={onZoneClick} />
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
        </Suspense>
    );
}
