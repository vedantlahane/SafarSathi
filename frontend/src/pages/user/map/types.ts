// src/pages/user/map/types.ts
export interface RiskZone {
    id: number | string;
    name: string;
    description: string | null;
    centerLat: number;
    centerLng: number;
    radiusMeters: number;
    riskLevel: string | null;
}

export interface PoliceStation {
    id: string | number;
    position: [number, number];
    name: string;
    contact: string;
    available: boolean;
    responseTime?: string;
}

export interface Destination {
    name: string;
    lat: number;
    lng: number;
}

export type RiskFilter = "all" | "high" | "medium" | "low";

export interface LayerVisibility {
    zones: boolean;
    police: boolean;
}

export function getZoneColor(level: string | null): { stroke: string; fill: string } {
    switch (level?.toLowerCase()) {
        case "high": return { stroke: "#dc2626", fill: "#dc2626" };
        case "medium": return { stroke: "#ea580c", fill: "#ea580c" };
        case "low": return { stroke: "#ca8a04", fill: "#ca8a04" };
        default: return { stroke: "#ea580c", fill: "#ea580c" };
    }
}
