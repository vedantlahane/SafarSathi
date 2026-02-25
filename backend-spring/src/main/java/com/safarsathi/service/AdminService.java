package com.safarsathi.service;

import com.safarsathi.entity.PoliceDepartment;
import com.safarsathi.repository.PoliceDepartmentRepository;
import com.safarsathi.security.JwtService;
import com.safarsathi.util.HashUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final PoliceDepartmentRepository policeDepartmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    /**
     * Validate admin login (police department credentials).
     */
    public PoliceDepartment validateAdminLogin(String email, String password) {
        if (email == null || password == null) return null;

        PoliceDepartment admin = policeDepartmentRepository
                .findByEmail(email.trim().toLowerCase())
                .orElse(null);
        if (admin == null) return null;

        if (!passwordEncoder.matches(password, admin.getPasswordHash())) return null;
        return admin;
    }

    /**
     * Generate a JWT token for admin access.
     */
    public String generateAdminToken(PoliceDepartment dept) {
        return jwtService.generateToken(dept.getId(), "admin");
    }
}
