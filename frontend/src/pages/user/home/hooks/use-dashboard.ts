import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
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
} from "@/lib/api";
import { useSession } from "@/lib/session";
import { hapticFeedback, formatRelativeTime } from "@/lib/store";
import { useThemeColors } from "@/lib/theme/use-theme-colors";
import type { DashboardData, SafetyStatus, AlertView } from "../types";

const REFRESH_INTERVAL = 30_000;
const REALTIME_MIN_RECHECK_MS = 12_000;
const REALTIME_MIN_MOVE_METERS = 30;

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

type GpsLocation = {
  lat: number;
  lon: number;
};

function haversineMeters(a: GpsLocation, b: GpsLocation): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusMeters = 6371000;

  const latDelta = toRad(b.lat - a.lat);
  const lonDelta = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(lonDelta / 2) ** 2;

  return 2 * earthRadiusMeters * Math.asin(Math.sqrt(h));
}

/** Derive safety status from numeric score */
function deriveStatus(score: number): SafetyStatus {
  if (score >= 80) return "safe";
  if (score >= 50) return "caution";
  return "danger";
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
  const [loading, setLoading] = useState(false);

  const gpsLocationRef = useRef<GpsLocation | null>(null);
  const lastSafetyFetchRef = useRef<{
    at: number;
    location: GpsLocation;
  } | null>(null);

  const hasSession = Boolean(session?.touristId);

  useEffect(() => {
    gpsLocationRef.current = gpsLocation;
  }, [gpsLocation]);

  const loadDashboard = useCallback(async () => {
    if (!session?.touristId) return;
    try {
      setLoading(true);
      const d = await fetchTouristDashboard(session.touristId);
      const score = d.safetyScore ?? 100;
      setSafetyScore(score);

      setData((prev) => ({
        ...prev,
        safetyScore: score,
        status: deriveStatus(score),
        recommendation: deriveRecommendation(score),
        factors: [],
        alerts: d.alerts.map((a: TouristAlert): AlertView => ({
          id: a.id,
          type: a.alertType,
          message: a.message ?? "Alert received",
          time: formatRelativeTime(a.timestamp),
          priority: a.priority as AlertView["priority"],
        })),
        openAlerts: d.openAlerts ?? 0,
      }));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load dashboard";
      toast.error("Dashboard update failed", { description: message });
    } finally {
      setLoading(false);
    }
  }, [session?.touristId, setSafetyScore]);

  const loadRealTimeSafety = useCallback(
    async (location: GpsLocation | null, force = false) => {
      if (!location) {
        return;
      }

      const now = Date.now();
      const lastFetch = lastSafetyFetchRef.current;

      if (!force && lastFetch) {
        const elapsed = now - lastFetch.at;
        const movedMeters = haversineMeters(lastFetch.location, location);
        if (
          elapsed < REALTIME_MIN_RECHECK_MS &&
          movedMeters < REALTIME_MIN_MOVE_METERS
        ) {
          return;
        }
      }

      lastSafetyFetchRef.current = { at: now, location };

      setRealTimeSafety((prev) => ({ ...prev, scanning: true }));

      try {
        const aiSafety = await fetchRealTimeSafety(location.lat, location.lon);
        const dangerScore = Math.max(0, Math.min(1, aiSafety.dangerScore ?? 0));

        setRealTimeSafety({
          ...aiSafety,
          dangerScore,
          scanning: false,
        });

        // Theme score uses "higher is safer". AI score uses "higher is more dangerous".
        setSafetyScore(Math.round((1 - dangerScore) * 100));
      } catch {
        setRealTimeSafety((prev) => ({ ...prev, scanning: false }));
      }
    },
    [setSafetyScore]
  );

  useEffect(() => {
    if (!hasSession) {
      setGpsLocation(null);
      setRealTimeSafety({ ...EMPTY_REALTIME_SAFETY, scanning: false });
      return;
    }

    if (!navigator.geolocation) {
      setRealTimeSafety({
        dangerScore: 0.0,
        isNearAdminZone: false,
        recommendation: "Geolocation is not supported by this browser.",
        riskLabel: "Low Risk",
        scanning: false,
      });
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        setGpsLocation(location);
        void loadRealTimeSafety(location);
      },
      (error) => {
        setGpsLocation(null);
        setRealTimeSafety({
          dangerScore: 0.0,
          isNearAdminZone: false,
          recommendation:
            error.code === error.PERMISSION_DENIED
              ? "Enable location permission for real-time safety analysis."
              : "Location unavailable. Safety analysis paused.",
          riskLabel: "Low Risk",
          scanning: false,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 20_000,
        maximumAge: 10_000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [hasSession, loadRealTimeSafety]);

  // Auto-refresh on interval
  useEffect(() => {
    if (!hasSession) {
      setData(EMPTY_DATA);
      setRealTimeSafety(EMPTY_REALTIME_SAFETY);
      return;
    }

    const refreshAll = async () => {
      await loadDashboard();
      await loadRealTimeSafety(gpsLocationRef.current, true);
    };

    void refreshAll();
    const id = setInterval(() => {
      void refreshAll();
    }, REFRESH_INTERVAL);

    return () => clearInterval(id);
  }, [hasSession, loadDashboard, loadRealTimeSafety]);

  // WebSocket real-time events (room-based)
  useEffect(() => {
    if (!hasSession || !session?.touristId) return;

    const room = `tourist:${session.touristId}`;

    const socket = connectWebSocket(room, {
      onAlert: (payload: WSAlertPayload) => {
        hapticFeedback("medium");
        setData((prev) => ({
          ...prev,
          alerts: [
            {
              id: payload.alertId ?? Date.now(),
              type: payload.alertType ?? "ALERT",
              message: payload.message ?? "New alert received",
              time: formatRelativeTime(
                payload.createdTime ?? new Date().toISOString()
              ),
              priority: (payload.priority as AlertView["priority"]) ?? "high",
            },
            ...prev.alerts,
          ].slice(0, 20),
          openAlerts: prev.openAlerts + 1,
        }));

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

  const refresh = useCallback(async () => {
    hapticFeedback("light");
    await loadDashboard();
    await loadRealTimeSafety(gpsLocationRef.current, true);
  }, [loadDashboard, loadRealTimeSafety]);

  return { data, realTimeSafety, loading, refresh, hasSession };
}