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
public class AuthController {

    @Autowired
    private TouristService touristService;

    // POST /api/auth/register
    // Payload: Tourist data (name, passportNumber, phone, emergencyContact)
    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody Tourist registrationData) {
        
        Tourist newTourist = touristService.registerTourist(registrationData);

        // Mock token generation for demo use, as full security is Post-MVP
        String token = touristService.login(newTourist.getPhone()); 

        // Response includes the data needed to display the QR code on the mobile app
        Map<String, String> response = Map.of(
            "touristId", newTourist.getId().toString(),
            "qr_content", "/api/admin/id/verify?hash=" + newTourist.getIdHash(),
            "token", token // The mobile app will use this token for location pings/SOS
        );
        
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}