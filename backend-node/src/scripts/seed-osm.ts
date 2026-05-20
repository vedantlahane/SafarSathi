/**
 * src/scripts/seed-osm.ts
 *
 * Fetches real Punjab, India data from OpenStreetMap Overpass API:
 *   ✅ Police stations
 *   ✅ Hospitals & clinics
 *   ✅ Pharmacies
 *   ✅ Fire stations
 *   ✅ Gurudwaras (Sikh temples)
 *   ✅ Temples, mosques, churches
 *   ✅ Tourist attractions, monuments, museums, forts
 *   ✅ Tourist info centers
 *   ✅ Auto-generated risk zones (military, industrial, flood-prone land use)
 *
 * Run manually:  npx tsx src/scripts/seed-osm.ts
 * Data: © OpenStreetMap contributors, ODbL.  https://www.openstreetmap.org/copyright
 */

import { randomUUID } from "crypto";
import mongoose from "mongoose";
import { hashPassword } from "../utils/hash.js";
import {
  HospitalModel,
  PoliceDepartmentModel,
  RiskZoneModel,
  TouristPOIModel,
  type ITouristPOI,
  type IHospital,
} from "../schemas/index.js";

// ── Punjab bounding box ──────────────────────────────────────────────────────
const BBOX = "29.5,73.8,32.6,76.9";
const OVERPASS = "https://overpass-api.de/api/interpreter";
const TIMEOUT  = 55_000; // ms

// ── Types ────────────────────────────────────────────────────────────────────
interface OSMNode {
  type: "node";
  id: number;
  lat: number;
  lon: number;
  tags: Record<string, string>;
}

interface OSMWay {
  type: "way";
  id: number;
  center: { lat: number; lon: number };
  tags: Record<string, string>;
}

type OSMElement = OSMNode | OSMWay;

interface OverpassResponse {
  elements: OSMElement[];
}

