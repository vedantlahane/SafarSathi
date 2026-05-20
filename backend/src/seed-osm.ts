/**
 * src/seed-osm.ts
 *
 * Fetches real Punjab, India data from OpenStreetMap Overpass API and
 * inserts it into Supabase Postgres via Drizzle ORM.
 *
 * Seeded data:
 *   ✅ Police stations
 *   ✅ Hospitals, clinics, pharmacies
 *   ✅ Fire stations
 *   ✅ Gurudwaras, temples, mosques, churches
 *   ✅ Tourist attractions, monuments, museums, forts
 *   ✅ Auto-generated risk zones (military, industrial, quarry land use)
 *
 * Run:  npx tsx src/seed-osm.ts
 * Data: © OpenStreetMap contributors, ODbL.
 */

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { sql } from 'drizzle-orm';
import { db } from './shared/db/client.js';
import {
  hospitals, policeDepartments, riskZones, touristPOIs,
  type NewHospital, type NewPoliceDepartment, type NewRiskZone, type NewTouristPOI,
} from './shared/db/schema.js';

const hashPassword = (pw: string) => bcrypt.hash(pw, 10);


// ── Punjab bounding box (south, west, north, east) ──────────────────────────
const BBOX = '29.5,73.8,32.6,76.9';
const OVERPASS_ENDPOINTS = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

// ── Types ────────────────────────────────────────────────────────────────────
interface OSMNode {
  type: 'node';
  id: number;
  lat: number;
  lon: number;
  tags: Record<string, string>;
}
interface OSMWay {
  type: 'way';
  id: number;
  center?: { lat: number; lon: number };
  tags: Record<string, string>;
}
type OSMElement = OSMNode | OSMWay;

// ── Overpass fetch ───────────────────────────────────────────────────────────
async function overpassFetch(query: string): Promise<OSMElement[]> {
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      console.log(`  ↗ Querying ${endpoint.replace('https://', '').split('/')[0]}…`);
      const params = new URLSearchParams({ data: query });
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'User-Agent': 'YatraX-OSM-Seeder/1.0 (yatrax@example.com)',
        },
        body: params.toString(),
        signal: AbortSignal.timeout(55_000),
      });
      if (!res.ok) {
        console.warn(`    ⚠ ${res.status} from ${endpoint} — trying next`);
        continue;
      }
      const json = await res.json() as { elements: OSMElement[] };
      return json.elements ?? [];
    } catch (err) {
      console.warn(`    ⚠ Error from endpoint: ${(err as Error).message?.slice(0, 80)} — trying next`);
    }
  }
  throw new Error('All Overpass endpoints failed');
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const wkt = (lat: number, lon: number) => `SRID=4326;POINT(${lon} ${lat})`;

function getName(tags: Record<string, string>, fallback = 'Unknown') {
  return (tags['name:en'] || tags['name'] || fallback).slice(0, 200);
}

function cleanPhone(raw?: string): string | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[^\d+\-\s]/g, '').trim().slice(0, 30);
  return cleaned || null;
}

function extractLocation(tags: Record<string, string>) {
  const city = (
    tags['addr:city'] || tags['addr:town'] || tags['addr:village'] ||
    tags['addr:district'] || 'Punjab'
  ).slice(0, 100);
  const district = (tags['addr:district'] || tags['addr:county'] || city).slice(0, 100);
  return { city, district };
}

function mapHospitalType(tags: Record<string, string>): string {
  const hc = tags['healthcare'] || '';
  const am = tags['amenity'] || '';
  if (hc === 'pharmacy' || am === 'pharmacy') return 'pharmacy';
  if (hc === 'clinic' || hc === 'centre' || hc === 'health_centre' || am === 'clinic') return 'clinic';
  return 'hospital';
}

function mapTier(tags: Record<string, string>): string | null {
  const name = getName(tags, '').toLowerCase();
  const desc = (tags['description'] || '').toLowerCase();
  if (name.includes('medical college')) return 'Medical_College';
  if (name.includes('district hospital')) return 'DH';
  if (name.includes('chc') || desc.includes('community health')) return 'CHC';
  if (name.includes('phc') || desc.includes('primary health')) return 'PHC';
  return null;
}

function isEmergency(tags: Record<string, string>): boolean {
  return tags['opening_hours'] === '24/7' || tags['emergency'] === 'yes';
}

