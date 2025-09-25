package com.safarsathi.backendapi.services.Impl;

import com.safarsathi.backendapi.services.TouristService;
import com.safarsathi.backendapi.services.BlockchainService;
import com.safarsathi.backendapi.services.AnomalyService;

import com.safarsathi.backendapi.models.Tourist;
import com.safarsathi.backendapi.repo.TouristRepository;
import com.safarsathi.backendapi.util.HashingUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.Optional; 
import java.util.UUID;

@Service
public class TouristServiceImpl implements TouristService {

    @Autowired
    private TouristRepository touristRepository;

    @Autowired
    private BlockchainService blockchainService; 
    
    @Autowired
    private AnomalyService anomalyService;

    // -----------------------------------------------------------------
    // 🔑 UPDATED: Handles password hashing and sets key security fields
    // -----------------------------------------------------------------
    @Override
    public Tourist registerTourist(Tourist newTourist) {
        
        // 1. SERVER-SIDE PASSWORD HASHING (Crucial for security)
        // The incoming newTourist object contains the plaintext password in the passwordHash field.
        String rawPassword = newTourist.getPasswordHash(); 
        String hashedPassword = HashingUtil.sha256(rawPassword);
        newTourist.setPasswordHash(hashedPassword); // Store the secure hash in the model
        
        // 2. Generate the Digital ID Hash (for blockchain proof)
        String inputForHash = newTourist.getPassportNumber() + newTourist.getPhone() + Instant.now().toString();
        String idHash = HashingUtil.sha256(inputForHash);
        
        newTourist.setIdHash(idHash);
        
        // 3. Set standard registration/tracking fields
        newTourist.setLastSeen(Instant.now());
        newTourist.setIdExpiry(Instant.now().plusSeconds(31536000)); // 1 year mock validity
        
        // Note: Fields like name, email, phone, gender, dob, nationality, etc.,
        // are set directly on the newTourist object by Spring's @RequestBody binding
        // when the API receives the JSON. We don't need to manually set them here.
        
        // 4. Save to Database
        Tourist savedTourist = touristRepository.save(newTourist);

        // 5. Publish hash to the "Blockchain" log
        blockchainService.issueDigitalID(savedTourist.getId(), savedTourist.getIdHash());
        
        return savedTourist;
    }

    // --- verifyIdHash method (Unchanged) ---
    @Override
    public Tourist verifyIdHash(String idHash) {
        return touristRepository.findByIdHash(idHash)
                .orElseThrow(() -> new RuntimeException("Digital ID not found or invalid."));
    }

    // --- updateLocation method (Unchanged) ---
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
    
    // --- login method (Unchanged, token generation mock) ---
    @Override
    public String login(String phone) {
        // MVP MOCK: Generates a predictable (but secure format) mock token
        return "MOCK_JWT_TOKEN_" + HashingUtil.sha256(phone).substring(0, 10);
    }

    // ----------------------------------------------------
    // 🔑 LOGIN VALIDATION BY EMAIL AND PASSWORD
    // ----------------------------------------------------
    @Override
    public Tourist validateTouristLoginByEmail(String email, String rawPassword) {
        
        Optional<Tourist> touristOptional = touristRepository.findByEmail(email);

        if (touristOptional.isEmpty()) {
            return null; 
        }

        Tourist tourist = touristOptional.get();

        // 1. Hash the raw password provided during login
        String hashedInputPassword = HashingUtil.sha256(rawPassword);
        
        // 2. Compare the generated hash with the stored hash
        if (!hashedInputPassword.equals(tourist.getPasswordHash())) {
             // Password mismatch
             return null; 
        }

        // Success: Email found and password matches
        return tourist;
    }

    // ----------------------------------------------------
    // 🆕 GET TOURIST BY ID
    // ----------------------------------------------------
    @Override
    public Tourist getTouristById(UUID touristId) {
        Optional<Tourist> touristOptional = touristRepository.findById(touristId);
        return touristOptional.orElse(null);
    }
}