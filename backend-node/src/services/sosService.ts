import { handleSOS } from "./alertService.js";
import { updateLocation } from "./authService.js";

export function recordLocation(touristId: string, location: { lat: number; lng: number; accuracy?: number }) {
  return updateLocation(touristId, location.lat, location.lng, location.accuracy);
}

export function createSOS(touristId: string, lat?: number, lng?: number) {
  return handleSOS(touristId, lat, lng);
}
