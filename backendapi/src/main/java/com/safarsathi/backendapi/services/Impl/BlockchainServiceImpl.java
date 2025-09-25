package com.safarsathi.backendapi.services.Impl;

// backend/src/main/java/com/safarsathi/backendapi/service/BlockchainServiceImpl.java

import com.safarsathi.backendapi.services.BlockchainService;

import com.safarsathi.backendapi.models.BlockchainLog;
import com.safarsathi.backendapi.repo.BlockchainLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;
import java.util.UUID;

@Service
public class BlockchainServiceImpl implements BlockchainService {

    @Autowired
    private BlockchainLogRepository blockchainLogRepository;

    private static final String MOCK_TX_PREFIX = "0xHACK_SAT_";
    private static final String SUCCESS_STATUS = "SUCCESS_ISSUED_ON_TESTNET";

    @Override
    public BlockchainLog issueDigitalID(UUID touristId, String idHash) {
        // 1. Simulate the transaction ID returned by the smart contract call
        String mockTransactionId = MOCK_TX_PREFIX + UUID.randomUUID().toString().substring(0, 8);
        
        // 2. Log the transaction (this log is the "immutable proof" for the MVP)
        BlockchainLog log = new BlockchainLog();
        log.setTouristId(touristId);
        log.setDataHash(idHash);
        log.setTransactionId(mockTransactionId);
        log.setStatus(SUCCESS_STATUS); 
        
        return blockchainLogRepository.save(log);
    }

    @Override
    public boolean verifyIDProof(String idHash) {
        // Look up the hash in the log table
        Optional<BlockchainLog> log = blockchainLogRepository.findByDataHash(idHash);

        // A successful verification requires the hash to exist AND have a successful status.
        return log.isPresent() && log.get().getStatus().equals(SUCCESS_STATUS);
    }
}