// src/pages/user/map/hooks/use-map-data.ts
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import L from "leaflet";
import { toast } from "sonner";
import {
  fetchPublicRiskZones,
  fetchPoliceDepartments,
  fetchHospitals,
  postLocation,
} from "@/lib/api";
import { useSession } from "@/lib/session";
import { hapticFeedback } from "@/lib/store";
import assamData from "./../../../../../../dataSets/assamRistrictedAreas.json";
import policeData from "./../../../../../../dataSets/assamPoliceStations.json";
import { MAP_DEFAULTS, LOCATION_POST_INTERVAL_MS } from "../constants";
import {
  formatETA,
  type RiskZone,
  type PoliceStation,
  type Hospital,
  type RiskFilter,
  type LayerVisibility,
} from "../types";

export function useMapData() {
  const session = useSession();

  // ── Core position state ──
  const [position] = useState<[number, number]>(MAP_DEFAULTS.center);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(
    null
  );
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [speed, setSpeed] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);
  const [flyTo, setFlyTo] = useState<[number, number] | null>(null);

  // ── Data state ──
  const [backendZones, setBackendZones] = useState<RiskZone[]>([]);
  const [backendStations, setBackendStations] = useState<PoliceStation[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);

  // ── Filter & layer state ──
  const [riskFilter, setRiskFilter] = useState<RiskFilter>("all");
  const [showLayers, setShowLayers] = useState<LayerVisibility>({
    zones: true,
    police: true,
    hospitals: true,
    routes: true,
  });

  // ── Derived state ──
  const [userInZone, setUserInZone] = useState(false);
  const [currentZoneName, setCurrentZoneName] = useState<string | null>(null);
  const [nearestStation, setNearestStation] = useState<PoliceStation | null>(
    null
  );
  const [nearestHospital, setNearestHospital] = useState<Hospital | null>(null);

  // ── Environment state ──
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );
  const [bearing, setBearing] = useState(0);

  // ── Refs ──
  const prevZonesRef = useRef<Set<string | number>>(new Set());
  const watchIdRef = useRef<number | null>(null);
  const lastPostRef = useRef(0);

  // ── Fallback datasets ──
  const allPoliceStations = useMemo<PoliceStation[]>(() => {
    const stations: PoliceStation[] = [];
    Object.entries(policeData.assamPoliceStations).forEach(
      ([district, list]) => {
        (
          list as Array<{
            id?: string | number;
            position: number[];
            name: string;
            contact: string;
            available?: boolean;
            responseTime?: string;
          }>
        ).forEach((s, idx) => {
          stations.push({
            ...s,
            id: s.id ?? `${district}-${idx}`,
            position: s.position as [number, number],
            available: s.available ?? true,
          });
        });
      }
    );
    return stations;
  }, []);

  const fallbackZones = useMemo<RiskZone[]>(
    () =>
      (
        assamData.restrictedZones as Array<{
          id?: number | string;
          name: string;
          description?: string;
          position: number[];
          radius: number;
          riskLevel?: string;
        }>
      ).map((z, idx) => ({
        id: z.id ?? `fallback-zone-${idx}`,
        name: z.name,
        description: z.description ?? null,
        centerLat: z.position[0],
        centerLng: z.position[1],
        radiusMeters: z.radius,
        riskLevel: z.riskLevel?.toUpperCase() ?? "MEDIUM",
      })),
    []
  );

  // ── Filtered zones ──
  const zones = useMemo(() => {
    const src = backendZones.length ? backendZones : fallbackZones;
    return src
      .map((z, i) => ({ ...z, id: z.id ?? `zone-${i}` }))
      .filter((z) => {
        if (!showLayers.zones) return false;
        if (riskFilter === "all") return true;
        return z.riskLevel?.toLowerCase() === riskFilter;
      });
  }, [backendZones, fallbackZones, showLayers.zones, riskFilter]);

  // ── Filtered stations with distance/ETA ──
  const stations = useMemo(() => {
    if (!showLayers.police) return [];
    const src = backendStations.length ? backendStations : allPoliceStations;
    return src.map((s, i) => {
      const enriched: PoliceStation = { ...s, id: s.id ?? `station-${i}` };
      if (userPosition) {
        const dist = L.latLng(userPosition).distanceTo(L.latLng(s.position));
        enriched.distance = dist;
        enriched.eta = formatETA(dist, "walk");
      }
      return enriched;
    });
  }, [backendStations, allPoliceStations, showLayers.police, userPosition]);

  // ── Filtered hospitals with distance/ETA ──
  const visibleHospitals = useMemo(() => {
    if (!showLayers.hospitals) return [];
    return hospitals.map((h) => {
      const enriched: Hospital = { ...h };
      if (userPosition) {
        const dist = L.latLng(userPosition).distanceTo(L.latLng(h.position));
        enriched.distance = dist;
        enriched.eta = formatETA(dist, "drive");
      }
      return enriched;
    });
  }, [hospitals, showLayers.hospitals, userPosition]);

  // ── Geofence alert: detect zone enter/leave ──
  useEffect(() => {
    if (!userPosition) {
      setUserInZone(false);
      setCurrentZoneName(null);
      return;
    }

    const currentZoneIds = new Set<string | number>();
    let inAnyZone = false;
    let zoneName: string | null = null;

    zones.forEach((z) => {
      const dist = L.latLng(userPosition).distanceTo(
        L.latLng(z.centerLat, z.centerLng)
      );
      if (dist <= z.radiusMeters) {
        currentZoneIds.add(z.id);
        inAnyZone = true;
        zoneName = z.name;
      }
    });

    // Detect newly entered zones
    currentZoneIds.forEach((id) => {
      if (!prevZonesRef.current.has(id)) {
        const zone = zones.find((z) => z.id === id);
        if (zone) {
          hapticFeedback("heavy");
          toast.warning(`Entered risk zone: ${zone.name}`, {
            description: `${zone.riskLevel ?? "Medium"} risk — Stay alert`,
            duration: 5000,
          });
        }
      }
    });

    // Detect zones left
    prevZonesRef.current.forEach((id) => {
      if (!currentZoneIds.has(id)) {
        hapticFeedback("light");
        toast.success("You've left the risk zone", { duration: 3000 });
      }
    });

    prevZonesRef.current = currentZoneIds;
    setUserInZone(inAnyZone);
    setCurrentZoneName(zoneName);
  }, [userPosition, zones]);

  // ── Nearest police station ──
  useEffect(() => {
    if (!userPosition || !stations.length) {
      setNearestStation(null);
      return;
    }
    let nearest = stations[0];
    let min = Infinity;
    stations.forEach((s) => {
      const d = L.latLng(userPosition).distanceTo(L.latLng(s.position));
      if (d < min) {
        min = d;
        nearest = s;
      }
    });
    setNearestStation({
      ...nearest,
      distance: min,
      eta: formatETA(min, "walk"),
    });
  }, [userPosition, stations]);

  // ── Nearest hospital ──
  useEffect(() => {
    if (!userPosition || !visibleHospitals.length) {
      setNearestHospital(null);
      return;
    }
    let nearest = visibleHospitals[0];
    let min = Infinity;
    visibleHospitals.forEach((h) => {
      const d = L.latLng(userPosition).distanceTo(L.latLng(h.position));
      if (d < min) {
        min = d;
        nearest = h;
      }
    });
    setNearestHospital({
      ...nearest,
      distance: min,
      eta: formatETA(min, "drive"),
    });
  }, [userPosition, visibleHospitals]);

  // ── Load backend data ──
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [rz, pd, hosp] = await Promise.all([
          fetchPublicRiskZones(),
          fetchPoliceDepartments(),
          fetchHospitals(),
        ]);
        if (!active) return;
        setBackendZones(
          rz.map((z, i) => ({ ...z, id: z.id ?? `bz-${i}` }))
        );
        setBackendStations(
          pd.map((d, i) => ({
            id: d.id ?? `bs-${i}`,
            position: [d.latitude, d.longitude] as [number, number],
            name: d.name,
            contact: d.contactNumber,
            available: d.isActive ?? true,
          }))
        );
        setHospitals(
          hosp.map((h) => ({
            id: h.hospitalId,
            position: [h.latitude, h.longitude] as [number, number],
            name: h.name,
            contact: h.contact,
            type: h.type,
            emergency: h.emergency,
          }))
        );
      } catch {
        toast.error("Using offline map data", {
          description: "Could not fetch latest zones and stations",
        });
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // ── Continuous GPS tracking via watchPosition ──
  useEffect(() => {
    if (!navigator.geolocation) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const p: [number, number] = [
          pos.coords.latitude,
          pos.coords.longitude,
        ];
        setUserPosition(p);
        setAccuracy(pos.coords.accuracy);
        if (pos.coords.heading !== null) setHeading(pos.coords.heading);
        if (pos.coords.speed !== null) setSpeed(pos.coords.speed);

        // Throttled location post to backend
        const now = Date.now();
        if (
          session?.touristId &&
          now - lastPostRef.current > LOCATION_POST_INTERVAL_MS
        ) {
          lastPostRef.current = now;
          postLocation(session.touristId, {
            lat: p[0],
            lng: p[1],
          }).catch(() => { });
        }
      },
      () => { },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [session?.touristId]);

  // ── Online/offline detection ──
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Back online");
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("You're offline", {
        description: "Map data may be outdated",
      });
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // ── Dark mode observer ──
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // ── Manual locate ──
  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) return;
    hapticFeedback("light");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p: [number, number] = [
          pos.coords.latitude,
          pos.coords.longitude,
        ];
        setUserPosition(p);
        setAccuracy(pos.coords.accuracy);
        setFlyTo(p);
        setLocating(false);
      },
      () => {
        setLocating(false);
        toast.error("Could not get your location");
      },
      { enableHighAccuracy: true }
    );
  }, []);

  // ── Reset bearing ──
  const resetBearing = useCallback(() => {
    setBearing(0);
    hapticFeedback("light");
  }, []);

  return {
    position,
    userPosition,
    accuracy,
    heading,
    speed,
    flyTo,
    setFlyTo,
    locating,
    zones,
    stations,
    hospitals: visibleHospitals,
    nearestStation,
    nearestHospital,
    riskFilter,
    setRiskFilter,
    showLayers,
    setShowLayers,
    userInZone,
    currentZoneName,
    handleLocate,
    isOnline,
    isDarkMode,
    bearing,
    setBearing,
    resetBearing,
  };
}