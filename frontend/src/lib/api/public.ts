import { request } from "./client";
import type {
    ApiResponse,
    TouristDashboard,
    PoliceDepartment,
    HospitalResponse,
    TravelAdvisory,
    RealTimeSafety,
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
    const raw = candidate.dangerScore ?? candidate.danger_score;
    if (typeof raw === "number") {
        return clampDangerScore(raw);
    }
    return null;
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

    return {
        dangerScore,
        isNearAdminZone: Boolean(node.isNearAdminZone),
        recommendation,
        riskLabel,
        scanning: false,
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
    const hour = new Date().getHours();
    const params = new URLSearchParams({
        lat: String(lat),
        lon: String(lon),
        hour: String(hour),
    });

    try {
        const response = await request<ApiResponse<unknown> | unknown>(
            `/api/v1/safety/check?${params.toString()}`
        );

        if (response && typeof response === "object" && "success" in response) {
            const wrapped = response as ApiResponse<unknown>;
            if (!wrapped.success || wrapped.data == null) {
                return REALTIME_SAFETY_FALLBACK;
            }
            return normalizeSafetyPayload(wrapped.data);
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
