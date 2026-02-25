package com.safarsathi.config;

import com.safarsathi.entity.*;
import com.safarsathi.repository.*;
import com.safarsathi.util.HashUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

/**
 * Seeds the database with initial data on first run (when the tourists collection is empty).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final TouristRepository touristRepository;
    private final RiskZoneRepository riskZoneRepository;
    private final PoliceDepartmentRepository policeDepartmentRepository;
    private final HospitalRepository hospitalRepository;
    private final PasswordEncoder passwordEncoder;
    private final MongoTemplate mongoTemplate;

    @Override
    public void run(String... args) {
        if (touristRepository.count() > 0) {
            log.info("Database already seeded, skipping...");
            return;
        }
        log.info("Seeding database...");
        seedTourists();
        seedRiskZones();
        seedPoliceDepartments();
        seedHospitals();
        initCounters();
        log.info("Database seeded successfully");
    }

    private void seedTourists() {
        Tourist tourist = Tourist.builder()
                .id("ca4b21f2-ce17-49ef-a829-57d063d20163")
                .name("Aarav Sharma")
                .email("tourist@safarsathi.in")
                .phone("+91-9876543211")
                .passportNumber("IND1234567")
                .dateOfBirth("1993-04-12")
                .address("Pan Bazaar, Guwahati, Assam, India")
                .gender("Male")
                .nationality("Indian")
                .emergencyContact(new Tourist.EmergencyContact("Riya Sharma", "+91-9876543210"))
                .bloodType("O+")
                .allergies(List.of("Dust"))
                .medicalConditions(List.of("Asthma"))
                .passwordHash(passwordEncoder.encode("password123"))
                .idHash(HashUtil.sha256("IND1234567+91-9876543211"))
                .idExpiry(java.time.Instant.now().plus(365, java.time.temporal.ChronoUnit.DAYS).toString())
                .currentLat(26.2006)
                .currentLng(92.9376)
                .lastSeen(java.time.Instant.now().toString())
                .safetyScore(87.0)
                .build();
        touristRepository.save(tourist);
    }

    private void seedRiskZones() {
        riskZoneRepository.saveAll(List.of(
                RiskZone.builder()
                        .zoneId(1)
                        .name("Kamakhya Hill Restricted Belt")
                        .description("Sensitive wildlife and temple security perimeter. Tourists require special pass.")
                        .centerLat(26.1667).centerLng(91.7086)
                        .radiusMeters(750.0).riskLevel("HIGH").active(true)
                        .build(),
                RiskZone.builder()
                        .zoneId(2)
                        .name("Deepor Beel Wildlife Buffer")
                        .description("Flood-prone wetlands with limited transport access after dusk.")
                        .centerLat(26.1226).centerLng(91.65)
                        .radiusMeters(1200.0).riskLevel("MEDIUM").active(true)
                        .build()
        ));
    }

    private void seedPoliceDepartments() {
        policeDepartmentRepository.saveAll(List.of(
                PoliceDepartment.builder()
                        .id(UUID.randomUUID().toString())
                        .name("SafarSathi Control Center")
                        .email("admin@safarsathi.in")
                        .passwordHash(passwordEncoder.encode("admin123"))
                        .departmentCode("SS-CONTROL")
                        .latitude(26.1445).longitude(91.7362)
                        .city("Guwahati").district("Kamrup Metropolitan").state("Assam")
                        .contactNumber("+91-9876543210").isActive(true)
                        .build(),
                PoliceDepartment.builder()
                        .id(UUID.randomUUID().toString())
                        .name("Dispur Police Station")
                        .email("dispur@police.assam.gov.in")
                        .passwordHash(passwordEncoder.encode("admin123"))
                        .departmentCode("PS-DISPUR")
                        .latitude(26.1433).longitude(91.7898)
                        .city("Guwahati").district("Kamrup Metropolitan").state("Assam")
                        .contactNumber("+91-361-2234567").isActive(true)
                        .build()
        ));
    }

    private void seedHospitals() {
        hospitalRepository.saveAll(List.of(
                Hospital.builder()
                        .hospitalId(1).name("Gauhati Medical College & Hospital")
                        .latitude(26.1840).longitude(91.7456)
                        .contact("+91-361-2529457").type("hospital").emergency(true)
                        .city("Guwahati").district("Kamrup Metropolitan").state("Assam").isActive(true)
                        .build(),
                Hospital.builder()
                        .hospitalId(2).name("Down Town Hospital")
                        .latitude(26.1330).longitude(91.7890)
                        .contact("+91-361-2331003").type("hospital").emergency(true)
                        .city("Guwahati").district("Kamrup Metropolitan").state("Assam").isActive(true)
                        .build(),
                Hospital.builder()
                        .hospitalId(3).name("Nemcare Hospital")
                        .latitude(26.1480).longitude(91.7700)
                        .contact("+91-361-2463003").type("hospital").emergency(true)
                        .city("Guwahati").district("Kamrup Metropolitan").state("Assam").isActive(true)
                        .build(),
                Hospital.builder()
                        .hospitalId(4).name("Dispur Polyclinic & Nursing Home")
                        .latitude(26.1425).longitude(91.7880)
                        .contact("+91-361-2260373").type("clinic").emergency(false)
                        .city("Guwahati").district("Kamrup Metropolitan").state("Assam").isActive(true)
                        .build()
        ));
    }

    private void initCounters() {
        upsertCounter("riskZoneId", 2);
        upsertCounter("alertId", 0);
        upsertCounter("notificationId", 0);
        upsertCounter("blockchainLogId", 0);
        upsertCounter("hospitalId", 4);
    }

    private void upsertCounter(String name, long seq) {
        mongoTemplate.upsert(
                Query.query(Criteria.where("_id").is(name)),
                Update.update("seq", seq),
                Counter.class
        );
    }
}
