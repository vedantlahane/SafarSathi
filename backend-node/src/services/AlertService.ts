import { broadcastAlert, broadcastToRoom } from "./websocketHub.js";
import {
  getAllAlerts as getAll,
  getAlertsByTouristId,
  getOpenAlerts,
  getAlertById,
  createAlert as createAlertDoc,
  updateAlert as updateAlertDoc,
  createNotification,
  type IAlert,
} from "./mongoStore.js";
import { PoliceDepartmentModel } from "../schemas/index.js";

/** Lightweight alert view for WebSocket and API responses */
interface AlertView {
  id: number;
  touristId: string;
  alertType: string;
  lat?: number | null;
  lng?: number | null;
  status: string;
  message?: string | null;
  createdTime: string;
}

function mapToAlertView(alert: IAlert): AlertView {
  return {
    id: alert.alertId,
    touristId: alert.touristId,
    alertType: alert.alertType,
    lat: alert.latitude,
    lng: alert.longitude,
    status: alert.status,
    message: alert.message,
    createdTime: alert.createdAt ? new Date(alert.createdAt).toISOString() : new Date().toISOString(),
  };
}

export async function createAlert(alert: Partial<IAlert>) {
  // Auto-find nearest station if location provided
  let nearestStationId: string | undefined;
  if (typeof alert.latitude === "number" && typeof alert.longitude === "number") {
    try {
      const nearest = await PoliceDepartmentModel.findOne({
        isActive: true,
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: [alert.longitude, alert.latitude] },
            $maxDistance: 100000, // 100km
          },
        },
      }).lean();
      if (nearest) nearestStationId = nearest._id;
    } catch {
      // Geo index may not be built yet — fall back silently
    }
  }

  const saved = await createAlertDoc({
    ...alert,
    status: alert.status ?? "OPEN",
    nearestStationId,
  });

  if (saved.touristId) {
    await createNotification({
      touristId: saved.touristId,
      title: saved.alertType ?? "Alert",
      message: saved.message ?? "Safety alert received",
      type: "alert",
      sourceTab: "home",
      read: false,
      priority: saved.priority === "CRITICAL" ? "critical" : saved.priority === "HIGH" ? "urgent" : "normal",
      channel: "in_app",
    });
  }

  const view = mapToAlertView(saved);
  broadcastAlert(view);

  // Also push to the specific tourist's room
  if (saved.touristId) {
    broadcastToRoom(`tourist:${saved.touristId}`, { type: "ALERT", payload: view });
  }

  return saved;
}

export async function getActiveAlerts() {
  return getOpenAlerts();
}

export async function getAllAlerts() {
  return getAll();
}

export async function getRecentAlerts(limit: number) {
  const all = await getAll();
  if (limit <= 0 || all.length <= limit) {
    return all;
  }
  return all.slice(0, limit);
}

export async function getAlertsForTourist(touristId: string) {
  return getAlertsByTouristId(touristId);
}

export async function handleSOS(touristId: string, lat?: number, lng?: number, message?: string, media?: string[]) {
  const alertMessage = message ?? `TOURIST IN IMMEDIATE DANGER. LAST LOC: ${lat}, ${lng}`;
  return createAlert({
    touristId,
    latitude: lat,
    longitude: lng,
    alertType: "SOS",
    priority: "CRITICAL",
    message: alertMessage,
    escalationLevel: 3,
    media: media ?? [],
  });
}

/**
 * Silent pre-alert (2-second hold). Creates a PENDING alert for monitoring.
 */
export async function handlePreAlert(touristId: string, lat?: number, lng?: number) {
  return createAlert({
    touristId,
    latitude: lat,
    longitude: lng,
    alertType: "PRE_ALERT",
    priority: "MEDIUM",
    status: "PENDING",
    message: "Silent pre-alert triggered — tourist may need help.",
    preAlertTriggered: true,
    escalationLevel: 1,
  });
}

/**
 * Cancel an active alert (before full dispatch).
 */
export async function cancelAlert(alertId: number): Promise<IAlert | null> {
  const alert = await getAlertById(alertId);
  if (!alert) return null;
  if (alert.status === "RESOLVED" || alert.status === "CANCELLED") return alert;

  const updated = await updateAlertDoc(alertId, {
    status: "CANCELLED",
    cancelledAt: new Date(),
  } as Partial<IAlert>);

  if (updated) {
    broadcastAlert(mapToAlertView(updated));
  }
  return updated;
}

/**
 * Get alert status for polling.
 */
export async function getAlertStatus(alertId: number) {
  const alert = await getAlertById(alertId);
  if (!alert) return null;
  return {
    alertId: alert.alertId,
    status: alert.status,
    priority: alert.priority,
    escalationLevel: alert.escalationLevel,
    nearestStationId: alert.nearestStationId,
    resolvedBy: alert.resolvedBy,
    resolvedAt: alert.resolvedAt,
    createdAt: alert.createdAt,
  };
}

export async function updateAlertStatus(alertId: number, newStatus: string, resolvedBy?: string) {
  const alert = await getAlertById(alertId);
  if (!alert) {
    throw new Error(`Alert not found with ID: ${alertId}`);
  }

  const updateData: Partial<IAlert> = { status: newStatus } as Partial<IAlert>;
  if ((newStatus === "RESOLVED" || newStatus === "DISMISSED") && resolvedBy) {
    (updateData as any).resolvedBy = resolvedBy;
    (updateData as any).resolvedAt = new Date();
    // Compute response time
    if (alert.createdAt) {
      (updateData as any).responseTimeMs = Date.now() - new Date(alert.createdAt).getTime();
    }
  }

  const updated = await updateAlertDoc(alertId, updateData);
  if (updated) {
    broadcastAlert(mapToAlertView(updated));
  }
  return updated;
}
