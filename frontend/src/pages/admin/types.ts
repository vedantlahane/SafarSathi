import type { Alert } from "@/lib/api/alerts";
import type { Tourist } from "@/lib/api/tourists";
import type { RiskZone } from "@/lib/api/riskZones";
import type { PoliceDepartment } from "@/lib/api/police";
import type { DashboardStats } from "@/lib/api/admin";

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
