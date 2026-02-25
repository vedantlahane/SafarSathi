package com.safarsathi.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * SOS service - delegates to AlertService and AuthService for location + SOS handling.
 */
@Service
@RequiredArgsConstructor
public class SosService {

    private final AlertService alertService;
    private final AuthService authService;

    public void recordLocation(String touristId, Double lat, Double lng, Double accuracy) {
        authService.updateLocation(touristId, lat, lng, accuracy);
    }

    public void createSOS(String touristId, Double lat, Double lng) {
        alertService.handleSOS(touristId, lat, lng);
    }
}
