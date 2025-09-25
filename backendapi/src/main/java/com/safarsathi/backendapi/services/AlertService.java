package com.safarsathi.backendapi.services;

import com.safarsathi.backendapi.models.Alert;
import java.util.List;
import java.util.UUID;

public interface AlertService {

    Alert createAlert(Alert alert);
    List<Alert> getActiveAlerts();

    /**
     * Handles the Panic (SOS) call from the mobile app.
     * @param touristId The ID of the tourist raising the SOS.
     * @param lat Current latitude.
     * @param lng Current longitude.
     * @return The created SOS Alert.
     */
    Alert handleSOS(UUID touristId, Double lat, Double lng);
    
    Alert updateAlertStatus(Long alertId, String newStatus);
}