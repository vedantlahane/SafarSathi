package com.safarsathi.service;

import com.safarsathi.dto.*;
import com.safarsathi.entity.*;
import com.safarsathi.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TouristRepository touristRepository;
    private final AlertRepository alertRepository;
    private final PoliceDepartmentRepository policeDepartmentRepository;
    private final RiskZoneService riskZoneService;
    private final BlockchainService blockchainService;
    private final AlertService alertService;

    /**
     * Admin dashboard aggregated state.
     */
    public AdminDashboardResponse getAdminDashboardState() {
        List<Alert> allAlerts = alertRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        List<Tourist> allTourists = touristRepository.findAll();
        List<PoliceDepartment> allDepts = policeDepartmentRepository.findAll();

        List<Alert> recentAlerts = allAlerts.size() > 50 ? allAlerts.subList(0, 50) : allAlerts;
        Map<String, Tourist> touristLookup = allTourists.stream()
                .collect(Collectors.toMap(Tourist::getId, t -> t, (a, b) -> a));

        Map<String, List<Alert>> alertsByTourist = new HashMap<>();
        for (Alert alert : recentAlerts) {
            if (alert.getTouristId() != null) {
                alertsByTourist.computeIfAbsent(alert.getTouristId(), k -> new ArrayList<>()).add(alert);
            }
        }

        List<AlertView> alertViews = recentAlerts.stream()
                .map(a -> toAlertView(a, touristLookup.get(a.getTouristId())))
                .sorted(Comparator.comparing(AlertView::getTimestamp, Comparator.reverseOrder()))
                .collect(Collectors.toList());

        List<TouristSummary> touristSummaries = allTourists.stream()
                .map(t -> toTouristSummary(t, alertsByTourist.getOrDefault(t.getId(), List.of())))
                .sorted(Comparator.comparing(s -> s.getLastPing() != null ? s.getLastPing() : "",
                        Comparator.reverseOrder()))
                .collect(Collectors.toList());

        long criticalAlerts = alertViews.stream()
                .filter(a -> "critical".equals(a.getPriority()) && isAlertActive(a.getStatus()))
                .count();
        long activeAlerts = alertViews.stream()
                .filter(a -> isAlertActive(a.getStatus()))
                .count();
        long monitoredTourists = touristSummaries.stream()
                .filter(s -> !"safe".equals(s.getStatus()))
                .count();

        List<ResponseUnitView> responseUnits = allDepts.stream()
                .map(this::toResponseUnit)
                .collect(Collectors.toList());

        return AdminDashboardResponse.builder()
                .stats(AdminDashboardResponse.DashboardStats.builder()
                        .criticalAlerts(criticalAlerts)
                        .activeAlerts(activeAlerts)
                        .monitoredTourists(monitoredTourists)
                        .totalTourists(allTourists.size())
                        .build())
                .alerts(alertViews)
                .tourists(touristSummaries)
                .responseUnits(responseUnits)
                .build();
    }

    /**
     * Tourist-specific dashboard.
     */
    public TouristDashboardResponse getTouristDashboard(String touristId) {
        Tourist tourist = touristRepository.findById(touristId).orElse(null);
        if (tourist == null) return null;

        List<Alert> touristAlerts = alertService.getAlertsForTourist(touristId);
        List<RiskZone> activeRiskZones = riskZoneService.listActiveRiskZones();
        List<BlockchainLog> bcLogs = blockchainService.getRecentLogs(touristId, 10);

        double safetyScore = tourist.getSafetyScore() != null ? tourist.getSafetyScore() : 100.0;

        List<TouristDashboardResponse.TouristAlertView> alertViews = touristAlerts.stream()
                .map(this::toTouristAlertView)
                .collect(Collectors.toList());

        String status = deriveTouristStatus(safetyScore, alertViews);

        Map<String, String> ecMap = null;
        if (tourist.getEmergencyContact() != null) {
            ecMap = new HashMap<>();
            ecMap.put("name", tourist.getEmergencyContact().getName());
            ecMap.put("phone", tourist.getEmergencyContact().getPhone());
        }

        TouristDashboardResponse.TouristProfile profile = TouristDashboardResponse.TouristProfile.builder()
                .id(tourist.getId())
                .name(tourist.getName())
                .email(tourist.getEmail())
                .phone(tourist.getPhone())
                .passportNumber(tourist.getPassportNumber())
                .dateOfBirth(tourist.getDateOfBirth())
                .address(tourist.getAddress())
                .gender(tourist.getGender())
                .nationality(tourist.getNationality())
                .emergencyContact(ecMap)
                .bloodType(tourist.getBloodType())
                .allergies(tourist.getAllergies())
                .medicalConditions(tourist.getMedicalConditions())
                .safetyScore(safetyScore)
                .idHash(tourist.getIdHash())
                .build();

        List<TouristDashboardResponse.RiskZoneView> riskZoneViews = activeRiskZones.stream()
                .map(this::toRiskZoneView)
                .collect(Collectors.toList());

        List<TouristDashboardResponse.BlockchainLogView> bcViews = bcLogs.stream()
                .map(log -> TouristDashboardResponse.BlockchainLogView.builder()
                        .id(log.getLogId())
                        .transactionId(log.getTransactionId())
                        .status(log.getStatus())
                        .timestamp(log.getCreatedAt() != null ? log.getCreatedAt().toString() : Instant.now().toString())
                        .build())
                .collect(Collectors.toList());

        long openAlerts = alertViews.stream()
                .filter(a -> isAlertActive(a.getStatus()))
                .count();

        return TouristDashboardResponse.builder()
                .profile(profile)
                .alerts(alertViews)
                .safetyScore(safetyScore)
                .status(status)
                .lastLocation(TouristDashboardResponse.LastLocation.builder()
                        .lat(tourist.getCurrentLat())
                        .lng(tourist.getCurrentLng())
                        .lastSeen(tourist.getLastSeen())
                        .build())
                .riskZones(riskZoneViews)
                .openAlerts((int) openAlerts)
                .blockchainLogs(bcViews)
                .build();
    }

    // --- Mapping helpers ---

    private AlertView toAlertView(Alert alert, Tourist tourist) {
        return AlertView.builder()
                .id(alert.getAlertId())
                .touristId(alert.getTouristId())
                .touristName(tourist != null ? tourist.getName() : "Unknown")
                .alertType(alert.getAlertType())
                .priority(derivePriority(alert))
                .status(alert.getStatus())
                .description(alert.getMessage() != null ? alert.getMessage() : alert.getAlertType())
                .timestamp(alert.getCreatedAt() != null ? alert.getCreatedAt().toString() : Instant.now().toString())
                .lat(alert.getLatitude())
                .lng(alert.getLongitude())
                .assignedUnit(null)
                .build();
    }

    private TouristSummary toTouristSummary(Tourist tourist, List<Alert> alertsForTourist) {
        double safetyScore = tourist.getSafetyScore() != null ? tourist.getSafetyScore() : 100.0;
        List<TouristDashboardResponse.TouristAlertView> alertViews = alertsForTourist.stream()
                .map(this::toTouristAlertView)
                .collect(Collectors.toList());

        String status = deriveTouristStatus(safetyScore, alertViews);

        return TouristSummary.builder()
                .id(tourist.getId())
                .name(tourist.getName())
                .status(status)
                .safetyScore(safetyScore)
                .lastPing(tourist.getLastSeen())
                .lat(tourist.getCurrentLat())
                .lng(tourist.getCurrentLng())
                .lastKnownArea(buildLastKnownArea(tourist.getCurrentLat(), tourist.getCurrentLng()))
                .build();
    }

    private ResponseUnitView toResponseUnit(PoliceDepartment dept) {
        String status = Boolean.TRUE.equals(dept.getIsActive()) ? "available" : "offline";
        String type = dept.getDepartmentCode() != null &&
                dept.getDepartmentCode().toUpperCase().contains("CONTROL") ? "Control Center" : "Response Unit";
        return ResponseUnitView.builder()
                .id(dept.getId())
                .name(dept.getName())
                .status(status)
                .type(type)
                .city(dept.getCity())
                .district(dept.getDistrict())
                .state(dept.getState())
                .lat(dept.getLatitude())
                .lng(dept.getLongitude())
                .etaMinutes(Boolean.TRUE.equals(dept.getIsActive()) ? 6 : 15)
                .contactNumber(dept.getContactNumber())
                .build();
    }

    private TouristDashboardResponse.TouristAlertView toTouristAlertView(Alert alert) {
        return TouristDashboardResponse.TouristAlertView.builder()
                .id(alert.getAlertId())
                .alertType(alert.getAlertType())
                .priority(derivePriority(alert))
                .status(alert.getStatus())
                .message(alert.getMessage())
                .timestamp(alert.getCreatedAt() != null ? alert.getCreatedAt().toString() : Instant.now().toString())
                .build();
    }

    private TouristDashboardResponse.RiskZoneView toRiskZoneView(RiskZone zone) {
        return TouristDashboardResponse.RiskZoneView.builder()
                .id(zone.getZoneId())
                .name(zone.getName())
                .description(zone.getDescription())
                .centerLat(zone.getCenterLat())
                .centerLng(zone.getCenterLng())
                .radiusMeters(zone.getRadiusMeters())
                .riskLevel(zone.getRiskLevel())
                .active(zone.getActive())
                .updatedAt(zone.getUpdatedAt() != null ? zone.getUpdatedAt().toString() : null)
                .build();
    }

    private String derivePriority(Alert alert) {
        if (alert.getAlertType() == null) return "info";
        return switch (alert.getAlertType().toUpperCase()) {
            case "SOS" -> "critical";
            case "RISK_ZONE", "DEVIATION", "INACTIVITY" -> "high";
            default -> "info";
        };
    }

    private String deriveTouristStatus(double safetyScore,
                                       List<TouristDashboardResponse.TouristAlertView> alerts) {
        boolean hasCriticalActive = alerts.stream()
                .anyMatch(a -> "critical".equals(a.getPriority()) && isAlertActive(a.getStatus()));
        if (hasCriticalActive) return "sos";

        boolean hasActiveAlert = alerts.stream().anyMatch(a -> isAlertActive(a.getStatus()));
        if (hasActiveAlert || safetyScore < 70.0) return "warning";

        return "safe";
    }

    private boolean isAlertActive(String status) {
        return status == null || !"RESOLVED".equalsIgnoreCase(status);
    }

    private String buildLastKnownArea(Double lat, Double lng) {
        if (lat == null || lng == null) return "Unknown";
        return String.format("%.4f, %.4f", lat, lng);
    }
}
