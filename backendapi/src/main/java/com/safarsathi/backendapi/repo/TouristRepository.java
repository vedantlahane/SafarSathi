package com.safarsathi.backendapi.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.safarsathi.backendapi.models.Tourist;

import java.util.Optional;
import java.util.UUID;

public interface TouristRepository extends JpaRepository<Tourist, UUID> {
    
    // Custom finder method to verify the Digital ID hash
    Optional<Tourist> findByIdHash(String idHash);
}