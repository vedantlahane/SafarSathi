package com.safarsathi.backendapi.services.Impl;

import com.safarsathi.backendapi.models.PoliceDepartment;
import com.safarsathi.backendapi.repo.PoliceDepartmentRepository;
import com.safarsathi.backendapi.services.AdminService;
import com.safarsathi.backendapi.util.HashingUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Optional;

@Service
public class AdminServiceImpl implements AdminService {

    @Autowired
    private PoliceDepartmentRepository policeDepartmentRepository;

    @Override
    public PoliceDepartment validateAdminLogin(String email, String password) {
        if (email == null || password == null || email.trim().isEmpty() || password.trim().isEmpty()) {
            return null;
        }

        Optional<PoliceDepartment> optionalAdmin = policeDepartmentRepository.findByEmail(email.trim().toLowerCase());
        
        if (optionalAdmin.isEmpty()) {
            return null;
        }

        PoliceDepartment admin = optionalAdmin.get();
        
        // Hash the provided password and compare with stored hash (using same method as Tourist)
        String hashedPassword = HashingUtil.sha256(password);
        
        if (hashedPassword.equals(admin.getPasswordHash())) {
            return admin;
        }
        
        return null;
    }

    @Override
    public String generateAdminToken(PoliceDepartment policeDepartment) {
        // Simple token generation - in production, use JWT or similar
        String tokenData = policeDepartment.getEmail() + ":" + System.currentTimeMillis();
        return Base64.getEncoder().encodeToString(tokenData.getBytes(StandardCharsets.UTF_8));
    }


}