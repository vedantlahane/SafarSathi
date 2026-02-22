// src/pages/user/map/types.ts

export interface RiskZone {
  id: number | string;
  name: string;
  description: string | null;
  centerLat: number;
  centerLng: number;
  radiusMeters: number;
  riskLevel: string | null;
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
  intersections: { high: number; medium: number; low: number };
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

export type RiskFilter = "all" | "high" | "medium" | "low";

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