package com.safarsathi.backendapi.repo;


import com.safarsathi.backendapi.models.BlockchainLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BlockchainLogRepository extends JpaRepository<BlockchainLog, Long> {
    
    /**
     * Finds a log entry by the data hash (Digital ID). Essential for verification.
     */
    Optional<BlockchainLog> findByDataHash(String dataHash); 

    List<BlockchainLog> findTop10ByTouristIdOrderByTimestampDesc(UUID touristId);
}