// ── Overpass fetch helper ────────────────────────────────────────────────────
async function overpassFetch(query: string): Promise<OSMElement[]> {
  const res = await fetch(OVERPASS, {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    `data=${encodeURIComponent(query)}`,
    signal:  AbortSignal.timeout(TIMEOUT),
  });
  if (!res.ok) throw new Error(`Overpass HTTP ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as OverpassResponse;
  return json.elements ?? [];
}

// ── Coordinate helpers ───────────────────────────────────────────────────────
function getCoords(el: OSMElement): { lat: number; lon: number } | null {
  if (el.type === "node") return { lat: el.lat, lon: el.lon };
  if (el.type === "way" && el.center) return el.center;
  return null;
}

// ── Tag helpers ──────────────────────────────────────────────────────────────
function cleanPhone(raw?: string): string {
  if (!raw) return "N/A";
  return raw.replace(/[^\d+\-\s]/g, "").trim().slice(0, 20) || "N/A";
}

function extractLocation(tags: Record<string, string>): { city: string; district: string } {
  const city =
    tags["addr:city"] || tags["addr:town"] || tags["addr:village"] ||
    tags["addr:district"] || "Punjab";
  const district = tags["addr:district"] || tags["addr:county"] || city;
  return { city, district };
}

function getName(tags: Record<string, string>, fallback = "Unknown"): string {
  return tags["name:en"] || tags["name"] || fallback;
}

// ── Hospital mappers ─────────────────────────────────────────────────────────
function mapHospitalType(tags: Record<string, string>): IHospital["type"] {
  const hc = tags["healthcare"] || "";
  const am = tags["amenity"]    || "";
  if (hc === "pharmacy" || am === "pharmacy") return "pharmacy";
  if (hc === "clinic" || hc === "centre" || hc === "health_centre" || am === "clinic") return "clinic";
  return "hospital";
}

function mapTier(tags: Record<string, string>): IHospital["tier"] {
  const name = getName(tags, "").toLowerCase();
  const desc = (tags["description"] || tags["healthcare:speciality"] || "").toLowerCase();
  const hc   = (tags["healthcare"] || "").toLowerCase();
  if (name.includes("medical college") || name.includes("gmch")) return "Medical_College";
  if (name.includes("district hospital") || (hc === "hospital" && !name.includes("chc") && !name.includes("phc"))) return "DH";
  if (name.includes("chc") || desc.includes("community health")) return "CHC";
  if (name.includes("phc") || desc.includes("primary health"))   return "PHC";
  return undefined;
}

function isEmergency(tags: Record<string, string>): boolean {
  return tags["opening_hours"] === "24/7" || tags["emergency"] === "yes";
}

// ── Police mappers ───────────────────────────────────────────────────────────
function mapStationType(tags: Record<string, string>) {
  const pt = (tags["police"] || "").toLowerCase();
  if (pt === "headquarters" || pt === "regional") return "district_hq";
  if (pt === "box" || pt === "beat_post" || pt === "checkpost") return "outpost";
  return "station";
}

// ── Tourist POI mapper ───────────────────────────────────────────────────────
function mapPOIType(tags: Record<string, string>): ITouristPOI["type"] | null {
  const amenity  = tags["amenity"]  || "";
  const tourism  = tags["tourism"]  || "";
  const historic = tags["historic"] || "";
  const religion = tags["religion"] || "";
  const worship  = tags["place_of_worship"] || "";

  if (amenity === "fire_station") return "fire_station";
  if (amenity === "pharmacy")     return "pharmacy";
  if (amenity === "place_of_worship" || worship) {
    if (religion === "sikh")    return "gurudwara";
    if (religion === "hindu" || religion === "jain") return "temple";
    if (religion === "muslim")  return "mosque";
    if (religion === "christian") return "church";
    return "temple"; // default worship
  }
  if (tourism === "hotel" || tourism === "guest_house") return "hotel";
  if (tourism === "information") return "tourist_info";
  if (tourism === "attraction")  return "attraction";
  if (tourism === "museum")      return "museum";
  if (historic === "fort" || historic === "castle") return "fort";
  if (historic === "monument" || historic === "memorial") return "monument";
  if (historic)                  return "attraction";
  return null;
}

// ── Risk zone auto-generation from land use ──────────────────────────────────
interface AutoRiskZone {
  name: string;
  lat: number;
  lon: number;
  radiusMeters: number;
  riskLevel: string;
  category: string;
  description: string;
}

function landUseToRiskZone(tags: Record<string, string>, lat: number, lon: number): AutoRiskZone | null {
  const lu  = (tags["landuse"]  || "").toLowerCase();
  const man = (tags["man_made"] || "").toLowerCase();
  const name = getName(tags, "");

  if (lu === "military") {
    return {
      name: name || "Military Zone",
      lat, lon,
      radiusMeters: 1200,
      riskLevel: "HIGH",
      category: "political_unrest",
      description: "Active military installation. Civilians must stay on designated paths.",
    };
  }
  if (lu === "industrial") {
    return {
      name: name || "Industrial Area",
      lat, lon,
      radiusMeters: 800,
      riskLevel: "LOW",
      category: "traffic",
      description: "Industrial zone with heavy vehicle traffic and restricted pedestrian access.",
    };
  }
  if (lu === "quarry") {
    return {
      name: name || "Quarry/Mining Zone",
      lat, lon,
      radiusMeters: 600,
      riskLevel: "MEDIUM",
      category: "other",
      description: "Active quarry. Risk of falling debris and restricted access.",
    };
  }
  if (lu === "landfill") {
    return {
      name: name || "Landfill / Waste Site",
      lat, lon,
      radiusMeters: 500,
      riskLevel: "LOW",
      category: "other",
      description: "Waste disposal site. Health hazard — avoid unnecessary exposure.",
    };
  }
  if (man === "wastewater_plant" || man === "water_works") {
    return {
      name: name || "Water Treatment Plant",
      lat, lon,
      radiusMeters: 400,
      riskLevel: "LOW",
      category: "other",
      description: "Restricted infrastructure. Trespassing prohibited.",
    };
  }
  return null;
}

// ── Main seed function ───────────────────────────────────────────────────────
export async function seedFromOSM(): Promise<{
  police: number; hospitals: number; pois: number; riskZones: number;
}> {
  console.log("\n🌐 Fetching Punjab data from OpenStreetMap Overpass API…\n");

  // Build all queries
  const policeQ = `[out:json][timeout:50];node["amenity"="police"](${BBOX});out body;`;

  const hospitalQ = `[out:json][timeout:50];(
    node["amenity"="hospital"](${BBOX});
    node["amenity"="clinic"](${BBOX});
    node["amenity"="pharmacy"](${BBOX});
    node["healthcare"~"hospital|clinic|centre|health_centre"](${BBOX});
  );out body;`;

  const fireQ = `[out:json][timeout:50];node["amenity"="fire_station"](${BBOX});out body;`;

  const worshipQ = `[out:json][timeout:50];(
    node["amenity"="place_of_worship"]["religion"="sikh"](${BBOX});
    node["amenity"="place_of_worship"]["religion"="hindu"](${BBOX});
    node["amenity"="place_of_worship"]["religion"="muslim"](${BBOX});
    node["amenity"="place_of_worship"]["religion"="christian"](${BBOX});
  );out body;`;

  const attractionQ = `[out:json][timeout:50];(
    node["tourism"="attraction"](${BBOX});
    node["tourism"="museum"](${BBOX});
    node["tourism"="information"](${BBOX});
    node["tourism"="hotel"](${BBOX});
    node["historic"="fort"](${BBOX});
    node["historic"="monument"](${BBOX});
    node["historic"="memorial"](${BBOX});
  );out body;`;

  const landUseQ = `[out:json][timeout:50];(
    way["landuse"="military"](${BBOX});
    way["landuse"="industrial"](${BBOX});
    way["landuse"="quarry"](${BBOX});
    way["landuse"="landfill"](${BBOX});
    way["man_made"="wastewater_plant"](${BBOX});
  );out center tags;`;

  // Fetch in parallel (chunked to avoid hammering Overpass)
  console.log("  📡 Fetching police stations…");
  const policeNodes = await overpassFetch(policeQ);

  console.log("  📡 Fetching hospitals & clinics…");
  const hospitalNodes = await overpassFetch(hospitalQ);

  console.log("  📡 Fetching fire stations…");
  const fireNodes = await overpassFetch(fireQ);

  console.log("  📡 Fetching places of worship…");
  const worshipNodes = await overpassFetch(worshipQ);

  console.log("  📡 Fetching tourist attractions…");
  const attractionNodes = await overpassFetch(attractionQ);

  console.log("  📡 Fetching land-use risk areas…");
  const landUseWays = await overpassFetch(landUseQ);

  // ── 1. Police stations ──────────────────────────────────────────────────
  const defaultPwHash = await hashPassword("osm-readonly-2024");
  const namedPolice = policeNodes.filter(
    (n): n is OSMNode => n.type === "node" && !!(n as OSMNode).tags?.name
  );

  await PoliceDepartmentModel.deleteMany({ departmentCode: { $regex: /^OSM-PS-/ } });

  const policeRecords = namedPolice.map((node) => {
    const { city, district } = extractLocation(node.tags);
    return {
      _id: randomUUID(),
      name: getName(node.tags, "Police Station"),
      email: `osm.ps.${node.id}@yatrax-osm.local`,
      passwordHash: defaultPwHash,
      departmentCode: `OSM-PS-${node.id}`,
      latitude: node.lat, longitude: node.lon,
      location: { type: "Point", coordinates: [node.lon, node.lat] },
      city, district, state: "Punjab",
      contactNumber: cleanPhone(node.tags["contact:phone"] || node.tags["phone"]),
      isActive: true,
      stationType: mapStationType(node.tags),
      jurisdictionRadiusKm: 10,
      officerCount: 0,
    };
  });

  let insertedPolice = 0;
  if (policeRecords.length > 0) {
    await PoliceDepartmentModel.insertMany(policeRecords, { ordered: false })
      .then((r) => { insertedPolice = r.length; })
      .catch((e) => { insertedPolice = e.result?.nInserted ?? 0; });
  }
  console.log(`  🚔 Police stations: ${insertedPolice}/${namedPolice.length}`);

  // ── 2. Hospitals / clinics / pharmacies ─────────────────────────────────
  const namedHospitals = hospitalNodes.filter(
    (n): n is OSMNode => n.type === "node" && !!(n.tags?.name || n.tags?.["name:en"])
  );

  await HospitalModel.deleteMany({ hospitalId: { $gte: 1000 } });

  const hospitalRecords = namedHospitals.map((node, idx) => ({
    hospitalId: 1000 + idx,
    name: getName(node.tags, `Hospital #${idx + 1}`),
    latitude: node.lat, longitude: node.lon,
    location: { type: "Point", coordinates: [node.lon, node.lat] },
    contact: cleanPhone(node.tags["contact:phone"] || node.tags["phone"]),
    type: mapHospitalType(node.tags),
    tier: mapTier(node.tags),
    emergency: isEmergency(node.tags),
    city: extractLocation(node.tags).city,
    district: extractLocation(node.tags).district,
    state: "Punjab",
    isActive: true,
    specialties: [],
    bedCapacity: 0, availableBeds: 0,
    ambulanceAvailable: false,
    operatingHours: {
      is24Hours: isEmergency(node.tags),
      open: "08:00", close: "20:00",
    },
  }));

  let insertedHospitals = 0;
  if (hospitalRecords.length > 0) {
    await HospitalModel.insertMany(hospitalRecords, { ordered: false })
      .then((r) => { insertedHospitals = r.length; })
      .catch((e) => { insertedHospitals = e.result?.nInserted ?? 0; });
  }
  console.log(`  🏥 Hospitals/clinics/pharmacies: ${insertedHospitals}/${namedHospitals.length}`);

  // ── 3. Tourist POIs (fire stations + worship + attractions) ─────────────
  const allPOINodes = [...fireNodes, ...worshipNodes, ...attractionNodes];
  const seenOsmIds  = new Set<number>();
  const poiRecords: Omit<ITouristPOI, "createdAt" | "updatedAt">[] = [];

  for (const el of allPOINodes) {
    if (el.type !== "node") continue;
    const node = el as OSMNode;
    if (seenOsmIds.has(node.id)) continue;
    const nameStr = getName(node.tags, "");
    if (!nameStr) continue;

    const poiType = mapPOIType(node.tags);
    if (!poiType) continue;

    seenOsmIds.add(node.id);
    const { city, district } = extractLocation(node.tags);

    poiRecords.push({
      osmId: node.id,
      name: nameStr,
      type: poiType,
      latitude: node.lat, longitude: node.lon,
      location: { type: "Point", coordinates: [node.lon, node.lat] },
      city, district, state: "Punjab",
      phone:        cleanPhone(node.tags["contact:phone"] || node.tags["phone"]) || undefined,
      website:      node.tags["website"] || node.tags["contact:website"] || undefined,
      openingHours: node.tags["opening_hours"] || undefined,
      description:  node.tags["description"] || node.tags["tourism"] || undefined,
      isActive: true,
    });
  }

  await TouristPOIModel.deleteMany({});

  let insertedPOIs = 0;
  if (poiRecords.length > 0) {
    await TouristPOIModel.insertMany(poiRecords, { ordered: false })
      .then((r) => { insertedPOIs = r.length; })
      .catch((e) => { insertedPOIs = e.result?.nInserted ?? 0; });
  }
  console.log(`  🛕 Tourist POIs (worship, attractions, fire stations): ${insertedPOIs}/${poiRecords.length}`);

  // ── 4. Auto-generate risk zones from land use ────────────────────────────
  await RiskZoneModel.deleteMany({ source: "osm-landuse" });

  const autoZones: AutoRiskZone[] = [];
  for (const el of landUseWays) {
    const coords = getCoords(el);
    if (!coords) continue;
    const zone = landUseToRiskZone(el.tags, coords.lat, coords.lon);
    if (zone) autoZones.push(zone);
  }

  // Deduplicate: skip zones whose center is within 300 m of an existing zone
  const deduped: AutoRiskZone[] = [];
  for (const z of autoZones) {
    const tooClose = deduped.some((existing) => {
      const dlat = (z.lat - existing.lat) * 111_000;
      const dlon = (z.lon - existing.lon) * 111_000 * Math.cos(z.lat * Math.PI / 180);
      return Math.sqrt(dlat * dlat + dlon * dlon) < 300;
    });
    if (!tooClose) deduped.push(z);
  }

  // Get next zone ID to avoid collision with manual zones
  const maxExisting = await RiskZoneModel.findOne({}).sort({ zoneId: -1 }).select("zoneId").lean();
  let nextId = (maxExisting?.zoneId ?? 0) + 1;

  const zoneDocuments = deduped.map((z) => ({
    zoneId: nextId++,
    name: z.name,
    description: z.description,
    centerLat: z.lat,
    centerLng: z.lon,
    radiusMeters: z.radiusMeters,
    riskLevel: z.riskLevel,
    active: true,
    category: z.category,
    source: "osm-landuse",
  }));

  let insertedZones = 0;
  if (zoneDocuments.length > 0) {
    await RiskZoneModel.insertMany(zoneDocuments, { ordered: false })
      .then((r) => { insertedZones = r.length; })
      .catch((e) => { insertedZones = e.result?.nInserted ?? 0; });
  }
  console.log(`  ⚠️  Auto-generated risk zones (military, industrial, etc.): ${insertedZones}/${deduped.length}`);

  return {
    police: insertedPolice,
    hospitals: insertedHospitals,
    pois: insertedPOIs,
    riskZones: insertedZones,
  };
}

// ── Standalone CLI ────────────────────────────────────────────────────────────
const isMain =
  process.argv[1] &&
  (process.argv[1].endsWith("seed-osm.ts") || process.argv[1].endsWith("seed-osm.js"));

if (isMain) {
  const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/YatraX";
  console.log(`\n🔗 Connecting to MongoDB: ${MONGO_URI}`);
  mongoose
    .connect(MONGO_URI)
    .then(async () => {
      const result = await seedFromOSM();
      console.log("\n✅ OSM seed complete:", result);
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Seed failed:", err);
      process.exit(1);
    });
}
