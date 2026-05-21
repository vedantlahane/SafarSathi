// src/pages/user/map/constants.ts

export const MAP_DEFAULTS = {
  center: [31.2554, 75.7048] as [number, number], // LPU, Phagwara, Punjab
  zoom: 14.5, // Zoomed in slightly more for better 3D building visibility
  pitch: 65, // Tilt camera for 3D view
  bearing: -17, // Slight rotation
  minZoom: 5, // Allow zooming out much further
  maxZoom: 18,
  // Bounding box for Punjab (Southwest [Lng, Lat], Northeast [Lng, Lat])
  maxBounds: [
    [73.5, 29.3], // Southwest coordinates
    [77.0, 32.5], // Northeast coordinates
  ] as [[number, number], [number, number]],
} as const;

export const TILE_URLS = {
  light: "mapbox://styles/mapbox/light-v11",
  dark: "mapbox://styles/mapbox/dark-v11",
} as const;

export const TILE_ATTRIBUTIONS = {
  light:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  dark: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
} as const;

export const SEARCH_DEBOUNCE_MS = 400;

export const LOCATION_POST_INTERVAL_MS = 15_000;

export const SAFE_ROUTE_WEIGHTS = {
  criticalRiskPenalty: 50,
  highRiskPenalty: 30,
  mediumRiskPenalty: 15,
  lowRiskPenalty: 5,
  policeBonus: 10,
  baseScore: 100,
} as const;

export const WALKING_SPEED_MS = 1.39; // 5 km/h in m/s
export const DRIVING_SPEED_MS = 8.33; // 30 km/h in m/s

export const ROUTE_INTERPOLATION_STEPS = 30;
export const POLICE_PROXIMITY_RADIUS_M = 500;