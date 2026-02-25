package com.safarsathi.util;

/**
 * Geo-fencing utilities: Haversine distance, radius checks, deviation detection.
 */
public final class GeoFenceUtil {

    private static final double EARTH_RADIUS_KM = 6371.0088;

    private GeoFenceUtil() {
    }

    /**
     * Calculate route deviation (stub - always returns 0 for now).
     */
    public static double calculateDeviation(Double lat, Double lng) {
        if (lat == null || lng == null) return 0.0;
        return 0.0;
    }

    /**
     * Check if a point is within a circular radius.
     */
    public static boolean isPointWithinRadius(Double lat, Double lng,
                                              Double centerLat, Double centerLng,
                                              Double radiusMeters) {
        if (lat == null || lng == null || centerLat == null || centerLng == null || radiusMeters == null) {
            return false;
        }
        return haversineMeters(lat, lng, centerLat, centerLng) <= radiusMeters;
    }

    /**
     * Haversine formula to compute the great-circle distance in meters.
     */
    public static double haversineMeters(double lat1, double lng1, double lat2, double lng2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c * 1000;
    }
}
