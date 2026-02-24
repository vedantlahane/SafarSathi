// src/pages/user/map/hooks/use-map-navigation.ts
import { useState, useCallback, useMemo } from "react";
import L from "leaflet";
import { hapticFeedback } from "@/lib/store";
import {
  SAFE_ROUTE_WEIGHTS,
  ROUTE_INTERPOLATION_STEPS,
  POLICE_PROXIMITY_RADIUS_M,
} from "../constants";
import {
  type Destination,
  type RiskZone,
  type PoliceStation,
  type SafeRoute,
  type RouteInfo,
} from "../types";

function interpolateRoute(
  start: [number, number],
  end: [number, number],
  steps: number
): [number, number][] {
  const points: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    points.push([
      start[0] + (end[0] - start[0]) * t,
      start[1] + (end[1] - start[1]) * t,
    ]);
  }
  return points;
}

function generateAlternativeRoutes(
  start: [number, number],
  end: [number, number]
): [number, number][][] {
  const midLat = (start[0] + end[0]) / 2;
  const midLng = (start[1] + end[1]) / 2;
  const dLat = Math.abs(end[0] - start[0]);
  const dLng = Math.abs(end[1] - start[1]);
  const offset = Math.max(dLat, dLng) * 0.15;

  const directRoute = interpolateRoute(start, end, ROUTE_INTERPOLATION_STEPS);

  const northRoute = [
    ...interpolateRoute(
      start,
      [midLat + offset, midLng - offset * 0.5],
      Math.floor(ROUTE_INTERPOLATION_STEPS / 2)
    ),
    ...interpolateRoute(
      [midLat + offset, midLng - offset * 0.5],
      end,
      Math.floor(ROUTE_INTERPOLATION_STEPS / 2)
    ),
  ];

  const southRoute = [
    ...interpolateRoute(
      start,
      [midLat - offset, midLng + offset * 0.5],
      Math.floor(ROUTE_INTERPOLATION_STEPS / 2)
    ),
    ...interpolateRoute(
      [midLat - offset, midLng + offset * 0.5],
      end,
      Math.floor(ROUTE_INTERPOLATION_STEPS / 2)
    ),
  ];

  return [directRoute, northRoute, southRoute];
}

function scoreRoute(
  coordinates: [number, number][],
  zones: RiskZone[],
  stations: PoliceStation[]
): {
  score: number;
  intersections: { high: number; medium: number; low: number };
  policeNearby: number;
} {
  const intersections = { high: 0, medium: 0, low: 0 };
  let policeNearby = 0;

  coordinates.forEach((point) => {
    const latLng = L.latLng(point);

    zones.forEach((zone) => {
      const dist = latLng.distanceTo(L.latLng(zone.centerLat, zone.centerLng));
      if (dist <= zone.radiusMeters) {
        const level = zone.riskLevel?.toLowerCase();
        if (level === "high") intersections.high++;
        else if (level === "medium") intersections.medium++;
        else intersections.low++;
      }
    });

    stations.forEach((station) => {
      const dist = latLng.distanceTo(L.latLng(station.position));
      if (dist <= POLICE_PROXIMITY_RADIUS_M) policeNearby++;
    });
  });

  const score = Math.max(
    0,
    Math.min(
      100,
      SAFE_ROUTE_WEIGHTS.baseScore -
      intersections.high * SAFE_ROUTE_WEIGHTS.highRiskPenalty -
      intersections.medium * SAFE_ROUTE_WEIGHTS.mediumRiskPenalty -
      intersections.low * SAFE_ROUTE_WEIGHTS.lowRiskPenalty +
      policeNearby * SAFE_ROUTE_WEIGHTS.policeBonus
    )
  );

  return { score, intersections, policeNearby };
}

function computeRouteDistance(coords: [number, number][]): number {
  let total = 0;
  for (let i = 1; i < coords.length; i++) {
    total += L.latLng(coords[i - 1]).distanceTo(L.latLng(coords[i]));
  }
  return total;
}

export function useMapNavigation(
  userPosition: [number, number] | null,
  zones: RiskZone[],
  stations: PoliceStation[]
) {
  const [destination, setDestination] = useState<Destination | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routes, setRoutes] = useState<SafeRoute[]>([]);

  const calculateRoutes = useCallback(
    (dest: Destination) => {
      if (!userPosition) return;
      setRouteLoading(true);

      // Simulate async for future Google Directions API integration
      requestAnimationFrame(() => {
        const alternativeCoords = generateAlternativeRoutes(userPosition, [
          dest.lat,
          dest.lng,
        ]);

        const scoredRoutes: SafeRoute[] = alternativeCoords.map(
          (coords, idx) => {
            const { score, intersections, policeNearby } = scoreRoute(
              coords,
              zones,
              stations
            );
            const distanceMeters = computeRouteDistance(coords);
            const walkSpeedMs = 1.39;
            const durationSeconds = Math.round(distanceMeters / walkSpeedMs);

            return {
              id: `route-${idx}`,
              coordinates: coords,
              safetyScore: score,
              distanceMeters,
              durationSeconds,
              intersections,
              policeNearby,
              isSafest: false,
              isFastest: false,
            };
          }
        );

        // Mark safest and fastest
        const sortedBySafety = [...scoredRoutes].sort(
          (a, b) => b.safetyScore - a.safetyScore
        );
        const sortedByDistance = [...scoredRoutes].sort(
          (a, b) => a.distanceMeters - b.distanceMeters
        );

        if (sortedBySafety[0]) sortedBySafety[0].isSafest = true;
        if (sortedByDistance[0]) sortedByDistance[0].isFastest = true;

        setRoutes(scoredRoutes);
        setRouteLoading(false);
      });
    },
    [userPosition, zones, stations]
  );

  const handleSelectDestination = useCallback(
    (name: string, lat: number, lng: number) => {
      hapticFeedback("light");
      const dest: Destination = { name, lat, lng };
      setDestination(dest);
      calculateRoutes(dest);
    },
    [calculateRoutes]
  );

  const clearDestination = useCallback(() => {
    setDestination(null);
    setRoutes([]);
  }, []);

  const recalculateRoutes = useCallback(() => {
    if (destination) {
      calculateRoutes(destination);
    }
  }, [destination, calculateRoutes]);

  const routeInfo: RouteInfo = useMemo(
    () => ({
      routes,
      safest: routes.find((r) => r.isSafest) ?? null,
      fastest: routes.find((r) => r.isFastest) ?? null,
      loading: routeLoading,
    }),
    [routes, routeLoading]
  );

  return {
    destination,
    routeInfo,
    handleSelectDestination,
    clearDestination,
    recalculateRoutes,
  };
}