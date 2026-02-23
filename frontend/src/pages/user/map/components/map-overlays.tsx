// src/pages/user/map/components/map-overlays.tsx
import { memo } from "react";
import { OfflineMapBanner } from "./offline-map-banner";
import { RouteInfoPanel } from "./route-info-panel";
import {
    DestinationBar,
    NearestStationBar,
    NearestHospitalBar,
} from "./bottom-cards";

interface MapOverlaysProps {
    isOnline: boolean;
    routeInfo: any;
    showRoutes: boolean;
    destination: any;
    nearestStation: any;
    nearestHospital: any;
    onClearDestination: () => void;
}

function MapOverlaysInner({
    isOnline,
    routeInfo,
    showRoutes,
    destination,
    nearestStation,
    nearestHospital,
    onClearDestination,
}: MapOverlaysProps) {
    return (
        <>
            <OfflineMapBanner isOnline={isOnline} />

            <RouteInfoPanel
                routeInfo={routeInfo}
                visible={showRoutes && !!destination}
            />

            {destination ? (
                <DestinationBar
                    destination={destination}
                    routeInfo={routeInfo}
                    onClear={onClearDestination}
                />
            ) : (
                nearestStation && <NearestStationBar station={nearestStation} />
            )}

            {!destination && nearestHospital && (
                <NearestHospitalBar hospital={nearestHospital} />
            )}
        </>
    );
}

export const MapOverlays = memo(MapOverlaysInner);
