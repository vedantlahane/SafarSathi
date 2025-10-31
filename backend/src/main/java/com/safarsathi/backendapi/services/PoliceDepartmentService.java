package com.safarsathi.backendapi.services;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.safarsathi.backendapi.models.PoliceDepartment;

public interface PoliceDepartmentService {

    /**
     * Creates a new Police Department, hashing the password before persistence.
     */
    PoliceDepartment createDepartment(PoliceDepartment department);

    /**
     * Retrieves all registered Police Departments.
     */
    List<PoliceDepartment> findAllDepartments();

    /**
     * Finds a single Police Department by its ID.
     */
    Optional<PoliceDepartment> findDepartmentById(UUID id);

    /**
     * Updates the details of an existing Police Department.
     */
    PoliceDepartment updateDepartment(UUID id, PoliceDepartment departmentDetails);

    /**
     * Deletes a Police Department by its ID.
     */
    void deleteDepartment(UUID id);
}