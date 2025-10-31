package com.safarsathi.backendapi.repo;

import com.safarsathi.backendapi.models.PoliceDepartment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.Optional;

// JpaRepository<Entity, IdType>
public interface PoliceDepartmentRepository extends JpaRepository<PoliceDepartment, UUID> {
    // Custom finder method for location-based lookups (optional, but useful)
    // List<PoliceDepartment> findByCity(String city);
    
    // Method to find police department by email for admin login
    Optional<PoliceDepartment> findByEmail(String email);
}