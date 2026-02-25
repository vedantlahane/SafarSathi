package com.safarsathi.repository;

import com.safarsathi.entity.RiskZone;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RiskZoneRepository extends MongoRepository<RiskZone, String> {

    Optional<RiskZone> findByZoneId(Integer zoneId);

    List<RiskZone> findByActiveTrue();

    void deleteByZoneId(Integer zoneId);
}
