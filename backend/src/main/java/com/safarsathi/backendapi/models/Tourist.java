package com.safarsathi.backendapi.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "tourists")
@Data // Includes @Getter, @Setter, @ToString, @EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class Tourist {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    // --- Fields from Register.jsx (New/Updated) ---
    @Column(nullable = false)
    private String name;
    
    @Column(unique = true, nullable = false) // 🚨 Added nullable=false for email since it's used for login
    private String email; 
    
    @Column(nullable = false)
    private String phone;
    
    // Mapped from frontend 'idNumber'
    @Column(nullable = false, name = "passport_number") 
    private String passportNumber; 
    
    private String dateOfBirth; 
    
    @Column(columnDefinition = "TEXT") 
    private String address; 
    
    private String gender;
    private String nationality;
    
    @Column(columnDefinition = "TEXT") 
    private String emergencyContact; 
    
    // 🔑 ADDED FIELD FOR SECURITY AND LOGIN
    @Column(nullable = false, name = "password_hash") 
    private String passwordHash; 
    
    // --- Core Security/Tracking Fields (Unchanged) ---
    
    // The SHA256 Hash (Digital ID Proof)
    @Column(unique = true, nullable = false)
    private String idHash; 
    
    private Instant idExpiry; 
    
    // Current live location data 
    private Double currentLat;
    private Double currentLng;
    private Instant lastSeen;

    @Column(name = "safety_score", nullable = false)
    private Double safetyScore = 100.0;

    @PrePersist
    public void ensureDefaults() {
        if (safetyScore == null) {
            safetyScore = 100.0;
        }
    }
}