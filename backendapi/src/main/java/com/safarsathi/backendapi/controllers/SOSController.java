package com.safarsathi.backendapi.controllers;

import com.safarsathi.backendapi.services.AlertService;
import com.safarsathi.backendapi.services.TouristService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;
import java.util.Map;

// DTO to handle incoming location data
record LocationPingRequest(Double lat, Double lng, Integer accuracy) {} 

@RestController
@RequestMapping("/api/action")
public class SOSController {

    @Autowired
    private TouristService touristService;
    
    @Autowired
    private AlertService alertService;

    // POST /api/action/location/{touristId}
    // Note: In production, the touristId would be extracted from the Authorization header (JWT).
    @PostMapping("/location/{touristId}")
    public ResponseEntity<Void> locationPing(
        @PathVariable UUID touristId,
        @RequestBody LocationPingRequest pingData) 
    {
        // 1. Update the tourist's live location in the DB
        touristService.updateLocation(
            touristId, 
            pingData.lat(), 
            pingData.lng(), 
            pingData.accuracy()
        );
        
        // 2. The updateLocation method will implicitly trigger GeoFence/Anomaly checks later.
        return ResponseEntity.noContent().build(); 
    }

    // POST /api/action/sos/{touristId}
    // Panic Button functionality
    @PostMapping("/sos/{touristId}")
    public ResponseEntity<Map<String, String>> panicSOS(
        @PathVariable UUID touristId,
        @RequestBody LocationPingRequest sosData) 
    {
        // 1. Create a high-priority SOS alert
        alertService.handleSOS(touristId, sosData.lat(), sosData.lng());
        
        // 2. The alertService implementation is responsible for notifying the dashboard (via WebSocket)
        // and sending mock SMS to emergency contacts.
        
        Map<String, String> response = Map.of(
            "status", "SOS Alert initiated. Emergency response notified."
        );

        return ResponseEntity.ok(response);
    }
}