import { request } from "./client";
import type {
    TouristDashboard,
    PoliceDepartment,
    HospitalResponse,
} from "./types";

export async function fetchPublicRiskZones() {
    return request<TouristDashboard["riskZones"]>("/api/risk-zones/active");
}

export async function fetchPoliceDepartments() {
    return request<PoliceDepartment[]>("/api/police-stations");
}

export async function fetchHospitals() {
    return request<HospitalResponse[]>("/api/hospitals");
}
