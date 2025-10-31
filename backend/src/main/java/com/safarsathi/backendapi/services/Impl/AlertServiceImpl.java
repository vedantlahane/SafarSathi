package com.safarsathi.backendapi.services.Impl;

import com.safarsathi.backendapi.models.Alert;
import com.safarsathi.backendapi.repo.AlertRepository;
import com.safarsathi.backendapi.services.AlertService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class AlertServiceImpl implements AlertService {

    @Autowired
    private AlertRepository alertRepository;
    
    // 💡 Component used to send messages to WebSocket destinations (topics)
    @Autowired
    private SimpMessagingTemplate messagingTemplate; 
    
    private static final String RESOLVED_STATUS = "RESOLVED";
    private static final String ALERT_TOPIC = "/topic/alerts"; 

    @Override
    public Alert createAlert(Alert alert) {
        if (alert.getCreatedTime() == null) {
            alert.setCreatedTime(Instant.now());
        }
        if (alert.getStatus() == null) {
            alert.setStatus("NEW");
        }
        
        Alert savedAlert = alertRepository.save(alert);
        
        // ✨ REAL-TIME PUSH: Send the new alert object to all subscribed dashboard clients
        messagingTemplate.convertAndSend(ALERT_TOPIC, savedAlert); 
        
        return savedAlert;
    }

    @Override
    public List<Alert> getActiveAlerts() {
        return alertRepository.findByStatusIsNot(RESOLVED_STATUS);
    }

    @Override
    public List<Alert> getRecentAlerts(int limit) {
        List<Alert> recent = alertRepository.findTop20ByOrderByCreatedTimeDesc();
        if (limit <= 0 || recent.size() <= limit) {
            return recent;
        }
        return recent.subList(0, limit);
    }

    @Override
    public List<Alert> getAlertsForTourist(UUID touristId) {
        return alertRepository.findByTouristIdOrderByCreatedTimeDesc(touristId);
    }

    @Override
    public Alert handleSOS(UUID touristId, Double lat, Double lng) {
        Alert sosAlert = new Alert();
        sosAlert.setTouristId(touristId);
        sosAlert.setLat(lat);
        sosAlert.setLng(lng);
        sosAlert.setAlertType("SOS");
        sosAlert.setMessage("TOURIST IN IMMEDIATE DANGER. LAST LOC: " + lat + ", " + lng);
        
        // This implicitly calls createAlert, which handles saving and real-time push
        return this.createAlert(sosAlert);
    }
    
    @Override
    public Alert updateAlertStatus(Long alertId, String newStatus) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found with ID: " + alertId));
        
        alert.setStatus(newStatus);
        Alert updatedAlert = alertRepository.save(alert);
        
        // PUSH UPDATE: Send the updated alert so the dashboard can refresh its status
        messagingTemplate.convertAndSend(ALERT_TOPIC, updatedAlert); 
        
        return updatedAlert;
    }
}