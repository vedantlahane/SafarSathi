package com.safarsathi.backendapi.util;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * Utility class for generating cryptographically secure hashes, 
 * primarily used for creating the Digital Tourist ID hash (SHA-256).
 */
public class HashingUtil {

    private HashingUtil() {
        // Private constructor to prevent instantiation
    }

    /**
     * Computes the SHA-256 hash of the input data.
     * @param data The string data to hash (e.g., passport + phone + timestamp).
     * @return The 64-character hexadecimal SHA-256 hash string.
     */
    public static String sha256(String data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            // Compute the hash bytes
            byte[] hash = digest.digest(data.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            
            // Convert byte array to hexadecimal string
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                // Convert byte to hex, padding with a leading zero if necessary
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }

            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            // This should never happen in a standard Java environment
            throw new IllegalStateException("SHA-256 algorithm not found.", e);
        }
    }
}