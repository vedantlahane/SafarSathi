import { request } from "./client";

export type NotificationType = "alert" | "score_change" | "system" | "tip";

export interface NotificationDto {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  type: NotificationType;
  sourceTab?: "home" | "map" | "identity" | "settings";
}

export async function fetchNotifications(_touristId: string) {
  return request<NotificationDto[]>(
    `/api/notifications`
  );
}

export async function markNotificationRead(_touristId: string, notificationId: string) {
  return request<{ acknowledged: boolean }>(
    `/api/notifications/${encodeURIComponent(notificationId)}/read`,
    { method: "POST" }
  );
}

export async function markAllNotificationsRead(_touristId: string) {
  return request<{ acknowledged: boolean }>(
    `/api/notifications/read-all`,
    { method: "POST" }
  );
}
