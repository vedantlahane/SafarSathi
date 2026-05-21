// src/pages/user/map/components/map-overlays.tsx
import { memo, useState, useEffect } from "react";
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
        startNavigation: () => void;
        stopNavigation: () => void;
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
    const [dismissedStationId, setDismissedStationId] = useState<string | number | null>(null);
    const [dismissedHospitalId, setDismissedHospitalId] = useState<string | number | null>(null);

    // Reset dismissed state when the closest station/hospital changes
    useEffect(() => {
        setDismissedStationId(null);
    }, [nearestStation?.id]);

    useEffect(() => {
        setDismissedHospitalId(null);
    }, [nearestHospital?.id]);

    const isStationVisible = nearestStation && nearestStation.id !== dismissedStationId;
    const isHospitalVisible = nearestHospital && nearestHospital.id !== dismissedHospitalId;

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
                onExit={navigation.stopNavigation}
            />

            <RouteDeviationAlert
                visible={navigation.isDeviation}
                onRecalculate={onRecalculateRoutes}
                onDismiss={navigation.acknowledgeDeviation}
            />

            {!navigation.active && (
                <>
                    {destination ? (
                        <DestinationBar
                            destination={destination}
                            routeInfo={routeInfo}
                            onClear={onClearDestination}
                            onStartNavigation={navigation.startNavigation}
                        />
                    ) : (
                        <>
                            {isStationVisible && (
                                <NearestStationBar
                                    station={nearestStation}
                                    onDismiss={() => setDismissedStationId(nearestStation.id)}
                                    className="bottom-[100px]"
                                />
                            )}

                            {isHospitalVisible && (
                                <NearestHospitalBar
                                    hospital={nearestHospital}
                                    onDismiss={() => setDismissedHospitalId(nearestHospital.id)}
                                    className={isStationVisible ? "bottom-[176px]" : "bottom-[100px]"}
                                />
                            )}
                        </>
                    )}
                </>
            )}
        </>
    );
}

export const MapOverlays = memo(MapOverlaysInner);
