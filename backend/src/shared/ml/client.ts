import { env } from '../config/env.js';
import { logger } from '../logger/index.js';

export interface SafetyEvaluateRequest {
  lat: number;
  lon: number;
  local_hour: number;
  network_type?: string;
  weather_severity?: number;
  aqi?: number;
}

export interface FactorItem {
  label: string;
  score: number;
  detail: string;
}

export interface ForecastPoint {
  horizon_hours: number;
  safety_score: number;
  danger_score: number;
  status: string;
  rationale: string;
}

export interface AnomalyResult {
  detected: boolean;
  severity?: string;
  score?: number;
  contributing_features: string[];
  explanation?: string;
}

export interface SafetyEvaluateResponse {
  safety_score: number;
  danger_score: number;
  status: 'safe' | 'caution' | 'danger';
  recommendation: string;
  prediction_confidence: number;
  factors: FactorItem[];
  forecast: ForecastPoint[];
  anomaly?: AnomalyResult;
  incident_class?: string;
  recommended_alert_action: string;
  model_version: string;
  source: string;
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
      
      const payload = await res.json() as any;
      if (!payload || typeof payload !== 'object') {
        return null;
      }

      if (payload.status === "OUT_OF_BOUNDS") {
        logger.info('ML returned OUT_OF_BOUNDS (outside Punjab); triggering fallback');
        return null;
      }

      if (payload.status !== "SUCCESS") {
        logger.warn({ status: payload.status }, 'ML returned non-success status');
        return null;
      }

      const mlBaseline = payload.ml_baseline || {};
      const infrastructure = payload.infrastructure || {};
      const spatial = payload.spatial_context || {};

      const isAnomaly = mlBaseline.is_anomaly === true;
      const penaltyActive = infrastructure.socio_temporal_penalty_active === true;
      const village = typeof spatial.village === "string" ? spatial.village : "Unknown";
      const district = typeof spatial.district === "string" ? spatial.district : "Unknown";

      let dangerScore = 0.1;
      let safetyScore = 90;
      let status: 'safe' | 'caution' | 'danger' = 'safe';
      let recommendation = 'Low risk detected. Enjoy your time.';
      let cappedBy = null;
      const factors: FactorItem[] = [];

      if (mlBaseline.status === "UNMAPPED_TERRAIN") {
        recommendation = 'Location unmapped by AI. Relying on baseline metrics.';
        factors.push({ label: 'Terrain', score: 50, detail: 'Unmapped terrain.' });
      } else if (isAnomaly) {
        dangerScore = 0.85;
        safetyScore = 15;
        status = 'danger';
        recommendation = `High risk anomaly detected in ${village}. Remain vigilant.`;
        cappedBy = 'ML_ANOMALY';
        factors.push({ label: 'Historical Anomaly', score: 85, detail: 'Location flagged as anomalous based on historical incident data.' });
      } else if (penaltyActive) {
        dangerScore = 0.6;
        safetyScore = 40;
        status = 'caution';
        recommendation = 'Low visibility at night. Exercise caution.';
        cappedBy = 'INFRASTRUCTURE_PENALTY';
        factors.push({ label: 'Low Nightlight', score: 60, detail: 'Area has very low ambient lighting during nighttime hours.' });
      } else {
        factors.push({ label: 'Normal Conditions', score: 10, detail: 'Location aligns with normal historical patterns.' });
      }

      const nightlightScore = typeof infrastructure.viirs_nightlight_score === 'number'
        ? infrastructure.viirs_nightlight_score : 1.0;

      factors.push({
        label: 'Nightlight Score',
        score: Math.max(0, Math.min(100, Math.round(nightlightScore * 10))),
        detail: `Raw VIIRS score: ${nightlightScore}`
      });

      const response: SafetyEvaluateResponse = {
        safety_score: safetyScore,
        danger_score: dangerScore,
        status,
        recommendation,
        prediction_confidence: 0.8,
        factors,
        forecast: [],
        anomaly: {
          detected: isAnomaly,
          severity: isAnomaly ? 'High' : 'Low',
          contributing_features: isAnomaly ? ['historical_hazard'] : [],
          explanation: isAnomaly ? `Historical incident pattern flagged in ${village}, ${district}.` : ''
        },
        recommended_alert_action: isAnomaly ? 'alert_admin' : 'wait',
        model_version: '10.0.0',
        source: 'punjab_geo_engine'
      };

      return response;
    } catch (e) {
      logger.warn({ err: (e as Error).message }, 'ML evaluate failed; falling back');
      return null;
    }
  }
}

export const mlClient = new MlClient();