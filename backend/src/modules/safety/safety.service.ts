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
