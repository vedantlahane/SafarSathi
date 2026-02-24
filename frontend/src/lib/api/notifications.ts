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

export async function fetchNotifications(touristId: string) {
  return request<NotificationDto[]>(
    `/api/tourist/${encodeURIComponent(touristId)}/notifications`
  );
}

export async function markNotificationRead(touristId: string, notificationId: string) {
  return request<{ acknowledged: boolean }>(
    `/api/tourist/${encodeURIComponent(touristId)}/notifications/${encodeURIComponent(notificationId)}/read`,
    { method: "POST" }
  );
}

export async function markAllNotificationsRead(touristId: string) {
  return request<{ acknowledged: boolean }>(
    `/api/tourist/${encodeURIComponent(touristId)}/notifications/read-all`,
    { method: "POST" }
  );
}
