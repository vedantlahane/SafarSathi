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
 * Seeds the database with Punjab / LPU-area data.
 * Reference data (risk zones, hospitals, police stations) is ALWAYS refreshed on startup.
 * The demo tourist is only created once.
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
        log.info("Refreshing reference data with Punjab / LPU seed...");
        seedRiskZones();
        seedPoliceDepartments();
        seedHospitals();
        initCounters();

        if (touristRepository.count() == 0) {
            log.info("No tourists found — seeding demo tourist...");
            seedTourists();
        } else {
            log.info("Tourist data already present — skipping tourist seed.");
        }

        log.info("Database seed complete.");
    }

    // ── Demo tourist (LPU campus coordinates) ──────────────────────────────
    private void seedTourists() {
        Tourist tourist = Tourist.builder()
                .id("ca4b21f2-ce17-49ef-a829-57d063d20163")
                .name("Aarav Sharma")
                .email("tourist@safarsathi.in")
                .phone("+91-9876543211")
                .passportNumber("IND1234567")
                .dateOfBirth("1993-04-12")
                .address("LPU Campus, Phagwara, Punjab, India")
                .gender("Male")
                .nationality("Indian")
                .emergencyContact(new Tourist.EmergencyContact("Riya Sharma", "+91-9876543210"))
                .bloodType("O+")
                .allergies(List.of("Dust"))
                .medicalConditions(List.of("Asthma"))
                .passwordHash(passwordEncoder.encode("password123"))
                .idHash(HashUtil.sha256("IND1234567+91-9876543211"))
                .idExpiry(java.time.Instant.now().plus(365, java.time.temporal.ChronoUnit.DAYS).toString())
                .currentLat(31.2554)
                .currentLng(75.7048)
                .lastSeen(java.time.Instant.now().toString())
                .safetyScore(72.0)
                .build();
        touristRepository.save(tourist);
    }

    // ── Risk zones (Punjab / LPU area) ─────────────────────────────────────
    private void seedRiskZones() {
        riskZoneRepository.deleteAll();
        riskZoneRepository.saveAll(List.of(

                // ── LPU immediate vicinity ──
                RiskZone.builder()
                        .zoneId(1)
                        .name("LPU Front Gate — Traffic Danger Zone")
                        .description("Extremely high traffic density on GT Road at LPU gate. Mix of highway vehicles and student pedestrians causes frequent accidents. High risk for women walking alone at night.")
                        .centerLat(31.2554).centerLng(75.7048)
                        .radiusMeters(280.0).riskLevel("HIGH").active(true)
                        .build(),

                RiskZone.builder()
                        .zoneId(2)
                        .name("Law Gate Market Area")
                        .description("Crowded evening market outside LPU. Pickpocketing, eve teasing, and bag snatching incidents reported. Women advised not to walk alone after 8 PM.")
                        .centerLat(31.2580).centerLng(75.7015)
                        .radiusMeters(320.0).riskLevel("HIGH").active(true)
                        .build(),

                RiskZone.builder()
                        .zoneId(3)
                        .name("LPU Back Gate — Isolated Night Road")
                        .description("Poorly lit service road behind LPU campus. Very isolated after 10 PM. Multiple harassment incidents reported. Avoid walking alone at night.")
                        .centerLat(31.2600).centerLng(75.7130)
                        .radiusMeters(350.0).riskLevel("HIGH").active(true)
                        .build(),

                // ── Haveli & Khajurla area ──
                RiskZone.builder()
                        .zoneId(4)
                        .name("Khajurla Village Road")
                        .description("Narrow village road from LPU toward Khajurla. No streetlights after sunset. Used by students as shortcut but highly unsafe at night. Isolated stretch with no emergency services nearby.")
                        .centerLat(31.2655).centerLng(75.6855)
                        .radiusMeters(600.0).riskLevel("HIGH").active(true)
                        .build(),

                RiskZone.builder()
                        .zoneId(5)
                        .name("Haveli Khajurla Crossroads")
                        .description("Remote intersection near Haveli Khajurla village. Multiple vehicle theft and robbery incidents reported after dark. Avoid this area after 9 PM.")
                        .centerLat(31.2630).centerLng(75.6810)
                        .radiusMeters(500.0).riskLevel("HIGH").active(true)
                        .build(),

                RiskZone.builder()
                        .zoneId(6)
                        .name("Kajrula Road — Unlit Stretch")
                        .description("Dark isolated road connecting LPU area to Kajrula. Known for bike theft and lone-traveler incidents at night. No CCTV coverage.")
                        .centerLat(31.2620).centerLng(75.6930)
                        .radiusMeters(700.0).riskLevel("MEDIUM").active(true)
                        .build(),

                // ── GT Road / NH44 ──
                RiskZone.builder()
                        .zoneId(7)
                        .name("GT Road (NH44) — LPU to Phagwara at Night")
                        .description("High-speed highway with poor lighting between LPU and Phagwara. Rash driving, overtaking, and pedestrian accidents frequent at night. Women should avoid this stretch alone after 9 PM.")
                        .centerLat(31.2411).centerLng(75.7350)
                        .radiusMeters(1600.0).riskLevel("HIGH").active(true)
                        .build(),

                RiskZone.builder()
                        .zoneId(8)
                        .name("Rurka Kalan Highway Stretch")
                        .description("Poorly lit section of NH44 near Rurka Kalan. Unmarked speed bumps and stray animals cause frequent accidents after 9 PM. Avoid walking on or near this road at night.")
                        .centerLat(31.2180).centerLng(75.7920)
                        .radiusMeters(1000.0).riskLevel("HIGH").active(true)
                        .build(),

                // ── Chaheru / Phagwara ──
                RiskZone.builder()
                        .zoneId(9)
                        .name("Chaheru Railway Crossing")
                        .description("Dimly lit railway crossing and surrounding area. Isolated after 10 PM. Harassment incidents near the crossing have been reported. Arrange transport instead of walking here at night.")
                        .centerLat(31.2461).centerLng(75.7235)
                        .radiusMeters(420.0).riskLevel("MEDIUM").active(true)
                        .build(),

                RiskZone.builder()
                        .zoneId(10)
                        .name("Phagwara Railway Station Area")
                        .description("Busy transit hub. Theft, scams targeting travelers, and overcrowding. Women traveling alone should stay in well-lit areas and use official transport.")
                        .centerLat(31.2223).centerLng(75.7678)
                        .radiusMeters(380.0).riskLevel("MEDIUM").active(true)
                        .build(),

                RiskZone.builder()
                        .zoneId(11)
                        .name("Phagwara Industrial Area — Night Zone")
                        .description("Industrial outskirts of Phagwara. Minimal foot traffic after 11 PM. Vehicle theft and robbery incidents reported. Women should not be in this area alone at night.")
                        .centerLat(31.2150).centerLng(75.7900)
                        .radiusMeters(750.0).riskLevel("HIGH").active(true)
                        .build(),

                // ── Jalandhar ──
                RiskZone.builder()
                        .zoneId(12)
                        .name("Jalandhar Bus Stand (SBS ISBT)")
                        .description("Major bus terminal perpetually crowded. Active pickpockets and luggage thieves especially during boarding. Extra vigilance required — high risk for solo female travelers.")
                        .centerLat(31.3145).centerLng(75.5945)
                        .radiusMeters(520.0).riskLevel("HIGH").active(true)
                        .build(),

                RiskZone.builder()
                        .zoneId(13)
                        .name("Rama Mandi Chowk, Jalandhar")
                        .description("One of the most chaotic intersections in Jalandhar. High accident rate, chain snatching incidents near the chowk. Be alert, especially on two-wheelers.")
                        .centerLat(31.2885).centerLng(75.6135)
                        .radiusMeters(460.0).riskLevel("HIGH").active(true)
                        .build(),

                RiskZone.builder()
                        .zoneId(14)
                        .name("Jyoti Chowk Market, Jalandhar")
                        .description("Dense central market. High footfall increases pickpocketing likelihood. Avoid carrying large cash or valuables. Women report frequent eve teasing in narrow lanes.")
                        .centerLat(31.3260).centerLng(75.5762)
                        .radiusMeters(620.0).riskLevel("MEDIUM").active(true)
                        .build(),

                RiskZone.builder()
                        .zoneId(15)
                        .name("Kapurthala Road — Isolated Stretch at Night")
                        .description("Poorly lit sections between Jalandhar and Kapurthala with very low traffic at night. Avoid traveling alone on this route after dark.")
                        .centerLat(31.3550).centerLng(75.4650)
                        .radiusMeters(2100.0).riskLevel("MEDIUM").active(true)
                        .build()
        ));
    }

    // ── Police departments (Punjab / LPU area) ─────────────────────────────
    private void seedPoliceDepartments() {
        policeDepartmentRepository.deleteAll();
        policeDepartmentRepository.saveAll(List.of(

                // Admin / Control Center — must stay
                PoliceDepartment.builder()
                        .id("ss-control-center-001")
                        .name("SafarSathi Control Center")
                        .email("admin@safarsathi.in")
                        .passwordHash(passwordEncoder.encode("admin123"))
                        .departmentCode("SS-CONTROL")
                        .latitude(31.2554).longitude(75.7048)
                        .city("Phagwara").district("Kapurthala").state("Punjab")
                        .contactNumber("+91-9876543210").isActive(true)
                        .build(),

                // Phagwara / LPU vicinity
                PoliceDepartment.builder()
                        .id(UUID.randomUUID().toString())
                        .name("Phagwara City Police Station")
                        .email("phagwara@police.punjab.gov.in")
                        .passwordHash(passwordEncoder.encode("admin123"))
                        .departmentCode("PS-PHAGWARA")
                        .latitude(31.2223).longitude(75.7678)
                        .city("Phagwara").district("Kapurthala").state("Punjab")
                        .contactNumber("01824-260033").isActive(true)
                        .build(),

                PoliceDepartment.builder()
                        .id(UUID.randomUUID().toString())
                        .name("Chaheru Police Chowki")
                        .email("chaheru@police.punjab.gov.in")
                        .passwordHash(passwordEncoder.encode("admin123"))
                        .departmentCode("PC-CHAHERU")
                        .latitude(31.2461).longitude(75.7235)
                        .city("Phagwara").district("Kapurthala").state("Punjab")
                        .contactNumber("112").isActive(true)
                        .build(),

                PoliceDepartment.builder()
                        .id(UUID.randomUUID().toString())
                        .name("Guru Nanak Industrial Area Police Post")
                        .email("gnia@police.punjab.gov.in")
                        .passwordHash(passwordEncoder.encode("admin123"))
                        .departmentCode("PP-GNIA")
                        .latitude(31.2450).longitude(75.7620)
                        .city("Phagwara").district("Kapurthala").state("Punjab")
                        .contactNumber("112").isActive(true)
                        .build(),

                PoliceDepartment.builder()
                        .id(UUID.randomUUID().toString())
                        .name("Alawalpur Police Post")
                        .email("alawalpur@police.punjab.gov.in")
                        .passwordHash(passwordEncoder.encode("admin123"))
                        .departmentCode("PP-ALAWALPUR")
                        .latitude(31.2800).longitude(75.7000)
                        .city("Phagwara").district("Kapurthala").state("Punjab")
                        .contactNumber("112").isActive(true)
                        .build(),

                // Jalandhar
                PoliceDepartment.builder()
                        .id(UUID.randomUUID().toString())
                        .name("Jalandhar Division 1 (Police Lines)")
                        .email("div1@police.punjab.gov.in")
                        .passwordHash(passwordEncoder.encode("admin123"))
                        .departmentCode("PS-JLD-DIV1")
                        .latitude(31.3260).longitude(75.5762)
                        .city("Jalandhar").district("Jalandhar").state("Punjab")
                        .contactNumber("0181-2222200").isActive(true)
                        .build(),

                PoliceDepartment.builder()
                        .id(UUID.randomUUID().toString())
                        .name("Rama Mandi Police Station")
                        .email("ramamandi@police.punjab.gov.in")
                        .passwordHash(passwordEncoder.encode("admin123"))
                        .departmentCode("PS-RAMA-MANDI")
                        .latitude(31.2885).longitude(75.6135)
                        .city("Jalandhar").district("Jalandhar").state("Punjab")
                        .contactNumber("0181-2660100").isActive(true)
                        .build(),

                PoliceDepartment.builder()
                        .id(UUID.randomUUID().toString())
                        .name("Focal Point Police Station, Jalandhar")
                        .email("focalpoint@police.punjab.gov.in")
                        .passwordHash(passwordEncoder.encode("admin123"))
                        .departmentCode("PS-FOCAL-POINT")
                        .latitude(31.2964).longitude(75.6205)
                        .city("Jalandhar").district("Jalandhar").state("Punjab")
                        .contactNumber("0181-2670100").isActive(true)
                        .build(),

                // Kapurthala
                PoliceDepartment.builder()
                        .id(UUID.randomUUID().toString())
                        .name("Kapurthala Sadar Police Station")
                        .email("kapurthala@police.punjab.gov.in")
                        .passwordHash(passwordEncoder.encode("admin123"))
                        .departmentCode("PS-KAPURTHALA")
                        .latitude(31.3812).longitude(75.3800)
                        .city("Kapurthala").district("Kapurthala").state("Punjab")
                        .contactNumber("01822-232100").isActive(true)
                        .build(),

                PoliceDepartment.builder()
                        .id(UUID.randomUUID().toString())
                        .name("Nakodar Police Station")
                        .email("nakodar@police.punjab.gov.in")
                        .passwordHash(passwordEncoder.encode("admin123"))
                        .departmentCode("PS-NAKODAR")
                        .latitude(31.1274).longitude(75.4746)
                        .city("Nakodar").district("Kapurthala").state("Punjab")
                        .contactNumber("01821-244100").isActive(true)
                        .build()
        ));
    }

    // ── Hospitals (Punjab / LPU area) ───────────────────────────────────────
    private void seedHospitals() {
        hospitalRepository.deleteAll();
        hospitalRepository.saveAll(List.of(

                Hospital.builder()
                        .hospitalId(1)
                        .name("LPU Campus Medical Centre")
                        .latitude(31.2565).longitude(75.7090)
                        .contact("01824-500600").type("hospital").emergency(true)
                        .city("Phagwara").district("Kapurthala").state("Punjab").isActive(true)
                        .build(),

                Hospital.builder()
                        .hospitalId(2)
                        .name("Civil Hospital Phagwara")
                        .latitude(31.2260).longitude(75.7600)
                        .contact("01824-260100").type("hospital").emergency(true)
                        .city("Phagwara").district("Kapurthala").state("Punjab").isActive(true)
                        .build(),

                Hospital.builder()
                        .hospitalId(3)
                        .name("Guru Nanak Hospital, Phagwara")
                        .latitude(31.2280).longitude(75.7635)
                        .contact("01824-261000").type("hospital").emergency(true)
                        .city("Phagwara").district("Kapurthala").state("Punjab").isActive(true)
                        .build(),

                Hospital.builder()
                        .hospitalId(4)
                        .name("Phagwara Nursing Home")
                        .latitude(31.2285).longitude(75.7645)
                        .contact("01824-261500").type("clinic").emergency(false)
                        .city("Phagwara").district("Kapurthala").state("Punjab").isActive(true)
                        .build(),

                Hospital.builder()
                        .hospitalId(5)
                        .name("Kapurthala Civil Hospital")
                        .latitude(31.3785).longitude(75.3835)
                        .contact("01822-232000").type("hospital").emergency(true)
                        .city("Kapurthala").district("Kapurthala").state("Punjab").isActive(true)
                        .build(),

                Hospital.builder()
                        .hospitalId(6)
                        .name("Jalandhar Civil Hospital")
                        .latitude(31.3200).longitude(75.5770)
                        .contact("0181-2280100").type("hospital").emergency(true)
                        .city("Jalandhar").district("Jalandhar").state("Punjab").isActive(true)
                        .build(),

                Hospital.builder()
                        .hospitalId(7)
                        .name("Hero DMC Heart Institute, Jalandhar")
                        .latitude(31.2960).longitude(75.6280)
                        .contact("0181-2409100").type("hospital").emergency(true)
                        .city("Jalandhar").district("Jalandhar").state("Punjab").isActive(true)
                        .build(),

                Hospital.builder()
                        .hospitalId(8)
                        .name("Nakodar Community Health Centre")
                        .latitude(31.1285).longitude(75.4760)
                        .contact("01821-244200").type("clinic").emergency(false)
                        .city("Nakodar").district("Kapurthala").state("Punjab").isActive(true)
                        .build()
        ));
    }

    private void initCounters() {
        upsertCounter("riskZoneId", 15);
        upsertCounter("alertId", 0);
        upsertCounter("notificationId", 0);
        upsertCounter("blockchainLogId", 0);
        upsertCounter("hospitalId", 8);
    }

    private void upsertCounter(String name, long seq) {
        mongoTemplate.upsert(
                Query.query(Criteria.where("_id").is(name)),
                Update.update("seq", seq),
                Counter.class
        );
    }
}
