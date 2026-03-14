package com.safarsathi.controller;

import com.safarsathi.dto.ApiResponse;
import com.safarsathi.entity.RiskZone;
import com.safarsathi.service.AISafetyService;
import com.safarsathi.service.RiskZoneService;
import com.safarsathi.util.GeoFenceUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/safety")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class SafetyController {

    private final AISafetyService aiSafetyService;
    private final RiskZoneService riskZoneService;

    @GetMapping("/check")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkSafety(
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
            @RequestParam(name = "lat", required = false) Double lat,
            @RequestParam(name = "lon", required = false) Double lon,
            @RequestParam(required = false) Integer hour) {

        Double resolvedLat = latitude != null ? latitude : lat;
        Double resolvedLon = longitude != null ? longitude : lon;

        if (resolvedLat == null || resolvedLon == null) {
            return ResponseEntity.badRequest().body(
                    ApiResponse.error(
                            "INVALID_COORDINATES",
                            "latitude/longitude or lat/lon query parameters are required"
                    )
            );
        }

        int resolvedHour = normalizeHour(hour);
        double dangerScore = aiSafetyService.getRealTimeSafetyScore(resolvedLat, resolvedLon, resolvedHour);
        boolean isNearAdminZone = isNearAdminRiskZone(resolvedLat, resolvedLon);

        String riskLabel = deriveRiskLabel(dangerScore);
        String recommendation = deriveRecommendation(dangerScore);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("dangerScore", dangerScore);
        response.put("isNearAdminZone", isNearAdminZone);
        response.put("riskLabel", riskLabel);
        response.put("recommendation", recommendation);
        response.put("hour", resolvedHour);

        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    private int normalizeHour(Integer hour) {
        if (hour == null) {
            return LocalDateTime.now().getHour();
        }
        int mod = hour % 24;
        return mod < 0 ? mod + 24 : mod;
    }

    private boolean isNearAdminRiskZone(double latitude, double longitude) {
        List<RiskZone> zones = riskZoneService.listActiveRiskZones();
        if (zones.isEmpty()) {
            return false;
        }

        return zones.stream().anyMatch(zone -> GeoFenceUtil.isPointWithinRadius(
                latitude,
                longitude,
                zone.getCenterLat(),
                zone.getCenterLng(),
                zone.getRadiusMeters()
        ));
    }

    private String deriveRiskLabel(double dangerScore) {
        if (dangerScore > 0.7) {
            return "High Danger";
        }
        if (dangerScore >= 0.3) {
            return "Caution";
        }
        return "Low Risk";
    }

    private String deriveRecommendation(double dangerScore) {
        if (dangerScore > 0.7) {
            return "High risk activity likely nearby. Consider rerouting immediately.";
        }
        if (dangerScore >= 0.3) {
            return "Proceed with caution and stay aware of your surroundings.";
        }
        return "Low risk detected. Continue with normal precautions.";
    }
}
