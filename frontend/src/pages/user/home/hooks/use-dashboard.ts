import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import {
  connectWebSocket,
  fetchRealTimeSafety,
  fetchTouristDashboard,
  type RealTimeSafety,
  type TouristAlert,
  type WSAlertPayload,
  type WSBroadcastPayload,
  type WSAdvisoryPayload,
  type WSScoreUpdatePayload,
  postLocation,
} from "@/lib/api";
import { useSession } from "@/lib/session";
import { hapticFeedback, formatRelativeTime } from "@/lib/store";
import { useThemeColors } from "@/lib/theme/use-theme-colors";
import { type GpsLocation } from "@/lib/geo";
import type { DashboardData, SafetyStatus, AlertView } from "../types";

const REFRESH_INTERVAL = 300_000; // 5 minutes

const EMPTY_DATA: DashboardData = {
  safetyScore: 100,
  status: "safe",
  recommendation: "",
  factors: [],
  alerts: [],
  openAlerts: 0,
  broadcasts: [],
  advisories: [],
};

const EMPTY_REALTIME_SAFETY: RealTimeSafety = {
  dangerScore: 0.0,
  isNearAdminZone: false,
  recommendation: "Scanning...",
  riskLabel: "Low Risk",
  scanning: true,
};



/** Derive safety status from numeric score */
function deriveStatus(score: number): SafetyStatus {
  if (score >= 80) return "safe";
  if (score >= 50) return "caution";
  return "danger";
}

/** Normalize backend priority values → frontend AlertView priority */
function normalizePriority(p: string | undefined): AlertView["priority"] {
  if (!p) return "low";
  const lp = p.toLowerCase();
  if (lp === "critical" || lp === "sos") return "critical";
  if (lp === "high") return "high";
  if (lp === "medium" || lp === "moderate") return "medium";
  // Backend 'info', 'low', or anything else → low
  return "low";
}

/** Generate a contextual recommendation based on score */
function deriveRecommendation(score: number): string {
  if (score >= 80) return "Conditions look great. Enjoy your journey!";
  if (score >= 65) return "Stay aware of your surroundings. Minor factors flagged.";
  if (score >= 50) return "Exercise caution. Check alerts before moving further.";
  if (score >= 30) return "Elevated risk detected. Consider returning to a safe area.";
  return "High risk. Move to safety immediately and contact emergency services.";
}

