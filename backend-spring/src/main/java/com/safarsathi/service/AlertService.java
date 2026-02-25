package com.safarsathi.service;

import com.safarsathi.entity.Alert;
import com.safarsathi.entity.Notification;
import com.safarsathi.repository.AlertRepository;
import com.safarsathi.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRepository alertRepository;
    private final NotificationRepository notificationRepository;
    private final SequenceService sequenceService;
    private final WebSocketService webSocketService;

    /**
     * Create a new alert and broadcast it via WebSocket.
     */
    public Alert createAlert(Alert alert) {
        alert.setAlertId((int) sequenceService.getNextId("alertId"));
        if (alert.getStatus() == null) alert.setStatus("OPEN");
        Alert saved = alertRepository.save(alert);

        // Create a corresponding notification
        if (saved.getTouristId() != null) {
            Notification notification = Notification.builder()
                    .notificationId((int) sequenceService.getNextId("notificationId"))
                    .touristId(saved.getTouristId())
                    .title(saved.getAlertType() != null ? saved.getAlertType() : "Alert")
                    .message(saved.getMessage() != null ? saved.getMessage() : "Safety alert received")
                    .type("alert")
                    .sourceTab("home")
                    .read(false)
                    .build();
            notificationRepository.save(notification);
        }

        webSocketService.broadcastAlert(saved);
        return saved;
    }

    public List<Alert> getActiveAlerts() {
        return alertRepository.findByStatus("OPEN", Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    public List<Alert> getAllAlerts() {
        return alertRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    public List<Alert> getRecentAlerts(int limit) {
        List<Alert> all = getAllAlerts();
        if (limit <= 0 || all.size() <= limit) return all;
        return all.subList(0, limit);
    }

    public List<Alert> getAlertsForTourist(String touristId) {
        return alertRepository.findByTouristId(touristId, Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    /**
     * Handle an SOS emergency.
     */
    public Alert handleSOS(String touristId, Double lat, Double lng) {
        String message = String.format("TOURIST IN IMMEDIATE DANGER. LAST LOC: %s, %s", lat, lng);
        Alert alert = Alert.builder()
                .touristId(touristId)
                .latitude(lat)
                .longitude(lng)
                .alertType("SOS")
                .priority("CRITICAL")
                .message(message)
                .build();
        return createAlert(alert);
    }

    /**
     * Update the status of an existing alert.
     */
    public Alert updateAlertStatus(int alertId, String newStatus) {
        Alert alert = alertRepository.findByAlertId(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found with ID: " + alertId));
        alert.setStatus(newStatus);
        Alert updated = alertRepository.save(alert);
        webSocketService.broadcastAlert(updated);
        return updated;
    }
}
