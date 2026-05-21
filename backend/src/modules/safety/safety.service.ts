import { redis } from '../../shared/cache/redis.js';
import { env } from '../../shared/config/env.js';
import { logger } from '../../shared/logger/index.js';
import { externalApiService } from './external-api.service.js';
import { gatherContext } from './safety.context.js';
import { calculatePhase1Score, computeMinutesToSunset } from './safety.phase1.js';
import type { Phase1Input } from './safety.phase1.js';
import type { SafetyCheckQuery, SafetyEvaluateBody } from './safety.schema.js';

const snapToCell = (lat: number, lon: number): string => `${lat.toFixed(2)}:${lon.toFixed(2)}`;

const IMD_WARNING_MAP: Record<string, string> = {
  '1': 'No Warning',
  '2': 'Heavy Rain',
  '3': 'Heavy Snow',
  '4': 'Thunderstorm & Lightning',
  '5': 'Hailstorm',
  '6': 'Dust Storm',
  '9': 'Heat Wave',
  '15': 'Fog',
  '16': 'Very Heavy Rain',
};

type AggregatorStatus = 'safe' | 'caution' | 'danger';
type AggregatorLabel = 'SAFE' | 'WARNING' | 'DANGER' | 'CRITICAL_DANGER';

function resolveAggregatorStatus(dangerIndex: number): { status: AggregatorStatus; label: AggregatorLabel; recommendation: string } {
  if (dangerIndex >= 9) {
    return {
      status: 'danger',
      label: 'CRITICAL_DANGER',
      recommendation: 'Critical danger detected. Re-route immediately and follow official advisories.',
    };
  }

  if (dangerIndex >= 6) {
    return {
      status: 'danger',
      label: 'DANGER',
      recommendation: 'Danger level detected. Avoid non-essential travel and seek a safer route.',
    };
  }

  if (dangerIndex >= 3) {
    return {
      status: 'caution',
      label: 'WARNING',
      recommendation: 'Risk is rising. Stay alert and plan a safer route.',
    };
  }

  return {
    status: 'safe',
    label: 'SAFE',
    recommendation: 'Conditions look stable. Continue with normal precautions.',
  };
}

