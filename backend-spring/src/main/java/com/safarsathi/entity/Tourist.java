package com.safarsathi.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "tourists")
@CompoundIndex(def = "{'currentLat': 1, 'currentLng': 1}")
public class Tourist {

    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String email;

    private String phone;
    private String passportNumber;
    private String dateOfBirth;
    private String address;
    private String gender;
    private String nationality;
    private EmergencyContact emergencyContact;
    private String bloodType;
    private List<String> allergies;
    private List<String> medicalConditions;
    private String passwordHash;
    private String idHash;
    private String idExpiry;
    private String resetTokenHash;
    private Instant resetTokenExpires;
    private List<WebauthnCredential> webauthnCredentials;
    private Double currentLat;
    private Double currentLng;
    private String lastSeen;

    @Builder.Default
    private Double safetyScore = 100.0;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmergencyContact {
        private String name;
        private String phone;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WebauthnCredential {
        private String credentialId;
        private String publicKey;
        private int counter;
        private List<String> transports;
    }
}
