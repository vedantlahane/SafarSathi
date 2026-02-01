import { useState, useEffect, useMemo, useCallback } from "react";
import { getDashboard } from "@/lib/api/admin";
import { getAlerts, resolveAlert, Alert } from "@/lib/api/alerts";
import { getTourists } from "@/lib/api/tourists";
import { getRiskZones, createRiskZone, updateRiskZone, deleteRiskZone, RiskZone } from "@/lib/api/riskZones";
import { getPoliceDepartments, createPoliceDepartment, updatePoliceDepartment, deletePoliceDepartment, PoliceDepartment } from "@/lib/api/police";
import type { AdminData, AlertFilter, TouristFilter, ZoneFilter, ZoneFormData, PoliceFormData } from "../types";

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
        } : null,
        alerts: alertsData || [],
        tourists: touristsData || [],
        zones: zonesData || [],
        policeUnits: policeData || [],
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
        a.type.toLowerCase().includes(search) || 
        a.touristId?.toLowerCase().includes(search)
      );
    }
    return result;
  }, [data.alerts, alertFilter, globalSearch]);

  const filteredTourists = useMemo(() => {
    let result = data.tourists;
    if (touristFilter === "online") result = result.filter((t) => t.isActive);
    else if (touristFilter === "offline") result = result.filter((t) => !t.isActive);
    else if (touristFilter === "highrisk") result = result.filter((t) => t.riskScore > 70);
    if (globalSearch) {
      const search = globalSearch.toLowerCase();
      result = result.filter((t) => 
        t.name?.toLowerCase().includes(search) || 
        t.email?.toLowerCase().includes(search)
      );
    }
    return result;
  }, [data.tourists, touristFilter, globalSearch]);

  const filteredZones = useMemo(() => {
    let result = data.zones;
    if (zoneFilter === "active") result = result.filter((z) => z.isActive);
    else if (zoneFilter === "inactive") result = result.filter((z) => !z.isActive);
    if (globalSearch) {
      const search = globalSearch.toLowerCase();
      result = result.filter((z) => 
        z.name.toLowerCase().includes(search) || 
        z.description?.toLowerCase().includes(search)
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

export function useAlertActions(setData: React.Dispatch<React.SetStateAction<AdminData>>) {
  const handleResolveAlert = useCallback(async (alert: Alert) => {
    try {
      await resolveAlert(alert.id, "RESOLVED");
      setData((prev) => ({
        ...prev,
        alerts: prev.alerts.map((a) => (a.id === alert.id ? { ...a, status: "RESOLVED" } : a)),
      }));
    } catch (err) {
      console.error("Failed to resolve alert", err);
    }
  }, [setData]);

  const handleBulkResolve = useCallback(async (selectedIds: Set<string>, alerts: Alert[]) => {
    for (const id of selectedIds) {
      const alert = alerts.find((a) => a.id === id);
      if (alert && alert.status !== "RESOLVED") {
        await handleResolveAlert(alert);
      }
    }
  }, [handleResolveAlert]);

  return { handleResolveAlert, handleBulkResolve };
}

export function useZoneActions(setData: React.Dispatch<React.SetStateAction<AdminData>>) {
  const handleSaveZone = useCallback(async (formData: ZoneFormData, editingZone: RiskZone | null) => {
    const payload = {
      name: formData.name,
      description: formData.description,
      severity: formData.severity,
      radius: Number(formData.radius),
      center: {
        type: "Point" as const,
        coordinates: [Number(formData.lng), Number(formData.lat)] as [number, number],
      },
      isActive: formData.isActive,
    };

    try {
      if (editingZone) {
        const updated = await updateRiskZone(editingZone.id, payload);
        setData((prev) => ({
          ...prev,
          zones: prev.zones.map((z) => (z.id === editingZone.id ? updated : z)),
        }));
      } else {
        const created = await createRiskZone(payload);
        setData((prev) => ({
          ...prev,
          zones: [...prev.zones, created],
        }));
      }
      return true;
    } catch (e) {
      console.error("Failed to save zone", e);
      return false;
    }
  }, [setData]);

  const handleDeleteZone = useCallback(async (zoneId: string) => {
    try {
      await deleteRiskZone(zoneId);
      setData((prev) => ({
        ...prev,
        zones: prev.zones.filter((z) => z.id !== zoneId),
      }));
      return true;
    } catch (e) {
      console.error("Failed to delete zone", e);
      return false;
    }
  }, [setData]);

  return { handleSaveZone, handleDeleteZone };
}

export function usePoliceActions(setData: React.Dispatch<React.SetStateAction<AdminData>>) {
  const handleSavePolice = useCallback(async (formData: PoliceFormData, editingPolice: PoliceDepartment | null) => {
    const payload = {
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
      if (editingPolice) {
        const updated = await updatePoliceDepartment(editingPolice.id, payload);
        setData((prev) => ({
          ...prev,
          policeUnits: prev.policeUnits.map((p) => (p.id === editingPolice.id ? updated : p)),
        }));
      } else {
        const created = await createPoliceDepartment({
          ...payload,
          passwordHash: "admin123",
          district: "",
          state: "Assam",
        });
        setData((prev) => ({
          ...prev,
          policeUnits: [...prev.policeUnits, created],
        }));
      }
      return true;
    } catch (e) {
      console.error("Failed to save police", e);
      return false;
    }
  }, [setData]);

  const handleDeletePolice = useCallback(async (policeId: string) => {
    try {
      await deletePoliceDepartment(policeId);
      setData((prev) => ({
        ...prev,
        policeUnits: prev.policeUnits.filter((p) => p.id !== policeId),
      }));
      return true;
    } catch (e) {
      console.error("Failed to delete police", e);
      return false;
    }
  }, [setData]);

  return { handleSavePolice, handleDeletePolice };
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
