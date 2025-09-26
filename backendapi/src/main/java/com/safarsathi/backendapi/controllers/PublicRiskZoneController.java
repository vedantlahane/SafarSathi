package com.safarsathi.backendapi.controllers;

import com.safarsathi.backendapi.models.RiskZone;
import com.safarsathi.backendapi.services.RiskZoneService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Public facing controller exposing read-only risk zone data for tourists.
 */
@RestController
@RequestMapping("/api/risk-zones")
public class PublicRiskZoneController {

    @Autowired
    private RiskZoneService riskZoneService;

    @GetMapping("/active")
    public ResponseEntity<List<RiskZone>> getActiveZones() {
        return ResponseEntity.ok(riskZoneService.getActiveZones());
    }
}
