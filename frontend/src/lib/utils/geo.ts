/** Convert degrees to radians. */
export function degreesToRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
}

/**
 * Calculate Haversine distance between two lat/lng points.
 * @returns Distance in meters
 */
export function haversineDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = degreesToRadians(lat1);
    const φ2 = degreesToRadians(lat2);
    const Δφ = degreesToRadians(lat2 - lat1);
    const Δλ = degreesToRadians(lng2 - lng1);

    const a =
        Math.sin(Δφ / 2) ** 2 +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

/**
 * Check if a point is inside a circle.
 * @returns true if the point is within the radius (in meters)
 */
export function isInsideCircle(
    pointLat: number,
    pointLng: number,
    centerLat: number,
    centerLng: number,
    radiusMeters: number
): boolean {
    return (
        haversineDistance(pointLat, pointLng, centerLat, centerLng) <= radiusMeters
    );
}
