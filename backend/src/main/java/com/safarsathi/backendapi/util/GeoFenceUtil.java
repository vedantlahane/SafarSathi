package com.safarsathi.backendapi.util;

import java.util.Random;

/**
 * MVP Mock Utility for Geospatial and Geo-Fence Calculations.
 * In a production environment, this would use a spatial database (like PostGIS)
 * or a specialized library (like JTS) for accurate calculations.
 */
public class GeoFenceUtil {

    private GeoFenceUtil() {
        // Private constructor to prevent instantiation
    }

    /**
     * Mock check to simulate entering a high-risk geo-fence area.
     * @param lat Latitude of the tourist.
     * @param lng Longitude of the tourist.
     * @return True if the tourist has entered a mock dangerous area (random chance).
     */
    public static boolean isInHighRiskZone(Double lat, Double lng) {
        // Legacy helper retained for backward compatibility with mock logic.
        if (lat == null || lng == null) return false;
        return new Random().nextInt(100) < 5;
    }
    
    /**
     * Mock function to simulate calculating the route deviation in kilometers.
     * @param lat Current latitude.
     * @param lng Current longitude.
     * @return A random distance in km.
     */
    public static double calculateDeviation(Double lat, Double lng) {
        // MVP Rule: Mock calculation return a random value between 0 and 7 km.
        if (lat == null || lng == null) return 0.0;
        return new Random().nextDouble() * 7.0; 
    }

    /**
     * Determines whether a given coordinate lies within a radius of a center point.
     * Uses the Haversine formula to compute the geodesic distance in meters.
     */
    public static boolean isPointWithinRadius(Double lat, Double lng,
                                              Double centerLat, Double centerLng,
                                              Double radiusMeters) {
        if (lat == null || lng == null || centerLat == null || centerLng == null || radiusMeters == null) {
            return false;
        }

        double distance = haversineMeters(lat, lng, centerLat, centerLng);
        return distance <= radiusMeters;
    }

    /**
     * Calculates the distance between two coordinates using the Haversine formula.
     * @return Distance in meters.
     */
    public static double haversineMeters(Double lat1, Double lng1, Double lat2, Double lng2) {
        if (lat1 == null || lng1 == null || lat2 == null || lng2 == null) {
            return Double.POSITIVE_INFINITY;
        }

        final double EARTH_RADIUS_KM = 6371.0088;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);

        double a = Math.pow(Math.sin(dLat / 2), 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.pow(Math.sin(dLng / 2), 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        double distanceKm = EARTH_RADIUS_KM * c;
        return distanceKm * 1000;
    }
    
    // NOTE: A real implementation would use the Haversine formula here.
}