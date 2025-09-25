package com.safarsathi.backendapi.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "tourists")
@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Tourist {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    private String name;
    private String phone;
    private String passportNumber; // KYC Placeholder
    
    // The SHA256 Hash of the KYC data (Your Digital ID Proof)
    @Column(unique = true, nullable = false)
    private String idHash; 
    private Instant idExpiry; 
    
    // Current live location data (can be updated frequently)
    private Double currentLat;
    private Double currentLng;
    private Instant lastSeen;
    
    // Stored as JSON string or a dedicated table later (MVP uses String/JSON)
    @Column(columnDefinition = "TEXT") 
    private String emergencyContact; 

    // Constructors, Getters, and Setters... 
    // (Ensure you have a default constructor for JPA)
}