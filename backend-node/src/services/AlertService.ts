import { broadcastAlert } from "./websocketHub.js";
import {
  getAllAlerts as getAll,
  getAlertsByTouristId,
  getOpenAlerts,
  getAlertById,
  createAlert as createAlertDoc,
  updateAlert as updateAlertDoc,
  type IAlert,
} from "./mongoStore.js";

export async function createAlert(
  alert: Partial<IAlert>
) {
  const saved = await createAlertDoc({
    ...alert,
    status: alert.status ?? "OPEN",
  });
  broadcastAlert(saved);
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

export async function handleSOS(touristId: string, lat?: number, lng?: number) {
  const message = `TOURIST IN IMMEDIATE DANGER. LAST LOC: ${lat}, ${lng}`;
  return createAlert({
    touristId,
    latitude: lat,
    longitude: lng,
    alertType: "SOS",
    priority: "CRITICAL",
    message,
  });
}

export async function updateAlertStatus(alertId: number, newStatus: string) {
  const alert = await getAlertById(alertId);
  if (!alert) {
    throw new Error(`Alert not found with ID: ${alertId}`);
  }
  const updated = await updateAlertDoc(alertId, { status: newStatus });
  if (updated) {
    broadcastAlert(updated);
  }
  return updated;
}
