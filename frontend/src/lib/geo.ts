export type GpsLocation = {
  lat: number;
  lon: number;
};

export function haversineMeters(a: GpsLocation, b: GpsLocation): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusMeters = 6371000;

  const latDelta = toRad(b.lat - a.lat);
  const lonDelta = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(lonDelta / 2) ** 2;

  return 2 * earthRadiusMeters * Math.asin(Math.sqrt(h));
}

/**
 * Generates an array of [lng, lat] points forming a circle polygon for Mapbox GL GeoJSON.
 */
export function createCirclePolygon(
  center: GpsLocation,
  radiusMeters: number,
  points: number = 64
): [number, number][] {
  const coordinates: [number, number][] = [];
  const earthRadius = 6371000;

  for (let i = 0; i < points; i++) {
    const angle = (i * 360) / points;
    const toRad = (angle * Math.PI) / 180;

    const latRad = (center.lat * Math.PI) / 180;
    const lonRad = (center.lon * Math.PI) / 180;
    const distanceRad = radiusMeters / earthRadius;

    const newLatRad = Math.asin(
      Math.sin(latRad) * Math.cos(distanceRad) +
        Math.cos(latRad) * Math.sin(distanceRad) * Math.cos(toRad)
    );
    const newLonRad =
      lonRad +
      Math.atan2(
        Math.sin(toRad) * Math.sin(distanceRad) * Math.cos(latRad),
        Math.cos(distanceRad) - Math.sin(latRad) * Math.sin(newLatRad)
      );

    const newLat = (newLatRad * 180) / Math.PI;
    const newLon = (newLonRad * 180) / Math.PI;

    coordinates.push([newLon, newLat]);
  }

  // Close the polygon
  coordinates.push(coordinates[0]);

  return coordinates;
}
