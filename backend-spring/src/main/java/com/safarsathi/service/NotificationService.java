package com.safarsathi.service;

import com.safarsathi.entity.Notification;
import com.safarsathi.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SequenceService sequenceService;

    public List<Notification> getNotifications(String touristId) {
        return notificationRepository.findByTouristId(touristId,
                Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    public Notification markAsRead(int notificationId) {
        Notification notification = notificationRepository.findByNotificationId(notificationId)
                .orElse(null);
        if (notification == null) return null;
        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    public void markAllRead(String touristId) {
        List<Notification> unread = notificationRepository.findByTouristIdAndReadFalse(touristId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    public Notification createNotification(Notification notification) {
        notification.setNotificationId((int) sequenceService.getNextId("notificationId"));
        return notificationRepository.save(notification);
    }
}
