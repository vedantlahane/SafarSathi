package com.safarsathi.controller;

import com.safarsathi.dto.*;
import com.safarsathi.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * POST /api/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody TouristRegistrationRequest request) {
        if (request.getName() == null || request.getEmail() == null
                || request.getPhone() == null || request.getPassportNumber() == null
                || request.getPasswordHash() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Required fields missing."));
        }
        try {
            Map<String, Object> result = authService.registerTourist(request);
            return ResponseEntity.status(201).body(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        if (request.getEmail() == null || request.getPassword() == null
                || request.getEmail().isBlank() || request.getPassword().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Email and password are required."));
        }
        Map<String, Object> result = authService.loginTourist(request.getEmail(), request.getPassword());
        if (result == null) {
            return ResponseEntity.status(401)
                    .body(Map.of("message", "Invalid email or password."));
        }
        return ResponseEntity.ok(result);
    }

    /**
     * GET /api/auth/profile/{touristId}
     */
    @GetMapping("/profile/{touristId}")
    public ResponseEntity<?> profile(@PathVariable String touristId) {
        if (!isValidUuid(touristId)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid tourist ID format."));
        }
        TouristResponse profileData = authService.getProfile(touristId);
        if (profileData == null) {
            return ResponseEntity.status(404).body(Map.of("message", "Tourist not found."));
        }
        return ResponseEntity.ok(profileData);
    }

    /**
     * PUT /api/auth/profile/{touristId}
     */
    @PutMapping("/profile/{touristId}")
    public ResponseEntity<?> updateProfile(@PathVariable String touristId,
                                           @RequestBody Map<String, Object> payload) {
        if (!isValidUuid(touristId)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid tourist ID format."));
        }
        try {
            TouristResponse updated = authService.updateProfile(touristId, payload);
            if (updated == null) {
                return ResponseEntity.status(404).body(Map.of("message", "Tourist not found."));
            }
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * POST /api/auth/password-reset/request
     */
    @PostMapping("/password-reset/request")
    public ResponseEntity<?> requestPasswordReset(@RequestBody PasswordResetRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required."));
        }
        Map<String, Object> result = authService.requestPasswordReset(request.getEmail());
        return ResponseEntity.ok(result);
    }

    /**
     * POST /api/auth/password-reset/confirm
     */
    @PostMapping("/password-reset/confirm")
    public ResponseEntity<?> confirmPasswordReset(@RequestBody PasswordResetConfirmRequest request) {
        if (request.getToken() == null || request.getPassword() == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Token and password required."));
        }
        boolean ok = authService.confirmPasswordReset(request.getToken(), request.getPassword());
        if (!ok) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Invalid or expired reset token."));
        }
        return ResponseEntity.ok(Map.of("acknowledged", true));
    }

    private boolean isValidUuid(String value) {
        return value != null && value.matches(
                "^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$");
    }
}
