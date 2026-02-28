import { useState, useEffect, useMemo, useCallback } from "react";
import {
  fetchAdminDashboard as getDashboard,
  fetchAdminAlerts as getAlerts,
  resolveAlert,
  assignAlertUnit,
  fetchAdminTourists as getTourists,
  fetchAdminRiskZones as getRiskZones,
  createAdminRiskZone as createRiskZone,
  updateAdminRiskZone as updateRiskZone,
  deleteAdminRiskZone as deleteRiskZone,
  fetchPoliceDepartments as getPoliceDepartments,
  createPoliceDepartment,
  updatePoliceDepartment,
  deletePoliceDepartment,
  fetchAdminHospitals as getHospitals,
  createHospital,
  updateHospital,
  deleteHospital,
  fetchAdminAdvisories as getAdvisories,
  createAdvisory,
  updateAdvisory,
  deleteAdvisory,
  fetchAuditLogs as getAuditLogs,
  sendBroadcast,
} from "@/lib/api";
import type {
  AdminData,
  Alert,
  Tourist,
  RiskZone,
  PoliceDepartment,
  HospitalAdmin,
  TravelAdvisoryAdmin,
  AuditLogEntry,
  AlertFilter,
  TouristFilter,
  ZoneFilter,
  ZoneFormData,
  PoliceFormData,
  HospitalFormData,
  AdvisoryFormData,
} from "../types";

// Normalizers
const normalizeTourist = (t: any): Tourist => ({
  id: t.id || t._id,
  name: t.name || "Unknown",
  email: t.email || "",
  phoneNumber: t.phone || t.phoneNumber || "",
  passportNumber: t.passportNumber || "",
  isActive: Boolean(t.isActive ?? t.active ?? (t.lastSeen && (Date.now() - new Date(t.lastSeen).getTime() < 300000))),
  lastSeen: t.lastSeen || new Date().toISOString(),
  riskScore: typeof t.safetyScore === 'number' ? (100 - t.safetyScore) : 0,
  riskLevel: (100 - (t.safetyScore || 0)) > 80 ? "critical" : (100 - (t.safetyScore || 0)) > 60 ? "high" : (100 - (t.safetyScore || 0)) > 40 ? "medium" : "low",
  location: (t.currentLat && t.currentLng) ? { lat: t.currentLat, lng: t.currentLng } : null,
  address: t.address,
  emergencyContact: typeof t.emergencyContact === 'string' ? JSON.parse(t.emergencyContact) : t.emergencyContact,
  status: t.status,
  travelType: t.travelType,
  speed: t.speed,
  heading: t.heading,
});

const normalizeRiskZone = (z: any): RiskZone => ({
  id: z.zoneId || z.id,
  name: z.name,
  description: z.description || "",
  center: { lat: z.centerLat || z.latitude || 0, lng: z.centerLng || z.longitude || 0 },
  radius: z.radiusMeters || z.radius || 0,
  severity: (z.riskLevel || "LOW").toLowerCase() as any,
  isActive: Boolean(z.active),
  category: z.category,
  source: z.source,
  expiresAt: z.expiresAt,
});

const normalizeAlert = (a: any): Alert => ({
  id: a.alertId || a.id,
  touristId: a.touristId,
  touristName: a.touristName,
  type: a.type || a.alertType,
  status: a.status,
  timestamp: a.createdAt || a.createdTime || a.timestamp || new Date().toISOString(),
  message: a.message,
  location: (a.locationLat && a.locationLng) ? { lat: a.locationLat, lng: a.locationLng } : null,
  priority: a.priority,
  escalationLevel: a.escalationLevel,
  responseTimeMs: a.responseTimeMs,
  preAlertTriggered: a.preAlertTriggered,
  assignedUnit: a.assignedUnit,
  nearestStationId: a.nearestStationId,
  resolvedBy: a.resolvedBy,
  cancelledAt: a.cancelledAt,
  media: a.media,
});

const normalizePolice = (p: any): PoliceDepartment => ({
  id: p.id || p._id,
  name: p.name,
  email: p.email,
  departmentCode: p.departmentCode,
  city: p.city,
  contactNumber: p.contactNumber,
  location: { lat: p.latitude || 0, lng: p.longitude || 0 },
  isActive: Boolean(p.isActive),
  stationType: p.stationType,
  jurisdictionRadiusKm: p.jurisdictionRadiusKm,
  officerCount: p.officerCount,
});

