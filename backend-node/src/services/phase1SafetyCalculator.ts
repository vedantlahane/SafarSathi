/**
 * Phase 1 Safety Calculator
 *
 * Rule-based weighted scoring using 15 factors that are available today.
 * Higher output score = safer (0–100). Converts to danger score (0–1) at API layer.
 *
 * See problem statement: "ML Model Architecture — Phase 1: Rule-Based Score"
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Phase1Input {
  // Time
  currentHour: number;
  dayOfWeek: number;        // 0=Sun, 6=Sat
  month: number;            // 1-indexed
  minutesToSunset: number;

  // Location context
  nearbyPlaceCount: number;
  safetyPlaceCount: number; // police, hospital, fire nearby
  riskyPlaceCount: number;  // bars, clubs (relevant at night)
  openBusinessCount: number;

  // Infrastructure (drive-time minutes to nearest facility)
  policeETASeconds: number;
  hospitalETASeconds: number;

  // Backend context
  inRiskZone: boolean;
  riskZoneLevel: "HIGH" | "MEDIUM" | "LOW" | "CRITICAL" | null;
  activeAlertsNearby: number;
  historicalIncidents30d: number;

  // Device (passed from client or defaulted)
  networkType: "wifi" | "4g" | "3g" | "2g" | "none";

  // Environment
  weatherSeverity: number; // 0–100 (0 = clear, 100 = severe)
  airQualityIndex: number; // 0–500
}

export interface Phase1Factor {
  id: string;
  label: string;
  score: number;            // 0–100
  weight: number;           // 0–1
  /** "improving" / "declining" / "stable" – maps to "up" / "down" / "stable" on FE */
  trend: "improving" | "declining" | "stable";
  detail: string;
}

