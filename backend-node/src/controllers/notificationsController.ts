import type { Request, Response } from "express";
import { normalizeParam } from "../utils/params.js";
import {
  getNotificationsByTouristId,
  markAllNotificationsRead,
  updateNotification,
  type INotification,
} from "../services/mongoStore.js";

export async function listNotifications(req: Request, res: Response) {
  const touristId = normalizeParam(req.params.touristId);
  if (!touristId) {
    return res.status(400).json({ message: "Invalid tourist ID." });
  }

  const items = await getNotificationsByTouristId(touristId);
  return res.json(items.map(mapNotification));
}

export async function markNotificationRead(req: Request, res: Response) {
  const touristId = normalizeParam(req.params.touristId);
  const notificationId = Number(normalizeParam(req.params.notificationId));

  if (!touristId || Number.isNaN(notificationId)) {
    return res.status(400).json({ message: "Invalid request." });
  }

  const updated = await updateNotification(notificationId, { read: true });
  if (!updated) {
    return res.status(404).json({ message: "Notification not found." });
  }

  return res.json({ acknowledged: true });
}

export async function markAllRead(req: Request, res: Response) {
  const touristId = normalizeParam(req.params.touristId);
  if (!touristId) {
    return res.status(400).json({ message: "Invalid tourist ID." });
  }

  await markAllNotificationsRead(touristId);
  return res.json({ acknowledged: true });
}

function mapNotification(notification: INotification) {
  return {
    id: String(notification.notificationId),
    title: notification.title,
    message: notification.message,
    createdAt: notification.createdAt?.toISOString() ?? new Date().toISOString(),
    read: notification.read ?? false,
    type: notification.type ?? "system",
    sourceTab: notification.sourceTab ?? "home",
  };
}