package com.safarsathi.controller;

import com.safarsathi.entity.Alert;
import com.safarsathi.entity.PoliceDepartment;
import com.safarsathi.entity.Tourist;
import com.safarsathi.service.AdminService;
import com.safarsathi.service.AlertService;
import com.safarsathi.service.AuthService;
import com.safarsathi.service.BlockchainService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final AlertService alertService;
    private final AuthService authService;
    private final BlockchainService blockchainService;

    /**
     * POST /api/admin/login
     */
    @PostMapping("/login")
    public ResponseEntity<?> adminLogin(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        if (email == null || password == null || email.isBlank() || password.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Email and password are required"));
        }

        PoliceDepartment admin = adminService.validateAdminLogin(email, password);
        if (admin == null) {
            return ResponseEntity.status(401)
                    .body(Map.of("success", false, "message", "Invalid credentials"));
        }

        String token = adminService.generateAdminToken(admin);
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "Login successful");
        result.put("token", token);

        Map<String, Object> adminInfo = new HashMap<>();
        adminInfo.put("id", admin.getId());
        adminInfo.put("name", admin.getName());
        adminInfo.put("email", admin.getEmail());
        adminInfo.put("departmentCode", admin.getDepartmentCode());
        adminInfo.put("city", admin.getCity());
        adminInfo.put("district", admin.getDistrict());
        adminInfo.put("state", admin.getState());
        result.put("admin", adminInfo);

        return ResponseEntity.ok(result);
    }

    /**
     * GET /api/admin/id/verify?hash=...
     */
    @GetMapping("/id/verify")
    public ResponseEntity<?> verifyId(@RequestParam String hash) {
        if (hash == null || hash.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "hash is required"));
        }
        try {
            Tourist tourist = authService.verifyIdHash(hash);
            boolean isProofValid = blockchainService.verifyIDProof(hash);

            String passportPartial = tourist.getPassportNumber() != null
                    ? tourist.getPassportNumber().substring(0, 2) + "****" : "";

            Map<String, Object> result = new HashMap<>();
            result.put("valid", isProofValid);
            result.put("name", tourist.getName());
            result.put("passport_partial", passportPartial);
            result.put("id_expiry", tourist.getIdExpiry());
            result.put("blockchain_status",
                    isProofValid ? "VERIFIED ON IMMUTABLE LOG" : "PROOF FAILED");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    /**
     * GET /api/admin/alerts
     */
    @GetMapping("/alerts")
    public ResponseEntity<List<Alert>> getAlerts() {
        return ResponseEntity.ok(alertService.getActiveAlerts());
    }

    /**
     * GET /api/admin/alerts/all
     */
    @GetMapping("/alerts/all")
    public ResponseEntity<List<Alert>> getAlertHistory() {
        return ResponseEntity.ok(alertService.getAllAlerts());
    }

    /**
     * POST /api/admin/alerts/{alertId}/status
     */
    @PostMapping("/alerts/{alertId}/status")
    public ResponseEntity<?> updateAlert(
            @PathVariable int alertId,
            @RequestParam(required = false) String status,
            @RequestBody(required = false) Map<String, String> body) {
        String resolvedStatus = status;
        if (resolvedStatus == null && body != null) {
            resolvedStatus = body.get("status");
        }
        if (resolvedStatus == null || resolvedStatus.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "status required"));
        }
        Alert updated = alertService.updateAlertStatus(alertId, resolvedStatus.toUpperCase());
        return ResponseEntity.ok(updated);
    }

    /**
     * GET /api/admin/tourists
     */
    @GetMapping("/tourists")
    public ResponseEntity<List<Tourist>> getTourists() {
        return ResponseEntity.ok(authService.listTourists());
    }
}
