// src/pages/user/map/components/map-view.tsx
import { Suspense } from "react";
import Map from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

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
import { TouristPOIMarkers } from "./tourist-poi-markers";
import type { TouristPOI } from "@/lib/api/public";

interface MapViewProps {
    /** Computed tile URL (light/dark). */
    tileUrl: string;
    /** Map data from useMapData. */
    data: {
        position: [number, number];
        flyTo: [number, number] | null;
        zones: RiskZone[];
        stations: PoliceStation[];
        hospitals: Hospital[];
        pois: TouristPOI[];
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
    data,
    nav,
    onZoneClick,
    onLayersOpen,
}: Omit<MapViewProps, "tileAttr">) {
    return (
        <Suspense fallback={<MapLoading />}>
            <Map
                initialViewState={{
                    longitude: data.position[1],
                    latitude: data.position[0],
                    zoom: MAP_DEFAULTS.zoom,
                }}
                minZoom={MAP_DEFAULTS.minZoom}
                maxZoom={MAP_DEFAULTS.maxZoom}
                maxBounds={MAP_DEFAULTS.maxBounds}
                mapStyle={tileUrl}
                mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
                style={{ width: "100%", height: "100%" }}
                attributionControl={true}
                pitchWithRotate={true}
                dragRotate={true}
                interactiveLayerIds={["zones-fill"]}
                onClick={(e: any) => {
                    const feature = e.features?.[0];
                    if (feature && feature.properties?.id) {
                        const zone = data.zones.find((z) => z.id === feature.properties!.id);
                        if (zone) {
                            onZoneClick(zone);
                            return;
                        }
                    }
                    
                    // Tap-to-Route: If no interactive feature was clicked, set a destination pin
                    if (e.lngLat) {
                        const { lng, lat } = e.lngLat;
                        nav.handleSelectDestination("Dropped Pin", lat, lng);
                    }
                }}
            >
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
                <TouristPOIMarkers pois={data.pois} />
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
            </Map>
        </Suspense>
    );
}
