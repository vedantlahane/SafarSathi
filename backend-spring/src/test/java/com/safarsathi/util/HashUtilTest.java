package com.safarsathi.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class HashUtilTest {

    @Test
    void testSha256ProducesDeterministicOutput() {
        String hash1 = HashUtil.sha256("hello");
        String hash2 = HashUtil.sha256("hello");
        assertEquals(hash1, hash2);
        assertEquals(64, hash1.length()); // SHA-256 hex = 64 chars
    }

    @Test
    void testSha256DifferentInputsDifferentOutput() {
        String hash1 = HashUtil.sha256("hello");
        String hash2 = HashUtil.sha256("world");
        assertNotEquals(hash1, hash2);
    }
}
