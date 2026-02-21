import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  connectAlertsSocket,
  fetchTouristDashboard,
  type TouristAlert,
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

      setData({
        safetyScore: score,
        status: deriveStatus(score),
        recommendation: deriveRecommendation(score),
        // factors: d.factors ?? [],
        factors: [],
        alerts: d.alerts.map((a: TouristAlert): AlertView => ({
          id: a.id,
          type: a.alertType,
          message: a.message ?? "Alert received",
          time: formatRelativeTime(a.timestamp),
          priority: a.priority as AlertView["priority"],
        })),
        openAlerts: d.openAlerts ?? 0,
      });
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

  // WebSocket real-time alerts
  useEffect(() => {
    if (!hasSession) return;

    const socket = connectAlertsSocket((payload) => {
      hapticFeedback("medium");
      const p = payload as {
        id?: number;
        alertType?: string;
        message?: string;
        createdTime?: string;
        priority?: string;
      };

      setData((prev) => ({
        ...prev,
        alerts: [
          {
            id: p.id ?? Date.now(),
            type: p.alertType ?? "ALERT",
            message: p.message ?? "New alert received",
            time: formatRelativeTime(
              p.createdTime ?? new Date().toISOString()
            ),
            priority: (p.priority as AlertView["priority"]) ?? "high",
          },
          ...prev.alerts,
        ].slice(0, 20),
        openAlerts: prev.openAlerts + 1,
      }));

      toast.warning(p.alertType ?? "New Alert", {
        description: p.message ?? "Check your alerts",
      });
    });

    return () => socket.close();
  }, [hasSession]);

  const refresh = useCallback(async () => {
    hapticFeedback("light");
    await loadDashboard();
  }, [loadDashboard]);

  return { data, loading, refresh, hasSession };
}