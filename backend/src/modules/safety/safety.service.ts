import { redis } from '../../shared/cache/redis.js';
import { env } from '../../shared/config/env.js';
import { logger } from '../../shared/logger/index.js';
import { externalApiService } from './external-api.service.js';
import { gatherContext } from './safety.context.js';
import { calculatePhase1Score, computeMinutesToSunset } from './safety.phase1.js';
import type { Phase1Input } from './safety.phase1.js';
import type { SafetyCheckQuery, SafetyEvaluateBody } from './safety.schema.js';
import { touristRepo } from '../tourist/tourist.repo.js';

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

  let gender = ('gender' in input && input.gender) ? String(input.gender).toLowerCase() : 'unknown';
  let age: number | undefined;
  let medicalConditions: string[] = [];
  let adminManualPenalty = 0;
  
  if ('touristId' in input && input.touristId) {
    const tourist = await touristRepo.findById(input.touristId).catch(() => null);
    if (tourist) {
      if (tourist.gender) gender = tourist.gender.toLowerCase();
      if (tourist.dateOfBirth) {
         const dob = new Date(tourist.dateOfBirth);
         if (!isNaN(dob.getTime())) {
             age = new Date().getFullYear() - dob.getFullYear();
         }
      }
      if (tourist.medicalConditions && Array.isArray(tourist.medicalConditions)) {
          medicalConditions = tourist.medicalConditions;
      }
      if (tourist.adminManualPenalty) {
          adminManualPenalty = tourist.adminManualPenalty;
      }
    }
  }

  // Key on 2-decimal grid (~1.1km cells) + time + demographics
  const cacheKey = `safety:${snapToCell(lat, lon)}:h${localHour}:g${gender}`;
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

  const [aqiData, imdData, localCtx] = await Promise.all([
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
    gatherContext(lat, lon).catch(() => null)
  ]);

  let dangerIndex = 0;
  const riskFactors: any[] = [];

  // ==========================================
  // A. HISTORICAL ML BASELINE (Now Continuous via Random Forest & SHAP)
  // ==========================================
  let mlHazardScore = 0;
  const mlBaseline = mlData.ml_baseline;
  
  if (mlBaseline && mlBaseline.predicted_score !== undefined) {
    // The Random Forest model predicts a safety score (0-100).
    // We convert it to a danger index contribution (0-10) where lower safety = higher danger.
    mlHazardScore = (100 - mlBaseline.predicted_score) / 10;
    mlHazardScore = Math.max(0, Math.min(10, mlHazardScore));
    
    // Add explainability factors via SHAP values
    if (mlBaseline.shap_values) {
      const featureNames: Record<string, string> = {
        pm25_mean: "Air Pollution (PM2.5)",
        vcf_mean: "Vegetation/Tree Cover",
        viirs_annual_mean: "Nightlight Density",
        elevation_mean: "Elevation Terrain",
        tri_mean: "Terrain Ruggedness"
      };

      for (const [feature, shapValue] of Object.entries(mlBaseline.shap_values)) {
        // Negative SHAP means it dragged the safety score down.
        if (shapValue < -1.5) {
          const readableName = featureNames[feature] || feature;
          riskFactors.push({
            id: `shap_${feature}`,
            label: `Risk Factor: ${readableName}`,
            score: Math.min(100, Math.round(Math.abs(shapValue) * 5)),
            detail: `AI analysis indicates ${readableName} is significantly reducing safety in this area.`,
            trend: 'stable'
          });
        } else if (shapValue > 2.0) {
          // Positive SHAP means it boosted safety
          const readableName = featureNames[feature] || feature;
          riskFactors.push({
            id: `shap_${feature}`,
            label: `Safety Boost: ${readableName}`,
            score: Math.min(100, Math.round(shapValue * 5)),
            detail: `AI analysis indicates ${readableName} contributes positively to safety here.`,
            trend: 'stable'
          });
        }
      }
    }
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
    aqiScore = 1.0;
    riskFactors.push({
      id: 'live_aqi',
      label: 'Toxic Air Quality',
      score: 10,
      detail: `Critical pollution levels (PM2.5: ${pm25}, PM10: ${pm10}, Ozone: ${ozone}).`,
      trend: 'declining'
    });
  } else if (pm25 > 60 || pm10 > 100 || ozone > 100) {
    aqiScore = 0.2;
    riskFactors.push({
      id: 'live_aqi',
      label: 'Poor Air Quality',
      score: 2,
      detail: `Elevated pollution levels (PM10: ${pm10}, Ozone: ${ozone}). Avoid prolonged outdoor activity.`,
      trend: 'stable'
    });
  }

  // Base Danger strictly anchors to ML
  dangerIndex = mlHazardScore + aqiScore;

  // ==========================================
  // C. INFRASTRUCTURE & SOCIO-TEMPORAL
  // ==========================================
  const infrastructure = mlData.infrastructure as Record<string, unknown> | null | undefined;
  if (infrastructure?.socio_temporal_penalty_active === true) {
    dangerIndex += 1.5;
    riskFactors.push({
      id: 'infrastructure',
      label: 'Unlit Zone at Night',
      score: 15,
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
      dangerIndex += 1.0;
      riskFactors.push({
        id: 'live_weather',
        label: 'Severe Weather Alert',
        score: 10,
        detail: `IMD SEVERE ALERT: ${hazardName} expected today.`,
        trend: 'declining'
      });
    } else if (colorCode === '2') { // Yellow Alert (Like your Kapurthala Heat Wave!)
      dangerIndex += 0.2;
      riskFactors.push({
        id: 'live_weather',
        label: 'Weather Warning (Yellow)',
        score: 2,
        detail: `IMD ADVISORY: ${hazardName} expected today. Be prepared.`,
        trend: 'stable'
      });
    }
  }

  // ==========================================
  // Y. DEVICE TELEMETRY ENGINE
  // ==========================================
  const battery = 'batteryPct' in input && typeof input.batteryPct === 'number' ? input.batteryPct : null;
  const network = 'networkType' in input && typeof input.networkType === 'string' ? input.networkType : null;
  
  if (battery !== null && battery < 15) {
     if (dangerIndex >= 3 || infrastructure?.socio_temporal_penalty_active === true) {
         dangerIndex += 1.5;
         riskFactors.push({
             id: 'telemetry_battery',
             label: 'Stranding Risk (Low Battery)',
             score: 15,
             detail: `Battery is critically low (${battery}%). Emergency SOS capability may be lost soon.`,
             trend: 'declining'
         });
     }
  }
  
  if (network === '2g' || network === 'none') {
     dangerIndex += 1.0;
     riskFactors.push({
         id: 'telemetry_network',
         label: 'Digital Isolation',
         score: 10,
         detail: 'Poor network connectivity detected. Emergency dispatch may be delayed.',
         trend: 'stable'
     });
  }

  // ==========================================
  // Z. DEMOGRAPHIC & MEDICAL ENGINE
  // ==========================================
  const isNight = localHour < 6 || localHour >= 19;
  const isUnlit = infrastructure?.is_unlit === true;
  
  if (isNight && (localHour >= 23 || localHour <= 4)) {
      dangerIndex += 1.0;
      riskFactors.push({
         id: 'temporal_late_night',
         label: 'Late Night Travel',
         score: 10,
         detail: 'Statistical risk is uniformly higher between 11 PM and 4 AM.',
         trend: 'stable'
      });
  }
  
  if ((gender.includes('female') || gender.includes('other') || gender.includes('non-binary')) && isUnlit && isNight) {
      // Offset: If police are within 10 minutes (600s), cut the vulnerability penalty in half.
      const hasPolice = localCtx && localCtx.policeETASeconds < 600;
      dangerIndex += hasPolice ? 1.0 : 2.0;
      riskFactors.push({
         id: 'demographic_vulnerability',
         label: 'Nighttime Vulnerability',
         score: hasPolice ? 10 : 20,
         detail: hasPolice 
            ? 'Additional caution advised for female/solo travelers, though police proximity mitigates extreme risk.'
            : 'Additional caution advised for female/solo travelers in unlit zones after dark.',
         trend: 'stable'
      });
  }
  
  if (medicalConditions.length > 0 && aqiScore > 0) {
      const hasRespiratory = medicalConditions.some(c => c.toLowerCase().includes('asthma') || c.toLowerCase().includes('respiratory') || c.toLowerCase().includes('lung'));
      if (hasRespiratory) {
          // Offset: If a hospital is within 5 minutes (300s), cut the respiratory penalty.
          const hasHospital = localCtx && localCtx.hospitalETASeconds < 300;
          dangerIndex += hasHospital ? 1.5 : 3;
          riskFactors.push({
              id: 'medical_respiratory',
              label: 'Respiratory Danger',
              score: hasHospital ? 15 : 30,
              detail: hasHospital
                  ? 'Medical Alert: High AQI poses risk, but you are very close to a hospital.'
                  : 'Medical Alert: High AQI poses severe risk due to your listed respiratory conditions.',
              trend: 'declining'
          });
      }
  }
  
  if (age !== undefined && (age > 60 || age < 18)) {
     if (imdData && ['2','3','4'].includes(String(imdData.Day1_Color))) {
         dangerIndex += 3;
         riskFactors.push({
             id: 'demographic_age_weather',
             label: 'Age-based Weather Vulnerability',
             score: 30,
             detail: 'Extreme weather alert poses elevated risk for seniors and minors.',
             trend: 'stable'
         });
     }
  }

  // ==========================================
  // Z2. EMERGENCY INFRASTRUCTURE OFFSETS
  // ==========================================
  if (localCtx) {
      if (localCtx.policeETASeconds < 600) {
          dangerIndex -= 1.5;
          riskFactors.push({
             id: 'offset_police',
             label: 'Safety Boost: Police Nearby',
             score: -15,
             detail: `A police station is ~${Math.ceil(localCtx.policeETASeconds / 60)} minutes away.`,
             trend: 'stable'
          });
      }
      if (localCtx.hospitalETASeconds < 600) {
          dangerIndex -= 1.5;
          riskFactors.push({
             id: 'offset_hospital',
             label: 'Safety Boost: Hospital Nearby',
             score: -15,
             detail: `A medical facility is ~${Math.ceil(localCtx.hospitalETASeconds / 60)} minutes away.`,
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
  // X. ADMIN OVERRIDES
  // ==========================================
  if (adminManualPenalty > 0) {
      dangerIndex += adminManualPenalty;
      riskFactors.push({
          id: 'admin_manual_penalty',
          label: 'Admin Manual Override',
          score: adminManualPenalty * 10,
          detail: `Safety score administratively reduced by ${adminManualPenalty * 10} points due to severe local risk.`,
          trend: 'declining'
      });
  }

  // ==========================================
  // F. FINAL OUTPUT SYNTHESIS
  // ==========================================
  dangerIndex = Math.max(0, dangerIndex); // Prevent negative indices
  
  // Asymptotic Danger Curve: prevent hard-crashing to 10 (Safety Score 0) unless physically inside a mapped Critical Risk Zone
  const isCriticalRiskZone = localCtx && ['CRITICAL', 'HIGH'].includes(String(localCtx.riskZoneLevel));
  if (!isCriticalRiskZone) {
      // Soft curve only applies when danger is extremely high (> 7), preventing it from inflating low danger scores
      if (dangerIndex > 7) {
          dangerIndex = 7 + 3 * (1 - Math.exp(-(dangerIndex - 7) / 3));
      }
  } else {
      dangerIndex = Math.min(dangerIndex, 10);
  }

  let resolved = resolveAggregatorStatus(dangerIndex);
  
  // Status Cap: Never show CRITICAL_DANGER (0-10 safety) unless in a physical Risk Zone
  if (resolved.label === 'CRITICAL_DANGER' && !isCriticalRiskZone) {
      resolved.status = 'danger';
      resolved.label = 'DANGER';
      resolved.recommendation = 'Danger level detected. Avoid non-essential travel and seek a safer route.';
  }

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