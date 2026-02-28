import { request } from "./client";
import type {
    TouristDashboard,
    PoliceDepartment,
    HospitalResponse,
    TravelAdvisory,
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

export async function fetchCurrentAdvisories() {
    return request<TravelAdvisory[]>("/api/advisories/current");
}

export async function fetchNearbyHospitals(lat: number, lng: number, radiusKm = 10) {
    return request<HospitalResponse[]>(
        `/api/hospitals/nearby?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}`
    );
}
