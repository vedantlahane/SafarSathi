/**
 * src/import-osm-json.ts
 *
 * Reads the JSON file produced by seed-osm.ps1 and inserts the data into
 * the Supabase Postgres database via Drizzle ORM in optimized batches.
 *
 * Run after seed-osm.ps1:
 *   npx tsx src/import-osm-json.ts
 */

import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import { sql } from 'drizzle-orm';
import { db } from './shared/db/client.js';
import {
  hospitals, policeDepartments, riskZones, touristPOIs,
  type NewHospital, type NewPoliceDepartment, type NewRiskZone, type NewTouristPOI,
} from './shared/db/schema.js';

const hashPw = (pw: string) => bcrypt.hash(pw, 10);
const wkt    = (lat: number, lon: number) => `SRID=4326;POINT(${lon} ${lat})`;

// Helper to chunk array
function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

function getName(tags: Record<string, string>, fallback = 'Unknown'): string {
  return (tags['name:en'] || tags['name'] || fallback).slice(0, 200);
}

function cleanPhone(raw?: string): string | null {
  if (!raw) return null;
  const s = raw.replace(/[^\d+\-\s]/g, '').trim().slice(0, 30);
  return s || null;
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
  if (hc === 'clinic'   || am === 'clinic')   return 'clinic';
  return 'hospital';
}

function mapTier(tags: Record<string, string>): string | null {
  const name = getName(tags, '').toLowerCase();
  if (name.includes('medical college')) return 'Medical_College';
  if (name.includes('district hospital')) return 'DH';
  if (name.includes('chc')) return 'CHC';
  if (name.includes('phc')) return 'PHC';
  return null;
}

function isEmergency(tags: Record<string, string>) {
  return tags['opening_hours'] === '24/7' || tags['emergency'] === 'yes';
}

function mapPOIType(tags: Record<string, string>): string | null {
  const amenity  = tags['amenity']  || '';
  const tourism  = tags['tourism']  || '';
  const historic = tags['historic'] || '';
  const religion = tags['religion'] || '';
  if (amenity === 'fire_station') return 'fire_station';
  if (amenity === 'pharmacy')     return 'pharmacy';
  if (amenity === 'place_of_worship') {
    if (religion === 'sikh')    return 'gurudwara';
    if (religion === 'muslim')  return 'mosque';
    if (religion === 'christian') return 'church';
    return 'temple';
  }
  if (tourism === 'attraction')  return 'attraction';
  if (tourism === 'museum')      return 'museum';
  if (tourism === 'information') return 'tourist_info';
  if (historic === 'fort')       return 'fort';
  if (historic === 'monument' || historic === 'memorial') return 'monument';
  if (historic) return 'attraction';
  return null;
}

const LU_MAP: Record<string, { level: string; cat: string; radius: number; desc: string }> = {
  military:   { level: 'HIGH',   cat: 'political_unrest', radius: 1200, desc: 'Active military installation — stay on designated paths.' },
  industrial: { level: 'LOW',    cat: 'traffic',          radius: 800,  desc: 'Industrial zone with heavy vehicle traffic.' },
  quarry:     { level: 'MEDIUM', cat: 'other',            radius: 600,  desc: 'Active quarry. Risk of debris. Restricted access.' },
  landfill:   { level: 'LOW',    cat: 'other',            radius: 500,  desc: 'Waste disposal site — avoid unnecessary exposure.' },
};

