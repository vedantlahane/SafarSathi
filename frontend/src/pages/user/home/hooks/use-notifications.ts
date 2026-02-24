import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationDto,
} from "@/lib/api/notifications";
import { useSession } from "@/lib/session";
import type { AlertView, NotificationView } from "../types";

function mapAlertToNotification(alert: AlertView): NotificationView {
  return {
    id: `alert-${alert.id}`,
    title: alert.type,
    message: alert.message,
    time: alert.time,
    type: "alert",
    read: false,
    sourceTab: "home",
  };
}

function mapDto(dto: NotificationDto): NotificationView {
  return {
    id: dto.id,
    title: dto.title,
    message: dto.message,
    time: new Date(dto.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    type: dto.type,
    read: dto.read,
    sourceTab: dto.sourceTab ?? "home",
  };
}

export function useNotifications(alerts: AlertView[]) {
  const session = useSession();
  const [notifications, setNotifications] = useState<NotificationView[]>([]);

  useEffect(() => {
    if (!session?.touristId) {
      setNotifications([]);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const serverItems = await fetchNotifications(session.touristId);
        if (!cancelled) {
          setNotifications(serverItems.map(mapDto));
        }
      } catch {
        if (!cancelled) {
          setNotifications((prev) => {
            const known = new Set(prev.map((n) => n.id));
            const incoming = alerts
              .map(mapAlertToNotification)
              .filter((a) => !known.has(a.id));
            return [...incoming, ...prev];
          });
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [session?.touristId]);

  useEffect(() => {
    setNotifications((prev) => {
      const known = new Set(prev.map((n) => n.id));
      const incoming = alerts
        .map(mapAlertToNotification)
        .filter((item) => !known.has(item.id));
      return incoming.length ? [...incoming, ...prev] : prev;
    });
  }, [alerts]);

  const markRead = useCallback(
    async (id: string) => {
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, read: true } : item))
      );
      if (!session?.touristId) return;
      try {
        await markNotificationRead(session.touristId, id);
      } catch {
        // local state is source of truth when backend endpoint is unavailable
      }
    },
    [session?.touristId]
  );

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    if (!session?.touristId) return;
    try {
      await markAllNotificationsRead(session.touristId);
    } catch {
      // local-only fallback
    }
  }, [session?.touristId]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  return {
    notifications,
    unreadCount,
    markRead,
    markAllRead,
  };
}
