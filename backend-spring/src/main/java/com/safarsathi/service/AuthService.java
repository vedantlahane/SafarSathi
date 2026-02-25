package com.safarsathi.service;

import com.safarsathi.dto.TouristRegistrationRequest;
import com.safarsathi.dto.TouristResponse;
import com.safarsathi.entity.Tourist;
import com.safarsathi.repository.TouristRepository;
import com.safarsathi.security.JwtService;
import com.safarsathi.util.HashUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final TouristRepository touristRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final BlockchainService blockchainService;
    private final AnomalyService anomalyService;

    /**
     * Register a new tourist.
     */
    public Map<String, Object> registerTourist(TouristRegistrationRequest request) {
        if (touristRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already registered");
        }

        String hashedPassword = passwordEncoder.encode(request.getPasswordHash());
        String idHashInput = request.getPassportNumber() + request.getPhone() + Instant.now().toString();
        String idHash = HashUtil.sha256(idHashInput);
        Instant expiry = Instant.now().plus(365, ChronoUnit.DAYS);

        Tourist.EmergencyContact ec = null;
        if (request.getEmergencyContact() != null) {
            ec = new Tourist.EmergencyContact(
                    request.getEmergencyContact().get("name"),
                    request.getEmergencyContact().get("phone"));
        }

        Tourist tourist = Tourist.builder()
                .id(UUID.randomUUID().toString())
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .passportNumber(request.getPassportNumber())
                .dateOfBirth(request.getDateOfBirth())
                .address(request.getAddress())
                .gender(request.getGender())
                .nationality(request.getNationality())
                .emergencyContact(ec)
                .bloodType(request.getBloodType())
                .allergies(request.getAllergies())
                .medicalConditions(request.getMedicalConditions())
                .passwordHash(hashedPassword)
                .idHash(idHash)
                .idExpiry(expiry.toString())
                .currentLat(request.getCurrentLat())
                .currentLng(request.getCurrentLng())
                .lastSeen(Instant.now().toString())
                .safetyScore(100.0)
                .build();

        tourist = touristRepository.save(tourist);

        // Issue digital ID on mock blockchain
        blockchainService.issueDigitalID(tourist.getId(), idHash);

        String token = jwtService.generateToken(tourist.getId(), "tourist");

        Map<String, Object> result = new HashMap<>();
        result.put("touristId", tourist.getId());
        result.put("qr_content", "/api/admin/id/verify?hash=" + idHash);
        result.put("token", token);
        result.put("user", toResponse(tourist));
        return result;
    }

    /**
     * Login a tourist with email and password.
     */
    public Map<String, Object> loginTourist(String email, String password) {
        Tourist tourist = touristRepository.findByEmail(email)
                .orElse(null);
        if (tourist == null || !passwordEncoder.matches(password, tourist.getPasswordHash())) {
            return null;
        }

        String token = jwtService.generateToken(tourist.getId(), "tourist");

        Map<String, Object> result = new HashMap<>();
        result.put("touristId", tourist.getId());
        result.put("qr_content", "/api/admin/id/verify?hash=" + tourist.getIdHash());
        result.put("token", token);
        result.put("user", toResponse(tourist));
        return result;
    }

    /**
     * Get tourist profile.
     */
    public TouristResponse getProfile(String touristId) {
        return touristRepository.findById(touristId)
                .map(this::toResponse)
                .orElse(null);
    }

    /**
     * Update tourist profile.
     */
    public TouristResponse updateProfile(String touristId, Map<String, Object> payload) {
        Tourist tourist = touristRepository.findById(touristId).orElse(null);
        if (tourist == null) return null;

        if (payload.containsKey("email")) {
            String newEmail = (String) payload.get("email");
            touristRepository.findByEmail(newEmail).ifPresent(existing -> {
                if (!existing.getId().equals(touristId)) {
                    throw new IllegalArgumentException("Email already registered");
                }
            });
            tourist.setEmail(newEmail);
        }
        if (payload.containsKey("name")) tourist.setName((String) payload.get("name"));
        if (payload.containsKey("phone")) tourist.setPhone((String) payload.get("phone"));
        if (payload.containsKey("passportNumber")) tourist.setPassportNumber((String) payload.get("passportNumber"));
        if (payload.containsKey("dateOfBirth")) tourist.setDateOfBirth((String) payload.get("dateOfBirth"));
        if (payload.containsKey("address")) tourist.setAddress((String) payload.get("address"));
        if (payload.containsKey("gender")) tourist.setGender((String) payload.get("gender"));
        if (payload.containsKey("nationality")) tourist.setNationality((String) payload.get("nationality"));
        if (payload.containsKey("bloodType")) tourist.setBloodType((String) payload.get("bloodType"));

        if (payload.containsKey("emergencyContact")) {
            @SuppressWarnings("unchecked")
            Map<String, String> ecMap = (Map<String, String>) payload.get("emergencyContact");
            if (ecMap != null) {
                tourist.setEmergencyContact(new Tourist.EmergencyContact(ecMap.get("name"), ecMap.get("phone")));
            }
        }
        if (payload.containsKey("allergies")) {
            @SuppressWarnings("unchecked")
            List<String> allergies = (List<String>) payload.get("allergies");
            tourist.setAllergies(allergies);
        }
        if (payload.containsKey("medicalConditions")) {
            @SuppressWarnings("unchecked")
            List<String> mc = (List<String>) payload.get("medicalConditions");
            tourist.setMedicalConditions(mc);
        }

        tourist = touristRepository.save(tourist);
        return toResponse(tourist);
    }

    /**
     * Update tourist location and trigger anomaly detection.
     */
    public void updateLocation(String touristId, Double lat, Double lng, Double accuracy) {
        Tourist tourist = touristRepository.findById(touristId)
                .orElseThrow(() -> new RuntimeException("Tourist not found."));
        tourist.setCurrentLat(lat);
        tourist.setCurrentLng(lng);
        tourist.setLastSeen(Instant.now().toString());
        tourist = touristRepository.save(tourist);
        anomalyService.processLocation(tourist);
    }

    /**
     * Verify an ID hash (for QR code scanning by admin).
     */
    public Tourist verifyIdHash(String idHash) {
        return touristRepository.findByIdHash(idHash)
                .orElseThrow(() -> new RuntimeException("Digital ID not found or invalid."));
    }

    /**
     * List all tourists.
     */
    public List<Tourist> listTourists() {
        return touristRepository.findAll();
    }

    /**
     * Request a password reset token.
     */
    public Map<String, Object> requestPasswordReset(String email) {
        Map<String, Object> result = new HashMap<>();
        result.put("acknowledged", true);

        Tourist tourist = touristRepository.findByEmail(email).orElse(null);
        if (tourist == null) return result;

        String resetToken = UUID.randomUUID().toString().replace("-", "").substring(0, 40);
        String resetTokenHash = HashUtil.sha256(resetToken);
        Instant expires = Instant.now().plus(30, ChronoUnit.MINUTES);

        tourist.setResetTokenHash(resetTokenHash);
        tourist.setResetTokenExpires(expires);
        touristRepository.save(tourist);

        result.put("resetToken", resetToken);
        return result;
    }

    /**
     * Confirm password reset with token.
     */
    public boolean confirmPasswordReset(String token, String newPassword) {
        String tokenHash = HashUtil.sha256(token);
        Tourist tourist = touristRepository
                .findByResetTokenHashAndResetTokenExpiresAfter(tokenHash, Instant.now())
                .orElse(null);
        if (tourist == null) return false;

        tourist.setPasswordHash(passwordEncoder.encode(newPassword));
        tourist.setResetTokenHash(null);
        tourist.setResetTokenExpires(null);
        touristRepository.save(tourist);
        return true;
    }

    /**
     * Convert Tourist entity to TouristResponse DTO.
     */
    public TouristResponse toResponse(Tourist tourist) {
        Map<String, String> ecMap = null;
        if (tourist.getEmergencyContact() != null) {
            ecMap = new HashMap<>();
            ecMap.put("name", tourist.getEmergencyContact().getName());
            ecMap.put("phone", tourist.getEmergencyContact().getPhone());
        }

        return TouristResponse.builder()
                .id(tourist.getId())
                .name(tourist.getName())
                .email(tourist.getEmail())
                .phone(tourist.getPhone())
                .passportNumber(tourist.getPassportNumber())
                .dateOfBirth(tourist.getDateOfBirth())
                .address(tourist.getAddress())
                .gender(tourist.getGender())
                .nationality(tourist.getNationality())
                .emergencyContact(ecMap)
                .bloodType(tourist.getBloodType())
                .allergies(tourist.getAllergies())
                .medicalConditions(tourist.getMedicalConditions())
                .currentLat(tourist.getCurrentLat())
                .currentLng(tourist.getCurrentLng())
                .lastSeen(tourist.getLastSeen())
                .idHash(tourist.getIdHash())
                .idExpiry(tourist.getIdExpiry())
                .build();
    }
}