async function main() {
  const jsonPath = path.resolve('data/punjab-osm.json');
  if (!fs.existsSync(jsonPath)) {
    console.error(`\n❌ JSON file not found: ${jsonPath}`);
    process.exit(1);
  }

  console.log(`\n📂 Reading: ${jsonPath}`);
  let dataStr = fs.readFileSync(jsonPath, 'utf-8');
  dataStr = dataStr.replace(/^\uFEFF/, '').trim();
  const raw = JSON.parse(dataStr);
  const { police = [], hospitals: hosp = [], pois = [], landuse = [] } = raw;
  console.log(`   Police: ${police.length}, Hospitals: ${hosp.length}, POIs: ${pois.length}, LandUse: ${landuse.length}\n`);

  const defaultPwHash = await hashPw('osm-readonly-2024');

  // ── 1. Police ─────────────────────────────────────────────────────────────
  console.log('🚔 Clearing old police stations…');
  await db.delete(policeDepartments).where(sql`department_code LIKE 'OSM-PS-%'`);
  
  const policeRecords: any[] = [];
  for (const node of police) {
    const tags = node.tags ?? {};
    if (!getName(tags, '')) continue;
    const { city, district } = extractLocation(tags);
    policeRecords.push({
      name: getName(tags, 'Police Station'),
      email: `osm.ps.${node.id}@yatrax-osm.local`,
      passwordHash: defaultPwHash,
      departmentCode: `OSM-PS-${node.id}`,
      latitude: node.lat, longitude: node.lon,
      geom: sql`ST_GeogFromText(${wkt(node.lat, node.lon)})`,
      city, district, state: 'Punjab',
      contactNumber: cleanPhone(tags['contact:phone'] || tags['phone']) ?? 'N/A',
      isActive: true, stationType: 'station',
      jurisdictionRadiusKm: 10, officerCount: 0,
    });
  }

  let insertedPolice = 0;
  for (const chunk of chunkArray(policeRecords, 50)) {
    await db.insert(policeDepartments).values(chunk).onConflictDoNothing();
    insertedPolice += chunk.length;
  }
  console.log(`   ✅ Inserted ${insertedPolice} police departments`);

  // ── 2. Hospitals ──────────────────────────────────────────────────────────
  console.log('\n🏥 Clearing old medical facilities…');
  await db.delete(hospitals).where(sql`id >= 1000 AND state = 'Punjab'`);

  const hospitalRecords: any[] = [];
  for (const node of hosp) {
    const tags = node.tags ?? {};
    if (!getName(tags, '')) continue;
    const { city, district } = extractLocation(tags);
    hospitalRecords.push({
      // Start IDs at 10000 to avoid conflicting with manual rows
      name: getName(tags, 'Medical Facility'),
      latitude: node.lat, longitude: node.lon,
      geom: sql`ST_GeogFromText(${wkt(node.lat, node.lon)})`,
      contact: cleanPhone(tags['contact:phone'] || tags['phone']) ?? 'N/A',
      type: mapHospitalType(tags),
      tier: mapTier(tags) ?? undefined,
      emergency: isEmergency(tags),
      city, district, state: 'Punjab',
      specialties: [], bedCapacity: 0, availableBeds: 0,
      ambulanceAvailable: false,
      operatingHours: { is24Hours: isEmergency(tags), open: '08:00', close: '20:00' },
      isActive: true,
    });
  }

  let insertedHospitals = 0;
  for (const chunk of chunkArray(hospitalRecords, 100)) {
    await db.insert(hospitals).values(chunk).onConflictDoNothing();
    insertedHospitals += chunk.length;
  }
  console.log(`   ✅ Inserted ${insertedHospitals} medical facilities`);

  // ── 3. Tourist POIs ───────────────────────────────────────────────────────
  console.log('\n🛕 Clearing old tourist POIs…');
  await db.delete(touristPOIs);

  const seenIds = new Set<number>();
  const poiRecords: any[] = [];
  for (const node of pois) {
    const tags = node.tags ?? {};
    if (seenIds.has(node.id)) continue;
    const name = getName(tags, '');
    if (!name) continue;
    const poiType = mapPOIType(tags);
    if (!poiType) continue;
    seenIds.add(node.id);
    const { city, district } = extractLocation(tags);
    poiRecords.push({
      osmId: node.id,
      name, type: poiType,
      latitude: node.lat, longitude: node.lon,
      geom: sql`ST_GeogFromText(${wkt(node.lat, node.lon)})`,
      city, district, state: 'Punjab',
      phone:        cleanPhone(tags['contact:phone'] || tags['phone']) ?? undefined,
      website:      tags['website'] || undefined,
      openingHours: tags['opening_hours'] || undefined,
      description:  tags['description'] || undefined,
      isActive: true,
    });
  }

  let insertedPOIs = 0;
  for (const chunk of chunkArray(poiRecords, 100)) {
    await db.insert(touristPOIs).values(chunk).onConflictDoNothing();
    insertedPOIs += chunk.length;
  }
  console.log(`   ✅ Inserted ${insertedPOIs} tourist POIs`);

  // ── 4. Risk zones ─────────────────────────────────────────────────────────
  console.log('\n⚠️ Clearing old risk zones…');
  await db.delete(riskZones).where(sql`source = 'osm-landuse'`);

  const seenGrid = new Set<string>();
  const zoneRecords: any[] = [];
  for (const el of landuse) {
    const geomList = el.geometry;
    if (!geomList || geomList.length < 3) continue; // Need at least 3 points for a polygon
    
    // Compute center
    const bounds = el.bounds || {
        minlat: Math.min(...geomList.map((p: any) => p.lat)),
        maxlat: Math.max(...geomList.map((p: any) => p.lat)),
        minlon: Math.min(...geomList.map((p: any) => p.lon)),
        maxlon: Math.max(...geomList.map((p: any) => p.lon)),
    };
    const centerLat = (bounds.minlat + bounds.maxlat) / 2;
    const centerLng = (bounds.minlon + bounds.maxlon) / 2;

    const lu = (el.tags?.landuse || '').toLowerCase();
    const cfg = LU_MAP[lu];
    if (!cfg) continue;
    const gridKey = `${Math.round(centerLat * 100)},${Math.round(centerLng * 100)}`;
    if (seenGrid.has(gridKey)) continue;
    seenGrid.add(gridKey);
    const tags = el.tags ?? {};

    // Ensure polygon is closed for PostGIS
    const coords = geomList.map((p: any) => [p.lat, p.lon]);
    if (coords[0][0] !== coords[coords.length - 1][0] || coords[0][1] !== coords[coords.length - 1][1]) {
        coords.push([coords[0][0], coords[0][1]]);
    }

    // WKT Polygon string: POLYGON((lon1 lat1, lon2 lat2, ...))
    const wktPolygon = `SRID=4326;POLYGON((${coords.map((c: any) => `${c[1]} ${c[0]}`).join(', ')}))`;

    zoneRecords.push({
      name: getName(tags, `${lu.charAt(0).toUpperCase() + lu.slice(1)} Area`),
      description: cfg.desc,
      shapeType: 'polygon',
      centerLat, centerLng,
      radiusMeters: cfg.radius,
      polygonCoordinates: coords,
      geom: sql`ST_GeogFromText(${wktPolygon})`,
      riskLevel: cfg.level, active: true,
      category: cfg.cat, source: 'osm-landuse',
    });
  }

  let insertedZones = 0;
  for (const chunk of chunkArray(zoneRecords, 100)) {
    await db.insert(riskZones).values(chunk).onConflictDoNothing();
    insertedZones += chunk.length;
  }
  console.log(`   ✅ Inserted ${insertedZones} land-use risk zones`);

  console.log('\n🎉 Bulk import complete!\n');
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Import failed:', err);
  process.exit(1);
});
