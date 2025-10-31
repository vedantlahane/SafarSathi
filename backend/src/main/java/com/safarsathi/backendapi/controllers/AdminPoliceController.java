package com.safarsathi.backendapi.controllers;

import com.safarsathi.backendapi.models.PoliceDepartment;
import com.safarsathi.backendapi.services.PoliceDepartmentService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

// This controller should be secured to only allow ADMIN roles
@RestController
@RequestMapping("/api/admin/police")
public class AdminPoliceController {

    private final PoliceDepartmentService policeDepartmentService;

    public AdminPoliceController(PoliceDepartmentService policeDepartmentService) {
        this.policeDepartmentService = policeDepartmentService;
    }

    // 1. POST: Create a new Police Department
    @PostMapping
    public ResponseEntity<PoliceDepartment> createDepartment(@RequestBody PoliceDepartment department) {
        // IMPORTANT: The request body will contain the plaintext password in the 'passwordHash' field,
        // which the service layer must HASH before saving it as 'passwordHash'
        PoliceDepartment created = policeDepartmentService.createDepartment(department);
        // Clean the password hash before sending the response back
        created.setPasswordHash(null); 
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    // 2. GET: Retrieve all Police Departments
    @GetMapping
    public List<PoliceDepartment> getAllDepartments() {
        // In a real app, you would use DTOs and pagination, 
        // and ensure password hashes are NOT sent!
        List<PoliceDepartment> departments = policeDepartmentService.findAllDepartments();
        departments.forEach(d -> d.setPasswordHash(null));
        return departments;
    }

    // 3. GET: Retrieve a specific Police Department
    @GetMapping("/{id}")
    public ResponseEntity<PoliceDepartment> getDepartmentById(@PathVariable UUID id) {
        return policeDepartmentService.findDepartmentById(id)
                .map(department -> {
                    department.setPasswordHash(null); // Clean hash
                    return ResponseEntity.ok(department);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 4. PUT: Update an existing Police Department
    @PutMapping("/{id}")
    public ResponseEntity<PoliceDepartment> updateDepartment(@PathVariable UUID id, @RequestBody PoliceDepartment departmentDetails) {
        try {
            PoliceDepartment updated = policeDepartmentService.updateDepartment(id, departmentDetails);
            updated.setPasswordHash(null); // Clean hash
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 5. DELETE: Delete a Police Department
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDepartment(@PathVariable UUID id) {
        policeDepartmentService.deleteDepartment(id);
        return ResponseEntity.noContent().build();
    }
}