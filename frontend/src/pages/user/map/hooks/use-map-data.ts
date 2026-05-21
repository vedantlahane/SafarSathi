// src/pages/user/map/hooks/use-map-data.ts
import { useState, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { haversineMeters } from "@/lib/geo";
import {
  fetchPublicRiskZones,
  fetchPoliceDepartments,
  fetchHospitals,
  fetchTouristPOIs,
  postLocation,
} from "@/lib/api";
import { useSession } from "@/lib/session";
import { hapticFeedback } from "@/lib/store";
import { MAP_DEFAULTS, LOCATION_POST_INTERVAL_MS } from "../constants";
import { getPrefs } from "@/lib/store/user-prefs";
import { useQuery } from "@tanstack/react-query";
import {
  formatETA,
  getCategoryLabel,
  isPointInZone,
  type RiskZone,
  type PoliceStation,
  type Hospital,
  type RiskFilter,
  type LayerVisibility,
} from "../types";

export function useMapData() {
  const session = useSession();

  // ── Permission & User Interaction state for geolocation ──
  const [permissionState, setPermissionState] = useState<PermissionState | "unknown">("unknown");
  const [userInteracted, setUserInteracted] = useState(false);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.permissions || !navigator.permissions.query) {
      setPermissionState("prompt");
      return;
    }
    navigator.permissions
      .query({ name: "geolocation" as PermissionName })
      .then((status) => {
        setPermissionState(status.state);
        status.onchange = () => {
          setPermissionState(status.state);
        };
      })
      .catch(() => {
        setPermissionState("prompt");
      });
  }, []);

  useEffect(() => {
    const handleInteraction = () => setUserInteracted(true);
    window.addEventListener("pointerdown", handleInteraction, { once: true });
    window.addEventListener("keydown", handleInteraction, { once: true });
    return () => {
      window.removeEventListener("pointerdown", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
  }, []);

  // ── Core position state ──
  const [position] = useState<[number, number]>(MAP_DEFAULTS.center);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [speed, setSpeed] = useState<number | null>(null);
  const [flyTo, setFlyTo] = useState<[number, number] | null>(null);

  // ── Data fetching (React Query) – live backend only ──
  const { data: rawZones, isError: zonesError } = useQuery({
    queryKey: ["riskZones"],
    queryFn: fetchPublicRiskZones,
    retry: 2,
    staleTime: 60_000,
  });

  const { data: rawStations, isError: stationsError } = useQuery({
    queryKey: ["policeStations"],
    queryFn: fetchPoliceDepartments,
    retry: 2,
    staleTime: 60_000,
  });

  const { data: rawHospitals, isError: hospitalsError } = useQuery({
    queryKey: ["hospitals"],
    queryFn: fetchHospitals,
    retry: 2,
    staleTime: 60_000,
  });

  const { data: rawPOIs } = useQuery({
    queryKey: ["touristPOIs"],
    queryFn: () => fetchTouristPOIs(),
    retry: 2,
    staleTime: 5 * 60_000, // 5 min — POIs change rarely
  });

  // On error: inform user but DO NOT fall back to stale JSON
  useEffect(() => {
    if (zonesError || stationsError || hospitalsError) {
      toast.error("Could not fetch live map data", {
        description: "Check your connection. Retrying automatically.",
        id: "map-data-error",
      });
    }
  }, [zonesError, stationsError, hospitalsError]);

  // ── Normalize backend data ──
  const backendZones = useMemo<RiskZone[]>(() => {
    if (!rawZones) return [];
    return rawZones.map((z, i) => ({ ...z, id: z.id ?? `bz-${i}` } as RiskZone));
  }, [rawZones]);

  const backendStations = useMemo(() => {
    if (!rawStations) return [];
    return rawStations.map((d, i) => ({
      id: d.id ?? `bs-${i}`,
      position: [d.latitude, d.longitude] as [number, number],
      name: d.name,
      contact: d.contactNumber,
      available: d.isActive ?? true,
    }));
  }, [rawStations]);

  const backendHospitals = useMemo(() => {
    if (!rawHospitals) return [];
    return rawHospitals.map((h) => ({
      id: h.hospitalId ?? h.id,
      position: [h.latitude, h.longitude] as [number, number],
      name: h.name,
      contact: h.contact,
      type: h.type,
      emergency: h.emergency,
      tier: h.tier ?? undefined,
      specialties: h.specialties,
      bedCapacity: h.bedCapacity,
      availableBeds: h.availableBeds,
      ambulanceAvailable: h.ambulanceAvailable,
    }));
  }, [rawHospitals]);

  // ── Filter & layer state ──
  const [riskFilter, setRiskFilter] = useState<RiskFilter>("all");
  const [showLayers, setShowLayers] = useState<LayerVisibility>({
    zones: true,
    police: true,
    hospitals: true,
    routes: true,
    pois: true,
  });

  // ── Derived state ──
  const [userInZone, setUserInZone] = useState(false);
  const [currentZoneName, setCurrentZoneName] = useState<string | null>(null);
  const [nearestStation, setNearestStation] = useState<PoliceStation | null>(null);
  const [nearestHospital, setNearestHospital] = useState<Hospital | null>(null);

  // ── Environment state ──
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );
  // ── Refs ──
  const prevZonesRef = useRef<Set<string | number>>(new Set());
  const watchIdRef = useRef<number | null>(null);
  const lastPostRef = useRef(0);

  // ── Filtered zones – live backend data only ──
  const zones = useMemo<RiskZone[]>(() => {
    return backendZones
      .map((z, i) => ({ ...z, id: z.id ?? `zone-${i}` }))
      .filter((z) => {
        if (!showLayers.zones) return false;
        if (riskFilter === "all") return true;
        return z.riskLevel?.toLowerCase() === riskFilter;
      });
  }, [backendZones, showLayers.zones, riskFilter]);

  // ── Filtered stations with distance/ETA – live backend data only ──
  const stations = useMemo<PoliceStation[]>(() => {
    if (!showLayers.police) return [];
    return backendStations.map((s, i) => {
      const enriched: PoliceStation = { ...s, id: s.id ?? `station-${i}` };
      if (userPosition) {
        const dist = haversineMeters(
          { lat: userPosition[0], lon: userPosition[1] },
          { lat: s.position[0], lon: s.position[1] }
        );
        enriched.distance = dist;
        enriched.eta = formatETA(dist, "walk");
      }
      return enriched;
    });
  }, [backendStations, showLayers.police, userPosition]);

  // ── Filtered hospitals with distance/ETA – live backend data only ──
  const visibleHospitals = useMemo<Hospital[]>(() => {
    if (!showLayers.hospitals) return [];
    return backendHospitals.map((h) => {
      const enriched: Hospital = { ...h };
      if (userPosition) {
        const dist = haversineMeters(
          { lat: userPosition[0], lon: userPosition[1] },
          { lat: h.position[0], lon: h.position[1] }
        );
        enriched.distance = dist;
        enriched.eta = formatETA(dist, "drive");
      }
      return enriched;
    });
  }, [backendHospitals, showLayers.hospitals, userPosition]);

  // ── Geofence alert: detect zone enter/leave ──
  useEffect(() => {
    if (!userPosition) {
      setUserInZone(false);
      setCurrentZoneName(null);
      return;
    }

    const currentZoneIds = new Set<string | number>();
    let inAnyZone = false;
    let highestSeverityZoneName: string | null = null;
    let highestSeverityLevel = -1;

    const severityOrder: Record<string, number> = {
      low: 0, medium: 1, high: 2, critical: 3,
    };

    zones.forEach((z) => {
      if (isPointInZone(userPosition[0], userPosition[1], z)) {
        currentZoneIds.add(z.id);
        inAnyZone = true;
        const s = severityOrder[z.riskLevel?.toLowerCase() ?? "medium"] ?? 1;
        if (s > highestSeverityLevel) {
          highestSeverityLevel = s;
          highestSeverityZoneName = z.name;
        }
      }
    });

    currentZoneIds.forEach((id) => {
      if (!prevZonesRef.current.has(id)) {
        const zone = zones.find((z) => z.id === id);
        if (zone) {
          const level = zone.riskLevel?.toLowerCase();
          const categoryLabel = getCategoryLabel(zone.category);
          const isCritical = level === "critical";
          const isHighOrCritical = isCritical || level === "high";

          hapticFeedback(isHighOrCritical ? "heavy" : "medium");

          if (isCritical) {
            toast.error(`🔴 CRITICAL ZONE: ${zone.name}`, {
              description: `${categoryLabel} — Leave this area immediately if possible.`,
              duration: 10000,
            });
          } else if (level === "high") {
            toast.warning(`⚠️ High Risk Zone: ${zone.name}`, {
              description: `${categoryLabel} — Exercise extreme caution.`,
              duration: 7000,
            });
          } else {
            toast.warning(`Entered risk zone: ${zone.name}`, {
              description: `${zone.riskLevel ?? "Medium"} risk · ${categoryLabel} — Stay alert`,
              duration: 5000,
            });
          }
        }
      }
    });

    prevZonesRef.current.forEach((id) => {
      if (!currentZoneIds.has(id)) {
        hapticFeedback("light");
        toast.success("You've left the risk zone", { duration: 3000 });
      }
    });

    prevZonesRef.current = currentZoneIds;
    setUserInZone(inAnyZone);
    setCurrentZoneName(highestSeverityZoneName);
  }, [userPosition, zones]);

  // ── Nearest police station ──
  useEffect(() => {
    if (!userPosition || !stations.length) { setNearestStation(null); return; }
    let nearest = stations[0];
    let min = Infinity;
    stations.forEach((s) => {
      const d = haversineMeters(
        { lat: userPosition[0], lon: userPosition[1] },
        { lat: s.position[0], lon: s.position[1] }
      );
      if (d < min) { min = d; nearest = s; }
    });
    setNearestStation({ ...nearest, distance: min, eta: formatETA(min, "walk") });
  }, [userPosition, stations]);

  // ── Nearest hospital ──
  useEffect(() => {
    if (!userPosition || !visibleHospitals.length) { setNearestHospital(null); return; }
    let nearest = visibleHospitals[0];
    let min = Infinity;
    visibleHospitals.forEach((h) => {
      const d = haversineMeters(
        { lat: userPosition[0], lon: userPosition[1] },
        { lat: h.position[0], lon: h.position[1] }
      );
      if (d < min) { min = d; nearest = h; }
    });
    setNearestHospital({ ...nearest, distance: min, eta: formatETA(min, "drive") });
  }, [userPosition, visibleHospitals]);

  // ── Continuous GPS tracking ──
  useEffect(() => {
    if (!userInteracted) return;
    if (permissionState !== "granted") return;
    if (!navigator.geolocation) return;

    const prefs = getPrefs();
    // If location sharing is disabled in Settings, do not start tracking
    if (!prefs.locationSharing) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const p: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserPosition(p);
        setAccuracy(pos.coords.accuracy);
        if (pos.coords.heading !== null) setHeading(pos.coords.heading);
        if (pos.coords.speed !== null) setSpeed(pos.coords.speed);

        const now = Date.now();
        if (session?.touristId && now - lastPostRef.current > LOCATION_POST_INTERVAL_MS) {
          lastPostRef.current = now;
          postLocation(session.touristId, {
            lat: p[0], lng: p[1],
            accuracy: pos.coords.accuracy ?? undefined,
            speed: pos.coords.speed ?? undefined,
            heading: pos.coords.heading ?? undefined,
          }).catch(() => { });
        }
      },
      () => { },
      {
        enableHighAccuracy: prefs.highAccuracyGps,
        maximumAge: prefs.highAccuracyGps ? 0 : 5000,
        timeout: 15000,
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [session?.touristId, permissionState, userInteracted]);

  // ── Online/offline detection ──
  useEffect(() => {
    const handleOnline = () => { setIsOnline(true); toast.success("Back online"); };
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("You're offline", { description: "Map data may be outdated" });
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
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);



  return {
    position,
    userPosition,
    accuracy,
    heading,
    speed,
    flyTo,
    setFlyTo,
    zones,
    stations,
    hospitals: visibleHospitals,
    pois: showLayers.pois ? (rawPOIs ?? []) : [],
    nearestStation,
    nearestHospital,
    riskFilter,
    setRiskFilter,
    showLayers,
    setShowLayers,
    userInZone,
    currentZoneName,
    isOnline,
    isDarkMode,
  };
}