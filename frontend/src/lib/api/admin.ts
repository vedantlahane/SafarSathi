import { request } from "./client";
import type {
    PoliceDepartment,
    RiskZone,
    AdminDashboardState,
} from "./types";

export async function adminLogin(payload: {
    email: string;
    password: string;
}) {
    return request<{
        success: boolean;
        token: string;
        admin: {
            id: string;
            name: string;
            email: string;
            departmentCode: string;
            city: string;
            district: string;
            state: string;
        };
    }>("/api/admin/login", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function fetchAdminDashboard() {
    return request<AdminDashboardState>("/api/admin/dashboard/state");
}

export async function fetchAdminAlerts() {
    return request<
        Array<{
            id: number;
            touristId?: string;
            alertType: string;
            status: string;
            createdTime: string;
            message?: string;
        }>
    >("/api/admin/alerts/all");
}

export async function resolveAlert(alertId: number, status: string) {
    return request(`/api/admin/alerts/${alertId}/status`, {
        method: "POST",
        body: JSON.stringify({ status }),
    });
}

export async function fetchAdminTourists() {
    return request<
        Array<{
            id: string;
            name: string;
            status?: string;
            safetyScore?: number;
            lastSeen?: string;
        }>
    >("/api/admin/tourists");
}

export async function fetchAdminRiskZones() {
    return request<RiskZone[]>("/api/admin/risk-zones");
}

export async function createAdminRiskZone(
    payload: Omit<RiskZone, "id" | "createdAt" | "updatedAt">
) {
    return request<RiskZone>("/api/admin/risk-zones", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function updateAdminRiskZone(
    id: number,
    payload: Partial<RiskZone>
) {
    return request<RiskZone>(`/api/admin/risk-zones/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export async function toggleAdminRiskZone(id: number, active: boolean) {
    return request<RiskZone>(
        `/api/admin/risk-zones/${id}/status?active=${active}`,
        { method: "PATCH" }
    );
}

export async function deleteAdminRiskZone(id: number) {
    return request<void>(`/api/admin/risk-zones/${id}`, { method: "DELETE" });
}

export async function createPoliceDepartment(
    payload: Omit<PoliceDepartment, "id">
) {
    return request<PoliceDepartment>("/api/admin/police", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function updatePoliceDepartment(
    id: string,
    payload: Partial<PoliceDepartment>
) {
    return request<PoliceDepartment>(
        `/api/admin/police/${encodeURIComponent(id)}`,
        {
            method: "PUT",
            body: JSON.stringify(payload),
        }
    );
}

export async function deletePoliceDepartment(id: string) {
    return request<void>(`/api/admin/police/${encodeURIComponent(id)}`, {
        method: "DELETE",
    });
}

export async function verifyDigitalId(hash: string) {
    return request<{
        valid: boolean;
        name: string;
        passport_partial: string;
        id_expiry: string;
        blockchain_status: string;
    }>(`/api/admin/id/verify?hash=${encodeURIComponent(hash)}`);
}
