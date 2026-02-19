// All types for the home page

export interface AlertView {
    id: number;
    type: string;
    message: string;
    time: string;
    priority: "critical" | "high" | "medium" | "low";
}

export interface SafetyFactor {
    label: string;
    score: number;
    trend: "up" | "down" | "stable";
}

export interface DashboardData {
    safetyScore: number;
    status: string;
    factors: SafetyFactor[];
    alerts: AlertView[];
    openAlerts: number;
}

export interface LocationShareState {
    loading: boolean;
    shared: boolean;
    share: () => void;
}

export interface EmergencyContact {
    id: number;
    name: string;
    number: string;
    color: string;
}

export const ALERT_PRIORITY_COLORS: Record<AlertView["priority"], string> = {
    critical: "bg-red-500",
    high: "bg-orange-500",
    medium: "bg-amber-400",
    low: "bg-blue-400",
};

export const EMERGENCY_CONTACTS: EmergencyContact[] = [
    { id: 1, name: "Police", number: "100", color: "bg-blue-500" },
    { id: 2, name: "Ambulance", number: "108", color: "bg-red-500" },
    { id: 3, name: "Fire", number: "101", color: "bg-orange-500" },
    { id: 4, name: "Women", number: "181", color: "bg-purple-500" },
    { id: 5, name: "Tourist", number: "1363", color: "bg-emerald-500" },
];

export const SAFETY_TIPS: string[] = [
    "Always share your live location with family",
    "Keep emergency numbers saved offline",
    "Avoid isolated areas after dark",
    "Register with local tourist police",
    "Keep digital copies of documents",
    "Stay aware of your surroundings in crowded places",
    "Use authorized transport services only",
];
