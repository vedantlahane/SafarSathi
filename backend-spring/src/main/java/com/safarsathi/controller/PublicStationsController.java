package com.safarsathi.controller;

import com.safarsathi.entity.PoliceDepartment;
import com.safarsathi.repository.PoliceDepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/police-stations")
@RequiredArgsConstructor
public class PublicStationsController {

    private final PoliceDepartmentRepository policeDepartmentRepository;

    /**
     * GET /api/police-stations (public endpoint)
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listPublicStations() {
        List<Map<String, Object>> stations = policeDepartmentRepository.findAll()
                .stream()
                .map(this::stripPassword)
                .collect(Collectors.toList());
        return ResponseEntity.ok(stations);
    }

    private Map<String, Object> stripPassword(PoliceDepartment dept) {
        Map<String, Object> map = new LinkedHashMap<>();
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
