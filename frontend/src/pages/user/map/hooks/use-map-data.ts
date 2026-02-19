import { useState, useEffect, useMemo, useCallback } from "react";
import L from "leaflet";
import { fetchPublicRiskZones, fetchPoliceDepartments, postLocation } from "@/lib/api";
import { useSession } from "@/lib/session";
import { hapticFeedback } from "@/lib/store";
import assamData from "../../../../../../dataSets/assamRistrictedAreas.json";
import policeData from "../../../../../../dataSets/assamPoliceStations.json";
import type { RiskZone, PoliceStation, RiskFilter, LayerVisibility } from "../types";

export function useMapData() {
    const session = useSession();
    const [position, setPosition] = useState<[number, number]>([26.1445, 91.7362]);
    const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
    const [locating, setLocating] = useState(false);
    const [flyTo, setFlyTo] = useState<[number, number] | null>(null);
    const [backendZones, setBackendZones] = useState<RiskZone[]>([]);
    const [backendStations, setBackendStations] = useState<PoliceStation[]>([]);
    const [riskFilter, setRiskFilter] = useState<RiskFilter>("all");
    const [showLayers, setShowLayers] = useState<LayerVisibility>({ zones: true, police: true });
    const [userInZone, setUserInZone] = useState(false);
    const [nearestStation, setNearestStation] = useState<PoliceStation | null>(null);

    // Flatten police stations from dataset
    const allPoliceStations = useMemo(() => {
        const stations: PoliceStation[] = [];
        Object.entries(policeData.assamPoliceStations).forEach(([district, list]) => {
            (list as Array<{ id?: string | number; position: number[]; name: string; contact: string; available?: boolean; responseTime?: string }>).forEach((s, idx) => {
                stations.push({
                    ...s,
                    id: s.id ?? `${district}-${idx}`,
                    position: s.position as [number, number],
                    available: s.available ?? true,
                });
            });
        });
        return stations;
    }, []);

    // Fallback zones from dataset
    const fallbackZones = useMemo<RiskZone[]>(() =>
        (assamData.restrictedZones as Array<{ id?: number | string; name: string; description?: string; position: number[]; radius: number; riskLevel?: string }>).map((z, idx) => ({
            id: z.id ?? `fallback-zone-${idx}`,
            name: z.name,
            description: z.description ?? null,
            centerLat: z.position[0],
            centerLng: z.position[1],
            radiusMeters: z.radius,
            riskLevel: z.riskLevel?.toUpperCase() ?? "MEDIUM",
        })), []);

    // Filtered zones
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

    // Filtered stations
    const stations = useMemo(() => {
        if (!showLayers.police) return [];
        const src = backendStations.length ? backendStations : allPoliceStations;
        return src.map((s, i) => ({ ...s, id: s.id ?? `station-${i}` }));
    }, [backendStations, allPoliceStations, showLayers.police]);

    // Check if user is in a risk zone
    useEffect(() => {
        if (!userPosition) { setUserInZone(false); return; }
        const inZone = zones.some((z) => L.latLng(userPosition).distanceTo(L.latLng(z.centerLat, z.centerLng)) <= z.radiusMeters);
        setUserInZone(inZone);
    }, [userPosition, zones]);

    // Nearest police station
    useEffect(() => {
        if (!userPosition || !stations.length) { setNearestStation(null); return; }
        let nearest = stations[0]; let min = Infinity;
        stations.forEach((s) => { const d = L.latLng(userPosition).distanceTo(L.latLng(s.position)); if (d < min) { min = d; nearest = s; } });
        setNearestStation(nearest);
    }, [userPosition, stations]);

    // Load backend data
    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const [rz, pd] = await Promise.all([fetchPublicRiskZones(), fetchPoliceDepartments()]);
                if (!active) return;
                setBackendZones(rz.map((z, i) => ({ ...z, id: z.id ?? `bz-${i}` })));
                setBackendStations(pd.map((d, i) => ({
                    id: d.id ?? `bs-${i}`, position: [d.latitude, d.longitude] as [number, number],
                    name: d.name, contact: d.contactNumber, available: d.isActive ?? true,
                })));
            } catch { /* fallback */ }
        })();
        return () => { active = false; };
    }, []);

    // Get user location on mount
    useEffect(() => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            (pos) => { const p: [number, number] = [pos.coords.latitude, pos.coords.longitude]; setUserPosition(p); setPosition(p); },
            () => { }, { enableHighAccuracy: true },
        );
    }, []);

    const handleLocate = useCallback(() => {
        if (!navigator.geolocation) return;
        hapticFeedback("light"); setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const p: [number, number] = [pos.coords.latitude, pos.coords.longitude];
                setUserPosition(p); setFlyTo(p); setLocating(false);
                if (session?.touristId) postLocation(session.touristId, { lat: p[0], lng: p[1] }).catch(() => { });
            },
            () => setLocating(false), { enableHighAccuracy: true },
        );
    }, [session?.touristId]);

    return {
        position, userPosition, flyTo, setFlyTo, locating,
        zones, stations, riskFilter, setRiskFilter,
        showLayers, setShowLayers, userInZone, nearestStation,
        handleLocate,
    };
}
