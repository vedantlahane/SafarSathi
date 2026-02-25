package com.safarsathi.controller;

import com.safarsathi.dto.NotificationResponse;
import com.safarsathi.entity.Notification;
import com.safarsathi.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class NotificationsController {

    private final NotificationService notificationService;

    /**
     * GET /api/tourist/{touristId}/notifications
     */
    @GetMapping("/tourist/{touristId}/notifications")
    public ResponseEntity<?> listNotifications(@PathVariable String touristId) {
        if (touristId == null || touristId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid tourist ID."));
        }
        List<NotificationResponse> items = notificationService.getNotifications(touristId)
                .stream()
                .map(this::mapNotification)
                .collect(Collectors.toList());
        return ResponseEntity.ok(items);
    }

    /**
     * POST /api/tourist/{touristId}/notifications/{notificationId}/read
     */
    @PostMapping("/tourist/{touristId}/notifications/{notificationId}/read")
    public ResponseEntity<?> markNotificationRead(
            @PathVariable String touristId,
            @PathVariable int notificationId) {
        if (touristId == null || touristId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid request."));
        }
        Notification updated = notificationService.markAsRead(notificationId);
        if (updated == null) {
            return ResponseEntity.status(404).body(Map.of("message", "Notification not found."));
        }
        return ResponseEntity.ok(Map.of("acknowledged", true));
    }

    /**
     * POST /api/tourist/{touristId}/notifications/read-all
     */
    @PostMapping("/tourist/{touristId}/notifications/read-all")
    public ResponseEntity<?> markAllRead(@PathVariable String touristId) {
        if (touristId == null || touristId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid tourist ID."));
        }
        notificationService.markAllRead(touristId);
        return ResponseEntity.ok(Map.of("acknowledged", true));
    }

    private NotificationResponse mapNotification(Notification n) {
        return NotificationResponse.builder()
                .id(String.valueOf(n.getNotificationId()))
                .title(n.getTitle())
                .message(n.getMessage())
                .createdAt(n.getCreatedAt() != null ? n.getCreatedAt().toString() : Instant.now().toString())
                .read(n.getRead() != null ? n.getRead() : false)
                .type(n.getType() != null ? n.getType() : "system")
                .sourceTab(n.getSourceTab() != null ? n.getSourceTab() : "home")
                .build();
    }
}
