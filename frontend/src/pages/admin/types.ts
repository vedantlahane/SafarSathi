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
  emergencyContact?: { name?: string; phone?: string; relationship?: string };
  status?: string;
  travelType?: string;
  speed?: number;
  heading?: number;
  locationAccuracy?: number;
  // Rich profile fields
  nationality?: string;
  gender?: string;
  dateOfBirth?: string;
  bloodType?: string;
  allergies?: string[];
  medicalConditions?: string[];
  safetyScore?: number;
  idHash?: string;
  idExpiry?: string;
}

export interface RiskZone {
  id: number | string;
  name: string;
  description: string;
  shape: "circle" | "polygon";
  center: { lat: number; lng: number };
  radius: number;
  polygonCoordinates?: [number, number][];
  severity: "low" | "medium" | "high" | "critical";
  isActive: boolean;
  category?: string;
  source?: string;
  expiresAt?: string;
}

export interface Alert {
  id: number | string;
  touristId?: string | null;
  touristName?: string | null;
  type: string;
  status:
    | "OPEN"
    | "PENDING"
    | "ACKNOWLEDGED"
    | "RESOLVED"
    | "CANCELLED"
    | "DISMISSED"
    | "PRE_ALERT"
    | string;
  timestamp: string;
  message?: string | null;
  location: { lat: number; lng: number } | null;
  priority?: string;
  escalationLevel?: number;
  responseTimeMs?: number;
  preAlertTriggered?: boolean;
  assignedUnit?: string;
  nearestStationId?: string;
  resolvedBy?: string;
  cancelledAt?: string;
  media?: string[];
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
  stationType?: string;
  jurisdictionRadiusKm?: number;
  officerCount?: number;
}

export interface HospitalAdmin {
  id: string;
  name: string;
  contact: string;
  type: "hospital" | "clinic" | "pharmacy";
  emergency: boolean;
  location: { lat: number; lng: number };
  isActive: boolean;
  city?: string;
  district?: string;
  state?: string;
  tier?: string;
  specialties?: string[];
  bedCapacity?: number;
  availableBeds?: number;
  operatingHours?: string;
  ambulanceAvailable?: boolean;
}

export interface TravelAdvisoryAdmin {
  id: string;
  title: string;
  description: string;
  severity: "info" | "warning" | "critical";
  region: string;
  isActive: boolean;
  issuedBy: string;
  issuedAt: string;
  effectiveFrom?: string;
  expiresAt?: string;
  affectedDistricts?: string[];
}

export interface AuditLogEntry {
  id: string;
  action: string;
  performedBy: string;
  entityType: string;
  entityId: string;
  details?: string;
  ipAddress?: string;
  timestamp: string;
}

export interface DashboardStats {
  criticalAlerts: number;
  activeAlerts: number;
  monitoredTourists: number;
  totalTourists: number;
  riskZones: number;
  responseUnits: number;
  activeTouristCount: number;
  avgResponseTimeMs: number;
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
  hospitals: HospitalAdmin[];
  advisories: TravelAdvisoryAdmin[];
  auditLogs: AuditLogEntry[];
  auditLogTotal: number;
}

export interface ZoneFormData {
  name: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  category: "flood" | "wildlife" | "crime" | "traffic" | "political_unrest" | "other" | "";
  shape: "circle" | "polygon";
  radius: string;
  lat: string;
  lng: string;
  polygonCoordinates: [number, number][];
  isActive: boolean;
  expiresAt: string;
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

export interface HospitalFormData {
  name: string;
  contact: string;
  type: "hospital" | "clinic" | "pharmacy";
  emergency: boolean;
  lat: string;
  lng: string;
  city: string;
  district: string;
  state: string;
  tier: string;
  specialties: string;
  bedCapacity: string;
  ambulanceAvailable: boolean;
}

export interface AdvisoryFormData {
  title: string;
  description: string;
  severity: "info" | "warning" | "critical";
  region: string;
  effectiveFrom: string;
  expiresAt: string;
  affectedDistricts: string;
}

export interface DeleteConfirmation {
  type: "zone" | "police" | "hospital" | "advisory";
  id: string;
  name: string;
}

// ACTIVE statuses the backend actually sends: OPEN | ACKNOWLEDGED | PENDING
export const ACTIVE_ALERT_STATUSES = ["OPEN", "ACKNOWLEDGED", "PENDING"] as const;

export type AlertFilter =
  | "all"
  | "open"
  | "active"
  | "pending"
  | "acknowledged"
  | "resolved"
  | "cancelled"
  | "dismissed"
  | "pre_alert"
  | "sos"
  | "geofence";
export type TouristFilter = "all" | "online" | "offline" | "highrisk" | "high-risk" | "medium-risk" | "low-risk";
export type ZoneFilter = "all" | "active" | "inactive" | "critical" | "high" | "medium" | "low";
export type BroadcastType = "all" | "zone" | "district" | "emergency";
export type AdminSection = "dashboard" | "alerts" | "tourists" | "zones" | "police" | "hospitals" | "advisories" | "auditlog";
export interface MapboxConfig {
  show3dBuildings: boolean;
  showPointOfInterestLabels: boolean;
  showTransitLabels: boolean;
  lightPreset: "dawn" | "day" | "dusk" | "night";
}