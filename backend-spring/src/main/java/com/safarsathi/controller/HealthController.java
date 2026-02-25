package com.safarsathi.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.lang.management.ManagementFactory;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
public class HealthController {

    private final MongoTemplate mongoTemplate;

    /**
     * GET /api/health
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "ok");

        try {
            mongoTemplate.getDb().getName();
            response.put("db", "connected");
        } catch (Exception e) {
            response.put("db", "disconnected");
        }

        double uptimeSeconds = ManagementFactory.getRuntimeMXBean().getUptime() / 1000.0;
        response.put("uptime", uptimeSeconds);

        return ResponseEntity.ok(response);
    }
}
