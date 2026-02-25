package com.safarsathi.service;

import com.safarsathi.entity.Alert;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

/**
 * Broadcasts alerts to connected WebSocket clients via STOMP.
 */
@Service
public class WebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void broadcastAlert(Alert alert) {
        if (messagingTemplate != null) {
            messagingTemplate.convertAndSend("/topic/alerts", alert);
        }
    }
}
