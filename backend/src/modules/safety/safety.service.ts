import { redis } from '../../shared/cache/redis.js';
import { mlClient } from '../../shared/ml/client.js';
import { env } from '../../shared/config/env.js';
import { logger } from '../../shared/logger/index.js';
import { externalApiService } from './external-api.service.js';
import type { SafetyContext } from './safety.context.js';
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

async function buildMasterAggregator(input: SafetyEvaluateBody) {
  const cacheKey = ['safety-evaluate', snapToCell(input.lat, input.lon), input.local_hour].join(':');
  const cached = await redis.get(cacheKey).catch(() => null);
  if (cached) {
    try {
      return { ...JSON.parse(cached), cached: true };
    } catch {
      // fall through to live aggregation
    }
  }

  const mlData = await externalApiService.fetchMlBaseline(input.lat, input.lon, input.local_hour);

  if (mlData.status === 'OUT_OF_BOUNDS') {
    return {
      success: true,
      danger_index: 0,
      danger_score: 0,
      safety_score: 100,
      overallScore: 100,
      status: 'safe' as const,
      status_label: 'SAFE' as const,
      riskLabel: 'Low Risk',
      recommendation: 'Outside Punjab.',
      spatial_context: mlData.spatial_context ?? null,
      risk_factors: ['Outside Punjab'],
      source: 'master_aggregator',
      cached: false,
    };
  }

  const district = String(mlData.spatial_context && typeof mlData.spatial_context === 'object' ? (mlData.spatial_context as Record<string, unknown>).district ?? 'Unknown' : 'Unknown');

  const [aqiData, imdData] = await Promise.all([
    externalApiService.fetchLiveAqi(input.lat, input.lon),
    externalApiService.fetchLiveImdWarning(district),
  ]);

  let dangerIndex = 0;
  const riskFactors: string[] = [];

  let mlHazardScore = 0;
  const mlBaseline = mlData.ml_baseline as Record<string, unknown> | null | undefined;
  if (mlBaseline?.status === 'PERSISTENT_HAZARD') {
    mlHazardScore = 4;
    riskFactors.push('Historical Environmental Decay');
  } else if (mlBaseline?.status === 'EMERGING_HAZARD') {
    mlHazardScore = 2;
    riskFactors.push('Emerging Environmental Pressure');
  }

  let aqiScore = 0;
  const currentAqi = aqiData as Record<string, unknown>;
  const pm25 = extractPmValue(currentAqi.pm2_5);
  const pm10 = extractPmValue(currentAqi.pm10);

  if (pm25 > 100 || pm10 > 200) {
    aqiScore = 6;
    riskFactors.push(`Toxic Air Quality (PM2.5: ${pm25})`);
  } else if (pm25 > 60) {
    aqiScore = 3;
    riskFactors.push('Poor Air Quality');
  }

  dangerIndex += Math.max(mlHazardScore, aqiScore);

  const infrastructure = mlData.infrastructure as Record<string, unknown> | null | undefined;
  if (infrastructure?.socio_temporal_penalty_active === true) {
    dangerIndex += 3;
    riskFactors.push('Unlit Zone at Night');
  }

  if (imdData && ['3', '4'].includes(String(imdData.Day1_Color))) {
    dangerIndex += 5;
    const hazardCode = String(imdData?.Day_1 ?? '').split(',').at(0)?.trim() ?? '';
    riskFactors.push(`IMD SEVERE ALERT: ${IMD_WARNING_MAP[hazardCode] || 'Weather Hazard'}`);
  }

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
    spatial_context: mlData.spatial_context ?? null,
    risk_factors: riskFactors,
    ml_baseline: mlBaseline ?? null,
    infrastructure: mlData.infrastructure ?? null,
    live_aqi: aqiData,
    live_imd: imdData,
    source: 'master_aggregator',
    cached: false,
  };

  await redis.setex(cacheKey, 60, JSON.stringify(result)).catch(() => undefined);
  return result;
}

