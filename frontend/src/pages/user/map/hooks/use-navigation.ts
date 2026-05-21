import { useCallback, useEffect, useMemo, useState } from "react";
import { haversineMeters } from "@/lib/geo";
import type { Destination, RouteInfo, SafeRoute } from "../types";

const DEVIATION_THRESHOLD_M = 60;
const ARRIVAL_THRESHOLD_M = 30;

function getClosestDistance(route: SafeRoute, position: [number, number]): number {
  return route.coordinates.reduce((min, point) => {
    const dist = haversineMeters(
      { lat: position[0], lon: position[1] },
      { lat: point[0], lon: point[1] }
    );
    return Math.min(min, dist);
  }, Number.POSITIVE_INFINITY);
}

export function useNavigation(
  userPosition: [number, number] | null,
  destination: Destination | null,
  routeInfo: RouteInfo
) {
  const [navigationActive, setNavigationActive] = useState(false);
  const [isDeviation, setIsDeviation] = useState(false);
  const [hasArrived, setHasArrived] = useState(false);

  const safest = routeInfo.safest ?? null;

  // Reset navigation state when destination is cleared
  useEffect(() => {
    if (!destination) {
      setNavigationActive(false);
    }
  }, [destination]);

  const startNavigation = useCallback(() => {
    if (userPosition && destination && safest) {
      setNavigationActive(true);
    }
  }, [userPosition, destination, safest]);

  const stopNavigation = useCallback(() => {
    setNavigationActive(false);
  }, []);

  const distanceRemaining = useMemo(() => {
    if (!userPosition || !destination || !safest) return null;
    return safest.distanceMeters;
  }, [userPosition, destination, safest]);

  const etaMinutes = useMemo(() => {
    if (!safest) return null;
    return Math.round(safest.durationSeconds / 60);
  }, [safest]);

  const active = navigationActive && Boolean(userPosition && destination && safest && !routeInfo.loading);

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
    const distance = haversineMeters(
      { lat: userPosition[0], lon: userPosition[1] },
      { lat: destination.lat, lon: destination.lng }
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
    startNavigation,
    stopNavigation,
  };
}
