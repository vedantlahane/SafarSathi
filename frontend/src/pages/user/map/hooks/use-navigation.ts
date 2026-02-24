import { useCallback, useEffect, useMemo, useState } from "react";
import L from "leaflet";
import { WALKING_SPEED_MS } from "../constants";
import type { Destination, RouteInfo, SafeRoute } from "../types";

const DEVIATION_THRESHOLD_M = 60;
const ARRIVAL_THRESHOLD_M = 30;

function getClosestDistance(route: SafeRoute, position: [number, number]): number {
  return route.coordinates.reduce((min, point) => {
    const dist = L.latLng(position).distanceTo(L.latLng(point));
    return Math.min(min, dist);
  }, Number.POSITIVE_INFINITY);
}

export function useNavigation(
  userPosition: [number, number] | null,
  destination: Destination | null,
  routeInfo: RouteInfo
) {
  const [isDeviation, setIsDeviation] = useState(false);
  const [hasArrived, setHasArrived] = useState(false);

  const safest = routeInfo.safest ?? null;

  const distanceRemaining = useMemo(() => {
    if (!userPosition || !destination) return null;
    return L.latLng(userPosition).distanceTo(
      L.latLng(destination.lat, destination.lng)
    );
  }, [userPosition, destination]);

  const etaMinutes = useMemo(() => {
    if (distanceRemaining === null) return null;
    return Math.max(1, Math.round(distanceRemaining / WALKING_SPEED_MS / 60));
  }, [distanceRemaining]);

  const active = Boolean(userPosition && destination && safest && !routeInfo.loading);

  useEffect(() => {
    if (!active || !userPosition || !safest) {
      setIsDeviation(false);
      return;
    }
    const distanceToRoute = getClosestDistance(safest, userPosition);
    setIsDeviation(distanceToRoute > DEVIATION_THRESHOLD_M);
  }, [active, userPosition, safest]);

  useEffect(() => {
    if (!userPosition || !destination) {
      setHasArrived(false);
      return;
    }
    const distance = L.latLng(userPosition).distanceTo(
      L.latLng(destination.lat, destination.lng)
    );
    if (distance <= ARRIVAL_THRESHOLD_M) {
      setHasArrived(true);
    }
  }, [userPosition, destination]);

  const dismissArrival = useCallback(() => {
    setHasArrived(false);
  }, []);

  const acknowledgeDeviation = useCallback(() => {
    setIsDeviation(false);
  }, []);

  return {
    active,
    safest,
    distanceRemaining,
    etaMinutes,
    isDeviation,
    hasArrived,
    dismissArrival,
    acknowledgeDeviation,
  };
}
