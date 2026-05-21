import RBush from "rbush";
import { point, polygon as turfPolygon } from "@turf/helpers";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import distance from "@turf/distance";
import type { RiskZone } from "@/pages/user/map/types";

export interface ZoneBBox {
  minX: number; // minLng
  minY: number; // minLat
  maxX: number; // maxLng
  maxY: number; // maxLat
  zone: RiskZone;
}

export class GeofenceEngine {
  private tree: RBush<ZoneBBox>;

  constructor(zones: RiskZone[]) {
    this.tree = new RBush<ZoneBBox>();
    const items = zones.map((zone) => {
      let minX = Number.MAX_VALUE;
      let minY = Number.MAX_VALUE;
      let maxX = -Number.MAX_VALUE;
      let maxY = -Number.MAX_VALUE;

      if (zone.shapeType === "polygon" && zone.polygonCoordinates?.length) {
        zone.polygonCoordinates.forEach(([lat, lng]) => {
          if (lng < minX) minX = lng;
          if (lat < minY) minY = lat;
          if (lng > maxX) maxX = lng;
          if (lat > maxY) maxY = lat;
        });
      } else {
        // Circle approximation (1 degree latitude is approx 111,320 meters)
        // 1 degree longitude depends on latitude: 111,320 * cos(lat)
        const latMeters = 111320;
        const lngMeters = 111320 * Math.cos((zone.centerLat * Math.PI) / 180);
        
        const latDelta = zone.radiusMeters / latMeters;
        const lngDelta = zone.radiusMeters / lngMeters;
        
        minX = zone.centerLng - lngDelta;
        maxX = zone.centerLng + lngDelta;
        minY = zone.centerLat - latDelta;
        maxY = zone.centerLat + latDelta;
      }

      return { minX, minY, maxX, maxY, zone };
    });
    this.tree.load(items);
  }

  /**
   * Find all zones that the given coordinate is exactly inside.
   */
  public findIntersectingZones(lat: number, lng: number): RiskZone[] {
    // 1. Fast R-Tree bounding box check
    const candidates = this.tree.search({
      minX: lng,
      minY: lat,
      maxX: lng,
      maxY: lat,
    });

    const pt = point([lng, lat]);
    const results: RiskZone[] = [];

    // 2. Exact geometry check using Turf.js
    for (const item of candidates) {
      const zone = item.zone;

      if (zone.shapeType === "polygon" && zone.polygonCoordinates?.length) {
        // Ensure ring is closed for Turf.js
        const coords = zone.polygonCoordinates.map(([zLat, zLng]) => [zLng, zLat]); // Turf is [lng, lat]
        if (
          coords[0][0] !== coords[coords.length - 1][0] ||
          coords[0][1] !== coords[coords.length - 1][1]
        ) {
          coords.push([...coords[0]]);
        }
        
        if (coords.length >= 4) {
          try {
            const poly = turfPolygon([coords]);
            if (booleanPointInPolygon(pt, poly)) {
              results.push(zone);
            }
          } catch (e) {
            console.error("Invalid polygon geometry in geofence engine", e);
          }
        }
      } else {
        // Exact distance check for circle
        const center = point([zone.centerLng, zone.centerLat]);
        const distMeters = distance(pt, center, { units: "meters" });
        if (distMeters <= zone.radiusMeters) {
          results.push(zone);
        }
      }
    }

    return results;
  }
}
