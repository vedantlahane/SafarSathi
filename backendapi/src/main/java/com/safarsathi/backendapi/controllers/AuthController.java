package com.safarsathi.backendapi.controllers;

import com.safarsathi.backendapi.models.Tourist;
import com.safarsathi.backendapi.services.TouristService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
// 🚨 IMPORTANT: Add @CrossOrigin(origins = "http://localhost:5173") 
// or ensure you have a global CorsConfig to prevent frontend errors.
public class AuthController {

    @Autowired
    private TouristService touristService;

    // POST /api/auth/register (Registration endpoint remains unchanged)
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Tourist registrationData) {
        
        Tourist newTourist = touristService.registerTourist(registrationData);

        // Mock token generation for demo use
        String token = touristService.login(newTourist.getPhone()); 

        Map<String, Object> response = new java.util.HashMap<>();
        response.put("touristId", newTourist.getId().toString());
        response.put("qr_content", "/api/admin/id/verify?hash=" + newTourist.getIdHash());
        response.put("token", token);
        
        // Add user profile data to registration response
        Map<String, Object> userData = new java.util.HashMap<>();
        userData.put("id", newTourist.getId().toString());
        userData.put("name", newTourist.getName());
        userData.put("email", newTourist.getEmail());
        userData.put("phone", newTourist.getPhone());
        userData.put("passportNumber", newTourist.getPassportNumber());
        userData.put("dateOfBirth", newTourist.getDateOfBirth());
        userData.put("address", newTourist.getAddress());
        userData.put("gender", newTourist.getGender());
        userData.put("nationality", newTourist.getNationality());
        userData.put("emergencyContact", newTourist.getEmergencyContact());
        userData.put("currentLat", newTourist.getCurrentLat());
        userData.put("currentLng", newTourist.getCurrentLng());
        userData.put("lastSeen", newTourist.getLastSeen());
        
        response.put("user", userData);
        
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // ----------------------------------------------------
    // 🔐 POST /api/auth/login (UPDATED LOGIN ENDPOINT)
    // ----------------------------------------------------
    /**
     * Handles tourist login using email and password, utilizing server-side hash checking.
     * Payload expected: { "email": "user@example.com", "password": "123" }
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
        String email = loginData.get("email");
        String rawPassword = loginData.get("password"); // <-- Correctly extract raw password
        
        // Input validation
        if (email == null || rawPassword == null || email.isBlank() || rawPassword.isBlank()) {
            return new ResponseEntity<>(Map.of("message", "Email and password are required."), HttpStatus.BAD_REQUEST);
        }

        // 1. Service finds and validates the user by email AND password
        // 🚨 FIX: Pass BOTH arguments to the service method
        Tourist existingTourist = touristService.validateTouristLoginByEmail(email, rawPassword); 
        
        if (existingTourist == null) {
            // Service returns null if email is not found OR if password check fails
            return new ResponseEntity<>(Map.of("message", "Invalid email or password."), HttpStatus.UNAUTHORIZED);
        }

        // 2. Issue a new token
        String token = touristService.login(existingTourist.getPhone()); 

        // 3. Return ID, QR content, token, and user profile data
        Map<String, Object> response = new java.util.HashMap<>();
        response.put("touristId", existingTourist.getId().toString());
        response.put("qr_content", "/api/admin/id/verify?hash=" + existingTourist.getIdHash());
        response.put("token", token);
        
        // Add user profile data to login response
        Map<String, Object> userData = new java.util.HashMap<>();
        userData.put("id", existingTourist.getId().toString());
        userData.put("name", existingTourist.getName());
        userData.put("email", existingTourist.getEmail());
        userData.put("phone", existingTourist.getPhone());
        userData.put("passportNumber", existingTourist.getPassportNumber());
        userData.put("dateOfBirth", existingTourist.getDateOfBirth());
        userData.put("address", existingTourist.getAddress());
        userData.put("gender", existingTourist.getGender());
        userData.put("nationality", existingTourist.getNationality());
        userData.put("emergencyContact", existingTourist.getEmergencyContact());
        userData.put("currentLat", existingTourist.getCurrentLat());
        userData.put("currentLng", existingTourist.getCurrentLng());
        userData.put("lastSeen", existingTourist.getLastSeen());
        
        response.put("user", userData);
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // ----------------------------------------------------
    // 🆕 GET /api/auth/profile (NEW PROFILE ENDPOINT)
    // ----------------------------------------------------
    /**
     * Retrieves tourist profile data for the authenticated user.
     * @param touristId The ID of the tourist to fetch.
     * @returns {Tourist} The tourist profile data.
     */
    @GetMapping("/profile/{touristId}")
    public ResponseEntity<?> getProfile(@PathVariable String touristId) {
        try {
            java.util.UUID uuid = java.util.UUID.fromString(touristId);
            Tourist tourist = touristService.getTouristById(uuid);
            
            if (tourist == null) {
                return new ResponseEntity<>(Map.of("message", "Tourist not found."), HttpStatus.NOT_FOUND);
            }

            // Return tourist data (excluding sensitive fields like password hash)
            Map<String, Object> profileData = new java.util.HashMap<>();
            profileData.put("id", tourist.getId().toString());
            profileData.put("name", tourist.getName());
            profileData.put("email", tourist.getEmail());
            profileData.put("phone", tourist.getPhone());
            profileData.put("passportNumber", tourist.getPassportNumber());
            profileData.put("dateOfBirth", tourist.getDateOfBirth());
            profileData.put("address", tourist.getAddress());
            profileData.put("gender", tourist.getGender());
            profileData.put("nationality", tourist.getNationality());
            profileData.put("emergencyContact", tourist.getEmergencyContact());
            profileData.put("currentLat", tourist.getCurrentLat());
            profileData.put("currentLng", tourist.getCurrentLng());
            profileData.put("lastSeen", tourist.getLastSeen());
            
            return new ResponseEntity<>(profileData, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(Map.of("message", "Invalid tourist ID format."), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("message", "Error retrieving profile."), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}