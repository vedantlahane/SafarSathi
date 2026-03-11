import { request } from "./client";
import type {
    PoliceDepartment,
    RiskZone,
    HospitalResponse,
    TravelAdvisory,
    AuditLogPage,
    AdminDashboardState,
} from "./types";

/* ─── Auth ─────────────────────────────────────────────── */

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

/* ─── Dashboard ────────────────────────────────────────── */

export async function fetchAdminDashboard() {
    return request<AdminDashboardState>("/api/admin/dashboard/state");
}

/* ─── Alerts ───────────────────────────────────────────── */

export async function fetchAdminAlerts() {
    return request<
        Array<{
            id: number;
            touristId?: string;
            alertType: string;
            status: string;
            createdTime: string;
            message?: string;
            priority?: string;
            escalationLevel?: number;
            responseTimeMs?: number;
            preAlertTriggered?: boolean;
            assignedUnit?: string;
            nearestStationId?: string;
            resolvedBy?: string;
            cancelledAt?: string;
            media?: string[];
        }>
    >("/api/admin/alerts/all");
}

export async function resolveAlert(
    alertId: number,
    status: string,
    resolvedBy?: string
) {
    return request(`/api/admin/alerts/${alertId}/status`, {
        method: "POST",
        body: JSON.stringify({ status, resolvedBy }),
    });
}

export async function assignAlertUnit(alertId: number, unit: string) {
    return request(`/api/admin/alerts/${alertId}/assign`, {
        method: "POST",
        body: JSON.stringify({ assignedUnit: unit }),
    });
}

/* ─── Tourists ─────────────────────────────────────────── */

export async function fetchAdminTourists() {
    return request<
        Array<{
            id: string;
            name: string;
            status?: string;
            safetyScore?: number;
            lastSeen?: string;
            isActive?: boolean;
            travelType?: string;
            speed?: number;
            heading?: number;
        }>
    >("/api/admin/tourists");
}

/* ─── Risk Zones ───────────────────────────────────────── */

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

/* ─── Police Departments ───────────────────────────────── */

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

/* ─── Hospitals (Admin CRUD) ───────────────────────────── */

export async function fetchAdminHospitals() {
    return request<HospitalResponse[]>("/api/admin/hospitals");
}

export async function createHospital(
    payload: Omit<HospitalResponse, "id" | "createdAt" | "updatedAt">
) {
    return request<HospitalResponse>("/api/admin/hospitals", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function updateHospital(
    id: string,
    payload: Partial<HospitalResponse>
) {
    return request<HospitalResponse>(
        `/api/admin/hospitals/${encodeURIComponent(id)}`,
        {
            method: "PUT",
            body: JSON.stringify(payload),
        }
    );
}

export async function deleteHospital(id: string) {
    return request<void>(
        `/api/admin/hospitals/${encodeURIComponent(id)}`,
        { method: "DELETE" }
    );
}

export async function findNearbyHospitals(lat: number, lng: number, radiusKm = 10) {
    return request<HospitalResponse[]>(
        `/api/hospitals/nearby?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}`
    );
}

/* ─── Travel Advisories (Admin CRUD) ──────────────────── */

export async function fetchAdminAdvisories() {
    return request<TravelAdvisory[]>("/api/admin/advisories");
}

export async function createAdvisory(
    payload: Omit<TravelAdvisory, "id" | "createdAt" | "updatedAt">
) {
    return request<TravelAdvisory>("/api/admin/advisories", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function updateAdvisory(
    id: string,
    payload: Partial<TravelAdvisory>
) {
    return request<TravelAdvisory>(
        `/api/admin/advisories/${encodeURIComponent(id)}`,
        {
            method: "PUT",
            body: JSON.stringify(payload),
        }
    );
}

export async function deleteAdvisory(id: string) {
    return request<void>(
        `/api/admin/advisories/${encodeURIComponent(id)}`,
        { method: "DELETE" }
    );
}

/* ─── Audit Logs ───────────────────────────────────────── */

export async function fetchAuditLogs(
    page = 1,
    limit = 50,
    filters?: {
        action?: string;
        performedBy?: string;
        entityType?: string;
        startDate?: string;
        endDate?: string;
    }
) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filters?.action) params.set("action", filters.action);
    if (filters?.performedBy) params.set("performedBy", filters.performedBy);
    if (filters?.entityType) params.set("entityType", filters.entityType);
    if (filters?.startDate) params.set("startDate", filters.startDate);
    if (filters?.endDate) params.set("endDate", filters.endDate);
    return request<AuditLogPage>(`/api/admin/audit-logs?${params.toString()}`);
}

/* ─── Broadcast ────────────────────────────────────────── */

export async function sendBroadcast(payload: {
    title: string;
    message: string;
    target?: "all" | "zone" | "district";
    priority?: "low" | "medium" | "high" | "critical";
    zoneId?: string;
    district?: string;
}) {
    return request<{ success: boolean; recipientCount: number }>(
        "/api/admin/broadcast",
        {
            method: "POST",
            body: JSON.stringify(payload),
        }
    );
}

/* ─── Digital ID Verification ──────────────────────────── */

export async function verifyDigitalId(hash: string) {
    return request<{
        valid: boolean;
        name: string;
        passport_partial: string;
        id_expiry: string;
        blockchain_status: string;
    }>(`/api/admin/id/verify?hash=${encodeURIComponent(hash)}`);
}
