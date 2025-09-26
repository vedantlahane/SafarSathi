-- Sample admin user for SafarSathi system
-- This creates a police department admin user with credentials:
-- Email: admin@safarsathi.in
-- Password: admin123

INSERT INTO police_departments (
    id,
    name, 
    email, 
    password_hash, 
    department_code, 
    latitude, 
    longitude, 
    city, 
    district, 
    state, 
    contact_number, 
    is_active
) VALUES (
    UNHEX(REPLACE(UUID(), '-', '')),
    'SafarSathi Control Center',
    'admin@safarsathi.in',
    '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', -- SHA-256 hash of 'admin123'
    'SS-CONTROL',
    26.1445,
    91.7362,
    'Guwahati',
    'Kamrup Metropolitan',
    'Assam',
    '+91-9876543210',
    true
) ON DUPLICATE KEY UPDATE 
    password_hash = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9';

-- Sample tourist record for development logins
-- Credentials: Email tourist@safarsathi.in / Password password123
INSERT INTO tourists (
    id,
    name,
    email,
    phone,
    passport_number,
    date_of_birth,
    address,
    gender,
    nationality,
    emergency_contact,
    password_hash,
    id_hash,
    id_expiry,
    current_lat,
    current_lng,
    last_seen
) VALUES (
    UNHEX(REPLACE('ca4b21f2-ce17-49ef-a829-57d063d20163', '-', '')),
    'Aarav Sharma',
    'tourist@safarsathi.in',
    '+91-9876543211',
    'IND1234567',
    '1993-04-12',
    'Pan Bazaar, Guwahati, Assam, India',
    'Male',
    'Indian',
    '{"name":"Riya Sharma","relationship":"Sibling","phone":"+91-9876543210"}',
    'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
    'aa0be181c2721b6f22258da241b74d87413eef6c5ec7fd68d7b50beb14b5af18',
    '2026-09-26 00:00:00',
    26.2006,
    92.9376,
    '2025-09-26 05:30:00'
) ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    phone = VALUES(phone),
    emergency_contact = VALUES(emergency_contact),
    password_hash = VALUES(password_hash),
    current_lat = VALUES(current_lat),
    current_lng = VALUES(current_lng),
    last_seen = VALUES(last_seen);

-- Additional sample police departments
INSERT INTO police_departments (
    id,
    name, 
    email, 
    password_hash, 
    department_code, 
    latitude, 
    longitude, 
    city, 
    district, 
    state, 
    contact_number, 
    is_active
) VALUES 
(
    UNHEX(REPLACE(UUID(), '-', '')),
    'Dispur Police Station',
    'dispur@police.assam.gov.in',
    '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', -- password: admin123
    'PS-DISPUR',
    26.1433,
    91.7898,
    'Guwahati',
    'Kamrup Metropolitan',
    'Assam',
    '+91-361-2234567',
    true
),
(
    UNHEX(REPLACE(UUID(), '-', '')),
    'Paltan Bazaar Police Station',
    'paltan@police.assam.gov.in',
    '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', -- password: admin123
    'PS-PALTAN',
    26.1158,
    91.7086,
    'Guwahati',
    'Kamrup Metropolitan',
    'Assam',
    '+91-361-2234568',
    true
) ON DUPLICATE KEY UPDATE 
    password_hash = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9';