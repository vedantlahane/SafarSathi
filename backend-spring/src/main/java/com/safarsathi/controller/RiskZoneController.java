package com.safarsathi.controller;

import com.safarsathi.entity.RiskZone;
import com.safarsathi.service.RiskZoneService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/risk-zones")
@RequiredArgsConstructor
public class RiskZoneController {

    private final RiskZoneService riskZoneService;

    /**
     * GET /api/admin/risk-zones
     */
    @GetMapping
    public ResponseEntity<List<RiskZone>> listZones() {
        return ResponseEntity.ok(riskZoneService.listRiskZones());
    }

    /**
     * GET /api/admin/risk-zones/active
     */
    @GetMapping("/active")
    public ResponseEntity<List<RiskZone>> listActiveZones() {
        return ResponseEntity.ok(riskZoneService.listActiveRiskZones());
    }

    /**
     * POST /api/admin/risk-zones
     */
    @PostMapping
    public ResponseEntity<RiskZone> createZone(@RequestBody RiskZone zone) {
        RiskZone created = riskZoneService.createRiskZone(zone);
        return ResponseEntity.status(201).body(created);
    }

    /**
     * PUT /api/admin/risk-zones/{zoneId}
     */
    @PutMapping("/{zoneId}")
    public ResponseEntity<?> updateZone(@PathVariable int zoneId, @RequestBody RiskZone updates) {
        RiskZone zone = riskZoneService.updateRiskZone(zoneId, updates);
        if (zone == null) return ResponseEntity.status(404).body(Map.of("message", "Not found"));
        return ResponseEntity.ok(zone);
    }

    /**
     * PATCH /api/admin/risk-zones/{zoneId}/status?active=true|false
     */
    @PatchMapping("/{zoneId}/status")
    public ResponseEntity<?> toggleZone(@PathVariable int zoneId,
                                        @RequestParam(defaultValue = "true") boolean active) {
        RiskZone zone = riskZoneService.toggleZoneStatus(zoneId, active);
        if (zone == null) return ResponseEntity.status(404).body(Map.of("message", "Not found"));
        return ResponseEntity.ok(zone);
    }

    /**
     * DELETE /api/admin/risk-zones/{zoneId}
     */
    @DeleteMapping("/{zoneId}")
    public ResponseEntity<?> deleteZone(@PathVariable int zoneId) {
        boolean ok = riskZoneService.deleteRiskZone(zoneId);
        if (!ok) return ResponseEntity.status(404).body(Map.of("message", "Not found"));
        return ResponseEntity.noContent().build();
    }
}
