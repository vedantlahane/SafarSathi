import { env } from '../config/env.js';
import { logger } from '../logger/index.js';

export interface SafetyEvaluateRequest {
  lat: number;
  lon: number;
  local_hour: number;
}

export interface SafetyEvaluateResponse {
  historicalStatus: string;
  baseViirs: number;
  village: string;
  district: string;
  isAnomaly: boolean;
  isUnlit: boolean;
  isNight: boolean;
  socioTemporalPenaltyActive: boolean;
}

function normalizeMlResponse(raw: unknown): SafetyEvaluateResponse {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid ML response');
  }

  const obj = raw as Record<string, any>;
  const spatialContext = obj.spatial_context || {};
  const mlBaseline = obj.ml_baseline || {};
  const infrastructure = obj.infrastructure || {};

  return {
    historicalStatus: String(mlBaseline.status || 'NORMAL'),
    baseViirs: typeof infrastructure.viirs_nightlight_score === 'number' ? infrastructure.viirs_nightlight_score : 0,
    village: String(spatialContext.village || 'Unknown'),
    district: String(spatialContext.district || 'Unknown'),
    isAnomaly: Boolean(mlBaseline.is_anomaly),
    isUnlit: Boolean(infrastructure.is_unlit),
    isNight: Boolean(infrastructure.is_night),
    socioTemporalPenaltyActive: Boolean(infrastructure.socio_temporal_penalty_active),
  };
}

class MlClient {
  async evaluate(req: SafetyEvaluateRequest): Promise<SafetyEvaluateResponse | null> {
    const ctrl = AbortSignal.timeout(env.ML_API_TIMEOUT_MS || 2500);
    try {
      const mlReq = {
        lat: req.lat,
        lon: req.lon,
        local_hour: req.local_hour,
      };

      const res = await fetch(`${env.ML_API_URL}/safety/evaluate`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(mlReq),
        signal: ctrl,
      });

      if (!res.ok) {
        logger.warn({ status: res.status }, 'ML evaluate non-ok');
        return null;
      }
      const raw = await res.json();
      return normalizeMlResponse(raw);
    } catch (e) {
      logger.warn({ err: (e as Error).message }, 'ML evaluate failed; falling back');
      return null;
    }
  }
}

export const mlClient = new MlClient();