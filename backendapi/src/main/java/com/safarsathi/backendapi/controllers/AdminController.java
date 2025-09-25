package com.safarsathi.backendapi.controllers;

import com.safarsathi.backendapi.models.Tourist;
import com.safarsathi.backendapi.models.Alert;
import com.safarsathi.backendapi.services.BlockchainService;
import com.safarsathi.backendapi.services.TouristService;
import com.safarsathi.backendapi.services.AlertService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private TouristService touristService;
    
    @Autowired
    private BlockchainService blockchainService;
    
    @Autowired
    private AlertService alertService;

    // GET /api/admin/id/verify?hash=...
    // Endpoint for verifying the Digital Tourist ID via QR code scan.
    @GetMapping("/id/verify")
    public ResponseEntity<Map<String, Object>> verifyDigitalID(@RequestParam String hash) {
        
        Tourist tourist = touristService.verifyIdHash(hash); 
        boolean isProofValid = blockchainService.verifyIDProof(hash); // Check the immutable log

        // Returns public-facing/verification details
        Map<String, Object> response = Map.of(
            "valid", isProofValid,
            "name", tourist.getName(),
            "passport_partial", tourist.getPassportNumber().substring(0, 2) + "****", 
            "id_expiry", tourist.getIdExpiry(),
            "blockchain_status", isProofValid ? "VERIFIED ON IMMUTABLE LOG" : "PROOF FAILED"
        );
        
        return ResponseEntity.ok(response);
    }
    
    // GET /api/admin/alerts 
    // Initial fetch of active alerts for the dashboard feed.
    @GetMapping("/alerts")
    public ResponseEntity<List<Alert>> getActiveAlerts() {
        return ResponseEntity.ok(alertService.getActiveAlerts());
    }
    
    // POST /api/admin/alerts/{alertId}/status?status=ACKNOWLEDGED
    // Action endpoint for police/admin to update an alert status.
    @PostMapping("/alerts/{alertId}/status")
    public ResponseEntity<Alert> updateAlertStatus(
        @PathVariable Long alertId, 
        @RequestParam String status) 
    {
        Alert updatedAlert = alertService.updateAlertStatus(alertId, status.toUpperCase());
        return ResponseEntity.ok(updatedAlert);
    }
}