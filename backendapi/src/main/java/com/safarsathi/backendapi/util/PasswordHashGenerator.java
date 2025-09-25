package com.safarsathi.backendapi.util;

/**
 * Simple utility to generate password hashes for admin users
 * Run this to get the hash for your admin passwords
 */
public class PasswordHashGenerator {
    
    public static void main(String[] args) {
        String password = "admin123";
        String hash = HashingUtil.sha256(password);
        System.out.println("Password: " + password);
        System.out.println("Hash: " + hash);
        
        // Test with another password
        String password2 = "password123";
        String hash2 = HashingUtil.sha256(password2);
        System.out.println("\nPassword: " + password2);
        System.out.println("Hash: " + hash2);
    }
}
