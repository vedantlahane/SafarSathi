// src/pages/user/map/hooks/use-map-navigation.ts
import { useState, useCallback, useMemo } from "react";
import { haversineMeters } from "@/lib/geo";
import { hapticFeedback } from "@/lib/store";
import {
  SAFE_ROUTE_WEIGHTS,
  POLICE_PROXIMITY_RADIUS_M,
} from "../constants";
import {
  isPointInZone,
  type Destination,
  type RiskZone,
  type PoliceStation,
  type SafeRoute,
  type RouteInfo,
} from "../types";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string;

function scoreRoute(
  coordinates: [number, number][],
  zones: RiskZone[],
  stations: PoliceStation[]
): {
  score: number;
  intersections: { critical: number; high: number; medium: number; low: number };
  policeNearby: number;
} {
  const intersections = { critical: 0, high: 0, medium: 0, low: 0 };
  let policeNearby = 0;

  coordinates.forEach((point) => {

    zones.forEach((zone) => {
      if (isPointInZone(point[0], point[1], zone)) {
        const level = zone.riskLevel?.toLowerCase();
        if (level === "critical") intersections.critical++;
        else if (level === "high") intersections.high++;
        else if (level === "medium") intersections.medium++;
        else intersections.low++;
      }
    });

    stations.forEach((station) => {
      const dist = haversineMeters(
        { lat: point[0], lon: point[1] },
        { lat: station.position[0], lon: station.position[1] }
      );
      if (dist <= POLICE_PROXIMITY_RADIUS_M) policeNearby++;
    });
  });

  const score = Math.max(
    0,
    Math.min(
      100,
      SAFE_ROUTE_WEIGHTS.baseScore -
      intersections.critical * SAFE_ROUTE_WEIGHTS.criticalRiskPenalty -
      intersections.high * SAFE_ROUTE_WEIGHTS.highRiskPenalty -
      intersections.medium * SAFE_ROUTE_WEIGHTS.mediumRiskPenalty -
      intersections.low * SAFE_ROUTE_WEIGHTS.lowRiskPenalty +
      policeNearby * SAFE_ROUTE_WEIGHTS.policeBonus
    )
  );

  return { score, intersections, policeNearby };
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

      const fetchRoutes = async () => {
        try {
          const res = await fetch(
            `https://api.mapbox.com/directions/v5/mapbox/driving/${userPosition[1]},${userPosition[0]};${dest.lng},${dest.lat}?alternatives=true&geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`
          );
          const data = await res.json();
          if (!data.routes) throw new Error("No routes found");

          const scoredRoutes: SafeRoute[] = data.routes.map(
            (r: any, idx: number) => {
              // Mapbox returns coordinates as [lng, lat], we need [lat, lng] for scoreRoute
              const coords: [number, number][] = r.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
              
              const { score, intersections, policeNearby } = scoreRoute(
                coords,
                zones,
                stations
              );

              return {
                id: `route-${idx}`,
                coordinates: coords,
                safetyScore: score,
                distanceMeters: r.distance,
                durationSeconds: r.duration,
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
        } catch (error) {
          console.error("Failed to fetch Mapbox routes:", error);
          setRoutes([]);
        } finally {
          setRouteLoading(false);
        }
      };
      
      fetchRoutes();
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