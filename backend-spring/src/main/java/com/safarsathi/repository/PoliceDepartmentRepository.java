package com.safarsathi.repository;

import com.safarsathi.entity.PoliceDepartment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PoliceDepartmentRepository extends MongoRepository<PoliceDepartment, String> {

    Optional<PoliceDepartment> findByEmail(String email);

    Optional<PoliceDepartment> findByDepartmentCode(String departmentCode);
}