export interface Phase1Result {
  overall: number;          // 0–100 (higher = safer)
  status: "safe" | "caution" | "danger";
  factors: Phase1Factor[];
  cappedBy: string | null;
  recommendation: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

// ─── Main Calculator ──────────────────────────────────────────────────────────

export function calculatePhase1Score(input: Phase1Input): Phase1Result {
  const factors: Phase1Factor[] = [];
  const h = input.currentHour;

  // ─── 1. Time of Day (10%) ──────────────────────────────────────────
  let timeScore: number;
  if (h >= 8 && h < 18)       timeScore = 95;
  else if (h >= 18 && h < 20) timeScore = 75;
  else if (h >= 20 && h < 22) timeScore = 50;
  else if (h >= 22 || h < 2)  timeScore = 25;
  else if (h >= 2 && h < 5)   timeScore = 10;
  else                          timeScore = 60;  // 5–8

  factors.push({
    id: "time_of_day",
    label: "Time of Day",
    score: timeScore,
    weight: 0.10,
    trend: h >= 5 && h < 14 ? "improving" : h >= 17 ? "declining" : "stable",
    detail:
      h >= 22 || h < 5
        ? "Late night — elevated risk"
        : h >= 8 && h < 18
          ? "Daytime — lowest risk period"
          : "Transitional period",
  });

  // ─── 2. Day of Week (3%) ───────────────────────────────────────────
  const isWeekendNight =
    (input.dayOfWeek === 5 || input.dayOfWeek === 6) && (h >= 21 || h < 4);
  const dayScore = isWeekendNight ? 40 : 80;

  factors.push({
    id: "day_of_week",
    label: "Day Pattern",
    score: dayScore,
    weight: 0.03,
    trend: "stable",
    detail: isWeekendNight
      ? "Weekend night — higher alcohol-related risk"
      : "Normal day pattern",
  });

  // ─── 3. Season (5%) ────────────────────────────────────────────────
  let seasonScore: number;
  let seasonDetail: string;
  const m = input.month;
  if (m >= 6 && m <= 9) {
    seasonScore = 35;
    seasonDetail = "Monsoon season — flood, landslide, snake risk";
  } else if (m >= 11 || m <= 2) {
    seasonScore = 65;
    seasonDetail = "Winter — fog risk, reduced visibility";
  } else if (m >= 3 && m <= 5) {
    seasonScore = 55;
    seasonDetail = "Summer — heat, thunderstorm risk";
  } else {
    seasonScore = 80;
    seasonDetail = "Post-monsoon — generally favourable";
  }

  factors.push({
    id: "season",
    label: "Season",
    score: seasonScore,
    weight: 0.05,
    trend: "stable",
    detail: seasonDetail,
  });

  // ─── 4. Daylight Remaining (5%) ────────────────────────────────────
  let daylightScore: number;
  if (input.minutesToSunset > 180)      daylightScore = 95;
  else if (input.minutesToSunset > 60)  daylightScore = 75;
  else if (input.minutesToSunset > 15)  daylightScore = 45;
  else if (input.minutesToSunset > 0)   daylightScore = 25;
  else                                   daylightScore = 15;

  factors.push({
    id: "daylight",
    label: "Daylight",
    score: daylightScore,
    weight: 0.05,
    trend: input.minutesToSunset > 0 ? "declining" : "stable",
    detail:
      input.minutesToSunset > 0
        ? `${input.minutesToSunset} minutes of daylight remaining`
        : "After sunset — limited natural visibility",
  });

  // ─── 5. Risk Zone (12%) ────────────────────────────────────────────
  let zoneScore: number;
  if (!input.inRiskZone) {
    zoneScore = 95;
  } else {
    switch (input.riskZoneLevel) {
      case "CRITICAL": zoneScore = 5;  break;
      case "HIGH":     zoneScore = 10; break;
      case "MEDIUM":   zoneScore = 40; break;
      case "LOW":      zoneScore = 65; break;
      default:         zoneScore = 40;
    }
  }

  factors.push({
    id: "risk_zone",
    label: "Risk Zone",
    score: zoneScore,
    weight: 0.12,
    trend: "stable",
    detail: input.inRiskZone
      ? `Inside ${input.riskZoneLevel ?? "unknown"} risk zone`
      : "Outside all designated risk zones",
  });

  // ─── 6. Police Station ETA (10%) ───────────────────────────────────
  let policeScore: number;
  const pMin = input.policeETASeconds / 60;
  if (pMin < 5)        policeScore = 95;
  else if (pMin < 10)  policeScore = 80;
  else if (pMin < 15)  policeScore = 60;
  else if (pMin < 30)  policeScore = 35;
  else                  policeScore = 10;

  factors.push({
    id: "police_eta",
    label: "Police Response",
    score: policeScore,
    weight: 0.10,
    trend: "stable",
    detail: `Nearest police: ${Math.round(pMin)} min drive`,
  });

  // ─── 7. Hospital ETA (8%) ──────────────────────────────────────────
  let hospitalScore: number;
  const hMin = input.hospitalETASeconds / 60;
  if (hMin < 10)       hospitalScore = 95;
  else if (hMin < 20)  hospitalScore = 75;
  else if (hMin < 40)  hospitalScore = 50;
  else if (hMin < 60)  hospitalScore = 25;
  else                  hospitalScore = 5;

  factors.push({
    id: "hospital_eta",
    label: "Medical Access",
    score: hospitalScore,
    weight: 0.08,
    trend: "stable",
    detail:
      hMin < 60
        ? `Nearest hospital: ${Math.round(hMin)} min`
        : `Nearest hospital: ${Math.round(hMin / 60)}+ hr — REMOTE`,
  });

  // ─── 8. Area Place Density (8%) ────────────────────────────────────
  let densityScore: number;
  const pc = input.nearbyPlaceCount;
  if (pc > 20)       densityScore = 90;
  else if (pc > 10)  densityScore = 75;
  else if (pc > 5)   densityScore = 55;
  else if (pc > 2)   densityScore = 30;
  else                densityScore = 10;

  factors.push({
    id: "area_density",
    label: "Area Activity",
    score: densityScore,
    weight: 0.08,
    trend: "stable",
    detail:
      pc > 10
        ? `${pc} establishments nearby — active area`
        : pc > 2
          ? `${pc} places nearby — moderate activity`
          : `${pc} places nearby — isolated area`,
  });

  // ─── 9. Area Place Types (7%) ──────────────────────────────────────
  let typeScore = 50;
  typeScore += Math.min(input.safetyPlaceCount * 8, 30);
  if (h >= 21 || h < 5) {
    typeScore -= input.riskyPlaceCount * 5;
  }
  typeScore = clamp(typeScore, 0, 100);

  factors.push({
    id: "area_types",
    label: "Area Profile",
    score: typeScore,
    weight: 0.07,
    trend: "stable",
    detail:
      input.safetyPlaceCount > 3
        ? `${input.safetyPlaceCount} safety services nearby`
        : "Limited safety services in area",
  });

  // ─── 10. Open Businesses (5%) ──────────────────────────────────────
  let openScore: number;
  const ob = input.openBusinessCount;
  if (ob > 10)      openScore = 90;
  else if (ob > 5)  openScore = 70;
  else if (ob > 2)  openScore = 45;
  else if (ob > 0)  openScore = 20;
  else               openScore = 5;

  factors.push({
    id: "open_businesses",
    label: "Active Services",
    score: openScore,
    weight: 0.05,
    trend: h >= 18 ? "declining" : h >= 6 ? "improving" : "stable",
    detail:
      ob > 0
        ? `${ob} businesses currently open`
        : "No businesses open — area is deserted",
  });

  // ─── 11. Active Alerts (8%) ────────────────────────────────────────
  let alertScore: number;
  const ac = input.activeAlertsNearby;
  if (ac === 0)      alertScore = 95;
  else if (ac <= 2)  alertScore = 60;
  else if (ac <= 5)  alertScore = 30;
  else                alertScore = 10;

  factors.push({
    id: "active_alerts",
    label: "Active Alerts",
    score: alertScore,
    weight: 0.08,
    trend: "stable",
    detail:
      ac === 0
        ? "No active alerts in your area"
        : `${ac} active alert${ac > 1 ? "s" : ""} nearby`,
  });

  // ─── 12. Historical Incidents (7%) ─────────────────────────────────
  let historyScore: number;
  const hi = input.historicalIncidents30d;
  if (hi === 0)       historyScore = 95;
  else if (hi <= 2)   historyScore = 75;
  else if (hi <= 5)   historyScore = 50;
  else if (hi <= 10)  historyScore = 25;
  else                 historyScore = 5;

  factors.push({
    id: "history",
    label: "Area History",
    score: historyScore,
    weight: 0.07,
    trend: "stable",
    detail:
      hi === 0
        ? "No incidents reported in last 30 days"
        : `${hi} incident${hi > 1 ? "s" : ""} in last 30 days`,
  });

  // ─── 13. Network Connectivity (4%) ─────────────────────────────────
  let networkScore: number;
  switch (input.networkType) {
    case "wifi":  networkScore = 95; break;
    case "4g":    networkScore = 90; break;
    case "3g":    networkScore = 65; break;
    case "2g":    networkScore = 35; break;
    case "none":  networkScore = 5;  break;
    default:      networkScore = 50;
  }

  factors.push({
    id: "connectivity",
    label: "Connectivity",
    score: networkScore,
    weight: 0.04,
    trend: "stable",
    detail:
      input.networkType === "none"
        ? "NO SIGNAL — cannot call for help"
        : `${input.networkType.toUpperCase()} available`,
  });

  // ─── 14. Weather Severity (5%) ─────────────────────────────────────
  const weatherScore = clamp(100 - input.weatherSeverity, 0, 100);

  factors.push({
    id: "weather",
    label: "Weather",
    score: weatherScore,
    weight: 0.05,
    trend: "stable",
    detail:
      weatherScore > 70
        ? "Favourable weather conditions"
        : weatherScore > 40
          ? "Moderate weather — exercise caution"
          : "Severe weather — stay sheltered",
  });

  // ─── 15. Air Quality (3%) ──────────────────────────────────────────
  let aqScore: number;
  const aqi = input.airQualityIndex;
  if (aqi <= 50)        aqScore = 95;
  else if (aqi <= 100)  aqScore = 75;
  else if (aqi <= 150)  aqScore = 50;
  else if (aqi <= 200)  aqScore = 25;
  else                   aqScore = 5;

  factors.push({
    id: "air_quality",
    label: "Air Quality",
    score: aqScore,
    weight: 0.03,
    trend: "stable",
    detail:
      aqi <= 50  ? `AQI ${aqi} — Good`
      : aqi <= 100 ? `AQI ${aqi} — Moderate`
      : aqi <= 200 ? `AQI ${aqi} — Unhealthy`
      : `AQI ${aqi} — Hazardous`,
  });

  // ─── Weighted Overall Score ─────────────────────────────────────────
  let weightedSum = 0;
  let totalWeight = 0;
  for (const f of factors) {
    weightedSum += f.score * f.weight;
    totalWeight += f.weight;
  }
  let overall = Math.round(weightedSum / totalWeight);

  // ─── Hard Caps ──────────────────────────────────────────────────────
  let cappedBy: string | null = null;

  if (
    input.inRiskZone &&
    (input.riskZoneLevel === "HIGH" || input.riskZoneLevel === "CRITICAL")
  ) {
    if (overall > 40) { overall = 40; cappedBy = "High Risk Zone"; }
  } else if (input.inRiskZone && input.riskZoneLevel === "MEDIUM") {
    if (overall > 65) { overall = 65; cappedBy = "Medium Risk Zone"; }
  }
  if (input.activeAlertsNearby > 5) {
    if (overall > 30) { overall = 30; cappedBy = "Multiple Active Alerts"; }
  }
  if (input.networkType === "none") {
    if (overall > 50) { overall = 50; cappedBy = "No Network Coverage"; }
  }

  const status: Phase1Result["status"] =
    overall >= 80 ? "safe" : overall >= 50 ? "caution" : "danger";

  const recommendation = generateRecommendation(overall, status, factors, input);

  return { overall, status, factors, cappedBy, recommendation };
}

// ─── Recommendation Generator ─────────────────────────────────────────────────

function generateRecommendation(
  _score: number,
  status: Phase1Result["status"],
  factors: Phase1Factor[],
  input: Phase1Input
): string {
  const worst = [...factors].sort((a, b) => a.score - b.score)[0];

  if (status === "danger") {
    if (input.networkType === "none") {
      return "Move toward a populated area to regain phone signal.";
    }
    if (
      input.inRiskZone &&
      (input.riskZoneLevel === "HIGH" || input.riskZoneLevel === "CRITICAL")
    ) {
      return "Leave this high-risk area as soon as safely possible.";
    }
    if (worst.id === "time_of_day") {
      return "Find a well-lit, populated area or return to your accommodation.";
    }
    if (worst.id === "area_density") {
      return "This is an isolated area — move toward a populated location.";
    }
    return "Exercise extreme caution and consider moving to a safer area.";
  }

  if (status === "caution") {
    if (worst.id === "daylight") {
      return `${input.minutesToSunset > 0 ? input.minutesToSunset + " min of daylight left" : "After sunset"} — plan your return route now.`;
    }
    if (worst.id === "weather") {
      return "Weather conditions deteriorating — find shelter if needed.";
    }
    if (worst.id === "open_businesses") {
      return "Most services closing — note your nearest safe spots.";
    }
    if (worst.id === "active_alerts") {
      return "Active alerts in your area — stay vigilant and keep emergency contacts ready.";
    }
    return "Stay aware of your surroundings and keep emergency contacts ready.";
  }

  return "Conditions are favourable — enjoy your visit!";
}

// ─── Astronomical Helpers ─────────────────────────────────────────────────────

/** Returns day of year (1–366) for a given Date. */
function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

/**
 * Estimates minutes until local sunset using a simplified astronomical formula.
 * Accurate to ±15 min for most latitudes.
 *
 * @param lat  Decimal degrees latitude
 * @param lon  Decimal degrees longitude (east positive)
 * @param now  Current timestamp (UTC)
 * @returns    Minutes until sunset; negative means sunset has already passed today.
 */
export function computeMinutesToSunset(lat: number, lon: number, now: Date): number {
  const dayOfYear = getDayOfYear(now);

  // Solar declination (degrees)
  const declDeg = 23.45 * Math.sin(((2 * Math.PI) / 365) * (dayOfYear - 81));
  const declRad = declDeg * (Math.PI / 180);
  const latRad = lat * (Math.PI / 180);

  const cosH = -Math.tan(latRad) * Math.tan(declRad);

  // Polar extremes: midnight sun or polar night
  if (cosH < -1) return 24 * 60;  // midnight sun — always light
  if (cosH > 1)  return -60;      // polar night — already dark

  const sunsetHourAngleDeg = Math.acos(cosH) * (180 / Math.PI);

  // Sunset in solar time (hours from midnight, local solar noon = 12:00)
  const sunsetSolarHour = 12 + sunsetHourAngleDeg / 15;

  // Equation of time correction (simplified, in minutes)
  const B = (2 * Math.PI / 365) * (dayOfYear - 81);
  const eotMinutes = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);

  // Local Standard Time Meridian (LSTM) — we use UTC + lon correction
  const longitudeOffsetHours = lon / 15;
  const sunsetUTCHour = sunsetSolarHour - longitudeOffsetHours - eotMinutes / 60;

  const nowUTCHour = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;

  return Math.round((sunsetUTCHour - nowUTCHour) * 60);
}

/**
 * Haversine distance in metres between two (lat, lng) points.
 */
export function haversineMetres(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/**
 * Estimate driving time in seconds given a straight-line distance in metres.
 * Uses an average urban/rural speed of 30 km/h with a 1.35 route factor.
 */
export function estimateDriveSeconds(distanceMetres: number): number {
  const avgSpeedMs = (30 * 1000) / 3600; // 30 km/h in m/s
  const routeFactor = 1.35;
  return Math.round((distanceMetres * routeFactor) / avgSpeedMs);
}
