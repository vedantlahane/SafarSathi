-- STEP 1: Create tourist_pois table
CREATE TABLE IF NOT EXISTS tourist_pois (
  id           BIGSERIAL PRIMARY KEY,
  osm_id       BIGINT UNIQUE,
  name         TEXT NOT NULL,
  type         TEXT NOT NULL,
  latitude     DOUBLE PRECISION NOT NULL,
  longitude    DOUBLE PRECISION NOT NULL,
  geom         geography(Geometry, 4326) NOT NULL,
  city         TEXT NOT NULL,
  district     TEXT NOT NULL DEFAULT 'Punjab',
  state        TEXT NOT NULL DEFAULT 'Punjab',
  phone        TEXT,
  website      TEXT,
  opening_hours TEXT,
  description  TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS poi_geom_idx   ON tourist_pois USING GIST (geom);
CREATE INDEX IF NOT EXISTS poi_type_idx   ON tourist_pois (type);
CREATE INDEX IF NOT EXISTS poi_osm_id_idx ON tourist_pois (osm_id);
CREATE INDEX IF NOT EXISTS poi_active_idx ON tourist_pois (is_active);

-- STEP 2: Enable RLS on all tables (excluding system spatial_ref_sys)
ALTER TABLE tourists              ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_zones            ENABLE ROW LEVEL SECURITY;
ALTER TABLE police_departments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals             ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts                ENABLE ROW LEVEL SECURITY;
ALTER TABLE tourist_location_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications         ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_advisories     ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs            ENABLE ROW LEVEL SECURITY;
ALTER TABLE blockchain_logs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE tourist_pois          ENABLE ROW LEVEL SECURITY;
ALTER TABLE __drizzle_migrations  ENABLE ROW LEVEL SECURITY;

-- STEP 3: Policies (deny sensitive, allow public map data)
CREATE POLICY "deny_all_tourists"        ON tourists              FOR ALL TO anon, authenticated USING (false);
CREATE POLICY "deny_all_alerts"          ON alerts                FOR ALL TO anon, authenticated USING (false);
CREATE POLICY "deny_all_location_logs"   ON tourist_location_logs FOR ALL TO anon, authenticated USING (false);
CREATE POLICY "deny_all_notifications"   ON notifications         FOR ALL TO anon, authenticated USING (false);
CREATE POLICY "deny_all_audit_logs"      ON audit_logs            FOR ALL TO anon, authenticated USING (false);
CREATE POLICY "deny_all_blockchain_logs" ON blockchain_logs       FOR ALL TO anon, authenticated USING (false);
CREATE POLICY "deny_all_migrations"      ON __drizzle_migrations  FOR ALL TO anon, authenticated USING (false);
CREATE POLICY "public_read_police"       ON police_departments    FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "public_read_hospitals"    ON hospitals             FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "public_read_risk_zones"   ON risk_zones            FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "public_read_advisories"   ON travel_advisories     FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "public_read_tourist_pois" ON tourist_pois          FOR SELECT TO anon, authenticated USING (is_active = true);
