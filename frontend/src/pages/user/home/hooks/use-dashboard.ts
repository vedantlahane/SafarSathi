import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  connectWebSocket,
  fetchTouristDashboard,
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
  const [loading, setLoading] = useState(false);

  const hasSession = Boolean(session?.touristId);

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

  // Auto-refresh on interval
  useEffect(() => {
    if (!hasSession) {
      setData(EMPTY_DATA);
      return;
    }
    loadDashboard();
    const id = setInterval(loadDashboard, REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, [hasSession, loadDashboard]);

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
  }, [loadDashboard]);

  return { data, loading, refresh, hasSession };
}