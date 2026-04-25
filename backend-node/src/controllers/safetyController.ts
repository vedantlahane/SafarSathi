import type { Request, Response } from "express";
import {
  calculatePhase1Score,
  computeMinutesToSunset,
  haversineMetres,
  estimateDriveSeconds,
  type Phase1Input,
  type Phase1Factor,
} from "../services/phase1SafetyCalculator.js";
import {
  getRiskZonesNearby,
  getAllPoliceDepartments,
  getAllHospitals,
  type IRiskZone,
  type IAlert,
  type IPoliceDepartment,
  type IHospital,
  type IIncident,
} from "../services/mongoStore.js";
import { AlertModel } from "../schemas/Alert.schema.js";
import { IncidentModel } from "../schemas/Incident.schema.js";
import { env } from "../config/env.js";
import { predictSafetyFromMl } from "../services/safetyMlService.js";

// Radius within which we look for context data
const ZONE_RADIUS_KM = 2;
const ALERT_RADIUS_KM = 3;
const INCIDENT_RADIUS_KM = 5;

// Default place-density values used when Google Places is unavailable.
// These represent a moderate urban environment.
const DEFAULT_NEARBY_PLACE_COUNT = 10;
const DEFAULT_SAFETY_PLACE_COUNT = 2;
const DEFAULT_RISKY_PLACE_COUNT = 1;
const DEFAULT_OPEN_BUSINESS_COUNT = 5;

// Valid networkType values accepted from clients
const VALID_NETWORK_TYPES = new Set(["wifi", "4g", "3g", "2g", "none"]);

/** Map Phase1Factor trend to the frontend "up" / "down" / "stable" vocabulary. */
function mapTrend(trend: Phase1Factor["trend"]): "up" | "down" | "stable" {
  if (trend === "improving") return "up";
  if (trend === "declining") return "down";
  return "stable";
}

/**
 * GET /api/v1/safety/check
 *
 * Query params:
 *   lat            (required)  – decimal degrees
 *   lon            (required)  – decimal degrees
 *   hour           (optional)  – local hour 0-23 (defaults to server UTC hour)
 *   networkType    (optional)  – "wifi" | "4g" | "3g" | "2g" | "none"
 *   weatherSeverity(optional)  – 0-100
 *   aqi            (optional)  – 0-500
 */