export const safetyService = {
  async evaluate(input: SafetyEvaluateBody) {
    return buildMasterAggregator(input);
  },

  async check(input: SafetyCheckQuery) {
    const localHour = input.hour ?? new Date().getHours();
    return buildMasterAggregator({ lat: input.lat, lon: input.lon, local_hour: localHour });
  },

  async synthesize(input: SafetyCheckQuery, ctx: SafetyContext & { district?: string | undefined }) {
    const now = new Date();
    const currentHour = input.hour ?? now.getHours();
    const lat = input.lat;
    const lon = input.lon;

    logger.info({ lat, lon, currentHour }, 'Starting safety check risk synthesis');

    // 1. Fetch Air Quality
    let pm25 = 0;
    let pm10 = 0;
    let E_live = 0;
    try {
      const aqiRes = await fetch(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm2_5,pm10`
      );
      if (aqiRes.ok) {
        const aqiData = (await aqiRes.json()) as any;
        pm25 = aqiData?.current?.pm2_5 ?? 0;
        pm10 = aqiData?.current?.pm10 ?? 0;
        if (pm25 > 60) {
          E_live = 15;
        }
      }
    } catch (err) {
      logger.error({ err }, 'Air quality api failed');
    }

    // 2. Fetch Weather Alert
    let W_live = 0;
    let imdStatus = '1';
    let districtName = ctx.district || 'Unknown';
    let weatherSeverity = 20; // Default baseline
    try {
      const weatherRes = await fetch('https://api.imd.gov.in/api/v1/districtwarning');
      if (weatherRes.ok) {
        const weatherData = (await weatherRes.json()) as any;
        if (Array.isArray(weatherData)) {
          const warning = weatherData.find((w: any) =>
            w.district && districtName && w.district.toLowerCase().trim() === districtName.toLowerCase().trim()
          );
          if (warning) {
            const code = Number(warning.code ?? warning.status_code ?? warning.color_code ?? warning.color ?? 1);
            imdStatus = String(code);
            if (code === 3 || code === 4) {
              W_live = 50;
              weatherSeverity = 80; // High severity
            }
          }
        }
      }
    } catch (err) {
      logger.error({ err }, 'IMD weather api failed');
    }

    // Cache key for saving responses
    const cacheKey = [
      'safety',
      snapToCell(lat, lon),
      currentHour,
      input.networkType || '4g',
      Math.round((input.weatherSeverity ?? weatherSeverity) / 10),
      Math.round((input.aqi ?? pm25) / 50),
    ].join(':');

    // 3. Call Python ML engine (V2)
    if (env.ML_API_URL) {
      try {
        const ml = await mlClient.evaluate({
          lat,
          lon,
          local_hour: currentHour,
          network_type: input.networkType || '4g',
          weather_severity: input.weatherSeverity ?? weatherSeverity,
          aqi: input.aqi ?? pm25,
        });

        if (ml) {
          logger.info({ lat, lon }, 'Python ML engine returned V2 safety payload');
          const result = { ...ml, cached: false };
          await redis.setex(cacheKey, 60, JSON.stringify(result)).catch(() => undefined);
          return result;
        }
      } catch (err) {
        logger.error({ err }, 'Python ML engine offline or failed during evaluation');
      }
    }

    logger.warn('Falling back to legacy rule-based safety calculator');

    // 4. Legacy Fallback Calculator
    let E_hist = 0;
    let isNight = currentHour < 6 || currentHour > 19;
    let socioTemporalPenalty = isNight ? 15 : 0;
    const T_traffic = 0;
    const C_crowd = 0;

    const Risk_total = Math.max(E_hist, E_live) + W_live + socioTemporalPenalty + T_traffic + C_crowd;
    const overallScore = Math.max(0, Math.min(100, Math.round(100 - Risk_total)));

    let status: 'safe' | 'caution' | 'danger' = 'safe';
    if (overallScore >= 70) status = 'safe';
    else if (overallScore >= 45) status = 'caution';
    else status = 'danger';

    const riskLabel = status === 'safe' ? 'Low Risk' : status === 'caution' ? 'Caution' : 'High Danger';

    const factors: any[] = [];
    if (E_live > 0) {
      factors.push({
        label: 'Poor Air Quality',
        score: E_live,
        detail: `High PM2.5 level (${pm25} µg/m³) exceeding the safe threshold.`,
      });
    }
    if (W_live > 0) {
      factors.push({
        label: 'Severe Weather Alert',
        score: W_live,
        detail: `IMD issued Orange or Red weather warning (Status code: ${imdStatus}).`,
      });
    }
    if (socioTemporalPenalty > 0) {
      factors.push({
        label: 'Unlit Night Environment',
        score: socioTemporalPenalty,
        detail: `Socio-temporal risk active: Nighttime in an unlit area.`,
      });
    }

    const dangerScore = Number(((100 - overallScore) / 100).toFixed(4));
    let recommendation = 'Conditions are favourable — enjoy your visit!';
    if (status === 'danger') recommendation = 'Danger level detected. Leave this area or seek shelter immediately.';
    else if (status === 'caution') recommendation = 'Stay aware of your surroundings and keep emergency contacts ready.';

    const result = {
      safety_score: overallScore,
      danger_score: dangerScore,
      status,
      riskLabel,
      recommendation,
      prediction_confidence: 0.1,
      factors,
      forecast: [],
      recommended_alert_action: 'wait',
      model_version: 'fallback',
      source: 'fallback',
    };

    await redis.setex(cacheKey, 60, JSON.stringify(result)).catch(() => undefined);
    return { ...result, cached: false };
  }
};