function extractPmValue(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

async function buildMasterAggregator(input: SafetyEvaluateBody | SafetyCheckQuery) {
  const lat = input.lat;
  const lon = input.lon;
  const localHour = ('local_hour' in input) ? input.local_hour : (input.hour ?? new Date().getHours());

  // Key on 2-decimal grid (~1.1km cells) WITHOUT the hour — the 300s TTL handles time freshness.
  // Including the hour caused cache misses at hour boundaries (e.g. 10:59 vs 11:00).
  const cacheKey = `safety:${snapToCell(lat, lon)}`;
  const cached = await redis.get(cacheKey).catch(() => null);
  if (cached) {
    try {
      return { ...JSON.parse(cached), cached: true };
    } catch {
      // fall through to live aggregation
    }
  }

  // 1. Core ML Boundary Hook (Python Fast-API)
  const mlData = await externalApiService.fetchMlBaseline(lat, lon, localHour);

  // 2. The Circuit Breaker (Failover to Phase 1 Heuristic Engine)
  if (mlData.status === 'OUT_OF_BOUNDS' || mlData.status === 'OFFLINE' || mlData.status === 'UNMAPPED_TERRAIN') {
    logger.warn({ mlStatus: mlData.status }, 'ML Engine unavailable or out of bounds. Falling back to Phase 1 Heuristic Engine.');

    // Fetch live local DB Context & Real POIs concurrently
    const [ctx, realPOIs] = await Promise.all([
      gatherContext(lat, lon),
      externalApiService.fetchRealPOIs(lat, lon, 1500) // 1.5km radius
    ]);
    
    // Map Query Inputs into Heuristic Inputs
    const p1Input: Phase1Input = {
      currentHour: localHour,
      dayOfWeek: new Date().getDay(),
      month: new Date().getMonth() + 1,
      minutesToSunset: computeMinutesToSunset(lat, lon, new Date()),
      nearbyPlaceCount: realPOIs.nearbyPlaceCount,
      safetyPlaceCount: realPOIs.safetyPlaceCount,
      riskyPlaceCount: realPOIs.riskyPlaceCount,
      openBusinessCount: realPOIs.openBusinessCount,
      policeETASeconds: ctx.policeETASeconds,
      hospitalETASeconds: ctx.hospitalETASeconds,
      inRiskZone: ctx.inRiskZone,
      riskZoneLevel: ctx.riskZoneLevel,
      activeAlertsNearby: ctx.activeAlertsNearby,
      historicalIncidents30d: ctx.historicalIncidents30d,
      networkType: ('networkType' in input && input.networkType) ? input.networkType : '4g',
      weatherSeverity: ('weatherSeverity' in input && input.weatherSeverity) ? input.weatherSeverity : 20,
      airQualityIndex: ('aqi' in input && input.aqi) ? input.aqi : 50,
    };

    const phase1 = calculatePhase1Score(p1Input);
    
    const result = {
      success: true,
      danger_index: Number(((100 - phase1.overall) / 10).toFixed(1)),
      danger_score: Number(((100 - phase1.overall) / 100).toFixed(2)),
      safety_score: phase1.overall,
      overallScore: phase1.overall,
      status: phase1.status,
      status_label: phase1.status === 'danger' ? 'DANGER' : phase1.status === 'caution' ? 'WARNING' : 'SAFE',
      riskLabel: phase1.status === 'safe' ? 'Low Risk' : phase1.status === 'caution' ? 'Caution' : 'High Danger',
      recommendation: phase1.recommendation,
      spatial_context: null,
      risk_factors: phase1.factors, // Phase 1 natively outputs mapped factor objects
      source: 'heuristic_fallback',
      cached: false,
    };

    // Cache fallback result for 5 minutes too
    await redis.setex(cacheKey, 300, JSON.stringify(result)).catch(() => undefined);
    return result;
  }

  // 3. Main Synthesis Logic (Master Aggregator - ML Flow)
  const district = String(mlData.spatial_context && typeof mlData.spatial_context === 'object' ? (mlData.spatial_context as Record<string, unknown>).district ?? 'Unknown' : 'Unknown');

  // Parallel remote fetches — each cached independently in Redis:
  // AQI: 1 hour (3600s) — changes hourly on Open-Meteo
  // IMD: 6 hours (21600s) — district warnings update at most twice a day
  const aqiCacheKey  = `aqi:${snapToCell(lat, lon)}`;
  const imdCacheKey  = `imd:${district.toLowerCase().trim()}`;

  const [aqiData, imdData] = await Promise.all([
    redis.get(aqiCacheKey).catch(() => null).then(async (hit) => {
      if (hit) { try { return JSON.parse(hit) as Record<string, unknown>; } catch { /**/ } }
      const fresh = await externalApiService.fetchLiveAqi(lat, lon);
      await redis.setex(aqiCacheKey, 3600, JSON.stringify(fresh)).catch(() => undefined);
      return fresh;
    }),
    redis.get(imdCacheKey).catch(() => null).then(async (hit) => {
      if (hit) { try { const v = JSON.parse(hit); return v === '__null__' ? null : v; } catch { /**/ } }
      const fresh = await externalApiService.fetchLiveImdWarning(district);
      // Cache null sentinel too — don't hammer IMD on every miss
      await redis.setex(imdCacheKey, 21600, fresh ? JSON.stringify(fresh) : '__null__').catch(() => undefined);
      return fresh;
    }),
  ]);

  let dangerIndex = 0;
  const riskFactors: any[] = [];

  // ==========================================
  // A. HISTORICAL ML BASELINE (Now Continuous!)
  // ==========================================
  let mlHazardScore = 0;
  const mlBaseline = mlData.ml_baseline as Record<string, unknown> | null | undefined;
  const anomalyMagnitude = Number(mlBaseline?.anomaly_magnitude) || 1.0;

  if (anomalyMagnitude >= 1.63) { // Top 1% Extreme Hazard
    mlHazardScore = 6;
    riskFactors.push({
      id: 'ml_hazard',
      label: 'Critical Environmental Hazard',
      score: 60,
      detail: `Catastrophic historical environmental decay detected (Magnitude: ${anomalyMagnitude.toFixed(2)}).`,
      trend: 'declining'
    });
  } else if (anomalyMagnitude >= 1.20) { // Warning Threshold
    mlHazardScore = 3;
    riskFactors.push({
      id: 'ml_hazard',
      label: 'Elevated Environmental Risk',
      score: 30,
      detail: `Noticeable environmental degradation in this zone (Magnitude: ${anomalyMagnitude.toFixed(2)}).`,
      trend: 'declining'
    });
  }

  // ==========================================
  // B. LIVE AIR QUALITY (Fixed for PM10 & Ozone)
  // ==========================================
  let aqiScore = 0;
  const currentAqi = aqiData as Record<string, unknown>;
  const pm25 = extractPmValue(currentAqi.pm2_5);
  const pm10 = extractPmValue(currentAqi.pm10);
  const ozone = extractPmValue(currentAqi.ozone);

  if (pm25 > 100 || pm10 > 200 || ozone > 150) {
    aqiScore = 6;
    riskFactors.push({
      id: 'live_aqi',
      label: 'Toxic Air Quality',
      score: 60,
      detail: `Critical pollution levels (PM2.5: ${pm25}, PM10: ${pm10}, Ozone: ${ozone}).`,
      trend: 'declining'
    });
  } else if (pm25 > 60 || pm10 > 100 || ozone > 100) {
    aqiScore = 3;
    riskFactors.push({
      id: 'live_aqi',
      label: 'Poor Air Quality',
      score: 30,
      detail: `Elevated pollution levels (PM10: ${pm10}, Ozone: ${ozone}). Avoid prolonged outdoor activity.`,
      trend: 'stable'
    });
  }

  // Max(E_hist, E_live) - Don't double count environment!
  dangerIndex += Math.max(mlHazardScore, aqiScore);

  // ==========================================
  // C. INFRASTRUCTURE & SOCIO-TEMPORAL
  // ==========================================
  const infrastructure = mlData.infrastructure as Record<string, unknown> | null | undefined;
  if (infrastructure?.socio_temporal_penalty_active === true) {
    dangerIndex += 3;
    riskFactors.push({
      id: 'infrastructure',
      label: 'Unlit Zone at Night',
      score: 30,
      detail: 'Satellite VIIRS data indicates poor street lighting during nighttime hours.',
      trend: 'stable'
    });
  }

  // ==========================================
  // D. LIVE WEATHER (Now includes Yellow Alerts!)
  // ==========================================
  if (imdData) {
    const colorCode = String(imdData.Day1_Color);
    const hazardCode = String(imdData.Day_1 ?? '').split(',').at(0)?.trim() ?? '';
    const hazardName = IMD_WARNING_MAP[hazardCode] || 'Weather Hazard';

    if (['3', '4'].includes(colorCode)) { // Orange/Red Alert
      dangerIndex += 5;
      riskFactors.push({
        id: 'live_weather',
        label: 'Severe Weather Alert',
        score: 50,
        detail: `IMD SEVERE ALERT: ${hazardName} expected today.`,
        trend: 'declining'
      });
    } else if (colorCode === '2') { // Yellow Alert (Like your Kapurthala Heat Wave!)
      dangerIndex += 2;
      riskFactors.push({
        id: 'live_weather',
        label: 'Weather Warning (Yellow)',
        score: 20,
        detail: `IMD ADVISORY: ${hazardName} expected today. Be prepared.`,
        trend: 'stable'
      });
    }
  }

  // ==========================================
  // E. CONFIDENCE ENGINE
  // ==========================================
  let confidenceScore = 1.0;
  const confidenceReasons: string[] = [];

  if (mlData.status === 'UNMAPPED_TERRAIN') {
    confidenceScore -= 0.15;
    confidenceReasons.push("Missing historical ML baseline for this precise village.");
  }
  if (!imdData) {
    confidenceScore -= 0.20;
    confidenceReasons.push("IMD Weather API unavailable; weather hazards unverified.");
  }

  // ==========================================
  // F. FINAL OUTPUT SYNTHESIS
  // ==========================================
  dangerIndex = Math.min(dangerIndex, 10);
  const resolved = resolveAggregatorStatus(dangerIndex);
  const dangerScore = Number((dangerIndex / 10).toFixed(2));
  const safetyScore = Math.max(0, Math.round(100 - dangerIndex * 10));

  const result = {
    success: true,
    danger_index: dangerIndex,
    danger_score: dangerScore,
    safety_score: safetyScore,
    overallScore: safetyScore,
    status: resolved.status,
    status_label: resolved.label,
    riskLabel: resolved.label === 'SAFE' ? 'Low Risk' : resolved.label === 'WARNING' ? 'Caution' : 'High Danger',
    recommendation: resolved.recommendation,
    
    // Confidence Metrics
    prediction_confidence: Number(confidenceScore.toFixed(2)),
    confidence_reasons: confidenceReasons,

    spatial_context: mlData.spatial_context ?? null,
    risk_factors: riskFactors,
    ml_baseline: mlBaseline ?? null,
    infrastructure: mlData.infrastructure ?? null,
    live_aqi: aqiData,
    live_imd: imdData,
    source: 'master_aggregator',
    cached: false,
  };

  // Cache final result for 5 minutes — matches the frontend REFRESH_INTERVAL
  await redis.setex(cacheKey, 300, JSON.stringify(result)).catch(() => undefined);
  return result;
}

export const safetyService = {
  // Routes both traditional GET checks and POST evaluation queries dynamically to the Master Aggregator.
  async evaluate(input: SafetyEvaluateBody) {
    return buildMasterAggregator(input);
  },

  async check(input: SafetyCheckQuery) {
    return buildMasterAggregator(input);
  }
};