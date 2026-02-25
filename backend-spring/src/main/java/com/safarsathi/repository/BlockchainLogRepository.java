package com.safarsathi.repository;

import com.safarsathi.entity.BlockchainLog;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BlockchainLogRepository extends MongoRepository<BlockchainLog, String> {

    List<BlockchainLog> findByTouristId(String touristId, Sort sort);

    BlockchainLog findByDataHashAndStatus(String dataHash, String status);
}
