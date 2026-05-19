package com.YatraX.controller;

import com.YatraX.entity.Hospital;
import com.YatraX.repository.HospitalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/hospitals")
@RequiredArgsConstructor
public class PublicHospitalsController {

    private final HospitalRepository hospitalRepository;

    /**
     * GET /api/hospitals (public endpoint)
     */
    @GetMapping
    public ResponseEntity<List<Hospital>> listPublicHospitals() {
        return ResponseEntity.ok(hospitalRepository.findByIsActiveTrue());
    }
}
