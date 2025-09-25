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
        // MVP Rule: Generate a GEO_FENCE alert randomly 5% of the time for demo data.
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
    
    // NOTE: A real implementation would use the Haversine formula here.
}