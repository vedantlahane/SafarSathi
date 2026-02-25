package com.safarsathi.controller;

import com.safarsathi.entity.PoliceDepartment;
import com.safarsathi.service.PoliceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/police")
@RequiredArgsConstructor
public class AdminPoliceController {

    private final PoliceService policeService;

    /**
     * POST /api/admin/police
     */
    @PostMapping
    public ResponseEntity<?> createPolice(@RequestBody PoliceDepartment dept) {
        PoliceDepartment created = policeService.createPoliceDepartment(dept);
        return ResponseEntity.status(201).body(stripPassword(created));
    }

    /**
     * GET /api/admin/police
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listPolice() {
        List<Map<String, Object>> departments = policeService.listPoliceDepartments()
                .stream().map(this::stripPassword).collect(Collectors.toList());
        return ResponseEntity.ok(departments);
    }

    /**
     * GET /api/admin/police/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getPolice(@PathVariable String id) {
        if (id == null || id.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid police ID."));
        }
        PoliceDepartment dept = policeService.getPoliceDepartment(id);
        if (dept == null) return ResponseEntity.status(404).body(Map.of("message", "Not found"));
        return ResponseEntity.ok(stripPassword(dept));
    }

    /**
     * PUT /api/admin/police/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePolice(@PathVariable String id,
                                          @RequestBody PoliceDepartment updates) {
        if (id == null || id.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid police ID."));
        }
        PoliceDepartment dept = policeService.updatePoliceDepartment(id, updates);
        if (dept == null) return ResponseEntity.status(404).body(Map.of("message", "Not found"));
        return ResponseEntity.ok(stripPassword(dept));
    }

    /**
     * DELETE /api/admin/police/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePolice(@PathVariable String id) {
        if (id == null || id.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid police ID."));
        }
        boolean ok = policeService.deletePoliceDepartment(id);
        if (!ok) return ResponseEntity.status(404).body(Map.of("message", "Not found"));
        return ResponseEntity.noContent().build();
    }

    private Map<String, Object> stripPassword(PoliceDepartment dept) {
        Map<String, Object> map = new java.util.LinkedHashMap<>();
        map.put("id", dept.getId());
        map.put("name", dept.getName());
        map.put("email", dept.getEmail());
        map.put("departmentCode", dept.getDepartmentCode());
        map.put("latitude", dept.getLatitude());
        map.put("longitude", dept.getLongitude());
        map.put("city", dept.getCity());
        map.put("district", dept.getDistrict());
        map.put("state", dept.getState());
        map.put("contactNumber", dept.getContactNumber());
        map.put("isActive", dept.getIsActive());
        return map;
    }
}
