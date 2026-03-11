import { request } from "./client";
import type {
    TouristRegistrationPayload,
    TouristProfile,
    TouristDashboard,
    LocationPayload,
    SOSPayload,
    SOSResponse,
} from "./types";

export async function registerTourist(payload: TouristRegistrationPayload) {
    return request<{
        touristId: string;
        token: string;
        user: TouristProfile;
        qr_content: string;
    }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function loginTourist(payload: {
    email: string;
    password: string;
}) {
    return request<{
        touristId: string;
        token: string;
        user: TouristProfile;
        qr_content: string;
    }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function fetchTouristProfile(touristId: string) {
    return request<TouristProfile>(
        `/api/auth/profile/${encodeURIComponent(touristId)}`
    );
}

export async function updateTouristProfile(
    touristId: string,
    payload: Partial<TouristProfile>
) {
    return request<TouristProfile>(
        `/api/auth/profile/${encodeURIComponent(touristId)}`,
        {
            method: "PUT",
            body: JSON.stringify(payload),
        }
    );
}

export async function fetchTouristDashboard(touristId: string) {
    return request<TouristDashboard>(
        `/api/tourist/${encodeURIComponent(touristId)}/dashboard`
    );
}

export async function postLocation(
    touristId: string,
    payload: LocationPayload
) {
    return request<void>(
        `/api/action/location/${encodeURIComponent(touristId)}`,
        {
            method: "POST",
            body: JSON.stringify(payload),
        }
    );
}

export async function postSOS(
    touristId: string,
    payload: SOSPayload
) {
    return request<SOSResponse>(
        `/api/action/sos/${encodeURIComponent(touristId)}`,
        {
            method: "POST",
            body: JSON.stringify(payload),
        }
    );
}

export async function postPreAlert(
    touristId: string,
    payload: { lat?: number; lng?: number }
) {
    return request<SOSResponse>(
        `/api/action/sos/${encodeURIComponent(touristId)}/pre-alert`,
        {
            method: "POST",
            body: JSON.stringify(payload),
        }
    );
}

export async function cancelSOSAlert(alertId: number) {
    return request<{ status: string; alertId: number; alertStatus: string }>(
        `/api/action/sos/${alertId}/cancel`,
        { method: "POST" }
    );
}

export async function getSOSAlertStatus(alertId: number) {
    return request<{
        alertId: number;
        status: string;
        priority: string;
        escalationLevel: number;
        nearestStationId?: string;
        resolvedBy?: string;
        resolvedAt?: string;
        createdAt?: string;
    }>(`/api/action/sos/${alertId}/status`);
}
