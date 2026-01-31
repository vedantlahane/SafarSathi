import type { AdminUser } from "../models/admin.js";
import type { Alert } from "../models/Alert.js";
import { alerts, tourists } from "./dataStore.js";
import { generateId } from "../utils/id.js";

const admins: AdminUser[] = [
  { id: generateId("admin"), email: "admin@safarsathi.local", name: "Admin" }
];

export function loginAdmin(email: string) {
  const admin = admins.find((a) => a.email === email);
  if (!admin) {
    return { ok: false, message: "Invalid credentials" };
  }
  return { ok: true, admin, token: `admin_${admin.id}` };
}

export function verifyTouristId(_idNumber: string) {
  return { ok: true, verified: true, reason: "stubbed" };
}

export function listAlerts(): Alert[] {
  return alerts;
}

export function updateAlertStatus(alertId: string, status: Alert["status"]) {
  const alert = alerts.find((a) => a.id === alertId);
  if (!alert) {
    return { ok: false, message: "Alert not found" };
  }
  alert.status = status;
  return { ok: true, alert };
}

export function listTourists() {
  return tourists;
}
