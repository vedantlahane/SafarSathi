import { useState, useEffect, useMemo, useCallback } from "react";
import {
  fetchAdminDashboard as getDashboard,
  fetchAdminAlerts as getAlerts,
  resolveAlert,
  fetchAdminTourists as getTourists,
  fetchAdminRiskZones as getRiskZones,
  createAdminRiskZone as createRiskZone,
  updateAdminRiskZone as updateRiskZone,
  deleteAdminRiskZone as deleteRiskZone,
  fetchPoliceDepartments as getPoliceDepartments,
  createPoliceDepartment,
  updatePoliceDepartment,
  deletePoliceDepartment,
} from "@/lib/api";
import type {
  AdminData,
  Alert,
  Tourist,
  RiskZone,
  PoliceDepartment,
  AlertFilter,
  TouristFilter,
  ZoneFilter,
  ZoneFormData,
  PoliceFormData
} from "../types";

// Normalizers
const normalizeTourist = (t: any): Tourist => ({
  id: t.id || t._id,
  name: t.name || "Unknown",
  email: t.email || "",
  phoneNumber: t.phone || t.phoneNumber || "",
  passportNumber: t.passportNumber || "",
  isActive: Boolean(t.active || (t.lastSeen && (Date.now() - new Date(t.lastSeen).getTime() < 300000))),
  lastSeen: t.lastSeen || new Date().toISOString(),
  riskScore: typeof t.safetyScore === 'number' ? (100 - t.safetyScore) : 0,
  riskLevel: (100 - (t.safetyScore || 0)) > 80 ? "critical" : (100 - (t.safetyScore || 0)) > 60 ? "high" : (100 - (t.safetyScore || 0)) > 40 ? "medium" : "low",
  location: (t.currentLat && t.currentLng) ? { lat: t.currentLat, lng: t.currentLng } : null,
  address: t.address,
  emergencyContact: typeof t.emergencyContact === 'string' ? JSON.parse(t.emergencyContact) : t.emergencyContact,
  status: t.status
});

const normalizeRiskZone = (z: any): RiskZone => ({
  id: z.zoneId || z.id,
  name: z.name,
  description: z.description || "",
  center: { lat: z.centerLat || z.latitude || 0, lng: z.centerLng || z.longitude || 0 },
  radius: z.radiusMeters || z.radius || 0,
  severity: (z.riskLevel || "LOW").toLowerCase() as any,
  isActive: Boolean(z.active)
});

const normalizeAlert = (a: any): Alert => ({
  id: a.alertId || a.id,
  touristId: a.touristId,
  touristName: a.touristName,
  type: a.type || a.alertType,
  status: a.status,
  timestamp: a.createdAt || a.timestamp || new Date().toISOString(),
  message: a.message,
  location: (a.locationLat && a.locationLng) ? { lat: a.locationLat, lng: a.locationLng } : null
});

const normalizePolice = (p: any): PoliceDepartment => ({
  id: p.id || p._id,
  name: p.name,
  email: p.email,
  departmentCode: p.departmentCode,
  city: p.city,
  contactNumber: p.contactNumber,
  location: { lat: p.latitude || 0, lng: p.longitude || 0 },
  isActive: Boolean(p.isActive)
});

export function useAdminData(isAuthenticated: boolean) {
  const [data, setData] = useState<AdminData>({
    stats: null,
    alerts: [],
    tourists: [],
    zones: [],
    policeUnits: [],
  });
  const [refreshing, setRefreshing] = useState(false);

  const fetchAllData = useCallback(async () => {
    if (!isAuthenticated) return;

    setRefreshing(true);
    try {
      const [dashData, alertsData, touristsData, zonesData, policeData] = await Promise.all([
        getDashboard().catch(() => null),
        getAlerts().catch(() => []),
        getTourists().catch(() => []),
        getRiskZones().catch(() => []),
        getPoliceDepartments().catch(() => []),
      ]);

      setData({
        stats: dashData ? {
          ...dashData,
          riskZones: zonesData?.length || 0,
          responseUnits: policeData?.length || 0,
        } as any : null,
        alerts: (alertsData || []).map(normalizeAlert),
        tourists: (touristsData || []).map(normalizeTourist),
        zones: (zonesData || []).map(normalizeRiskZone),
        policeUnits: (policeData || []).map(normalizePolice),
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
  const handleResolveAlert = useCallback(async (alertId: string | number) => {
    try {
      await resolveAlert(Number(alertId), "RESOLVED");
      await refetch();
    } catch (err) {
      console.error("Failed to resolve alert", err);
    }
  }, [refetch]);

  const handleBulkResolve = useCallback(async (selectedIds: string[]) => {
    for (const id of selectedIds) {
      await handleResolveAlert(id);
    }
  }, [handleResolveAlert]);

  return { resolve: handleResolveAlert, bulkResolve: handleBulkResolve };
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
  }), [data]);
}
