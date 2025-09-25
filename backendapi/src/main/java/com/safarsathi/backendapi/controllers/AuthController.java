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
    public ResponseEntity<Map<String, String>> register(@RequestBody Tourist registrationData) {
        
        Tourist newTourist = touristService.registerTourist(registrationData);

        // Mock token generation for demo use
        String token = touristService.login(newTourist.getPhone()); 

        Map<String, String> response = Map.of(
            "touristId", newTourist.getId().toString(),
            "qr_content", "/api/admin/id/verify?hash=" + newTourist.getIdHash(),
            "token", token 
        );
        
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
    public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> loginData) {
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

        // 3. Return ID, QR content, and token
        Map<String, String> response = Map.of(
            "touristId", existingTourist.getId().toString(),
            "qr_content", "/api/admin/id/verify?hash=" + existingTourist.getIdHash(),
            "token", token 
        );
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}