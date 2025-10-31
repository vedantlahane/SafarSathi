package com.safarsathi.backendapi.services;

import com.safarsathi.backendapi.models.PoliceDepartment;

public interface AdminService {
    /**
     * Validates admin login credentials
     * @param email Admin email
     * @param password Raw password
     * @return PoliceDepartment if valid, null otherwise
     */
    PoliceDepartment validateAdminLogin(String email, String password);
    
    /**
     * Generates a simple token for admin session
     * @param policeDepartment Authenticated police department
     * @return Authentication token
     */
    String generateAdminToken(PoliceDepartment policeDepartment);
}