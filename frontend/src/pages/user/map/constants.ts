// src/pages/user/map/constants.ts

export const MAP_DEFAULTS = {
  center: [26.1445, 91.7362] as [number, number],
  zoom: 13,
  minZoom: 8,
  maxZoom: 18,
} as const;

export const TILE_URLS = {
  light: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
} as const;

export const TILE_ATTRIBUTIONS = {
  light:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  dark: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
} as const;

export const SEARCH_DEBOUNCE_MS = 400;

export const LOCATION_POST_INTERVAL_MS = 15_000;

export const SAFE_ROUTE_WEIGHTS = {
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