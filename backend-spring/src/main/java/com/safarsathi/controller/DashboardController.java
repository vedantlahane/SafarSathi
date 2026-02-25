package com.safarsathi.controller;

import com.safarsathi.dto.AdminDashboardResponse;
import com.safarsathi.dto.TouristDashboardResponse;
import com.safarsathi.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    /**
     * GET /api/admin/dashboard/state
     */
    @GetMapping("/admin/dashboard/state")
    public ResponseEntity<AdminDashboardResponse> adminDashboard() {
        return ResponseEntity.ok(dashboardService.getAdminDashboardState());
    }

    /**
     * GET /api/tourist/{touristId}/dashboard
     */
    @GetMapping("/tourist/{touristId}/dashboard")
    public ResponseEntity<?> touristDashboard(@PathVariable String touristId) {
        if (touristId == null || touristId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid tourist ID."));
        }
        TouristDashboardResponse data = dashboardService.getTouristDashboard(touristId);
        if (data == null) {
            return ResponseEntity.status(404).body(Map.of("message", "Tourist not found"));
        }
        return ResponseEntity.ok(data);
    }
}
