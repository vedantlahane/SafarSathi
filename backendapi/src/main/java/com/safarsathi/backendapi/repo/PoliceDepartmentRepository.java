package com.safarsathi.backendapi.repo;

import com.safarsathi.backendapi.models.PoliceDepartment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

// JpaRepository<Entity, IdType>
public interface PoliceDepartmentRepository extends JpaRepository<PoliceDepartment, UUID> {
    // Custom finder method for location-based lookups (optional, but useful)
    // List<PoliceDepartment> findByCity(String city);
}