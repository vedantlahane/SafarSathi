package com.safarsathi.controller;

import com.safarsathi.entity.RiskZone;
import com.safarsathi.service.RiskZoneService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/risk-zones")
@RequiredArgsConstructor
public class PublicRiskZoneController {

    private final RiskZoneService riskZoneService;

    /**
     * GET /api/risk-zones/active (public endpoint)
     */
    @GetMapping("/active")
    public ResponseEntity<List<RiskZone>> listPublicActiveZones() {
        return ResponseEntity.ok(riskZoneService.listActiveRiskZones());
    }
}
