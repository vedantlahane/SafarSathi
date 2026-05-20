type SafetyStatus = "safe" | "caution" | "danger";

export interface MlFactor {
  label: string;
  score: number;
  detail: string;
}

export interface MlForecastPoint {
  horizonHours: number;
  safetyScore: number;
  dangerScore: number;
  status: SafetyStatus;
  rationale: string;
}

export interface MlPrediction {
  safetyScore: number;
  dangerScore: number;
  status: SafetyStatus;
  recommendation: string;
  cappedBy: string | null;
  environment: string | null;
  factors: MlFactor[];
  forecast: MlForecastPoint[];
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function clamp(value: number, low: number, high: number): number {
  return Math.max(low, Math.min(high, value));
}

function normalizeApiBaseUrl(apiBaseUrl: string): string {
  return apiBaseUrl.replace(/\/+$/, "");
}

export async function predictSafetyFromMl(
  features: Record<string, unknown>,
  apiBaseUrl: string,
  timeoutMs: number,
): Promise<MlPrediction | null> {
  const baseUrl = normalizeApiBaseUrl(apiBaseUrl);
  if (!baseUrl) {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, Math.max(500, timeoutMs));

  try {
    const response = await fetch(`${baseUrl}/safety/evaluate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        lat: features.latitude,
        lon: features.longitude,
        local_hour: features.hour
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return null;
    }

    const payload: unknown = await response.json();
    if (!isObject(payload)) {
      return null;
    }

    if (payload.status === "OUT_OF_BOUNDS") {
      // Out of Punjab; fallback to Node.js Phase 1 heuristics
      return null;
    }

    if (payload.status !== "SUCCESS") {
      return null;
    }

    const mlBaseline = isObject(payload.ml_baseline) ? payload.ml_baseline : {};
    const infrastructure = isObject(payload.infrastructure) ? payload.infrastructure : {};
    const spatial = isObject(payload.spatial_context) ? payload.spatial_context : {};

    const isAnomaly = mlBaseline.is_anomaly === true;
    const penaltyActive = infrastructure.socio_temporal_penalty_active === true;
    const village = typeof spatial.village === "string" ? spatial.village : "Unknown";

    let dangerScore = 0.1; 
    let safetyScore = 90;
    let status: SafetyStatus = "safe";
    let recommendation = "Low risk detected. Enjoy your time.";
    let cappedBy: string | null = null;
    const factors: MlFactor[] = [];

    if (mlBaseline.status === "UNMAPPED_TERRAIN") {
      recommendation = "Location unmapped by AI. Relying on baseline metrics.";
      factors.push({ label: "Terrain", score: 50, detail: "Unmapped terrain." });
    } else if (isAnomaly) {
      dangerScore = 0.85;
      safetyScore = 15;
      status = "danger";
      recommendation = `High risk anomaly detected in ${village}. Remain vigilant.`;
      cappedBy = "ML_ANOMALY";
      factors.push({ label: "Historical Anomaly", score: 85, detail: "Location flagged as anomalous based on historical incident data." });
    } else if (penaltyActive) {
      dangerScore = 0.6;
      safetyScore = 40;
      status = "caution";
      recommendation = "Low visibility at night. Exercise caution.";
      cappedBy = "INFRASTRUCTURE_PENALTY";
      factors.push({ label: "Low Nightlight", score: 60, detail: "Area has very low ambient lighting during nighttime hours." });
    } else {
      factors.push({ label: "Normal Conditions", score: 10, detail: "Location aligns with normal historical patterns." });
    }

    const nightlightScore = typeof infrastructure.viirs_nightlight_score === "number" 
      ? infrastructure.viirs_nightlight_score : 1.0;
    
    factors.push({
      label: "Nightlight Score",
      score: clamp(nightlightScore * 10, 0, 100),
      detail: `Raw VIIRS score: ${nightlightScore}`
    });

    return {
      safetyScore,
      dangerScore,
      status,
      recommendation,
      cappedBy,
      environment: `Village: ${village}`,
      factors,
      forecast: [],
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
