import type { Alert } from "../models/Alert.js";
import { alerts } from "./dataStore.js";
import { generateId } from "../utils/id.js";

export function recordLocation(touristId: string, location: { lat: number; lng: number }) {
  return {
    touristId,
    location,
    recordedAt: new Date().toISOString()
  };
}

export function createSOS(touristId: string, message?: string) {
  const alert: Alert = {
    id: generateId("alert"),
    touristId,
    message: message ?? "SOS triggered",
    status: "open",
    createdAt: new Date().toISOString()
  };
  alerts.push(alert);
  return alert;
}
