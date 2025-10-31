package com.safarsathi.backendapi.repo;

import com.safarsathi.backendapi.models.RiskZone;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RiskZoneRepository extends JpaRepository<RiskZone, Long> {
    List<RiskZone> findByActiveTrue();
}
