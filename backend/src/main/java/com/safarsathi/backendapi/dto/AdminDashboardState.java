package com.safarsathi.backendapi.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record AdminDashboardState(
        AdminStats stats,
        List<AlertView> alerts,
        List<TouristSummary> tourists,
        List<ResponseUnit> responseUnits
) {
    public record AdminStats(
            int criticalAlerts,
            int activeAlerts,
            int monitoredTourists,
            int totalTourists
    ) {}

    public record AlertView(
            Long id,
            UUID touristId,
            String touristName,
            String alertType,
            String priority,
            String status,
            String description,
            Instant timestamp,
            Double lat,
            Double lng,
            String assignedUnit
    ) {}

    public record TouristSummary(
            UUID id,
            String name,
            String status,
            Double safetyScore,
            Instant lastPing,
            Double lat,
            Double lng,
            String lastKnownArea
    ) {}

    public record ResponseUnit(
            UUID id,
            String name,
            String status,
            String type,
            String city,
            String district,
            String state,
            Double lat,
            Double lng,
            Integer etaMinutes,
            String contactNumber
    ) {}
}
