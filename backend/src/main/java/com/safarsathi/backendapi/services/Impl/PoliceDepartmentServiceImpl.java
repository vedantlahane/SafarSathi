package com.safarsathi.backendapi.services.Impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.safarsathi.backendapi.models.PoliceDepartment;
import com.safarsathi.backendapi.repo.PoliceDepartmentRepository;
import com.safarsathi.backendapi.services.PoliceDepartmentService;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service // Marks this as a Spring service component
@Transactional // Ensures methods run within a database transaction
public class PoliceDepartmentServiceImpl implements PoliceDepartmentService {

    private final PoliceDepartmentRepository repository;

    // Constructor Injection (preferred method)
    public PoliceDepartmentServiceImpl(PoliceDepartmentRepository repository) {
        this.repository = repository;
    }

    @Override
    public PoliceDepartment createDepartment(PoliceDepartment department) {
        return repository.save(department);
    }

    @Override
    public List<PoliceDepartment> findAllDepartments() {
        return repository.findAll();
    }

    @Override
    public Optional<PoliceDepartment> findDepartmentById(UUID id) {
        return repository.findById(id);
    }

    @Override
    public void deleteDepartment(UUID id) {
        repository.deleteById(id);
    }

    @Override
    public PoliceDepartment updateDepartment(UUID id, PoliceDepartment departmentDetails) {
        PoliceDepartment department = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Police Department not found with id: " + id));

        // Update fields:
        department.setName(departmentDetails.getName());
        department.setEmail(departmentDetails.getEmail());
        department.setDepartmentCode(departmentDetails.getDepartmentCode());
        department.setLatitude(departmentDetails.getLatitude());
        department.setLongitude(departmentDetails.getLongitude());
        department.setCity(departmentDetails.getCity());
        department.setDistrict(departmentDetails.getDistrict());
        department.setState(departmentDetails.getState());
        department.setContactNumber(departmentDetails.getContactNumber());
        department.setIsActive(departmentDetails.getIsActive());

        return repository.save(department);
    }
}