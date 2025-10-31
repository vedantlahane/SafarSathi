package com.safarsathi.backendapi.services.Impl;

import com.safarsathi.backendapi.models.Tourist;
import com.safarsathi.backendapi.models.Alert;
import com.safarsathi.backendapi.models.RiskZone;
import com.safarsathi.backendapi.services.AnomalyService;
import com.safarsathi.backendapi.services.AlertService;
import com.safarsathi.backendapi.services.RiskZoneService;
import com.safarsathi.backendapi.repo.TouristRepository;
import com.safarsathi.backendapi.util.GeoFenceUtil; // Utility for geospatial checks
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.Duration;
import java.time.Instant;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class AnomalyServiceImpl implements AnomalyService {

    @Autowired
    private AlertService alertService;
    
    @Autowired
    private RiskZoneService riskZoneService;

    @Autowired
    private TouristRepository touristRepository;
    
    // MVP Rule Configuration
    private static final long INACTIVITY_THRESHOLD_MINUTES = 30; 
    private static final double DEVIATION_THRESHOLD_KM = 5.0;

    private static final Map<UUID, Set<Long>> touristActiveZones = new ConcurrentHashMap<>();

    @Override
    public void processLocation(Tourist tourist, Integer accuracy) {
        // --- 1. Rule: Inactivity Check ---
        this.checkInactivity(tourist);
        
        // --- 2. Rule: Route Deviation (Mocked) ---
        // Assuming itinerary data is available for a real check
        this.checkRouteDeviation(tourist);
        
        // --- 3. Rule: Geo-Fence Check (Real risk zone store) ---
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
        Double lat = tourist.getCurrentLat();
        Double lng = tourist.getCurrentLng();

        if (lat == null || lng == null) {
            return;
        }

        List<RiskZone> activeZones = riskZoneService.getActiveZones();
        if (activeZones.isEmpty()) {
            touristActiveZones.remove(tourist.getId());
            return;
        }

        Map<Long, RiskZone> zoneLookup = activeZones.stream()
                .collect(Collectors.toMap(RiskZone::getId, zone -> zone));

        Set<Long> currentlyInside = activeZones.stream()
                .filter(zone -> GeoFenceUtil.isPointWithinRadius(lat, lng, zone.getCenterLat(), zone.getCenterLng(), zone.getRadiusMeters()))
                .map(RiskZone::getId)
                .collect(Collectors.toSet());

        Set<Long> previous = touristActiveZones.getOrDefault(tourist.getId(), Collections.emptySet());
        Set<Long> entered = new HashSet<>(currentlyInside);
        entered.removeAll(previous);

        if (!currentlyInside.isEmpty()) {
            touristActiveZones.put(tourist.getId(), currentlyInside);
        } else {
            touristActiveZones.remove(tourist.getId());
        }

        if (entered.isEmpty()) {
            return;
        }

        double safetyScore = tourist.getSafetyScore() != null ? tourist.getSafetyScore() : 100.0;
        for (Long zoneId : entered) {
            RiskZone zone = zoneLookup.get(zoneId);
            if (zone == null) {
                continue;
            }

            safetyScore = Math.max(0.0, safetyScore - penaltyFor(zone.getRiskLevel()));

            Alert alert = new Alert();
            alert.setTouristId(tourist.getId());
            alert.setAlertType("RISK_ZONE");
            alert.setLat(lat);
            alert.setLng(lng);
            alert.setMessage("Tourist entered risk zone '" + zone.getName() + "' [" + zone.getRiskLevel() + "]");
            alertService.createAlert(alert);
        }

        tourist.setSafetyScore(Math.max(0.0, Math.min(100.0, safetyScore)));
        touristRepository.save(tourist);
    }

    private double penaltyFor(RiskZone.RiskLevel riskLevel) {
        if (riskLevel == null) {
            return 8.0;
        }
        return switch (riskLevel) {
            case LOW -> 5.0;
            case MEDIUM -> 10.0;
            case HIGH -> 18.0;
        };
    }
}