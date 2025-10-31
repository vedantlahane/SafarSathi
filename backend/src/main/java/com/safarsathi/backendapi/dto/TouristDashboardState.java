package com.safarsathi.backendapi.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record TouristDashboardState(
        TouristProfile profile,
        List<TouristAlert> alerts,
        double safetyScore,
        String status,
        LocationSnapshot lastLocation,
        List<RiskZoneView> riskZones,
        int openAlerts,
        List<BlockchainLogView> blockchainLogs
) {
    public record TouristProfile(
            UUID id,
            String name,
            String email,
            String phone,
            String passportNumber,
            String dateOfBirth,
            String address,
            String gender,
            String nationality,
            String emergencyContact,
            Double safetyScore,
            String idHash
    ) {}

    public record TouristAlert(
            Long id,
            String alertType,
            String priority,
            String status,
            String message,
            Instant timestamp
    ) {}

    public record LocationSnapshot(
            Double lat,
            Double lng,
            Instant lastSeen
    ) {}

    public record RiskZoneView(
            Long id,
            String name,
            String description,
            Double centerLat,
            Double centerLng,
            Double radiusMeters,
            String riskLevel,
            boolean active,
            Instant updatedAt
    ) {}

    public record BlockchainLogView(
            Long id,
            String transactionId,
            String status,
            Instant timestamp
    ) {}
}