const normalizeHospital = (h: any): HospitalAdmin => ({
  id: h.hospitalId || h.id || h._id,
  name: h.name,
  contact: h.contact || h.contactNumber || "",
  type: h.type || "hospital",
  emergency: Boolean(h.emergency),
  location: { lat: h.latitude || 0, lng: h.longitude || 0 },
  isActive: h.isActive !== false,
  tier: h.tier,
  specialties: h.specialties,
  bedCapacity: h.bedCapacity,
  availableBeds: h.availableBeds,
  operatingHours: h.operatingHours,
  ambulanceAvailable: h.ambulanceAvailable,
});

const normalizeAdvisory = (a: any): TravelAdvisoryAdmin => ({
  id: a.id || a._id,
  title: a.title,
  description: a.description,
  severity: a.severity || "info",
  region: a.region || "",
  isActive: a.isActive !== false,
  issuedBy: a.issuedBy || "Admin",
  issuedAt: a.issuedAt || a.createdAt || new Date().toISOString(),
  expiresAt: a.expiresAt,
  affectedDistricts: a.affectedDistricts,
});

const normalizeAuditLog = (l: any): AuditLogEntry => ({
  id: l.id || l._id,
  action: l.action,
  performedBy: l.performedBy,
  entityType: l.entityType,
  entityId: l.entityId,
  details: l.details,
  ipAddress: l.ipAddress,
  timestamp: l.timestamp || l.createdAt || new Date().toISOString(),
});

