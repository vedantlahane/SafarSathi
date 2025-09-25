package com.safarsathi.backendapi.services.Impl;

import com.safarsathi.backendapi.models.Tourist;
import com.safarsathi.backendapi.models.Alert;
import com.safarsathi.backendapi.services.AnomalyService;
import com.safarsathi.backendapi.services.AlertService;
import com.safarsathi.backendapi.util.GeoFenceUtil; // Utility for geospatial checks
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.Duration;
import java.time.Instant;

@Service
public class AnomalyServiceImpl implements AnomalyService {

    @Autowired
    private AlertService alertService;
    
    // MVP Rule Configuration
    private static final long INACTIVITY_THRESHOLD_MINUTES = 30; 
    private static final double DEVIATION_THRESHOLD_KM = 5.0;

    @Override
    public void processLocation(Tourist tourist, Integer accuracy) {
        // --- 1. Rule: Inactivity Check ---
        this.checkInactivity(tourist);
        
        // --- 2. Rule: Route Deviation (Mocked) ---
        // Assuming itinerary data is available for a real check
        this.checkRouteDeviation(tourist);
        
        // --- 3. Rule: Geo-Fence Check (Server-Side verification of client-side logic) ---
        this.checkGeoFence(tourist);
    }
    
    private void checkInactivity(Tourist tourist) {
        long minutesSinceLastSeen = Duration.between(tourist.getLastSeen(), Instant.now()).toMinutes();
        
        if (minutesSinceLastSeen > INACTIVITY_THRESHOLD_MINUTES) {
            Alert alert = new Alert();
            alert.setTouristId(tourist.getId());
            alert.setAlertType("INACTIVITY");
            alert.setLat(tourist.getCurrentLat());
            alert.setLng(tourist.getCurrentLng());
            alert.setMessage("Tourist has not sent a location update in " + minutesSinceLastSeen + " minutes.");
            
            // Generate the alert and push it to the dashboard via AlertService
            alertService.createAlert(alert); 
        }
    }
    
    private void checkRouteDeviation(Tourist tourist) {
        // MVP Mock: Check distance from a planned route (requires complex data, so we mock the calculation)
        double deviationKm = GeoFenceUtil.calculateDeviation(tourist.getCurrentLat(), tourist.getCurrentLng());
        
        if (deviationKm > DEVIATION_THRESHOLD_KM) {
            Alert alert = new Alert();
            alert.setTouristId(tourist.getId());
            alert.setAlertType("DEVIATION");
            alert.setLat(tourist.getCurrentLat());
            alert.setLng(tourist.getCurrentLng());
            alert.setMessage("Route deviation detected: " + String.format("%.2f", deviationKm) + " km off planned route.");
            
            alertService.createAlert(alert); 
        }
    }

    private void checkGeoFence(Tourist tourist) {
        // Geo-Fence check is needed server-side to prevent mobile app tampering
        if (GeoFenceUtil.isInHighRiskZone(tourist.getCurrentLat(), tourist.getCurrentLng())) {
            Alert alert = new Alert();
            alert.setTouristId(tourist.getId());
            alert.setAlertType("GEO_FENCE");
            alert.setLat(tourist.getCurrentLat());
            alert.setLng(tourist.getCurrentLng());
            alert.setMessage("Tourist entered a Server-Verified HIGH-RISK GEO-FENCE area.");
            
            alertService.createAlert(alert); 
        }
    }
}