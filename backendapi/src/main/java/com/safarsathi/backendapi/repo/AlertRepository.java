package com.safarsathi.backendapi.repo;

import com.safarsathi.backendapi.models.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AlertRepository extends JpaRepository<Alert, Long> {
    
    // Find all alerts that are NOT resolved, used for the Admin Dashboard feed
    List<Alert> findByStatusIsNot(String status);
}