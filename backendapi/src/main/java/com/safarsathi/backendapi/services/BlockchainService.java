package com.safarsathi.backendapi.services;


import com.safarsathi.backendapi.models.BlockchainLog;
import java.util.UUID;

public interface BlockchainService {

    /**
     * Issues the given hash as an immutable record for the Tourist on the "chain."
     * (MVP: Mocks the transaction and saves a log entry).
     * @param touristId The ID of the tourist.
     * @param idHash The SHA256 hash (Digital ID).
     * @return The created BlockchainLog record.
     */
    BlockchainLog issueDigitalID(UUID touristId, String idHash);

    /**
     * Verifies the ID hash by checking its log and status.
     * @param idHash The hash to verify.
     * @return True if the hash exists and is valid.
     */
    boolean verifyIDProof(String idHash);
}