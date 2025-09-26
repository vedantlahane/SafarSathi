-- Auto-loaded seed data for admin / police departments
-- Provides baseline credentials for SafarSathi control center and nearby stations

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
    '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
    'SS-CONTROL',
    26.1445,
    91.7362,
    'Guwahati',
    'Kamrup Metropolitan',
    'Assam',
    '+91-9876543210',
    true
) ON DUPLICATE KEY UPDATE
    password_hash = VALUES(password_hash),
    is_active = VALUES(is_active);

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
    '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
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
    '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
    'PS-PALTAN',
    26.1158,
    91.7086,
    'Guwahati',
    'Kamrup Metropolitan',
    'Assam',
    '+91-361-2234568',
    true
) ON DUPLICATE KEY UPDATE
    password_hash = VALUES(password_hash),
    is_active = VALUES(is_active);
