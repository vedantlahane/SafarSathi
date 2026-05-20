// src/pages/user/map/components/map-view.tsx
import { Suspense, useRef, useEffect } from "react";
import Map, { Source, Layer } from "react-map-gl/mapbox";
import type { MapRef } from "react-map-gl/mapbox";
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
    data,
    nav,
    onZoneClick,
    onLayersOpen,
}: Omit<MapViewProps, "tileAttr" | "tileUrl">) {
    const mapRef = useRef<MapRef>(null);

    useEffect(() => {
        const map = mapRef.current?.getMap();
        if (!map) return;
        
        const setStandardConfig = () => {
            try {
                map.setConfigProperty('basemap', 'lightPreset', 'dusk');
                map.setConfigProperty('basemap', 'theme', 'faded');
            } catch (e) {
                // ignore
            }
        };
        
        map.on('style.load', setStandardConfig);
        return () => {
            map.off('style.load', setStandardConfig);
        };
    }, []);

    return (
        <Suspense fallback={<MapLoading />}>
            <Map
                ref={mapRef}
                initialViewState={{
                    longitude: data.position[1],
                    latitude: data.position[0],
                    zoom: MAP_DEFAULTS.zoom,
                }}
                minZoom={MAP_DEFAULTS.minZoom}
                maxZoom={MAP_DEFAULTS.maxZoom}
                maxBounds={MAP_DEFAULTS.maxBounds}
                mapStyle="mapbox://styles/mapbox/standard"
                mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
                style={{ width: "100%", height: "100%" }}
                terrain={{ source: 'mapbox-dem', exaggeration: 1.5 }}
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

                {/* ── 3D Terrain & Sky ── */}
                <Source
                    id="mapbox-dem"
                    type="raster-dem"
                    url="mapbox://mapbox.mapbox-terrain-dem-v1"
                    tileSize={512}
                    maxzoom={14}
                />
                <Layer
                    id="sky"
                    type="sky"
                    paint={{
                        "sky-type": "atmosphere",
                        "sky-atmosphere-sun": [0.0, 0.0],
                        "sky-atmosphere-sun-intensity": 15
                    }}
                />

                {/* ── 3D Buildings ── */}
                <Layer
                    id="3d-buildings"
                    source="composite"
                    source-layer="building"
                    filter={["==", "extrude", "true"]}
                    type="fill-extrusion"
                    minzoom={15}
                    paint={{
                        "fill-extrusion-color": "#aaa",
                        "fill-extrusion-height": [
                            "interpolate",
                            ["linear"],
                            ["zoom"],
                            15,
                            0,
                            15.05,
                            ["get", "height"]
                        ],
                        "fill-extrusion-base": [
                            "interpolate",
                            ["linear"],
                            ["zoom"],
                            15,
                            0,
                            15.05,
                            ["get", "min_height"]
                        ],
                        "fill-extrusion-opacity": 0.6
                    }}
                />

                {/* ── Traffic Layer ── */}
                <Source id="traffic" type="vector" url="mapbox://mapbox.mapbox-traffic-v1">
                    <Layer
                        id="traffic-line"
                        type="line"
                        source-layer="traffic"
                        paint={{
                            "line-width": 2,
                            "line-color": [
                                "match",
                                ["get", "congestion"],
                                "low", "#10b981",
                                "moderate", "#f59e0b",
                                "heavy", "#ef4444",
                                "severe", "#7f1d1d",
                                "transparent"
                            ],
                            "line-opacity": 0.75
                        }}
                    />
                </Source>

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
