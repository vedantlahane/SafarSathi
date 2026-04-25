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

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function clamp(value: number, low: number, high: number): number {
  return Math.max(low, Math.min(high, value));
}

function toStatus(value: unknown, safetyScore: number): SafetyStatus {
  if (value === "safe" || value === "caution" || value === "danger") {
    return value;
  }

  if (safetyScore >= 80) return "safe";
  if (safetyScore >= 50) return "caution";
  return "danger";
}

function parseFactors(raw: unknown): MlFactor[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((item) => {
      if (!isObject(item)) {
        return null;
      }

      const score = toNumber(item.score);
      if (score === null) {
        return null;
      }

      const label = typeof item.label === "string" ? item.label : "Unknown";
      const detail = typeof item.detail === "string" ? item.detail : "";

      return {
        label,
        score: clamp(score, 0, 100),
        detail,
      } as MlFactor;
    })
    .filter((item): item is MlFactor => item !== null);
}

function parseForecast(raw: unknown): MlForecastPoint[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((item) => {
      if (!isObject(item)) {
        return null;
      }

      const horizonHours = toNumber(item.horizon_hours);
      const safetyScore = toNumber(item.safety_score);
      const dangerScore = toNumber(item.danger_score);

      if (horizonHours === null || safetyScore === null || dangerScore === null) {
        return null;
      }

      const status = toStatus(item.status, safetyScore);
      const rationale = typeof item.rationale === "string" ? item.rationale : "";

      return {
        horizonHours: Math.max(1, Math.round(horizonHours)),
        safetyScore: clamp(safetyScore, 0, 100),
        dangerScore: clamp(dangerScore, 0, 1),
        status,
        rationale,
      } as MlForecastPoint;
    })
    .filter((item): item is MlForecastPoint => item !== null);
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
    const response = await fetch(`${baseUrl}/v2/predict-safety`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        features,
        forecast_hours: [1, 3, 6],
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

    const data = isObject(payload.data) ? payload.data : payload;

    let safetyScore = toNumber(data.safety_score);
    let dangerScore = toNumber(data.danger_score);

    if (safetyScore === null && dangerScore === null) {
      return null;
    }

    if (safetyScore === null && dangerScore !== null) {
      safetyScore = clamp((1 - dangerScore) * 100, 0, 100);
    }

    if (dangerScore === null && safetyScore !== null) {
      dangerScore = clamp((100 - safetyScore) / 100, 0, 1);
    }

    if (safetyScore === null || dangerScore === null) {
      return null;
    }

    const status = toStatus(data.status, safetyScore);

    return {
      safetyScore: clamp(safetyScore, 0, 100),
      dangerScore: clamp(dangerScore, 0, 1),
      status,
      recommendation:
        typeof data.recommendation === "string"
          ? data.recommendation
          : "Stay aware of your surroundings and keep emergency contacts ready.",
      cappedBy: typeof data.capped_by === "string" ? data.capped_by : null,
      environment: typeof data.environment === "string" ? data.environment : null,
      factors: parseFactors(data.factors),
      forecast: parseForecast(data.forecast),
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
