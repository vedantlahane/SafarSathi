import type { TouristProfile as Tourist, RiskZone as RiskZoneType, PoliceDepartment, AdminDashboardState as DashboardStats } from "@/lib/api";

export type Alert = {
  id: number | string;
  touristId?: string | null;
  touristName?: string | null;
  type?: string;
  status: "ACTIVE" | "PENDING" | "RESOLVED" | string;
  timestamp?: string;
  message?: string | null;
  location?: { coordinates: [number, number] } | null;
};

// Normalize RiskZone shape to expected fields used in admin
export type RiskZone = {
  id: number | string;
  name: string;
  description?: string | null;
  center?: { type: "Point"; coordinates: [number, number] };
  severity?: "low" | "medium" | "high" | "critical" | string;
  radius?: number;
  isActive?: boolean;
} | RiskZoneType;

export interface AdminLayoutProps {
  activeSection: string;
  globalSearch: string;
  onSectionChange?: (section: string) => void;
}

export interface AdminData {
  stats: DashboardStats | null;
  alerts: Alert[];
  tourists: Tourist[];
  zones: RiskZone[];
  policeUnits: PoliceDepartment[];
}

export interface ZoneFormData {
  name: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  radius: string;
  lat: string;
  lng: string;
  isActive: boolean;
}

export interface PoliceFormData {
  name: string;
  email: string;
  departmentCode: string;
  city: string;
  contactNumber: string;
  lat: string;
  lng: string;
}

export interface DeleteConfirmation {
  type: "zone" | "police";
  id: string;
  name: string;
}

export type AlertFilter = "all" | "active" | "pending" | "resolved";
export type TouristFilter = "all" | "online" | "offline" | "highrisk";
export type ZoneFilter = "all" | "active" | "inactive";
export type BroadcastType = "all" | "zone" | "tourists";

export { Alert, Tourist, RiskZone, PoliceDepartment, DashboardStats };
