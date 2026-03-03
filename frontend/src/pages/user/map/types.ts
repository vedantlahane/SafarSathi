// src/pages/user/map/types.ts

export interface RiskZone {
  id: number | string;
  name: string;
  description: string | null;
  centerLat: number;
  centerLng: number;
  radiusMeters: number;
  riskLevel: string | null;
  category?: string | null;
  source?: string | null;
  expiresAt?: string | null;
  shapeType?: "circle" | "polygon";
  polygonCoordinates?: [number, number][];
}

export interface PoliceStation {
  id: string | number;
  position: [number, number];
  name: string;
  contact: string;
  available: boolean;
  responseTime?: string;
  distance?: number;
  eta?: string;
}

export interface Hospital {
  id: string | number;
  position: [number, number];
  name: string;
  contact: string;
  type: "hospital" | "clinic" | "pharmacy";
  emergency: boolean;
  distance?: number;
  eta?: string;
  tier?: string;
  specialties?: string[];
  bedCapacity?: number;
  availableBeds?: number;
  ambulanceAvailable?: boolean;
}

export interface Destination {
  name: string;
  lat: number;
  lng: number;
}

export interface SearchResult {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type?: string;
  address?: string;
}

export interface SafeRoute {
  id: string;
  coordinates: [number, number][];
  safetyScore: number;
  distanceMeters: number;
  durationSeconds: number;
  intersections: { critical: number; high: number; medium: number; low: number };
  policeNearby: number;
  isSafest: boolean;
  isFastest: boolean;
}

export interface RouteInfo {
  routes: SafeRoute[];
  safest: SafeRoute | null;
  fastest: SafeRoute | null;
  loading: boolean;
}

export type RiskFilter = "all" | "critical" | "high" | "medium" | "low";

export interface LayerVisibility {
  zones: boolean;
  police: boolean;
  hospitals: boolean;
  routes: boolean;
}

export interface MapViewState {
  isOnline: boolean;
  isDarkMode: boolean;
  isTracking: boolean;
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
  bearing: number;
}

export function getZoneColor(level: string | null): { stroke: string; fill: string } {
  switch (level?.toLowerCase()) {
    case "critical":
      return { stroke: "#7c3aed", fill: "#7c3aed" };
    case "high":
      return { stroke: "#dc2626", fill: "#dc2626" };
    case "medium":
      return { stroke: "#ea580c", fill: "#ea580c" };
    case "low":
      return { stroke: "#ca8a04", fill: "#ca8a04" };
    default:
      return { stroke: "#ea580c", fill: "#ea580c" };
  }
}

export function getZoneOpacity(level: string | null): number {
  switch (level?.toLowerCase()) {
    case "critical":
      return 0.22;
    case "high":
      return 0.18;
    case "medium":
      return 0.12;
    case "low":
      return 0.08;
    default:
      return 0.12;
  }
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

export function formatETA(
  meters: number,
  mode: "walk" | "drive" = "walk"
): string {
  const speedKmh = mode === "walk" ? 5 : 30;
  const minutes = Math.round((meters / 1000 / speedKmh) * 60);
  if (minutes < 1) return "< 1 min";
  if (minutes < 60) return `${minutes} min ${mode}`;
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return `${hours}h ${rem}m ${mode}`;
}

export function getZoneRiskWeight(level: string | null): number {
  switch (level?.toLowerCase()) {
    case "critical":
      return 50;
    case "high":
      return 30;
    case "medium":
      return 15;
    case "low":
      return 5;
    default:
      return 15;
  }
}

export type ZoneCategory = "flood" | "wildlife" | "crime" | "traffic" | "political_unrest" | "other";

export function getCategoryIcon(category: string | null | undefined): string {
  switch (category) {
    case "flood":
      return "🌊";
    case "wildlife":
      return "🐾";
    case "crime":
      return "⚠️";
    case "traffic":
      return "🚗";
    case "political_unrest":
      return "🚨";
    default:
      return "⛔";
  }
}

export function getCategoryLabel(category: string | null | undefined): string {
  switch (category) {
    case "flood":
      return "Flood Zone";
    case "wildlife":
      return "Wildlife Hazard";
    case "crime":
      return "High Crime Area";
    case "traffic":
      return "Traffic Hazard";
    case "political_unrest":
      return "Political Unrest";
    default:
      return "Restricted Area";
  }
}

export function getSafetyTips(
  riskLevel: string | null,
  category: string | null | undefined
): string[] {
  const tips: string[] = [];

  // Category-specific tips
  switch (category) {
    case "flood":
      tips.push(
        "Avoid low-lying areas and riverbanks",
        "Do not attempt to cross flooded roads",
        "Keep emergency supplies and waterproof bags ready",
        "Monitor local weather alerts continuously"
      );
      break;
    case "wildlife":
      tips.push(
        "Stay on designated trails and paths",
        "Make noise while walking to avoid surprising animals",
        "Carry a flashlight and first-aid kit",
        "Do not approach or feed wild animals",
        "Travel in groups, especially at dawn and dusk"
      );
      break;
    case "crime":
      tips.push(
        "Avoid traveling alone, especially after dark",
        "Keep valuables concealed and bags close",
        "Stay in well-lit, populated areas",
        "Share your live location with trusted contacts",
        "Be aware of your surroundings at all times"
      );
      break;
    case "traffic":
      tips.push(
        "Use designated pedestrian crossings",
        "Be extremely cautious on highways",
        "Wear reflective clothing if walking at night",
        "Avoid using earphones while walking on roads"
      );
      break;
    case "political_unrest":
      tips.push(
        "Avoid large gatherings and protests",
        "Stay updated on local news and advisories",
        "Keep your passport and documents accessible",
        "Register with your embassy if applicable",
        "Have an emergency exit plan ready"
      );
      break;
    default:
      tips.push(
        "Exercise heightened caution in this area",
        "Keep emergency contacts readily accessible",
        "Stay aware of your surroundings"
      );
  }

  // Level-specific urgency tips
  const level = riskLevel?.toLowerCase();
  if (level === "critical") {
    tips.unshift("🔴 AVOID THIS AREA if at all possible");
    tips.push("Immediately contact local authorities if you feel threatened");
  } else if (level === "high") {
    tips.unshift("Exercise extreme caution — consider alternate routes");
  }

  return tips;
}

/**
 * Check if a point (lat, lng) is inside a zone.
 * Handles both circle zones (distance check) and polygon zones (ray-casting).
 */
export function isPointInZone(lat: number, lng: number, zone: RiskZone): boolean {
  if (zone.shapeType === "polygon" && zone.polygonCoordinates?.length) {
    // Ray-casting point-in-polygon
    const coords = zone.polygonCoordinates;
    let inside = false;
    for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
      const [yi, xi] = coords[i];
      const [yj, xj] = coords[j];
      if (((yi > lat) !== (yj > lat)) && (lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    return inside;
  }
  // Circle: Haversine-ish distance via simple Euclidean on lat/lng (good enough for small distances)
  // We use the same L.latLng().distanceTo() that callers previously used, but here
  // we do a quick approximation to avoid importing L directly in types.
  const R = 6371000; // Earth radius in meters
  const dLat = (lat - zone.centerLat) * (Math.PI / 180);
  const dLng = (lng - zone.centerLng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(zone.centerLat * (Math.PI / 180)) *
      Math.cos(lat * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return dist <= zone.radiusMeters;
}