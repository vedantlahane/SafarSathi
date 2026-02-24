// src/pages/user/map/components/map-overlays.tsx
import { memo } from "react";
import { OfflineMapBanner } from "./offline-map-banner";
import { RouteInfoPanel } from "./route-info-panel";
import {
    DestinationBar,
    NearestStationBar,
    NearestHospitalBar,
} from "./bottom-cards";
import { NavigationHeader } from "./navigation-header";
import { RouteDeviationAlert } from "./route-deviation-alert";

interface MapOverlaysProps {
    isOnline: boolean;
    routeInfo: any;
    showRoutes: boolean;
    destination: any;
    nearestStation: any;
    nearestHospital: any;
    onClearDestination: () => void;
    navigation: {
        active: boolean;
        distanceRemaining: number | null;
        etaMinutes: number | null;
        safetyScore: number | null;
        isDeviation: boolean;
        hasArrived: boolean;
        dismissArrival: () => void;
        acknowledgeDeviation: () => void;
    };
    onRecalculateRoutes: () => void;
}

function MapOverlaysInner({
    isOnline,
    routeInfo,
    showRoutes,
    destination,
    nearestStation,
    nearestHospital,
    onClearDestination,
    navigation,
    onRecalculateRoutes,
}: MapOverlaysProps) {
    return (
        <>
            <OfflineMapBanner isOnline={isOnline} />

            <RouteInfoPanel
                routeInfo={routeInfo}
                visible={showRoutes && !!destination && !navigation.active}
            />

            <NavigationHeader
                visible={navigation.active}
                distanceRemaining={navigation.distanceRemaining}
                etaMinutes={navigation.etaMinutes}
                safetyScore={navigation.safetyScore}
                arrived={navigation.hasArrived}
                onDismissArrival={navigation.dismissArrival}
            />

            <RouteDeviationAlert
                visible={navigation.isDeviation}
                onRecalculate={onRecalculateRoutes}
                onDismiss={navigation.acknowledgeDeviation}
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
