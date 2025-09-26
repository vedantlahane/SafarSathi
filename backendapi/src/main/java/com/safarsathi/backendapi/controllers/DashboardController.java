package com.safarsathi.backendapi.controllers;

import com.safarsathi.backendapi.dto.AdminDashboardState;
import com.safarsathi.backendapi.dto.TouristDashboardState;
import com.safarsathi.backendapi.models.Alert;
import com.safarsathi.backendapi.models.BlockchainLog;
import com.safarsathi.backendapi.models.PoliceDepartment;
import com.safarsathi.backendapi.models.RiskZone;
import com.safarsathi.backendapi.models.Tourist;
import com.safarsathi.backendapi.services.AlertService;
import com.safarsathi.backendapi.services.BlockchainService;
import com.safarsathi.backendapi.services.PoliceDepartmentService;
import com.safarsathi.backendapi.services.RiskZoneService;
import com.safarsathi.backendapi.services.TouristService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class DashboardController {

    private final AlertService alertService;
    private final TouristService touristService;
    private final PoliceDepartmentService policeDepartmentService;
    private final RiskZoneService riskZoneService;
    private final BlockchainService blockchainService;

    public DashboardController(AlertService alertService,
                               TouristService touristService,
                               PoliceDepartmentService policeDepartmentService,
                               RiskZoneService riskZoneService,
                               BlockchainService blockchainService) {
        this.alertService = alertService;
        this.touristService = touristService;
        this.policeDepartmentService = policeDepartmentService;
        this.riskZoneService = riskZoneService;
        this.blockchainService = blockchainService;
    }

    @GetMapping("/admin/dashboard/state")
    public ResponseEntity<AdminDashboardState> getAdminDashboardState() {
        List<Alert> alerts = alertService.getRecentAlerts(50);
        List<Tourist> tourists = touristService.getAllTourists();
        List<PoliceDepartment> departments = policeDepartmentService.findAllDepartments();

        Map<UUID, Tourist> touristLookup = tourists.stream()
                .collect(Collectors.toMap(Tourist::getId, t -> t));

        Map<UUID, List<Alert>> alertsByTourist = alerts.stream()
                .filter(alert -> alert.getTouristId() != null)
                .collect(Collectors.groupingBy(Alert::getTouristId));

        List<AdminDashboardState.AlertView> alertViews = alerts.stream()
                .map(alert -> toAlertView(alert, touristLookup.get(alert.getTouristId())))
                .sorted(Comparator.comparing(AdminDashboardState.AlertView::timestamp).reversed())
                .toList();

        List<AdminDashboardState.TouristSummary> touristSummaries = tourists.stream()
                .map(tourist -> toTouristSummary(tourist, alertsByTourist.getOrDefault(tourist.getId(), Collections.emptyList())))
                .sorted(Comparator.comparing(AdminDashboardState.TouristSummary::lastPing, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();

        AdminDashboardState.AdminStats stats = new AdminDashboardState.AdminStats(
                (int) alertViews.stream().filter(alert -> "critical".equalsIgnoreCase(alert.priority()) && isAlertActive(alert.status())).count(),
                (int) alertViews.stream().filter(alert -> isAlertActive(alert.status())).count(),
                (int) touristSummaries.stream().filter(summary -> !"safe".equalsIgnoreCase(summary.status())).count(),
                touristSummaries.size()
        );

        List<AdminDashboardState.ResponseUnit> responseUnits = departments.stream()
                .map(this::toResponseUnit)
                .toList();

        AdminDashboardState state = new AdminDashboardState(stats, alertViews, touristSummaries, responseUnits);
        return ResponseEntity.ok(state);
    }

    @GetMapping("/tourist/{touristId}/dashboard")
    public ResponseEntity<TouristDashboardState> getTouristDashboard(@PathVariable UUID touristId) {
        Tourist tourist = touristService.getTouristById(touristId);
        if (tourist == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tourist not found");
        }

        List<Alert> alerts = alertService.getAlertsForTourist(touristId);
        List<RiskZone> riskZones = riskZoneService.getActiveZones();
        List<BlockchainLog> blockchainLogs = blockchainService.getRecentLogs(touristId, 10);

        List<TouristDashboardState.TouristAlert> alertViews = alerts.stream()
                .map(this::toTouristAlert)
                .sorted(Comparator.comparing(TouristDashboardState.TouristAlert::timestamp, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();

        double safetyScore = tourist.getSafetyScore() != null ? tourist.getSafetyScore() : 100.0;
        String status = deriveTouristStatus(safetyScore, alertViews);

        TouristDashboardState.TouristProfile profile = new TouristDashboardState.TouristProfile(
                tourist.getId(),
                tourist.getName(),
                tourist.getEmail(),
                tourist.getPhone(),
                tourist.getPassportNumber(),
                tourist.getDateOfBirth(),
                tourist.getAddress(),
                tourist.getGender(),
                tourist.getNationality(),
                tourist.getEmergencyContact(),
                safetyScore,
                tourist.getIdHash()
        );

        TouristDashboardState.LocationSnapshot locationSnapshot = new TouristDashboardState.LocationSnapshot(
                tourist.getCurrentLat(),
                tourist.getCurrentLng(),
                tourist.getLastSeen()
        );

        List<TouristDashboardState.RiskZoneView> riskZoneViews = riskZones.stream()
                .map(this::toRiskZoneView)
                .toList();

        List<TouristDashboardState.BlockchainLogView> blockchainViews = blockchainLogs.stream()
                .map(this::toBlockchainView)
                .toList();

        int openAlerts = (int) alertViews.stream()
                .filter(alert -> isAlertActive(alert.status()))
                .count();

        TouristDashboardState state = new TouristDashboardState(
                profile,
                alertViews,
                safetyScore,
                status,
                locationSnapshot,
                riskZoneViews,
                openAlerts,
                blockchainViews
        );
        return ResponseEntity.ok(state);
    }

    private AdminDashboardState.AlertView toAlertView(Alert alert, Tourist tourist) {
        String priority = derivePriority(alert);
        String description = alert.getMessage() != null ? alert.getMessage() : alert.getAlertType();
        Instant timestamp = alert.getCreatedTime();
        String touristName = tourist != null ? tourist.getName() : "Unknown";

        return new AdminDashboardState.AlertView(
                alert.getId(),
                alert.getTouristId(),
                touristName,
                alert.getAlertType(),
                priority,
                alert.getStatus(),
                description,
                timestamp,
                alert.getLat(),
                alert.getLng(),
                null
        );
    }

    private AdminDashboardState.TouristSummary toTouristSummary(Tourist tourist, List<Alert> alerts) {
        double safetyScore = tourist.getSafetyScore() != null ? tourist.getSafetyScore() : 100.0;
        String status = deriveTouristStatus(safetyScore, alerts.stream().map(this::toTouristAlert).toList());
        String lastKnownArea = buildLastKnownArea(tourist.getCurrentLat(), tourist.getCurrentLng());

        return new AdminDashboardState.TouristSummary(
                tourist.getId(),
                tourist.getName(),
                status,
                safetyScore,
                tourist.getLastSeen(),
                tourist.getCurrentLat(),
                tourist.getCurrentLng(),
                lastKnownArea
        );
    }

    private AdminDashboardState.ResponseUnit toResponseUnit(PoliceDepartment department) {
        String status = Boolean.TRUE.equals(department.getIsActive()) ? "available" : "offline";
        String type = department.getDepartmentCode() != null && department.getDepartmentCode().toUpperCase().contains("CONTROL")
                ? "Control Center"
                : "Response Unit";
        int etaMinutes = Boolean.TRUE.equals(department.getIsActive()) ? 6 : 15;

        return new AdminDashboardState.ResponseUnit(
                department.getId(),
                department.getName(),
                status,
                type,
                department.getCity(),
                department.getDistrict(),
                department.getState(),
                department.getLatitude(),
                department.getLongitude(),
                etaMinutes,
                department.getContactNumber()
        );
    }

    private TouristDashboardState.TouristAlert toTouristAlert(Alert alert) {
        return new TouristDashboardState.TouristAlert(
                alert.getId(),
                alert.getAlertType(),
                derivePriority(alert),
                alert.getStatus(),
                alert.getMessage(),
                alert.getCreatedTime()
        );
    }

    private TouristDashboardState.RiskZoneView toRiskZoneView(RiskZone zone) {
        return new TouristDashboardState.RiskZoneView(
                zone.getId(),
                zone.getName(),
                zone.getDescription(),
                zone.getCenterLat(),
                zone.getCenterLng(),
                zone.getRadiusMeters(),
                zone.getRiskLevel() != null ? zone.getRiskLevel().name() : null,
                zone.isActive(),
                zone.getUpdatedAt()
        );
    }

    private TouristDashboardState.BlockchainLogView toBlockchainView(BlockchainLog log) {
        return new TouristDashboardState.BlockchainLogView(
                log.getId(),
                log.getTransactionId(),
                log.getStatus(),
                log.getTimestamp()
        );
    }

    private String deriveTouristStatus(double safetyScore, List<TouristDashboardState.TouristAlert> alerts) {
        boolean hasCriticalAlert = alerts.stream()
                .anyMatch(alert -> isAlertActive(alert.status()) && "critical".equalsIgnoreCase(alert.priority()));
        if (hasCriticalAlert) {
            return "sos";
        }

        boolean hasWarningAlert = alerts.stream()
                .anyMatch(alert -> isAlertActive(alert.status()));
        if (hasWarningAlert || safetyScore < 70.0) {
            return "warning";
        }
        return "safe";
    }

    private String derivePriority(Alert alert) {
        String type = alert.getAlertType() != null ? alert.getAlertType().toUpperCase() : "";
        return switch (type) {
            case "SOS" -> "critical";
            case "RISK_ZONE", "DEVIATION", "INACTIVITY" -> "high";
            default -> "info";
        };
    }

    private boolean isAlertActive(String status) {
        return status == null || !"RESOLVED".equalsIgnoreCase(status);
    }

    private String buildLastKnownArea(Double lat, Double lng) {
        if (lat == null || lng == null) {
            return "Unknown";
        }
        return String.format("%.4f, %.4f", lat, lng);
    }
}
