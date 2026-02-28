/**
 * Calculate deviation of a tourist's current position from their planned itinerary.
 * Uses the nearest itinerary waypoint to compute distance in kilometers.
 * If no waypoints are provided, returns 0 (no deviation detectable).
 */
export function calculateDeviation(
  lat?: number,
  lng?: number,
  itineraryWaypoints?: Array<{ lat: number; lng: number }>
) {
  if (typeof lat !== "number" || typeof lng !== "number") {
    return 0;
  }
  if (!itineraryWaypoints || itineraryWaypoints.length === 0) {
    return 0;
  }

  // Find the minimum distance to any waypoint
  let minDistanceKm = Infinity;
  for (const wp of itineraryWaypoints) {
    const distKm = haversineMeters(lat, lng, wp.lat, wp.lng) / 1000;
    if (distKm < minDistanceKm) {
      minDistanceKm = distKm;
    }
  }
  return minDistanceKm === Infinity ? 0 : minDistanceKm;
}

export function isPointWithinRadius(
  lat?: number,
  lng?: number,
  centerLat?: number,
  centerLng?: number,
  radiusMeters?: number
) {
  if (
    typeof lat !== "number" ||
    typeof lng !== "number" ||
    typeof centerLat !== "number" ||
    typeof centerLng !== "number" ||
    typeof radiusMeters !== "number"
  ) {
    return false;
  }
  return haversineMeters(lat, lng, centerLat, centerLng) <= radiusMeters;
}

export function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const earthRadiusKm = 6371.0088;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c * 1000;
}

function toRadians(deg: number) {
  return (deg * Math.PI) / 180;
}