export function useAdminData(isAuthenticated: boolean) {
  const [data, setData] = useState<AdminData>({
    stats: null,
    alerts: [],
    tourists: [],
    zones: [],
    policeUnits: [],
    hospitals: [],
    advisories: [],
    auditLogs: [],
    auditLogTotal: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  const fetchAllData = useCallback(async () => {
    if (!isAuthenticated) return;

    setRefreshing(true);
    try {
      const [dashData, alertsData, touristsData, zonesData, policeData, hospitalsData, advisoriesData, auditData] = await Promise.all([
        getDashboard().catch(() => null),
        getAlerts().catch(() => []),
        getTourists().catch(() => []),
        getRiskZones().catch(() => []),
        getPoliceDepartments().catch(() => []),
        getHospitals().catch(() => []),
        getAdvisories().catch(() => []),
        getAuditLogs(1, 50).catch(() => ({ logs: [], total: 0, page: 1, limit: 50 })),
      ]);

      setData({
        stats: dashData ? {
          ...dashData,
          riskZones: zonesData?.length || 0,
          responseUnits: policeData?.length || 0,
          activeTouristCount: (dashData as any).stats?.activeTouristCount ?? touristsData?.filter((t: any) => t.isActive).length ?? 0,
          avgResponseTimeMs: (dashData as any).stats?.avgResponseTimeMs ?? 0,
        } as any : null,
        alerts: (alertsData || []).map(normalizeAlert),
        tourists: (touristsData || []).map(normalizeTourist),
        zones: (zonesData || []).map(normalizeRiskZone),
        policeUnits: (policeData || []).map(normalizePolice),
        hospitals: (hospitalsData || []).map(normalizeHospital),
        advisories: (advisoriesData || []).map(normalizeAdvisory),
        auditLogs: ((auditData as any)?.logs || []).map(normalizeAuditLog),
        auditLogTotal: (auditData as any)?.total || 0,
      });
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setRefreshing(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
      const interval = setInterval(fetchAllData, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchAllData]);

  return { data, refreshing, refetch: fetchAllData, setData };
}

export function useFilteredData(
  data: AdminData,
  alertFilter: AlertFilter,
  touristFilter: TouristFilter,
  zoneFilter: ZoneFilter,
  globalSearch: string
) {
  const filteredAlerts = useMemo(() => {
    let result = data.alerts;
    if (alertFilter !== "all") {
      result = result.filter((a) => a.status.toLowerCase() === alertFilter);
    }
    if (globalSearch) {
      const search = globalSearch.toLowerCase();
      result = result.filter((a) =>
        (a.type || "").toLowerCase().includes(search) ||
        (a.touristId || "").toLowerCase().includes(search)
      );
    }
    return result;
  }, [data.alerts, alertFilter, globalSearch]);

  const filteredTourists = useMemo(() => {
    let result = data.tourists;
    if (touristFilter === "online") result = result.filter((t) => t.isActive);
    else if (touristFilter === "offline") result = result.filter((t) => !t.isActive);
    else if (touristFilter === "highrisk" || touristFilter === "high-risk") result = result.filter((t) => t.riskScore > 70);
    else if (touristFilter === "medium-risk") result = result.filter((t) => t.riskScore > 40 && t.riskScore <= 70);
    else if (touristFilter === "low-risk") result = result.filter((t) => t.riskScore <= 40);

    if (globalSearch) {
      const search = globalSearch.toLowerCase();
      result = result.filter((t) =>
        t.name.toLowerCase().includes(search) ||
        t.email.toLowerCase().includes(search)
      );
    }
    return result;
  }, [data.tourists, touristFilter, globalSearch]);

  const filteredZones = useMemo(() => {
    let result = data.zones;
    if (zoneFilter === "active") result = result.filter((z) => z.isActive);
    else if (zoneFilter === "inactive") result = result.filter((z) => !z.isActive);
    else if (["critical", "high", "medium", "low"].includes(zoneFilter)) {
      result = result.filter((z) => z.severity === zoneFilter);
    }

    if (globalSearch) {
      const search = globalSearch.toLowerCase();
      result = result.filter((z) =>
        z.name.toLowerCase().includes(search) ||
        (z.description || "").toLowerCase().includes(search)
      );
    }
    return result;
  }, [data.zones, zoneFilter, globalSearch]);

  const filteredPolice = useMemo(() => {
    let result = data.policeUnits;
    if (globalSearch) {
      const search = globalSearch.toLowerCase();
      result = result.filter((p) =>
        p.name.toLowerCase().includes(search) ||
        p.city.toLowerCase().includes(search)
      );
    }
    return result;
  }, [data.policeUnits, globalSearch]);

  return { filteredAlerts, filteredTourists, filteredZones, filteredPolice };
}

export function useAlertActions(refetch: () => Promise<void>) {
  const handleResolveAlert = useCallback(async (alertId: string | number, resolvedBy?: string) => {
    try {
      await resolveAlert(Number(alertId), "RESOLVED", resolvedBy);
      await refetch();
    } catch (err) {
      console.error("Failed to resolve alert", err);
    }
  }, [refetch]);

  const handleAssignUnit = useCallback(async (alertId: string | number, unit: string) => {
    try {
      await assignAlertUnit(Number(alertId), unit);
      await refetch();
    } catch (err) {
      console.error("Failed to assign unit", err);
    }
  }, [refetch]);

  const handleBulkResolve = useCallback(async (selectedIds: string[]) => {
    for (const id of selectedIds) {
      await handleResolveAlert(id);
    }
  }, [handleResolveAlert]);

  return { resolve: handleResolveAlert, assignUnit: handleAssignUnit, bulkResolve: handleBulkResolve };
}

export function useZoneActions(refetch: () => Promise<void>) {
  const handleSaveZone = useCallback(async (formData: ZoneFormData, editingZoneId?: string | number) => {
    const payload: any = {
      name: formData.name,
      description: formData.description,
      riskLevel: formData.severity.toUpperCase(),
      radiusMeters: Number(formData.radius),
      centerLat: Number(formData.lat),
      centerLng: Number(formData.lng),
      active: formData.isActive,
    };

    try {
      if (editingZoneId) {
        await updateRiskZone(Number(editingZoneId), payload);
      } else {
        await createRiskZone(payload);
      }
      await refetch();
      return true;
    } catch (e) {
      console.error("Failed to save zone", e);
      return false;
    }
  }, [refetch]);

  const handleDeleteZone = useCallback(async (zoneId: string | number) => {
    try {
      await deleteRiskZone(Number(zoneId));
      await refetch();
      return true;
    } catch (e) {
      console.error("Failed to delete zone", e);
      return false;
    }
  }, [refetch]);

  return { save: handleSaveZone, delete: handleDeleteZone };
}

export function usePoliceActions(refetch: () => Promise<void>) {
  const handleSavePolice = useCallback(async (formData: PoliceFormData, editingPoliceId?: string) => {
    const payload: any = {
      name: formData.name,
      email: formData.email,
      departmentCode: formData.departmentCode,
      city: formData.city,
      contactNumber: formData.contactNumber,
      latitude: formData.lat ? Number(formData.lat) : 26.1445,
      longitude: formData.lng ? Number(formData.lng) : 91.7362,
      isActive: true,
    };

    try {
      if (editingPoliceId) {
        await updatePoliceDepartment(editingPoliceId, payload);
      } else {
        await createPoliceDepartment({
          ...payload,
          passwordHash: "admin123", // Default password
          district: "", // Should be added to form if needed/required
          state: "Assam", // Should be added to form if needed
        });
      }
      await refetch();
      return true;
    } catch (e) {
      console.error("Failed to save police", e);
      return false;
    }
  }, [refetch]);

  const handleDeletePolice = useCallback(async (policeId: string) => {
    try {
      await deletePoliceDepartment(policeId);
      await refetch();
      return true;
    } catch (e) {
      console.error("Failed to delete police", e);
      return false;
    }
  }, [refetch]);

  return { save: handleSavePolice, delete: handleDeletePolice };
}

export function useQuickStats(data: AdminData) {
  return useMemo(() => ({
    activeAlerts: data.alerts.filter((a) => a.status === "ACTIVE").length,
    onlineTourists: data.tourists.filter((t) => t.isActive).length,
    highRiskTourists: data.tourists.filter((t) => t.riskScore > 70).length,
    activeZones: data.zones.filter((z) => z.isActive).length,
    onDutyPolice: data.policeUnits.filter((p) => p.isActive).length,
    resolvedToday: data.alerts.filter((a) => a.status === "RESOLVED").length,
    totalAlerts: data.alerts.length,
    totalTourists: data.tourists.length,
    totalZones: data.zones.length,
    totalPolice: data.policeUnits.length,
    totalHospitals: data.hospitals.length,
    activeAdvisories: data.advisories.filter((a) => a.isActive).length,
    avgResponseTimeMs: data.stats?.avgResponseTimeMs ?? 0,
    activeTouristCount: data.stats?.activeTouristCount ?? data.tourists.filter((t) => t.isActive).length,
  }), [data]);
}

/* ─── Hospital CRUD ─────────────────────────────────────── */

export function useHospitalActions(refetch: () => Promise<void>) {
  const handleSaveHospital = useCallback(async (formData: HospitalFormData, editingId?: string) => {
    const payload: any = {
      name: formData.name,
      contact: formData.contact,
      type: formData.type,
      emergency: formData.emergency,
      latitude: Number(formData.lat),
      longitude: Number(formData.lng),
      tier: formData.tier || undefined,
      specialties: formData.specialties ? formData.specialties.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
      bedCapacity: formData.bedCapacity ? Number(formData.bedCapacity) : undefined,
      ambulanceAvailable: formData.ambulanceAvailable,
    };

    try {
      if (editingId) {
        await updateHospital(editingId, payload);
      } else {
        await createHospital(payload);
      }
      await refetch();
      return true;
    } catch (e) {
      console.error("Failed to save hospital", e);
      return false;
    }
  }, [refetch]);

  const handleDeleteHospital = useCallback(async (id: string) => {
    try {
      await deleteHospital(id);
      await refetch();
      return true;
    } catch (e) {
      console.error("Failed to delete hospital", e);
      return false;
    }
  }, [refetch]);

  return { save: handleSaveHospital, delete: handleDeleteHospital };
}

/* ─── Advisory CRUD ─────────────────────────────────────── */

export function useAdvisoryActions(refetch: () => Promise<void>) {
  const handleSaveAdvisory = useCallback(async (formData: AdvisoryFormData, editingId?: string) => {
    const payload: any = {
      title: formData.title,
      description: formData.description,
      severity: formData.severity,
      region: formData.region,
      expiresAt: formData.expiresAt || undefined,
      affectedDistricts: formData.affectedDistricts ? formData.affectedDistricts.split(",").map((d) => d.trim()).filter(Boolean) : undefined,
      isActive: true,
    };

    try {
      if (editingId) {
        await updateAdvisory(editingId, payload);
      } else {
        await createAdvisory(payload);
      }
      await refetch();
      return true;
    } catch (e) {
      console.error("Failed to save advisory", e);
      return false;
    }
  }, [refetch]);

  const handleDeleteAdvisory = useCallback(async (id: string) => {
    try {
      await deleteAdvisory(id);
      await refetch();
      return true;
    } catch (e) {
      console.error("Failed to delete advisory", e);
      return false;
    }
  }, [refetch]);

  return { save: handleSaveAdvisory, delete: handleDeleteAdvisory };
}

/* ─── Broadcast ─────────────────────────────────────────── */

export function useBroadcastAction() {
  const handleBroadcast = useCallback(async (payload: {
    title: string;
    message: string;
    target?: "all" | "zone" | "district";
    priority?: "low" | "medium" | "high" | "critical";
    zoneId?: string;
    district?: string;
  }) => {
    try {
      const result = await sendBroadcast(payload);
      return result;
    } catch (e) {
      console.error("Failed to send broadcast", e);
      return null;
    }
  }, []);

  return { broadcast: handleBroadcast };
}

/* ─── Audit Log Pagination ──────────────────────────────── */

export function useAuditLogPagination() {
  const [page, setPage] = useState(1);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchPage = useCallback(async (
    pageNum: number,
    filters?: { action?: string; performedBy?: string; entityType?: string; startDate?: string; endDate?: string }
  ) => {
    setLoading(true);
    try {
      const result = await getAuditLogs(pageNum, 50, filters);
      setLogs((result as any).logs?.map(normalizeAuditLog) || []);
      setTotal((result as any).total || 0);
      setPage(pageNum);
    } catch {
      console.error("Failed to fetch audit logs");
    } finally {
      setLoading(false);
    }
  }, []);

  return { logs, total, page, loading, fetchPage };
}
