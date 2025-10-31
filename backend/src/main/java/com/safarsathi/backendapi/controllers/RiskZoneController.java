package com.safarsathi.backendapi.controllers;

import com.safarsathi.backendapi.models.RiskZone;
import com.safarsathi.backendapi.services.RiskZoneService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/risk-zones")
@Validated
public class RiskZoneController {

    @Autowired
    private RiskZoneService riskZoneService;

    @GetMapping
    public ResponseEntity<List<RiskZone>> getAllZones() {
        return ResponseEntity.ok(riskZoneService.getAllZones());
    }

    @GetMapping("/active")
    public ResponseEntity<List<RiskZone>> getActiveZones() {
        return ResponseEntity.ok(riskZoneService.getActiveZones());
    }

    @PostMapping
    public ResponseEntity<RiskZone> createZone(@Valid @RequestBody RiskZoneRequest request) {
        RiskZone saved = riskZoneService.createZone(toEntity(request));
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{zoneId}")
    public ResponseEntity<RiskZone> updateZone(@PathVariable Long zoneId,
                                               @Valid @RequestBody RiskZoneRequest request) {
        RiskZone updated = riskZoneService.updateZone(zoneId, toEntity(request));
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{zoneId}/status")
    public ResponseEntity<RiskZone> toggleZoneStatus(@PathVariable Long zoneId,
                                                     @RequestParam("active") boolean active) {
        RiskZone zone = riskZoneService.getZone(zoneId);
        zone.setActive(active);
        RiskZone updated = riskZoneService.updateZone(zoneId, zone);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{zoneId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteZone(@PathVariable Long zoneId) {
        riskZoneService.deleteZone(zoneId);
    }

    private RiskZone toEntity(RiskZoneRequest request) {
        RiskZone.RiskLevel level = request.riskLevel() != null ? request.riskLevel() : RiskZone.RiskLevel.MEDIUM;
        boolean active = request.active() == null || request.active();

        return RiskZone.builder()
                .name(request.name())
                .description(request.description())
                .centerLat(request.centerLat())
                .centerLng(request.centerLng())
                .radiusMeters(request.radiusMeters())
                .riskLevel(level)
                .active(active)
                .build();
    }

    public record RiskZoneRequest(
            @NotBlank String name,
            String description,
            @NotNull Double centerLat,
            @NotNull Double centerLng,
            @NotNull @Positive Double radiusMeters,
            RiskZone.RiskLevel riskLevel,
            Boolean active
    ) {}
}
