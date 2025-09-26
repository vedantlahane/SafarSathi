package com.safarsathi.backendapi.config;

import com.safarsathi.backendapi.util.HashingUtil;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class SampleDataLoader implements CommandLineRunner {

    private static final UUID TOURIST_ID = UUID.fromString("ca4b21f2-ce17-49ef-a829-57d063d20163");
    private static final String TOURIST_EMAIL = "tourist@safarsathi.in";
    private static final String RAW_PASSWORD = "password123";
    private static final String EMERGENCY_CONTACT_JSON =
            "{\"name\":\"Riya Sharma\",\"relationship\":\"Sibling\",\"phone\":\"+91-9876543210\"}";
    private static final String DIGITAL_ID_SEED = "IND1234567+91-9876543211";

    private final JdbcTemplate jdbcTemplate;

    public SampleDataLoader(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        final String sql =
                "INSERT INTO tourists (" +
                        "id, name, email, phone, passport_number, date_of_birth, address, gender, nationality, " +
                        "emergency_contact, password_hash, id_hash, id_expiry, current_lat, current_lng, last_seen, safety_score" +
                        ") VALUES (" +
                        "UNHEX(REPLACE(?, '-', '')), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?" +
                        ") ON DUPLICATE KEY UPDATE " +
                        "name = VALUES(name), " +
                        "phone = VALUES(phone), " +
                        "passport_number = VALUES(passport_number), " +
                        "date_of_birth = VALUES(date_of_birth), " +
                        "address = VALUES(address), " +
                        "gender = VALUES(gender), " +
                        "nationality = VALUES(nationality), " +
                        "emergency_contact = VALUES(emergency_contact), " +
                        "password_hash = VALUES(password_hash), " +
                        "id_hash = VALUES(id_hash), " +
                        "id_expiry = VALUES(id_expiry), " +
                        "current_lat = VALUES(current_lat), " +
                        "current_lng = VALUES(current_lng), " +
                        "last_seen = VALUES(last_seen), " +
                        "safety_score = VALUES(safety_score)";

        Instant now = Instant.now();
        jdbcTemplate.update(
                sql,
                TOURIST_ID.toString(),
                "Aarav Sharma",
                TOURIST_EMAIL,
                "+91-9876543211",
                "IND1234567",
                "1993-04-12",
                "Pan Bazaar, Guwahati, Assam, India",
                "Male",
                "Indian",
                EMERGENCY_CONTACT_JSON,
                HashingUtil.sha256(RAW_PASSWORD),
                HashingUtil.sha256(DIGITAL_ID_SEED),
                Timestamp.from(now.plus(365, ChronoUnit.DAYS)),
                26.2006,
                92.9376,
                Timestamp.from(now),
                87.0
        );
    }
}
