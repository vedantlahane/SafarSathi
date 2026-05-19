import { redis } from '../../shared/cache/redis.js';
import { mlClient } from '../../shared/ml/client.js';
import { env } from '../../shared/config/env.js';
import { logger } from '../../shared/logger/index.js';
import { gatherContext } from './safety.context.js';
import type { SafetyContext } from './safety.context.js';
import type { SafetyCheckQuery } from './safety.schema.js';

const snapToCell = (lat: number, lon: number): string => `${lat.toFixed(2)}:${lon.toFixed(2)}`;

export const safetyService = {
  async check(input: SafetyCheckQuery) {
    const now = new Date();
    const currentHour = input.hour ?? now.getHours();
    const networkType = input.networkType || '4g';
    const weatherSeverity = input.weatherSeverity ?? 0;
    const airQualityIndex = input.aqi ?? 50;

    const cacheKey = [
      'safety',
      snapToCell(input.lat, input.lon),
      currentHour,
      networkType,
      Math.round(weatherSeverity / 10),
      Math.round(airQualityIndex / 50),
    ].join(':');

    const cached = await redis.get(cacheKey).catch(() => null);
    if (cached) {
      try {
        return { ...JSON.parse(cached), cached: true };
      } catch {
        /* fall through */
      }
    }

    return gatherContext(input.lat, input.lon, input);
  },

  async synthesize(input: SafetyCheckQuery, ctx: SafetyContext & { district?: string | undefined }) {
    const now = new Date();
    const currentHour = input.hour ?? now.getHours();
    const lat = input.lat;
    const lon = input.lon;

    logger.info({ lat, lon, currentHour }, 'Starting safety check risk synthesis');

    let E_hist = 0;
    let baseViirs = 0;
    let village = 'Unknown';
    let districtName = ctx.district || 'Unknown';
    let isAnomaly = false;
    let isUnlit = false;
    let isNight = currentHour < 6 || currentHour > 19;
    let socioTemporalPenaltyActive = false;
    let mlApiUsed = false;
    let modelVersion = 'unknown';

    // 1. Call Python ML engine
    if (env.ML_API_URL) {
      try {
        const ml = await mlClient.evaluate({
          lat,
          lon,
          local_hour: currentHour,
        });

        if (ml) {
          const status = ml.historicalStatus;
          if (status === 'PERSISTENT_HAZARD') {
            E_hist = 25;
          } else if (status === 'EMERGING') {
            E_hist = 15;
          } else {
            E_hist = 0;
          }
          baseViirs = ml.baseViirs;
          village = ml.village;
          if (ml.district && ml.district !== 'Unknown') {
            districtName = ml.district;
          }
          isAnomaly = ml.isAnomaly;
          isUnlit = ml.isUnlit;
          isNight = ml.isNight;
          socioTemporalPenaltyActive = ml.socioTemporalPenaltyActive;
          mlApiUsed = true;
          modelVersion = '10.0.0';
          logger.info({ village, districtName, historicalStatus: ml.historicalStatus }, 'Python ML engine evaluated successfully');
        } else {
          logger.warn('Python ML engine returned empty response');
        }
      } catch (err) {
        logger.error({ err }, 'Python ML engine offline or failed during evaluation');
      }
    } else {
      logger.warn('ML_API_URL not configured');
    }

    // 2. Fetch Air Quality (E_live)
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
        logger.info({ pm25, pm10, E_live }, 'Air quality fetched successfully');
      } else {
        logger.warn({ status: aqiRes.status }, 'Air quality api returned non-ok status');
      }
    } catch (err) {
      logger.error({ err }, 'Air quality api failed');
    }

    // 3. Fetch Weather Alert (W_live)
    let W_live = 0;
    let imdStatus = '1';
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
            }
            logger.info({ districtName, code, W_live }, 'IMD weather warning found');
          } else {
            logger.info({ districtName }, 'No IMD weather warning found for district');
          }
        }
      } else {
        logger.warn({ status: weatherRes.status }, 'IMD weather api returned non-ok status');
      }
    } catch (err) {
      logger.error({ err }, 'IMD weather api failed');
    }

    // 4. Calculate socio-temporal penalty (S_infra * C_human)
    let socioTemporalPenalty = 0;
    if (mlApiUsed) {
      if (socioTemporalPenaltyActive) {
        socioTemporalPenalty = 15;
      }
    } else {
      if (isNight) {
        socioTemporalPenalty = 15;
      }
    }

    // 5. Placeholders for traffic and crowd
    const T_traffic = 0;
    const C_crowd = 0;

    // 6. Risk Synthesis Equation
    const Risk_total = Math.max(E_hist, E_live) + W_live + socioTemporalPenalty + T_traffic + C_crowd;
    const overallScore = Math.max(0, Math.min(100, Math.round(100 - Risk_total)));

    // Determine status
    let status: 'safe' | 'caution' | 'danger' = 'safe';
    if (overallScore >= 70) {
      status = 'safe';
    } else if (overallScore >= 45) {
      status = 'caution';
    } else {
      status = 'danger';
    }

    const riskLabel = status === 'safe' ? 'Low Risk' : status === 'caution' ? 'Caution' : 'High Danger';

    // Factors
    const factors: any[] = [];
    const factorLabels: string[] = [];

    if (E_hist > 0) {
      const label = 'Historical Risk';
      factors.push({
        label,
        score: E_hist,
        trend: 'stable',
        detail: `Inside historical high risk area (Status: ${E_hist === 25 ? 'PERSISTENT_HAZARD' : 'EMERGING'}).`,
      });
      factorLabels.push(label);
    }

    if (E_live > 0) {
      const label = 'Poor Air Quality';
      factors.push({
        label,
        score: E_live,
        trend: 'stable',
        detail: `High PM2.5 level (${pm25} µg/m³) exceeding the safe threshold.`,
      });
      factorLabels.push(label);
    }

    if (W_live > 0) {
      const label = 'Severe Weather Alert';
      factors.push({
        label,
        score: W_live,
        trend: 'stable',
        detail: `IMD issued Orange or Red weather warning (Status code: ${imdStatus}).`,
      });
      factorLabels.push(label);
    }

    if (socioTemporalPenalty > 0) {
      const label = 'Unlit Night Environment';
      factors.push({
        label,
        score: socioTemporalPenalty,
        trend: 'stable',
        detail: `Socio-temporal risk active: Nighttime in an unlit area.`,
      });
      factorLabels.push(label);
    }

    const dangerScore = Number(((100 - overallScore) / 100).toFixed(4));

    // Recommendations
    let recommendation = 'Conditions are favourable — enjoy your visit!';
    if (status === 'danger') {
      recommendation = 'Danger level detected. Leave this area or seek shelter immediately.';
    } else if (status === 'caution') {
      recommendation = 'Stay aware of your surroundings and keep emergency contacts ready.';
    }

    const result = {
      overallScore,
      dangerScore,
      status,
      riskLabel,
      cappedBy: null,
      recommendation,
      isNearAdminZone: ctx.inRiskZone,
      factors,
      factorLabels,
      forecast: [],
      anomaly: isAnomaly ? { detected: true } : null,
      scoringSource: mlApiUsed ? 'ml_v2' : 'phase1_fallback',
      mlApiConfigured: Boolean(env.ML_API_URL),
      mlApiUsed,
      modelVersion,
    };

    // Cache the result
    const cacheKey = [
      'safety',
      snapToCell(lat, lon),
      currentHour,
      input.networkType || '4g',
      Math.round((input.weatherSeverity ?? 0) / 10),
      Math.round((input.aqi ?? 50) / 50),
    ].join(':');

    await redis.setex(cacheKey, 60, JSON.stringify(result)).catch(() => undefined);

    logger.info({ overallScore, status }, 'Safety check risk synthesis completed successfully');

    return { ...result, cached: false };
  }
};
