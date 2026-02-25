package com.safarsathi.service;

import com.safarsathi.entity.PoliceDepartment;
import com.safarsathi.repository.PoliceDepartmentRepository;
import com.safarsathi.util.HashUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PoliceService {

    private final PoliceDepartmentRepository policeDepartmentRepository;
    private final PasswordEncoder passwordEncoder;

    public PoliceDepartment createPoliceDepartment(PoliceDepartment dept) {
        if (dept.getId() == null) dept.setId(UUID.randomUUID().toString());
        if (dept.getPasswordHash() != null) {
            dept.setPasswordHash(passwordEncoder.encode(dept.getPasswordHash()));
        }
        return policeDepartmentRepository.save(dept);
    }

    public List<PoliceDepartment> listPoliceDepartments() {
        return policeDepartmentRepository.findAll();
    }

    public PoliceDepartment getPoliceDepartment(String id) {
        return policeDepartmentRepository.findById(id).orElse(null);
    }

    public PoliceDepartment updatePoliceDepartment(String id, PoliceDepartment updates) {
        Optional<PoliceDepartment> opt = policeDepartmentRepository.findById(id);
        if (opt.isEmpty()) return null;

        PoliceDepartment dept = opt.get();
        if (updates.getName() != null) dept.setName(updates.getName());
        if (updates.getEmail() != null) dept.setEmail(updates.getEmail());
        if (updates.getDepartmentCode() != null) dept.setDepartmentCode(updates.getDepartmentCode());
        if (updates.getLatitude() != null) dept.setLatitude(updates.getLatitude());
        if (updates.getLongitude() != null) dept.setLongitude(updates.getLongitude());
        if (updates.getCity() != null) dept.setCity(updates.getCity());
        if (updates.getDistrict() != null) dept.setDistrict(updates.getDistrict());
        if (updates.getState() != null) dept.setState(updates.getState());
        if (updates.getContactNumber() != null) dept.setContactNumber(updates.getContactNumber());
        if (updates.getIsActive() != null) dept.setIsActive(updates.getIsActive());

        return policeDepartmentRepository.save(dept);
    }

    public boolean deletePoliceDepartment(String id) {
        if (!policeDepartmentRepository.existsById(id)) return false;
        policeDepartmentRepository.deleteById(id);
        return true;
    }
}
