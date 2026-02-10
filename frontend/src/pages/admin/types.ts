export interface Tourist {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  passportNumber: string;
  isActive: boolean;
  lastSeen: string;
  riskScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  location: { lat: number; lng: number } | null;
  address?: string;
  emergencyContact?: { name: string; phone: string };
  status?: string;
}

export interface RiskZone {
  id: number | string;
  name: string;
  description: string;
  center: { lat: number; lng: number };
  radius: number;
  severity: "low" | "medium" | "high" | "critical";
  isActive: boolean;
}

export interface Alert {
  id: number | string;
  touristId?: string | null;
  touristName?: string | null;
  type: string;
  status: "ACTIVE" | "PENDING" | "RESOLVED" | string;
  timestamp: string;
  message?: string | null;
  location: { lat: number; lng: number } | null;
}

export interface PoliceDepartment {
  id: string;
  name: string;
  email: string;
  departmentCode: string;
  city: string;
  contactNumber: string;
  location: { lat: number; lng: number };
  isActive: boolean;
}

export interface DashboardStats {
  criticalAlerts: number;
  activeAlerts: number;
  monitoredTourists: number;
  totalTourists: number;
  riskZones: number;
  responseUnits: number;
}

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

export type AlertFilter = "all" | "active" | "pending" | "resolved" | "sos" | "geofence";
export type TouristFilter = "all" | "online" | "offline" | "highrisk" | "high-risk" | "medium-risk" | "low-risk";
export type ZoneFilter = "all" | "active" | "inactive" | "critical" | "high" | "medium" | "low";
export type BroadcastType = "all" | "zone" | "emergency";