export async function safetyCheck(req: Request, res: Response): Promise<void> {
  // ── Parse & validate query params ──────────────────────────────────
  const lat = parseFloat(req.query.lat as string);
  const lon = parseFloat(req.query.lon as string);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    res.status(400).json({
      success: false,
      error: "Query params lat and lon must be valid numbers.",
    });
    return;
  }

  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    res.status(400).json({
      success: false,
      error: "lat must be in [-90, 90] and lon in [-180, 180].",
    });
    return;
  }

  const now = new Date();
  const rawHour = req.query.hour as string | undefined;
  const currentHour =
    rawHour !== undefined && /^\d{1,2}$/.test(rawHour)
      ? Math.min(23, Math.max(0, parseInt(rawHour, 10)))
      : now.getUTCHours();

  const rawNetwork = (req.query.networkType as string | undefined)?.toLowerCase();
  const networkType = VALID_NETWORK_TYPES.has(rawNetwork ?? "")
    ? (rawNetwork as Phase1Input["networkType"])
    : "4g";

  const rawWeather = parseFloat(req.query.weatherSeverity as string);
  const weatherSeverity = Number.isFinite(rawWeather)
    ? Math.min(100, Math.max(0, rawWeather))
    : 0;

  const rawAqi = parseFloat(req.query.aqi as string);
  const airQualityIndex = Number.isFinite(rawAqi)
    ? Math.min(500, Math.max(0, rawAqi))
    : 50;

  // ── Fetch MongoDB context in parallel ──────────────────────────────
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [nearbyZones, allPolice, allHospitals, activeAlerts, recentIncidents] =
    await Promise.all([
      getRiskZonesNearby(lat, lon, ZONE_RADIUS_KM).catch(() => []),
      getAllPoliceDepartments().catch(() => []),
      getAllHospitals().catch(() => []),
      AlertModel.find({
        status: { $in: ["OPEN", "PENDING", "ACKNOWLEDGED"] },
      })
        .lean()
        .catch(() => []),
      IncidentModel.find({
        createdAt: { $gte: thirtyDaysAgo },
        status: { $nin: ["false_alarm", "resolved"] },
      })
        .lean()
        .catch(() => []),
    ]);

  // ── Risk zone context ───────────────────────────────────────────────
  const inRiskZone = nearbyZones.length > 0;
  const levelOrder: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
  const worstZone = nearbyZones.reduce(
    (worst: (IRiskZone & { distanceMeters: number }) | undefined, z: IRiskZone & { distanceMeters: number }) =>
      (levelOrder[z.riskLevel ?? "LOW"] ?? 0) > (levelOrder[worst?.riskLevel ?? "LOW"] ?? 0) ? z : worst,
    nearbyZones[0] as (IRiskZone & { distanceMeters: number }) | undefined
  );
  const riskZoneLevel = worstZone?.riskLevel as Phase1Input["riskZoneLevel"] ?? null;

  // ── Active alerts near user ─────────────────────────────────────────
  const alertRadiusM = ALERT_RADIUS_KM * 1000;
  const activeAlertsNearby = (activeAlerts as IAlert[]).filter((a: IAlert) => {
    if (typeof a.latitude !== "number" || typeof a.longitude !== "number") return false;
    return haversineMetres(lat, lon, a.latitude, a.longitude) <= alertRadiusM;
  }).length;

  // ── Historical incidents near user (last 30 days) ───────────────────
  const incidentRadiusM = INCIDENT_RADIUS_KM * 1000;
  const historicalIncidents30d = (recentIncidents as IIncident[]).filter((i: IIncident) => {
    if (typeof i.latitude !== "number" || typeof i.longitude !== "number") return false;
    return haversineMetres(lat, lon, i.latitude, i.longitude) <= incidentRadiusM;
  }).length;

  // ── Nearest police station ETA ──────────────────────────────────────
  let policeETASeconds = 30 * 60; // fallback: 30 minutes
  if (allPolice.length > 0) {
    type PoliceBest = { dist: number; station: IPoliceDepartment };
    const nearest = (allPolice as IPoliceDepartment[])
      .filter((p: IPoliceDepartment) => typeof p.latitude === "number" && typeof p.longitude === "number")
      .reduce(
        (best: PoliceBest, p: IPoliceDepartment): PoliceBest => {
          const d = haversineMetres(lat, lon, p.latitude, p.longitude);
          return d < best.dist ? { dist: d, station: p } : best;
        },
        { dist: Infinity, station: allPolice[0] as IPoliceDepartment }
      );
    if (Number.isFinite(nearest.dist)) {
      policeETASeconds = estimateDriveSeconds(nearest.dist);
    }
  }

  // ── Nearest hospital ETA ────────────────────────────────────────────
  let hospitalETASeconds = 60 * 60; // fallback: 60 minutes
  if (allHospitals.length > 0) {
    type HospBest = { dist: number; hosp: IHospital };
    const nearest = (allHospitals as IHospital[])
      .filter((h: IHospital) => typeof h.latitude === "number" && typeof h.longitude === "number")
      .reduce(
        (best: HospBest, h: IHospital): HospBest => {
          const d = haversineMetres(lat, lon, h.latitude, h.longitude);
          return d < best.dist ? { dist: d, hosp: h } : best;
        },
        { dist: Infinity, hosp: allHospitals[0] as IHospital }
      );
    if (Number.isFinite(nearest.dist)) {
      hospitalETASeconds = estimateDriveSeconds(nearest.dist);
    }
  }

  // ── Daylight ────────────────────────────────────────────────────────
  const minutesToSunset = computeMinutesToSunset(lat, lon, now);

  // ── Build Phase1Input ───────────────────────────────────────────────
  const input: Phase1Input = {
    currentHour,
    dayOfWeek: now.getUTCDay(),
    month: now.getUTCMonth() + 1, // getUTCMonth() is 0-indexed

    minutesToSunset,

    // Place density — defaults used (no Google Places integration yet)
    nearbyPlaceCount: DEFAULT_NEARBY_PLACE_COUNT,
    safetyPlaceCount: DEFAULT_SAFETY_PLACE_COUNT,
    riskyPlaceCount: DEFAULT_RISKY_PLACE_COUNT,
    openBusinessCount: DEFAULT_OPEN_BUSINESS_COUNT,

    policeETASeconds,
    hospitalETASeconds,

    inRiskZone,
    riskZoneLevel,
    activeAlertsNearby,
    historicalIncidents30d,

    networkType,
    weatherSeverity,
    airQualityIndex,
  };

  // ── Run local phase-1 calculator (always available fallback) ───────
  const localResult = calculatePhase1Score(input);

  let overallScore = localResult.overall;
  let status = localResult.status;
  let cappedBy = localResult.cappedBy;
  let recommendation = localResult.recommendation;
  let dangerScore = Math.round((100 - localResult.overall) * 100) / 10000;
  let modelEnvironment: string | null = null;
  let forecast: Array<{
    horizonHours: number;
    safetyScore: number;
    dangerScore: number;
    status: "safe" | "caution" | "danger";
    rationale: string;
  }> = [];

  let scoringSource: "ml_v2" | "phase1_fallback" = "phase1_fallback";
  let mlApiUsed = false;

  // Map factors for the frontend SafetyFactor interface
  let frontendFactors = localResult.factors.map((f) => ({
    label: f.label,
    score: f.score,
    trend: mapTrend(f.trend),
    detail: f.detail,
  }));

  // ── Optional ML v2 scoring via Python API ───────────────────────────
  if (env.safetyMlApiUrl) {
    const mlFeatures: Record<string, unknown> = {
      latitude: lat,
      longitude: lon,
      hour: currentHour,
      day_of_week: now.getUTCDay(),
      month: now.getUTCMonth() + 1,
      minutes_to_sunset: minutesToSunset,

      network_type: networkType,
      weather_severity: weatherSeverity,
      aqi: airQualityIndex,

      in_risk_zone: inRiskZone,
      risk_zone_level: riskZoneLevel ?? "LOW",
      active_alerts_nearby: activeAlertsNearby,
      historical_incidents_30d: historicalIncidents30d,

      nearby_place_count: DEFAULT_NEARBY_PLACE_COUNT,
      safety_place_count: DEFAULT_SAFETY_PLACE_COUNT,
      risky_place_count: DEFAULT_RISKY_PLACE_COUNT,
      open_business_count: DEFAULT_OPEN_BUSINESS_COUNT,

      police_eta_min: policeETASeconds / 60,
      hospital_eta_min: hospitalETASeconds / 60,
    };

    const mlPrediction = await predictSafetyFromMl(
      mlFeatures,
      env.safetyMlApiUrl,
      env.safetyMlTimeoutMs,
    );

    if (mlPrediction) {
      mlApiUsed = true;
      scoringSource = "ml_v2";

      overallScore = Number(mlPrediction.safetyScore.toFixed(2));
      status = mlPrediction.status;
      cappedBy = mlPrediction.cappedBy;
      recommendation = mlPrediction.recommendation;
      dangerScore = Number(mlPrediction.dangerScore.toFixed(4));
      modelEnvironment = mlPrediction.environment;
      forecast = mlPrediction.forecast;

      if (mlPrediction.factors.length > 0) {
        frontendFactors = mlPrediction.factors.map((f) => ({
          label: f.label,
          score: Number(f.score.toFixed(2)),
          trend: "stable" as const,
          detail: f.detail,
        }));
      }
    }
  }

  const riskLabel: "Low Risk" | "Caution" | "High Danger" =
    status === "safe"
      ? "Low Risk"
      : status === "caution"
        ? "Caution"
        : "High Danger";

  res.json({
    success: true,
    data: {
      // Legacy fields (backward-compatible)
      dangerScore,
      riskLabel,
      isNearAdminZone: inRiskZone,
      recommendation,

      // Phase 1 enrichments
      overallScore,
      status,
      cappedBy,
      factors: frontendFactors,

      // ML enrichments (when available)
      environment: modelEnvironment,
      forecast,

      // Diagnostics
      scoringSource,
      mlApiConfigured: Boolean(env.safetyMlApiUrl),
      mlApiUsed,
    },
  });
}
