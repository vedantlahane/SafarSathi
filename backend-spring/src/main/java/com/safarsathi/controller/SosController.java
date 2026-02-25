package com.safarsathi.controller;

import com.safarsathi.dto.LocationRequest;
import com.safarsathi.service.SosService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/action")
@RequiredArgsConstructor
public class SosController {

    private final SosService sosService;

    /**
     * POST /api/action/location/{touristId}
     */
    @PostMapping("/location/{touristId}")
    public ResponseEntity<?> postLocation(@PathVariable String touristId,
                                          @RequestBody LocationRequest request) {
        if (touristId == null || touristId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid tourist ID."));
        }
        if (request.getLat() == null || request.getLng() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "lat and lng required"));
        }
        try {
            sosService.recordLocation(touristId, request.getLat(), request.getLng(), request.getAccuracy());
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            if ("Tourist not found.".equals(e.getMessage())) {
                return ResponseEntity.status(404).body(Map.of("message", "Tourist not found."));
            }
            throw e;
        }
    }

    /**
     * POST /api/action/sos/{touristId}
     */
    @PostMapping("/sos/{touristId}")
    public ResponseEntity<?> postSOS(@PathVariable String touristId,
                                     @RequestBody(required = false) Map<String, Double> body) {
        if (touristId == null || touristId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid tourist ID."));
        }
        Double lat = body != null ? body.get("lat") : null;
        Double lng = body != null ? body.get("lng") : null;
        sosService.createSOS(touristId, lat, lng);
        return ResponseEntity.ok(Map.of("status", "SOS Alert initiated. Emergency response notified."));
    }
}
