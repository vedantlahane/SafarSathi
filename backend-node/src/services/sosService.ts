import { handleSOS, handlePreAlert, cancelAlert, getAlertStatus } from "./AlertService.js";
import { updateLocation } from "./authService.js";

export async function recordLocation(
  touristId: string,
  location: { lat: number; lng: number; accuracy?: number; speed?: number; heading?: number }
) {
  return updateLocation(touristId, location.lat, location.lng, location.accuracy, location.speed, location.heading);
}

export async function createSOS(touristId: string, lat?: number, lng?: number, message?: string, media?: string[]) {
  return handleSOS(touristId, lat, lng, message, media);
}

export async function createPreAlert(touristId: string, lat?: number, lng?: number) {
  return handlePreAlert(touristId, lat, lng);
}

export async function cancelSOSAlert(alertId: number) {
  return cancelAlert(alertId);
}

export async function getSOSStatus(alertId: number) {
  return getAlertStatus(alertId);
}
