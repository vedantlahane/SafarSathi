package com.safarsathi.backendapi.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "police_departments")
@Data // From Lombok: generates getters, setters, toString, equals, hashCode
@NoArgsConstructor
@AllArgsConstructor
public class PoliceDepartment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String name; // e.g., 'Central Police Station'

    @Column(nullable = false, unique = true)
    private String email; // Login ID

    @Column(nullable = false)
    private String passwordHash; // **Stored Hashed Password**

    @Column(nullable = false)
    private String departmentCode; // Unique identifier (e.g., PS-GANDHINAGAR)

    // Location Coordinates (for distance calculation)
    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    // Location Hierarchy (for filtering and display)
    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String district;
    
    @Column(nullable = false)
    private String state;
    
    // Contact Info
    @Column(nullable = false)
    private String contactNumber;
    
    @Column(columnDefinition = "boolean default true")
    private Boolean isActive = true;

}