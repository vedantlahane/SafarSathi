import type { Alert } from "../models/Alert.js";
import { alerts, nextAlertId, saveStore } from "./dataStore.js";
import { broadcastAlert } from "./websocketHub.js";

const RESOLVED_STATUS = "RESOLVED";

export function createAlert(
  alert: Omit<Alert, "id" | "createdTime" | "status"> & Partial<Pick<Alert, "createdTime" | "status">>
) {
  const createdTime = alert.createdTime ?? new Date().toISOString();
  const status = alert.status ?? "NEW";
  const saved: Alert = {
    ...alert,
    id: nextAlertId(),
    createdTime,
    status
  };
  alerts.push(saved);
  broadcastAlert(saved);
  saveStore();
  return saved;
}

export function getActiveAlerts() {
  return alerts.filter((alert) => alert.status !== RESOLVED_STATUS);
}

export function getAllAlerts() {
  return [...alerts].sort((a, b) => b.createdTime.localeCompare(a.createdTime));
}

export function getRecentAlerts(limit: number) {
  const sorted = [...alerts].sort((a, b) => b.createdTime.localeCompare(a.createdTime));
  if (limit <= 0 || sorted.length <= limit) {
    return sorted;
  }
  return sorted.slice(0, limit);
}

export function getAlertsForTourist(touristId: string) {
  return alerts
    .filter((alert) => alert.touristId === touristId)
    .sort((a, b) => b.createdTime.localeCompare(a.createdTime));
}

export function handleSOS(touristId: string, lat?: number, lng?: number) {
  const message = `TOURIST IN IMMEDIATE DANGER. LAST LOC: ${lat}, ${lng}`;
  return createAlert({
    touristId,
    lat,
    lng,
    alertType: "SOS",
    message
  });
}

export function updateAlertStatus(alertId: number, newStatus: string) {
  const alert = alerts.find((a) => a.id === alertId);
  if (!alert) {
    throw new Error(`Alert not found with ID: ${alertId}`);
  }
  alert.status = newStatus;
  broadcastAlert(alert);
  saveStore();
  return alert;
}
