package com.safarsathi.service;

import com.safarsathi.entity.Alert;
import com.safarsathi.entity.RiskZone;
import com.safarsathi.entity.Tourist;
import com.safarsathi.repository.TouristRepository;
import com.safarsathi.util.GeoFenceUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Detects anomalies: inactivity, route deviation, geo-fence breaches.
 */
@Service
@RequiredArgsConstructor
public class AnomalyService {

    private static final int INACTIVITY_THRESHOLD_MINUTES = 30;
    private static final double DEVIATION_THRESHOLD_KM = 5.0;

    private final AlertService alertService;
    private final RiskZoneService riskZoneService;
    private final TouristRepository touristRepository;

    private final Map<String, Set<Integer>> touristActiveZones = new ConcurrentHashMap<>();

    public void processLocation(Tourist tourist) {
        checkInactivity(tourist);
        checkRouteDeviation(tourist);
        checkGeoFence(tourist);
    }

    private void checkInactivity(Tourist tourist) {
        if (tourist.getLastSeen() == null) return;
        try {
            long lastSeenMs = java.time.Instant.parse(tourist.getLastSeen()).toEpochMilli();
            double minutesSince = (System.currentTimeMillis() - lastSeenMs) / 60000.0;
            if (minutesSince > INACTIVITY_THRESHOLD_MINUTES) {
                Alert alert = Alert.builder()
                        .touristId(tourist.getId())
                        .alertType("INACTIVITY")
                        .latitude(tourist.getCurrentLat())
                        .longitude(tourist.getCurrentLng())
                        .message(String.format("Tourist has not sent a location update in %d minutes.",
                                (int) minutesSince))
                        .build();
                alertService.createAlert(alert);
            }
        } catch (Exception ignored) {
            // Invalid timestamp, skip
        }
    }

    private void checkRouteDeviation(Tourist tourist) {
        double deviationKm = GeoFenceUtil.calculateDeviation(tourist.getCurrentLat(), tourist.getCurrentLng());
        if (deviationKm > DEVIATION_THRESHOLD_KM) {
            Alert alert = Alert.builder()
                    .touristId(tourist.getId())
                    .alertType("DEVIATION")
                    .latitude(tourist.getCurrentLat())
                    .longitude(tourist.getCurrentLng())
                    .message(String.format("Route deviation detected: %.2f km off planned route.", deviationKm))
                    .build();
            alertService.createAlert(alert);
        }
    }

    private void checkGeoFence(Tourist tourist) {
        Double lat = tourist.getCurrentLat();
        Double lng = tourist.getCurrentLng();
        if (lat == null || lng == null) return;

        List<RiskZone> activeZones = riskZoneService.listActiveRiskZones();
        if (activeZones.isEmpty()) {
            touristActiveZones.remove(tourist.getId());
            return;
        }

        Map<Integer, RiskZone> zoneLookup = activeZones.stream()
                .collect(Collectors.toMap(RiskZone::getZoneId, z -> z));

        Set<Integer> currentlyInside = activeZones.stream()
                .filter(zone -> GeoFenceUtil.isPointWithinRadius(lat, lng,
                        zone.getCenterLat(), zone.getCenterLng(), zone.getRadiusMeters()))
                .map(RiskZone::getZoneId)
                .collect(Collectors.toSet());

        Set<Integer> previous = touristActiveZones.getOrDefault(tourist.getId(), new HashSet<>());

        Set<Integer> entered = new HashSet<>(currentlyInside);
        entered.removeAll(previous);

        if (!currentlyInside.isEmpty()) {
            touristActiveZones.put(tourist.getId(), currentlyInside);
        } else {
            touristActiveZones.remove(tourist.getId());
        }

        if (entered.isEmpty()) return;

        double safetyScore = tourist.getSafetyScore() != null ? tourist.getSafetyScore() : 100.0;
        for (Integer zoneId : entered) {
            RiskZone zone = zoneLookup.get(zoneId);
            if (zone == null) continue;
            safetyScore = Math.max(0, safetyScore - penaltyFor(zone));
            Alert alert = Alert.builder()
                    .touristId(tourist.getId())
                    .alertType("RISK_ZONE")
                    .latitude(lat)
                    .longitude(lng)
                    .message(String.format("Tourist entered risk zone '%s' [%s]",
                            zone.getName(), zone.getRiskLevel()))
                    .build();
            alertService.createAlert(alert);
        }

        tourist.setSafetyScore(Math.max(0, Math.min(100, safetyScore)));
        touristRepository.save(tourist);
    }

    private double penaltyFor(RiskZone zone) {
        if (zone.getRiskLevel() == null) return 8.0;
        return switch (zone.getRiskLevel()) {
            case "LOW" -> 5.0;
            case "MEDIUM" -> 10.0;
            case "HIGH" -> 18.0;
            default -> 8.0;
        };
    }
}
