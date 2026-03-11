export type TouristRegistrationPayload = {
    name: string;
    email: string;
    phone: string;
    passportNumber: string;
    passwordHash: string;
    dateOfBirth?: string;
    address?: string;
    gender?: string;
    nationality?: string;
    emergencyContact?: { name?: string; phone?: string; relationship?: string };
    bloodType?: string;
    allergies?: string[];
    medicalConditions?: string[];
    currentLat?: number;
    currentLng?: number;
    travelType?: "solo" | "family" | "group" | "adventure";
    preferredLanguage?: string;
    visaType?: string;
    visaExpiry?: string;
};

export type TouristProfile = {
    id: string;
    name: string;
    email: string;
    phone: string;
    passportNumber: string;
    dateOfBirth?: string;
    address?: string;
    gender?: string;
    nationality?: string;
    emergencyContact?: { name?: string; phone?: string; relationship?: string };
    bloodType?: string;
    allergies?: string[];
    medicalConditions?: string[];
    safetyScore?: number;
    idHash?: string;
    idExpiry?: string;
    travelType?: string;
    preferredLanguage?: string;
    visaType?: string;
    visaExpiry?: string;
    isActive?: boolean;
    speed?: number;
    heading?: number;
    locationAccuracy?: number;
};

export type TouristAlert = {
    id: number;
    alertType: string;
    priority: string;
    status: string;
    message: string | null;
    timestamp: string;
};

export type TouristDashboard = {
    profile: TouristProfile;
    alerts: TouristAlert[];
    safetyScore: number;
    status: string;
    lastLocation: {
        lat: number | null;
        lng: number | null;
        lastSeen: string | null;
    };
    riskZones: Array<{
        id: number;
        name: string;
        description: string | null;
        centerLat: number;
        centerLng: number;
        radiusMeters: number;
        riskLevel: string | null;
        active: boolean;
        updatedAt: string | null;
    }>;
    openAlerts: number;
    blockchainLogs: Array<{
        id: string;
        transactionId: string;
        status: string;
        timestamp: string;
    }>;
};

export type PoliceDepartment = {
    id: string;
    name: string;
    email: string;
    passwordHash?: string;
    departmentCode: string;
    latitude: number;
    longitude: number;
    city: string;
    district: string;
    state: string;
    contactNumber: string;
    isActive?: boolean;
    stationType?: "outpost" | "station" | "district_hq";
    jurisdictionRadiusKm?: number;
    officerCount?: number;
};

export type RiskZone = {
    id: number;
    name: string;
    description?: string | null;
    centerLat: number;
    centerLng: number;
    radiusMeters: number;
    riskLevel: string;
    active: boolean;
    category?: "flood" | "wildlife" | "crime" | "traffic" | "political_unrest" | "other";
    source?: "admin" | "ml_pipeline" | "crowd_report";
    expiresAt?: string;
    createdAt?: string;
    updatedAt?: string;
};

export type HospitalResponse = {
    hospitalId: number;
    name: string;
    latitude: number;
    longitude: number;
    contact: string;
    type: "hospital" | "clinic" | "pharmacy";
    tier?: "PHC" | "CHC" | "DH" | "Medical_College" | null;
    emergency: boolean;
    city: string;
    district: string;
    state: string;
    isActive: boolean;
    specialties?: string[];
    bedCapacity?: number;
    availableBeds?: number;
    operatingHours?: { open?: string; close?: string; is24Hours?: boolean };
    ambulanceAvailable?: boolean;
};

export type TravelAdvisory = {
    advisoryId: number;
    title: string;
    body: string;
    region: string;
    severity: "info" | "warning" | "critical";
    issuedBy?: string;
    effectiveFrom: string;
    effectiveTo: string;
    source?: "admin" | "ml_pipeline" | "government";
    active: boolean;
    affectedZoneIds?: number[];
    createdAt?: string;
    updatedAt?: string;
};

export type AuditLogEntry = {
    logId: number;
    actor: string;
    actorType: "admin" | "system" | "tourist";
    action: string;
    targetCollection: string;
    targetId: string;
    changes?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    timestamp: string;
};

export type AuditLogPage = {
    items: AuditLogEntry[];
    total: number;
    page: number;
    pages: number;
};

export type LocationPayload = {
    lat: number;
    lng: number;
    accuracy?: number;
    speed?: number;
    heading?: number;
};

export type SOSPayload = {
    lat?: number;
    lng?: number;
    message?: string;
    media?: string[];
};

export type SOSResponse = {
    status: string;
    alertId: number;
};

export type AdminDashboardState = {
    stats: {
        criticalAlerts: number;
        activeAlerts: number;
        monitoredTourists: number;
        totalTourists: number;
        activeTouristCount: number;
        avgResponseTimeMs: number;
    };
    alerts: Array<{
        id: number;
        touristId: string | null;
        touristName: string;
        alertType: string;
        priority: string;
        status: string;
        description: string;
        timestamp: string;
        lat: number | null;
        lng: number | null;
        assignedUnit: string | null;
    }>;
    tourists: Array<{
        id: string;
        name: string;
        status: string;
        safetyScore: number;
        lastPing: string | null;
        lat: number | null;
        lng: number | null;
        lastKnownArea: string;
    }>;
    responseUnits: Array<{
        id: string;
        name: string;
        status: string;
        type: string;
        city: string;
        district: string;
        state: string;
        lat: number;
        lng: number;
        etaMinutes: number;
        contactNumber: string;
    }>;
};
