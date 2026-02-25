package com.safarsathi.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TouristDashboardResponse {
    private TouristProfile profile;
    private List<TouristAlertView> alerts;
    private Double safetyScore;
    private String status;
    private LastLocation lastLocation;
    private List<RiskZoneView> riskZones;
    private Integer openAlerts;
    private List<BlockchainLogView> blockchainLogs;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TouristProfile {
        private String id;
        private String name;
        private String email;
        private String phone;
        private String passportNumber;
        private String dateOfBirth;
        private String address;
        private String gender;
        private String nationality;
        private Map<String, String> emergencyContact;
        private String bloodType;
        private List<String> allergies;
        private List<String> medicalConditions;
        private Double safetyScore;
        private String idHash;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TouristAlertView {
        private Integer id;
        private String alertType;
        private String priority;
        private String status;
        private String message;
        private String timestamp;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LastLocation {
        private Double lat;
        private Double lng;
        private String lastSeen;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RiskZoneView {
        private Integer id;
        private String name;
        private String description;
        private Double centerLat;
        private Double centerLng;
        private Double radiusMeters;
        private String riskLevel;
        private Boolean active;
        private String updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BlockchainLogView {
        private Integer id;
        private String transactionId;
        private String status;
        private String timestamp;
    }
}
