// src/pages/user/map/components/map-view.tsx
import { Suspense, useRef, useEffect } from "react";
import Map, { Source, Layer, NavigationControl, GeolocateControl, ScaleControl } from "react-map-gl/mapbox";
import type { MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAP_DEFAULTS } from "../constants";
import { Navigation } from "lucide-react";
import { hapticFeedback } from "@/lib/store";
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
import { ZoneOverlay } from "./zone-overlay";
import { StationMarkers } from "./station-markers";
import { HospitalMarkers } from "./hospital-markers";
import { UserMarker } from "./user-marker";
import { DestinationMarker } from "./destination-marker";
import { RouteLines } from "./route-lines";
import { MapLoading } from "./map-loading";
import { TouristPOIMarkers } from "./tourist-poi-markers";
import { IsochroneOverlay } from "./isochrone-overlay";
import type { TouristPOI } from "@/lib/api/public";

interface MapViewProps {
    /** Computed tile URL (light/dark). */
    tileUrl: string;
    /** Mapbox Native configuration settings */
    mapboxConfig: {
        show3dBuildings: boolean;
        showPointOfInterestLabels: boolean;
        showTransitLabels: boolean;
        lightPreset: "dawn" | "day" | "dusk" | "night";
    };
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
    mapboxConfig,
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
                map.setConfigProperty('basemap', 'lightPreset', mapboxConfig.lightPreset);
                map.setConfigProperty('basemap', 'show3dObjects', mapboxConfig.show3dBuildings);
                map.setConfigProperty('basemap', 'showPointOfInterestLabels', mapboxConfig.showPointOfInterestLabels);
                map.setConfigProperty('basemap', 'showTransitLabels', mapboxConfig.showTransitLabels);
                map.setConfigProperty('basemap', 'theme', 'faded');
                map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
            } catch (e) {
                console.warn("Failed to set mapbox standard config:", e);
            }
        };
        
        // Map might already be loaded or we wait for style.load
        if (map.isStyleLoaded()) {
            setStandardConfig();
        } else {
            map.once('style.load', setStandardConfig);
        }
    }, [mapboxConfig]);

    return (
        <Suspense fallback={<MapLoading />}>
            <Map
                ref={mapRef}
                initialViewState={{
                    longitude: data.position[1],
                    latitude: data.position[0],
                    zoom: MAP_DEFAULTS.zoom,
                    pitch: MAP_DEFAULTS.pitch,
                    bearing: MAP_DEFAULTS.bearing,
                }}
                minZoom={MAP_DEFAULTS.minZoom}
                maxZoom={MAP_DEFAULTS.maxZoom}
                maxBounds={MAP_DEFAULTS.maxBounds}
                mapStyle="mapbox://styles/mapbox/standard"
                mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
                style={{ width: "100%", height: "100%" }}
                padding={{ top: 130, bottom: 180, left: 10, right: 60 }}
                attributionControl={true}
                pitchWithRotate={true}
                dragRotate={true}
                touchPitch={true}
                touchZoomRotate={true}
                maxPitch={85}
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

                {/* ── Native Mapbox Controls ── */}
                <NavigationControl position="bottom-right" showCompass={false} showZoom={true} />
                <GeolocateControl 
                    position="bottom-right" 
                    trackUserLocation={true} 
                    showAccuracyCircle={true} 
                    showUserLocation={false} 
                />
                <ScaleControl position="bottom-left" />

                {/* ── Custom 3D & North Controls ── */}
                <div className="absolute right-[10px] bottom-[280px] flex flex-col gap-2 z-10">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            const map = mapRef.current?.getMap();
                            if (map) {
                                map.flyTo({ bearing: 0, duration: 800 }); // Only reset bearing
                                hapticFeedback("light");
                            }
                        }}
                        className="w-[29px] h-[29px] bg-white rounded-md shadow-[0_0_0_2px_rgba(0,0,0,0.1)] flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors"
                        title="Reset North"
                    >
                        <Navigation className="h-4 w-4" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            const map = mapRef.current?.getMap();
                            if (map) {
                                const is3D = map.getPitch() > 30;
                                map.flyTo({ pitch: is3D ? 0 : 65, duration: 800 });
                                hapticFeedback("light");
                            }
                        }}
                        className="w-[29px] h-[29px] bg-white rounded-md shadow-[0_0_0_2px_rgba(0,0,0,0.1)] flex items-center justify-center font-bold text-[11px] text-slate-700 hover:bg-slate-50 transition-colors"
                        title="Toggle 3D"
                    >
                        3D
                    </button>
                </div>

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

                <ZoneOverlay zones={data.zones} onZoneClick={onZoneClick} />
                <IsochroneOverlay userPosition={data.userPosition} userInZone={data.userInZone} />
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
