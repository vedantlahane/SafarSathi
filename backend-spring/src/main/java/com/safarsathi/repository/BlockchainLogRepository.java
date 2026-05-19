package com.YatraX.repository;

import com.YatraX.entity.BlockchainLog;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BlockchainLogRepository extends MongoRepository<BlockchainLog, String> {

    List<BlockchainLog> findByTouristId(String touristId, Sort sort);

    BlockchainLog findByDataHashAndStatus(String dataHash, String status);

    void deleteByTouristId(String touristId);
}
