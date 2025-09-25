package com.safarsathi.backendapi.services.Impl;

import com.safarsathi.backendapi.services.TouristService;
import com.safarsathi.backendapi.services.BlockchainService;
import com.safarsathi.backendapi.services.AlertService;
import com.safarsathi.backendapi.services.AnomalyService;

import com.safarsathi.backendapi.models.Tourist;
import com.safarsathi.backendapi.repo.TouristRepository;
import com.safarsathi.backendapi.util.HashingUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.UUID;

@Service
public class TouristServiceImpl implements TouristService {

    @Autowired
    private TouristRepository touristRepository;

    @Autowired
    private BlockchainService blockchainService; 
    
    // NEW INJECTIONS
    @Autowired 
    private AlertService alertService; 
    
    @Autowired
    private AnomalyService anomalyService;

    // --- registerTourist and verifyIdHash methods remain unchanged ---
    @Override
    public Tourist registerTourist(Tourist newTourist) {
        // 1. Generate the immutable ID hash 
        String inputForHash = newTourist.getPassportNumber() + newTourist.getPhone() + Instant.now().toString();
        String idHash = HashingUtil.sha256(inputForHash);
        
        newTourist.setIdHash(idHash);
        newTourist.setLastSeen(Instant.now());
        newTourist.setIdExpiry(Instant.now().plusSeconds(31536000)); // 1 year mock
        
        Tourist savedTourist = touristRepository.save(newTourist);

        // 2. Publish hash to the "Blockchain" log for immutable proof
        blockchainService.issueDigitalID(savedTourist.getId(), savedTourist.getIdHash());
        
        return savedTourist;
    }

    @Override
    public Tourist verifyIdHash(String idHash) {
        return touristRepository.findByIdHash(idHash)
                .orElseThrow(() -> new RuntimeException("Digital ID not found or invalid."));
    }

    @Override
    public Tourist updateLocation(UUID touristId, Double lat, Double lng, Integer accuracy) {
        Tourist tourist = touristRepository.findById(touristId)
                .orElseThrow(() -> new RuntimeException("Tourist not found."));

        // 1. Update live location fields
        tourist.setCurrentLat(lat);
        tourist.setCurrentLng(lng);
        tourist.setLastSeen(Instant.now());
        
        Tourist updatedTourist = touristRepository.save(tourist);

        // 2. ✨ INTEGRATION POINT: Send updated location data to the Anomaly Service
        anomalyService.processLocation(updatedTourist, accuracy);
        
        return updatedTourist;
    }
    
    @Override
    public String login(String phone) {
        // MVP MOCK
        return "MOCK_JWT_TOKEN_" + HashingUtil.sha256(phone).substring(0, 10);
    }
}