import { request } from "./client";
import type {
    ApiResponse,
    TouristDashboard,
    PoliceDepartment,
    HospitalResponse,
    TravelAdvisory,
    RealTimeSafety,
    RealTimeSafetyFactor,
} from "./types";

const REALTIME_SAFETY_FALLBACK: RealTimeSafety = {
    dangerScore: 0.0,
    isNearAdminZone: false,
    recommendation: "Scanning...",
    riskLabel: "Low Risk",
    scanning: true,
};

function clampDangerScore(value: number): number {
    if (!Number.isFinite(value)) {
        return 0.0;
    }
    if (value < 0) {
        return 0.0;
    }
    if (value > 1) {
        return 1.0;
    }
    return value;
}

function deriveRiskLabel(dangerScore: number): RealTimeSafety["riskLabel"] {
    if (dangerScore > 0.7) {
        return "High Danger";
    }
    if (dangerScore >= 0.3) {
        return "Caution";
    }
    return "Low Risk";
}

function getDangerScoreFromNode(node: unknown): number | null {
    if (!node || typeof node !== "object") {
        return null;
    }

    const candidate = node as Record<string, unknown>;
    const dangerRaw = candidate.dangerScore ?? candidate.danger_score;
    if (typeof dangerRaw === "number") {
        return clampDangerScore(dangerRaw);
    }

    // V2 ML Schema returns safety_score (0-100). Convert to dangerScore (0.0-1.0)
    const safetyRaw = candidate.safetyScore ?? candidate.safety_score;
    if (typeof safetyRaw === "number") {
        return clampDangerScore(1.0 - (safetyRaw / 100.0));
    }

    return null;
}

const VALID_TRENDS = ["up", "down", "stable"] as const;
type Trend = (typeof VALID_TRENDS)[number];

function isValidTrend(v: unknown): v is Trend {
    return VALID_TRENDS.includes(v as Trend);
}

function normalizeSafetyPayload(payload: unknown): RealTimeSafety {
    const dangerScore = getDangerScoreFromNode(payload);
    if (dangerScore === null) {
        return REALTIME_SAFETY_FALLBACK;
    }

    const node = (payload ?? {}) as Record<string, unknown>;
    const riskLabel =
        typeof node.riskLabel === "string"
            ? (node.riskLabel as RealTimeSafety["riskLabel"])
            : deriveRiskLabel(dangerScore);

    const recommendation =
        typeof node.recommendation === "string" && node.recommendation.trim().length > 0
            ? node.recommendation
            : riskLabel === "High Danger"
                ? "High risk activity likely nearby. Consider rerouting immediately."
                : riskLabel === "Caution"
                    ? "Proceed with caution and stay aware of your surroundings."
                    : "Low risk detected. Continue with normal precautions.";

    // Phase 1 enrichments (optional — absent when served by legacy Python model)
    const rawFactors = Array.isArray(node.factors) ? node.factors : undefined;
    const rawRiskFactors = Array.isArray(node.risk_factors) ? node.risk_factors : undefined;
    
    let factors: RealTimeSafetyFactor[] | undefined = undefined;

    if (rawFactors) {
        factors = rawFactors
            .filter(
                (f): f is Record<string, unknown> =>
                    f !== null && typeof f === "object"
            )
            .map((f) => ({
                label: typeof f.label === "string" ? f.label : "Unknown",
                score: typeof f.score === "number" ? f.score : 50,
                trend: isValidTrend(f.trend) ? f.trend : "stable",
                detail: typeof f.detail === "string" ? f.detail : undefined,
            }));
    } else if (rawRiskFactors) {
        factors = rawRiskFactors.map(rf => {
            if (rf !== null && typeof rf === "object") {
                const rfo = rf as Record<string, unknown>;
                return {
                    label: typeof rfo.label === "string" ? rfo.label : typeof rfo.id === "string" ? rfo.id : "Risk Factor",
                    score: typeof rfo.score === "number" ? rfo.score : (dangerScore * 100) || 50,
                    trend: isValidTrend(rfo.trend) ? rfo.trend : "stable",
                    detail: typeof rfo.detail === "string" ? rfo.detail : undefined,
                };
            }
            return {
                label: typeof rf === "string" ? rf : "Risk Factor",
                score: (dangerScore * 100) || 50,
                trend: "stable",
                detail: typeof rf === "string" ? rf : undefined,
            };
        });
    }

    const overallScore =
        typeof node.overallScore === "number" ? node.overallScore : undefined;
    const status =
        (["safe", "caution", "danger"] as const).includes(
            node.status as "safe" | "caution" | "danger"
        )
            ? (node.status as "safe" | "caution" | "danger")
            : undefined;
    const cappedBy =
        typeof node.cappedBy === "string" ? node.cappedBy : null;

    const rawAnomaly = node.anomaly as Record<string, unknown> | undefined;
    const anomaly = rawAnomaly ? {
        detected: Boolean(rawAnomaly.detected),
        severity: typeof rawAnomaly.severity === "string" ? rawAnomaly.severity : "Low",
        explanation: typeof rawAnomaly.explanation === "string" ? rawAnomaly.explanation : ""
    } : undefined;

    return {
        dangerScore,
        isNearAdminZone: Boolean(node.isNearAdminZone),
        recommendation,
        riskLabel,
        scanning: false,
        overallScore,
        status,
        cappedBy,
        factors,
        anomaly,
    };
}

export async function fetchPublicRiskZones() {
    return request<TouristDashboard["riskZones"]>("/api/risk-zones/active");
}

export async function fetchPoliceDepartments() {
    return request<PoliceDepartment[]>("/api/police-stations");
}

export async function fetchHospitals() {
    return request<HospitalResponse[]>("/api/hospitals");
}

export async function fetchCurrentAdvisories() {
    return request<TravelAdvisory[]>("/api/advisories/current");
}

export async function fetchRealTimeSafety(lat: number, lon: number) {
    const local_hour = new Date().getHours();
    try {
        const response = await request<ApiResponse<unknown> | unknown>(
            "/api/v1/safety/evaluate",
            {
                method: "POST",
                body: JSON.stringify({ lat, lon, local_hour })
            }
        );

        if (response && typeof response === "object") {
            const wrapped = response as Record<string, unknown>;
            if ("success" in wrapped || "danger_score" in wrapped) {
                // If it's already unwrapped by client.ts
                return normalizeSafetyPayload(wrapped);
            }
        }

        return normalizeSafetyPayload(response);
    } catch {
        return REALTIME_SAFETY_FALLBACK;
    }
}

export async function fetchNearbyHospitals(lat: number, lng: number, radiusKm = 10) {
    return request<HospitalResponse[]>(
        `/api/hospitals/nearby?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}`
    );
}

// Tourist POI types from OSM
export type TouristPOIType =
    | "gurudwara" | "temple" | "mosque" | "church"
    | "attraction" | "monument" | "museum" | "fort"
    | "hotel" | "tourist_info" | "fire_station" | "pharmacy";

export interface TouristPOI {
    _id: string;
    osmId: number;
    name: string;
    type: TouristPOIType;
    latitude: number;
    longitude: number;
    city: string;
    district: string;
    state: string;
    phone?: string;
    website?: string;
    openingHours?: string;
    description?: string;
    isActive: boolean;
}

export async function fetchTouristPOIs(types?: TouristPOIType[]): Promise<TouristPOI[]> {
    const params = types?.length ? `?type=${types.join(",")}` : "";
    const res = await request<{ ok: boolean; data: TouristPOI[] }>(`/api/tourist-pois${params}`);
    return (res as any)?.data ?? (Array.isArray(res) ? res : []);
}
