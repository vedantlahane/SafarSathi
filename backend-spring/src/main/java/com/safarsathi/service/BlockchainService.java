package com.safarsathi.service;

import com.safarsathi.entity.BlockchainLog;
import com.safarsathi.repository.BlockchainLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BlockchainService {

    private static final String MOCK_TX_PREFIX = "0xHACK_SAT_";
    private static final String SUCCESS_STATUS = "SUCCESS_ISSUED_ON_TESTNET";

    private final BlockchainLogRepository blockchainLogRepository;
    private final SequenceService sequenceService;

    /**
     * Issues a mock digital ID on a simulated blockchain.
     */
    public BlockchainLog issueDigitalID(String touristId, String idHash) {
        BlockchainLog log = BlockchainLog.builder()
                .logId((int) sequenceService.getNextId("blockchainLogId"))
                .touristId(touristId)
                .dataHash(idHash)
                .transactionId(MOCK_TX_PREFIX + UUID.randomUUID().toString().substring(0, 8))
                .status(SUCCESS_STATUS)
                .build();
        return blockchainLogRepository.save(log);
    }

    /**
     * Verify that an ID proof exists on the mock blockchain.
     */
    public boolean verifyIDProof(String idHash) {
        return blockchainLogRepository.findByDataHashAndStatus(idHash, SUCCESS_STATUS) != null;
    }

    /**
     * Get recent blockchain logs for a tourist.
     */
    public List<BlockchainLog> getRecentLogs(String touristId, int limit) {
        List<BlockchainLog> logs = blockchainLogRepository.findByTouristId(
                touristId, Sort.by(Sort.Direction.DESC, "createdAt"));
        if (limit <= 0 || logs.size() <= limit) return logs;
        return logs.subList(0, limit);
    }
}
