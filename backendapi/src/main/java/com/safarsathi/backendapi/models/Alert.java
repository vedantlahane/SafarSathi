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
@Table(name = "alerts")
@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Alert {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-incrementing ID for SQL
    private Long id;
    
    // Foreign key reference to the Tourist
    private UUID touristId; 
    
    private String alertType; // SOS | INACTIVITY | GEO_FENCE | DEVIATION
    
    private Double lat;
    private Double lng;
    
    private String status; // NEW | ACKNOWLEDGED | RESOLVED
    @Column(columnDefinition = "TEXT")
    private String message; 
    private Instant createdTime = Instant.now();

    // Constructors, Getters, and Setters... 
}