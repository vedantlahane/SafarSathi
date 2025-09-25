package com.safarsathi.backendapi.controllers;

import com.safarsathi.backendapi.models.Tourist;
import com.safarsathi.backendapi.models.Alert;
import com.safarsathi.backendapi.models.PoliceDepartment;
import com.safarsathi.backendapi.services.BlockchainService;
import com.safarsathi.backendapi.services.TouristService;
import com.safarsathi.backendapi.services.AlertService;
import com.safarsathi.backendapi.services.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private TouristService touristService;
    
    @Autowired
    private BlockchainService blockchainService;
    
    @Autowired
    private AlertService alertService;
    
    @Autowired
    private AdminService adminService;

    // POST /api/admin/login
    // Admin login endpoint for police departments
    @PostMapping("/login")
    public ResponseEntity<?> adminLogin(@RequestBody Map<String, String> loginData) {
        String email = loginData.get("email");
        String password = loginData.get("password");

        if (email == null || password == null) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Email and password are required");
            return ResponseEntity.badRequest().body(errorResponse);
        }

        try {
            PoliceDepartment admin = adminService.validateAdminLogin(email, password);
            
            if (admin == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Invalid credentials");
                return ResponseEntity.status(401).body(errorResponse);
            }

            String token = adminService.generateAdminToken(admin);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Login successful");
            response.put("token", token);
            response.put("admin", Map.of(
                "id", admin.getId().toString(),
                "name", admin.getName(),
                "email", admin.getEmail(),
                "departmentCode", admin.getDepartmentCode(),
                "city", admin.getCity(),
                "district", admin.getDistrict(),
                "state", admin.getState()
            ));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Login failed: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

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

    // GET /api/admin/tourists
    // Provides the full roster of tourists with their most recent location.
    @GetMapping("/tourists")
    public ResponseEntity<List<Tourist>> getAllTourists() {
        return ResponseEntity.ok(touristService.getAllTourists());
    }
}