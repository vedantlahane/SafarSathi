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
    emergencyContact?: { name?: string; phone?: string };
    bloodType?: string;
    allergies?: string[];
    medicalConditions?: string[];
    currentLat?: number;
    currentLng?: number;
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
    emergencyContact?: { name?: string; phone?: string };
    bloodType?: string;
    allergies?: string[];
    medicalConditions?: string[];
    safetyScore?: number;
    idHash?: string;
    idExpiry?: string;
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
    emergency: boolean;
    city: string;
    district: string;
    state: string;
    isActive: boolean;
};

export type AdminDashboardState = {
    stats: {
        criticalAlerts: number;
        activeAlerts: number;
        monitoredTourists: number;
        totalTourists: number;
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
