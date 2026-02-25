package com.safarsathi.dto;

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
public class TouristRegistrationRequest {
    private String name;
    private String email;
    private String phone;
    private String passportNumber;
    private String passwordHash; // raw password from frontend
    private String dateOfBirth;
    private String address;
    private String gender;
    private String nationality;
    private Map<String, String> emergencyContact;
    private String bloodType;
    private List<String> allergies;
    private List<String> medicalConditions;
    private Double currentLat;
    private Double currentLng;
}