function mapPOIType(tags: Record<string, string>): string | null {
  const amenity  = tags['amenity']  || '';
  const tourism  = tags['tourism']  || '';
  const historic = tags['historic'] || '';
  const religion = tags['religion'] || '';

  if (amenity === 'fire_station')        return 'fire_station';
  if (amenity === 'pharmacy')            return 'pharmacy';
  if (amenity === 'place_of_worship') {
    if (religion === 'sikh')             return 'gurudwara';
    if (religion === 'hindu' || religion === 'jain') return 'temple';
    if (religion === 'muslim')           return 'mosque';
    if (religion === 'christian')        return 'church';
    return 'temple';
  }
  if (tourism === 'hotel' || tourism === 'guest_house') return 'hotel';
  if (tourism === 'information')         return 'tourist_info';
  if (tourism === 'attraction')          return 'attraction';
  if (tourism === 'museum')              return 'museum';
  if (historic === 'fort' || historic === 'castle') return 'fort';
  if (historic === 'monument' || historic === 'memorial') return 'monument';
  if (historic)                          return 'attraction';
  return null;
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🌐 OSM Punjab Seed — Supabase Postgres\n');

  const defaultPwHash = await hashPassword('osm-readonly-2024');

  // ── 1. Police stations ──────────────────────────────────────────────────
  console.log('🚔 Fetching police stations…');
  const policeNodes = await overpassFetch(
    `[out:json][timeout:50];node["amenity"="police"](${BBOX});out body;`
  );
  const namedPolice = (policeNodes as OSMNode[]).filter(n => n.type === 'node' && n.tags?.name);
  console.log(`   ${namedPolice.length} named police stations found`);

  // Delete OSM-sourced police records and re-insert
  await db.delete(policeDepartments).where(
    sql`department_code LIKE 'OSM-PS-%'`
  );

  let insertedPolice = 0;
  for (const node of namedPolice as OSMNode[]) {
    const { city, district } = extractLocation(node.tags);
    try {
      await db.insert(policeDepartments).values({
        name: getName(node.tags, 'Police Station'),
        email: `osm.ps.${node.id}@yatrax-osm.local`,
        passwordHash: defaultPwHash,
        departmentCode: `OSM-PS-${node.id}`,
        latitude: node.lat,
        longitude: node.lon,
        geom: sql`ST_GeogFromText(${wkt(node.lat, node.lon)})` as any,
        city, district, state: 'Punjab',
        contactNumber: cleanPhone(node.tags['contact:phone'] || node.tags['phone']) ?? 'N/A',
        isActive: true,
        stationType: 'station',
        jurisdictionRadiusKm: 10,
        officerCount: 0,
      } satisfies Omit<NewPoliceDepartment, 'id' | 'createdAt' | 'updatedAt'>).onConflictDoNothing();
      insertedPolice++;
    } catch { /* skip duplicates */ }
  }
  console.log(`   ✅ Inserted ${insertedPolice} police stations`);

  // ── 2. Hospitals / clinics / pharmacies ─────────────────────────────────
  console.log('\n🏥 Fetching hospitals, clinics, pharmacies…');
  const hospitalNodes = await overpassFetch(`[out:json][timeout:50];(
    node["amenity"="hospital"](${BBOX});
    node["amenity"="clinic"](${BBOX});
    node["amenity"="pharmacy"](${BBOX});
    node["healthcare"~"hospital|clinic|centre|health_centre"](${BBOX});
  );out body;`);
  const namedHospitals = (hospitalNodes as OSMNode[]).filter(
    n => n.type === 'node' && (n.tags?.name || n.tags?.['name:en'])
  );
  console.log(`   ${namedHospitals.length} named medical facilities found`);

  // Delete OSM-sourced hospitals (id >= 1000 was our convention)
  await db.delete(hospitals).where(sql`id >= 1000`);

  let insertedHospitals = 0;
  for (const node of namedHospitals as OSMNode[]) {
    const { city, district } = extractLocation(node.tags);
    const tier = mapTier(node.tags);
    try {
      await db.insert(hospitals).values({
        name: getName(node.tags, 'Medical Facility'),
        latitude: node.lat,
        longitude: node.lon,
        geom: sql`ST_GeogFromText(${wkt(node.lat, node.lon)})` as any,
        contact: cleanPhone(node.tags['contact:phone'] || node.tags['phone']) ?? 'N/A',
        type: mapHospitalType(node.tags),
        tier: tier ?? undefined,
        emergency: isEmergency(node.tags),
        city, district, state: 'Punjab',
        specialties: [],
        bedCapacity: 0, availableBeds: 0,
        ambulanceAvailable: false,
        operatingHours: { is24Hours: isEmergency(node.tags), open: '08:00', close: '20:00' },
        isActive: true,
      } satisfies Omit<NewHospital, 'id' | 'createdAt' | 'updatedAt'>).onConflictDoNothing();
      insertedHospitals++;
    } catch { /* skip */ }
  }
  console.log(`   ✅ Inserted ${insertedHospitals} medical facilities`);

  // ── 3. Tourist POIs ─────────────────────────────────────────────────────
  console.log('\n🛕 Fetching tourist POIs (worship, attractions, fire stations)…');
  const [fireNodes, worshipNodes, attractionNodes] = await Promise.all([
    overpassFetch(`[out:json][timeout:50];node["amenity"="fire_station"](${BBOX});out body;`),
    overpassFetch(`[out:json][timeout:50];(
      node["amenity"="place_of_worship"]["religion"="sikh"](${BBOX});
      node["amenity"="place_of_worship"]["religion"="hindu"](${BBOX});
      node["amenity"="place_of_worship"]["religion"="muslim"](${BBOX});
      node["amenity"="place_of_worship"]["religion"="christian"](${BBOX});
    );out body;`),
    overpassFetch(`[out:json][timeout:50];(
      node["tourism"="attraction"](${BBOX});
      node["tourism"="museum"](${BBOX});
      node["tourism"="information"](${BBOX});
      node["historic"="fort"](${BBOX});
      node["historic"="monument"](${BBOX});
      node["historic"="memorial"](${BBOX});
    );out body;`),
  ]);

  // Deduplicate by OSM id, require name
  const seenIds = new Set<number>();
  const allPOINodes = [...fireNodes, ...worshipNodes, ...attractionNodes] as OSMNode[];
  const validPOIs = allPOINodes.filter(n => {
    if (n.type !== 'node') return false;
    if (seenIds.has(n.id)) return false;
    if (!getName(n.tags, '')) return false;
    const t = mapPOIType(n.tags);
    if (!t) return false;
    seenIds.add(n.id);
    return true;
  });
  console.log(`   ${validPOIs.length} unique named POIs found`);

  // Clear and re-insert
  await db.delete(touristPOIs);

  let insertedPOIs = 0;
  for (const node of validPOIs) {
    const { city, district } = extractLocation(node.tags);
    const poiType = mapPOIType(node.tags)!;
    try {
      await db.insert(touristPOIs).values({
        osmId: node.id,
        name: getName(node.tags, 'Point of Interest'),
        type: poiType,
        latitude: node.lat,
        longitude: node.lon,
        geom: sql`ST_GeogFromText(${wkt(node.lat, node.lon)})` as any,
        city, district, state: 'Punjab',
        phone:        cleanPhone(node.tags['contact:phone'] || node.tags['phone']) ?? undefined,
        website:      node.tags['website'] || node.tags['contact:website'] || undefined,
        openingHours: node.tags['opening_hours'] || undefined,
        description:  node.tags['description'] || undefined,
        isActive: true,
      } satisfies Omit<NewTouristPOI, 'id' | 'createdAt' | 'updatedAt'>).onConflictDoNothing();
      insertedPOIs++;
    } catch { /* skip */ }
  }
  console.log(`   ✅ Inserted ${insertedPOIs} tourist POIs`);

  // ── 4. Auto-generate risk zones from OSM land use ────────────────────────
  console.log('\n⚠️  Fetching land-use risk areas (military, industrial, quarry)…');
  const landUseWays = await overpassFetch(`[out:json][timeout:50];(
    way["landuse"="military"](${BBOX});
    way["landuse"="industrial"](${BBOX});
    way["landuse"="quarry"](${BBOX});
    way["landuse"="landfill"](${BBOX});
  );out center tags;`);

  const LU_MAP: Record<string, { level: string; cat: string; radius: number; desc: string }> = {
    military:   { level: 'HIGH',   cat: 'political_unrest', radius: 1200, desc: 'Active military installation. Civilians must stay on designated paths.' },
    industrial: { level: 'LOW',    cat: 'traffic',          radius: 800,  desc: 'Industrial zone with heavy vehicle traffic and restricted pedestrian access.' },
    quarry:     { level: 'MEDIUM', cat: 'other',            radius: 600,  desc: 'Active quarry site. Risk of debris. Restricted access.' },
    landfill:   { level: 'LOW',    cat: 'other',            radius: 500,  desc: 'Waste disposal site. Health hazard — avoid unnecessary exposure.' },
  };

  // Delete previously OSM-sourced risk zones
  await db.delete(riskZones).where(sql`source = 'osm-landuse'`);

  let insertedZones = 0;
  const seenZoneCoords = new Set<string>();

  for (const el of landUseWays as OSMWay[]) {
    const center = el.center;
    if (!center) continue;
    const lu = el.tags?.['landuse'] || '';
    const cfg = LU_MAP[lu];
    if (!cfg) continue;

    // Deduplicate within 300 m grid
    const gridKey = `${Math.round(center.lat * 100)},${Math.round(center.lon * 100)}`;
    if (seenZoneCoords.has(gridKey)) continue;
    seenZoneCoords.add(gridKey);

    try {
      await db.insert(riskZones).values({
        name: getName(el.tags, `${lu.charAt(0).toUpperCase() + lu.slice(1)} Area`),
        description: cfg.desc,
        shapeType: 'circle',
        centerLat: center.lat,
        centerLng: center.lon,
        radiusMeters: cfg.radius,
        geom: sql`ST_GeogFromText(${wkt(center.lat, center.lon)})` as any,
        riskLevel: cfg.level,
        active: true,
        category: cfg.cat,
        source: 'osm-landuse',
      } satisfies Omit<NewRiskZone, 'id' | 'createdAt' | 'updatedAt' | 'polygonCoordinates' | 'expiresAt'>);
      insertedZones++;
    } catch { /* skip */ }
  }
  console.log(`   ✅ Inserted ${insertedZones} auto-generated risk zones`);

  console.log('\n🎉 OSM seed complete!\n');
  console.log(`  🚔 Police stations : ${insertedPolice}`);
  console.log(`  🏥 Medical facilities: ${insertedHospitals}`);
  console.log(`  🛕 Tourist POIs    : ${insertedPOIs}`);
  console.log(`  ⚠️  Risk zones      : ${insertedZones}`);
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
