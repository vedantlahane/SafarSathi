package com.safarsathi.repository;

import com.safarsathi.entity.Alert;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AlertRepository extends MongoRepository<Alert, String> {

    Optional<Alert> findByAlertId(Integer alertId);

    List<Alert> findByTouristId(String touristId, Sort sort);

    List<Alert> findByStatus(String status, Sort sort);

    List<Alert> findAll(Sort sort);
}
