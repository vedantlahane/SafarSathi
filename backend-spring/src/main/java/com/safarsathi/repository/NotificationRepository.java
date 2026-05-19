package com.YatraX.repository;

import com.YatraX.entity.Notification;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {

    List<Notification> findByTouristId(String touristId, Sort sort);

    Optional<Notification> findByNotificationId(Integer notificationId);

    List<Notification> findByTouristIdAndReadFalse(String touristId);

    void deleteByTouristId(String touristId);
}