export function useDashboard() {
  const session = useSession();
  const { setSafetyScore } = useThemeColors();

  const [data, setData] = useState<DashboardData>(EMPTY_DATA);
  const [realTimeSafety, setRealTimeSafety] =
    useState<RealTimeSafety>(EMPTY_REALTIME_SAFETY);
  const [gpsLocation, setGpsLocation] = useState<GpsLocation | null>(null);
  const hasSession = Boolean(session?.touristId);

  // ── Dashboard Query ──
  const { 
    data: rawDashboard, 
    isLoading: loadingDashboard, 
    refetch: refetchDashboard 
  } = useQuery({
    queryKey: ["dashboard", session?.touristId],
    queryFn: () => fetchTouristDashboard(session!.touristId),
    enabled: hasSession,
    staleTime: REFRESH_INTERVAL,
    refetchInterval: REFRESH_INTERVAL,
  });

  // ── GPS Tracking ──
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsLocation(null);
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setGpsLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      () => setGpsLocation(null),
      { enableHighAccuracy: true, timeout: 20_000, maximumAge: 10_000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // ── Background Location Sync ──
  const lastPostRef = useRef<number>(0);
  useEffect(() => {
    if (gpsLocation && hasSession && session?.touristId) {
      const now = Date.now();
      if (now - lastPostRef.current > 30_000) {
        lastPostRef.current = now;
        postLocation(session.touristId, {
          lat: gpsLocation.lat,
          lng: gpsLocation.lon,
        }).catch(() => {});
      }
    }
  }, [gpsLocation, hasSession, session?.touristId]);

  // ── Realtime Safety Query ──
  // Snap to 2 decimal places (~1.1km grid) to match the backend Redis cache key.
  // This prevents a new query key (and API call) on every GPS micro-update.
  const snapLat = gpsLocation ? Math.round(gpsLocation.lat * 100) / 100 : null;
  const snapLon = gpsLocation ? Math.round(gpsLocation.lon * 100) / 100 : null;

  const { 
    data: aiSafetyData, 
    isLoading: loadingRealTime, 
    refetch: refetchRealTime 
  } = useQuery({
    queryKey: ["realtimeSafety", snapLat, snapLon],
    queryFn: () => fetchRealTimeSafety(gpsLocation!.lat, gpsLocation!.lon),
    enabled: !!gpsLocation,
    staleTime: REFRESH_INTERVAL,      // treat as fresh for 5 min
    refetchInterval: REFRESH_INTERVAL, // background refresh every 5 min
    refetchOnWindowFocus: false,
  });

  // ── State Syncs ──
  useEffect(() => {
    if (rawDashboard) {
      const score = rawDashboard.safetyScore ?? 100;
      setSafetyScore(score);
      setData((prev) => ({
        ...prev,
        safetyScore: score,
        status: deriveStatus(score),
        recommendation: deriveRecommendation(score),
        alerts: rawDashboard.alerts.map((a: TouristAlert): AlertView => ({
          id: a.id,
          type: a.alertType,
          message: a.message ?? "Alert received",
          time: formatRelativeTime(a.timestamp),
          status: a.status,
          priority: normalizePriority(a.priority),
        })),
        openAlerts: rawDashboard.openAlerts ?? 0,
      }));
    } else if (!hasSession) {
      setData(EMPTY_DATA);
    }
  }, [rawDashboard, hasSession, setSafetyScore]);

  useEffect(() => {
    if (aiSafetyData) {
      const dangerScore = Math.max(0, Math.min(1, aiSafetyData.dangerScore ?? 0));
      setRealTimeSafety({
        ...aiSafetyData,
        dangerScore,
        scanning: false,
      });
      // Set overall score derived from danger (higher danger -> lower score)
      setSafetyScore(Math.round((1 - dangerScore) * 100));
    } else if (!gpsLocation) {
      setRealTimeSafety({
        ...EMPTY_REALTIME_SAFETY,
        scanning: true,
        recommendation: navigator.geolocation ? "Locating..." : "Location Unavailable",
      });
    }
  }, [aiSafetyData, gpsLocation, setSafetyScore]);

  // WebSocket real-time events (room-based)
  useEffect(() => {
    if (!hasSession || !session?.touristId) return;

    const room = `tourist:${session.touristId}`;

    const socket = connectWebSocket(room, {
      onAlert: (payload: WSAlertPayload) => {
        hapticFeedback("medium");
        setData((prev) => {
          const newAlert: AlertView = {
            id: payload.alertId ?? Date.now(),
            type: payload.alertType ?? "ALERT",
            message: payload.message ?? "New alert received",
            time: formatRelativeTime(
              payload.createdTime ?? new Date().toISOString()
            ),
            status: payload.status ?? "OPEN",
            priority: normalizePriority(payload.priority ?? "high"),
          };

          const existingIndex = prev.alerts.findIndex(a => a.id === newAlert.id);
          let newAlerts;
          
          if (existingIndex >= 0) {
            newAlerts = [...prev.alerts];
            newAlerts[existingIndex] = { ...newAlerts[existingIndex], ...newAlert };
          } else {
            newAlerts = [newAlert, ...prev.alerts].slice(0, 20);
          }

          return {
            ...prev,
            alerts: newAlerts,
            openAlerts: newAlerts.filter(a => !["RESOLVED", "CANCELLED", "DISMISSED"].includes(a.status)).length,
          };
        });

        toast.warning(payload.alertType ?? "New Alert", {
          description: payload.message ?? "Check your alerts",
        });
      },

      onBroadcast: (payload: WSBroadcastPayload) => {
        hapticFeedback("medium");
        setData((prev) => ({
          ...prev,
          broadcasts: [
            {
              title: payload.title,
              message: payload.message,
              priority: payload.priority,
              sentAt: payload.sentAt,
            },
            ...(prev.broadcasts ?? []),
          ].slice(0, 10),
        }));
        toast.info(payload.title, {
          description: payload.message,
          duration: 8000,
        });
      },

      onAdvisory: (payload: WSAdvisoryPayload) => {
        hapticFeedback("light");
        setData((prev) => ({
          ...prev,
          advisories: [
            {
              id: payload.id,
              title: payload.title,
              description: payload.description,
              severity: payload.severity,
              region: payload.region,
              issuedAt: payload.issuedAt,
              expiresAt: payload.expiresAt,
            },
            ...(prev.advisories ?? []),
          ].slice(0, 10),
        }));
        toast.info(`Advisory: ${payload.title}`, {
          description: payload.description,
          duration: 10_000,
        });
      },

      onScoreUpdate: (payload: WSScoreUpdatePayload) => {
        const newScore = payload.safetyScore;
        setSafetyScore(newScore);
        setData((prev) => ({
          ...prev,
          safetyScore: newScore,
          status: deriveStatus(newScore),
          recommendation: deriveRecommendation(newScore),
        }));

        if (payload.previousScore && newScore < payload.previousScore - 10) {
          hapticFeedback("heavy");
          toast.warning("Safety score dropped", {
            description: payload.reason ?? `${payload.previousScore} → ${newScore}`,
          });
        }
      },
    });

    return () => socket.close();
  }, [hasSession, session?.touristId, setSafetyScore]);

  const refresh = async () => {
    hapticFeedback("light");
    await Promise.all([refetchDashboard(), refetchRealTime()]);
  };

  return { data, realTimeSafety, loading: loadingDashboard || loadingRealTime, refresh, hasSession };
}