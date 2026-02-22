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
  emergencyContact?: string;
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
  emergencyContact?: string;
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
  lastLocation: { lat: number | null; lng: number | null; lastSeen: string | null };
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
  blockchainLogs: Array<{ id: string; transactionId: string; status: string; timestamp: string }>;
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

const DEFAULT_BASE_URL = "http://localhost:8081";
const API_BASE_URL = (import.meta.env.VITE_BACKEND_NODE_URL as string | undefined) ?? DEFAULT_BASE_URL;

function buildUrl(path: string) {
  const trimmedBase = API_BASE_URL.replace(/\/$/, "");
  const trimmedPath = path.startsWith("/") ? path : `/${path}`;
  return `${trimmedBase}${trimmedPath}`;
}

async function request<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(buildUrl(path), {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {})
    },
    ...options
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return null as T;
  }
  return (await response.json()) as T;
}

export async function registerTourist(payload: TouristRegistrationPayload) {
  return request<{ touristId: string; token: string; user: TouristProfile; qr_content: string }>(
    "/api/auth/register",
    {
      method: "POST",
      body: JSON.stringify(payload)
    }
  );
}

export async function loginTourist(payload: { email: string; password: string }) {
  return request<{ touristId: string; token: string; user: TouristProfile; qr_content: string }>(
    "/api/auth/login",
    {
      method: "POST",
      body: JSON.stringify(payload)
    }
  );
}

export async function fetchTouristProfile(touristId: string) {
  return request<TouristProfile>(`/api/auth/profile/${encodeURIComponent(touristId)}`);
}

export async function updateTouristProfile(touristId: string, payload: Partial<TouristProfile>) {
  return request<TouristProfile>(`/api/auth/profile/${encodeURIComponent(touristId)}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function fetchTouristDashboard(touristId: string) {
  return request<TouristDashboard>(`/api/tourist/${encodeURIComponent(touristId)}/dashboard`);
}

export async function postLocation(
  touristId: string,
  payload: { lat: number; lng: number; accuracy?: number }
) {
  return request<void>(`/api/action/location/${encodeURIComponent(touristId)}`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function postSOS(touristId: string, payload: { lat?: number; lng?: number }) {
  return request<{ status: string }>(`/api/action/sos/${encodeURIComponent(touristId)}`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function fetchPublicRiskZones() {
  return request<TouristDashboard["riskZones"]>("/api/risk-zones/active");
}

export async function fetchPoliceDepartments() {
  return request<PoliceDepartment[]>("/api/police-stations");
}

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

export async function fetchHospitals() {
  return request<HospitalResponse[]>("/api/hospitals");
}

export async function createPoliceDepartment(payload: Omit<PoliceDepartment, "id">) {
  return request<PoliceDepartment>("/api/admin/police", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updatePoliceDepartment(id: string, payload: Partial<PoliceDepartment>) {
  return request<PoliceDepartment>(`/api/admin/police/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function deletePoliceDepartment(id: string) {
  return request<void>(`/api/admin/police/${encodeURIComponent(id)}`, {
    method: "DELETE"
  });
}

export async function fetchAdminRiskZones() {
  return request<RiskZone[]>("/api/admin/risk-zones");
}

export async function createAdminRiskZone(payload: Omit<RiskZone, "id" | "createdAt" | "updatedAt">) {
  return request<RiskZone>("/api/admin/risk-zones", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateAdminRiskZone(id: number, payload: Partial<RiskZone>) {
  return request<RiskZone>(`/api/admin/risk-zones/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function toggleAdminRiskZone(id: number, active: boolean) {
  return request<RiskZone>(`/api/admin/risk-zones/${id}/status?active=${active}`, {
    method: "PATCH"
  });
}

export async function deleteAdminRiskZone(id: number) {
  return request<void>(`/api/admin/risk-zones/${id}`, {
    method: "DELETE"
  });
}

export async function verifyDigitalId(hash: string) {
  return request<{
    valid: boolean;
    name: string;
    passport_partial: string;
    id_expiry: string;
    blockchain_status: string;
  }>(`/api/admin/id/verify?hash=${encodeURIComponent(hash)}`);
}

export async function adminLogin(payload: { email: string; password: string }) {
  return request<{
    success: boolean;
    token: string;
    admin: {
      id: string;
      name: string;
      email: string;
      departmentCode: string;
      city: string;
      district: string;
      state: string;
    };
  }>("/api/admin/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function fetchAdminDashboard() {
  return request<AdminDashboardState>("/api/admin/dashboard/state");
}

export async function fetchAdminAlerts() {
  return request<Array<{ id: number; touristId?: string; alertType: string; status: string; createdTime: string; message?: string }>>(
    "/api/admin/alerts/all"
  );
}

export async function resolveAlert(alertId: number, status: string) {
  return request(`/api/admin/alerts/${alertId}/status`, {
    method: "POST",
    body: JSON.stringify({ status })
  });
}

export async function fetchAdminTourists() {
  return request<Array<{ id: string; name: string; status?: string; safetyScore?: number; lastSeen?: string }>>(
    "/api/admin/tourists"
  );
}

export function connectAlertsSocket(onAlert: (alert: unknown) => void) {
  const wsBase = API_BASE_URL.replace(/^http/i, "ws").replace(/\/$/, "");
  const socket = new WebSocket(`${wsBase}/ws-connect`);
  socket.onmessage = (event) => {
    try {
      const parsed = JSON.parse(event.data);
      if (parsed?.payload) {
        onAlert(parsed.payload);
      }
    } catch {
      // ignore malformed messages
    }
  };
  return socket;
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}
