import { useState, useEffect, useCallback } from "react";
import {
    connectAlertsSocket,
    fetchTouristDashboard,
    type TouristAlert,
} from "@/lib/api";
import { useSession } from "@/lib/session";
import { hapticFeedback, formatRelativeTime } from "@/lib/store";
import { useThemeColors } from "@/lib/theme/use-theme-colors";
import type { DashboardData, AlertView } from "../types";

const REFRESH_INTERVAL = 30_000;

const EMPTY_DATA: DashboardData = {
    safetyScore: 100,
    status: "safe",
    factors: [],
    alerts: [],
    openAlerts: 0,
};

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
                status: d.status ?? "safe",
                factors: [],
                alerts: d.alerts.map((a: TouristAlert) => ({
                    id: a.id,
                    type: a.alertType,
                    message: a.message ?? "Alert received",
                    time: formatRelativeTime(a.timestamp),
                    priority: a.priority as AlertView["priority"],
                })),
                openAlerts: d.openAlerts ?? 0,
            });
        } catch {
            /* silent */
        } finally {
            setLoading(false);
        }
    }, [session?.touristId, setSafetyScore]);

    // Auto-refresh
    useEffect(() => {
        if (!hasSession) {
            setData(EMPTY_DATA);
            return;
        }
        loadDashboard();
        const id = setInterval(loadDashboard, REFRESH_INTERVAL);
        return () => clearInterval(id);
    }, [hasSession, loadDashboard]);

    // WebSocket alerts
    useEffect(() => {
        if (!hasSession) return;
        const socket = connectAlertsSocket((payload) => {
            hapticFeedback("medium");
            const p = payload as {
                id?: number;
                alertType?: string;
                message?: string;
                createdTime?: string;
            };
            setData((prev) => ({
                ...prev,
                alerts: [
                    {
                        id: p.id ?? Date.now(),
                        type: p.alertType ?? "ALERT",
                        message: p.message ?? "Alert received",
                        time: formatRelativeTime(p.createdTime ?? new Date().toISOString()),
                        priority: "high" as const,
                    },
                    ...prev.alerts,
                ].slice(0, 20),
            }));
        });
        return () => socket.close();
    }, [hasSession]);

    const refresh = useCallback(async () => {
        hapticFeedback("light");
        await loadDashboard();
    }, [loadDashboard]);

    return { data, loading, refresh, hasSession };
}
