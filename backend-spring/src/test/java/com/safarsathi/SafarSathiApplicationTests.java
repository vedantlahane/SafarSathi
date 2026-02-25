package com.safarsathi;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
    "spring.data.mongodb.uri=mongodb://localhost:27017/safarsathi-test",
    "app.jwt.secret=test-secret-key-for-unit-testing-only-32chars",
    "app.jwt.expiration-ms=3600000"
})
class SafarSathiApplicationTests {

    @Test
    void contextLoads() {
    }
}
