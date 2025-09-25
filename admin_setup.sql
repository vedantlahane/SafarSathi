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