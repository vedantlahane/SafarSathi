import { useState, useCallback } from "react";
import { toast } from "sonner";
import { LoginScreen } from "./components";
import {
  DashboardSection,
  AlertsSection,
  TouristsSection,
  ZonesSection,
  PoliceSection,
  HospitalsSection,
  AdvisoriesSection,
  AuditLogSection,
} from "./sections";
import {
  ZoneDialog,
  PoliceDialog,
  AlertDetailDialog,
  TouristDetailDialog,
  BroadcastDialog,
  SettingsDialog,
  ReportsDialog,
  ConfirmDeleteDialog,
} from "./dialogs";
import {
  useAdminData,
  useAlertActions,
  useZoneActions,
  usePoliceActions,
  useHospitalActions,
  useAdvisoryActions,
  useBroadcastAction,
} from "./hooks";
import type {
  Alert,
  Tourist,
  RiskZone,
  PoliceDepartment,
  HospitalAdmin,
  TravelAdvisoryAdmin,
  ZoneFormData,
  PoliceFormData,
  BroadcastType,
  DeleteConfirmation,
} from "./types";

import { useAdminSession, saveAdminSession } from "../../lib/session";
import { adminLogin } from "../../lib/api/admin";

interface AdminIndexProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AdminPanel({ activeTab, onTabChange }: AdminIndexProps) {
  // Auth state
  const session = useAdminSession();
  const isAuthenticated = !!session?.token;
  const [authError, setAuthError] = useState("");

  // Data hooks
  const { data, refreshing: isLoading, refetch: refresh } = useAdminData(isAuthenticated);
  const alertActions = useAlertActions(refresh);
  const zoneActions = useZoneActions(refresh);
  const policeActions = usePoliceActions(refresh);
  const hospitalActions = useHospitalActions(refresh);
  const advisoryActions = useAdvisoryActions(refresh);
  const { broadcast: sendBroadcastApi } = useBroadcastAction();

  // Dialog states
  const [zoneDialogOpen, setZoneDialogOpen] = useState(false);
  const [policeDialogOpen, setPoliceDialogOpen] = useState(false);
  const [alertDetailOpen, setAlertDetailOpen] = useState(false);
  const [touristDetailOpen, setTouristDetailOpen] = useState(false);
  const [broadcastDialogOpen, setBroadcastDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [reportsDialogOpen, setReportsDialogOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // Selected items
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [selectedTourist, setSelectedTourist] = useState<Tourist | null>(null);
  const [selectedZone, setSelectedZone] = useState<RiskZone | null>(null);
  const [selectedPolice, setSelectedPolice] = useState<PoliceDepartment | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmation | null>(null);

  // Zone adding state
  const [isAddingZone, setIsAddingZone] = useState(false);
  const [newZonePosition, setNewZonePosition] = useState<{ lat: number; lng: number } | null>(null);

  // Auth handlers
  const handleLogin = async (email: string, password: string) => {
    try {
      const res = await adminLogin({ email, password });

      if (!res.success) {
        throw new Error("Invalid credentials");
      }

      saveAdminSession({
        adminId: res.admin.id,
        token: res.token,
        name: res.admin.name,
        email: res.admin.email,
        departmentCode: res.admin.departmentCode,
        city: res.admin.city,
        district: res.admin.district,
        state: res.admin.state
      });
      setAuthError("");
      toast.success("Welcome to SafarSathi Admin");
    } catch (err: any) {
      setAuthError(err.message);
      toast.error(err.message);
    }
  };

  // Alert handlers
  const handleViewAlert = useCallback((alert: Alert) => {
    setSelectedAlert(alert);
    setAlertDetailOpen(true);
  }, []);

  const handleResolveAlert = useCallback(async (alertId: string | number) => {
    await alertActions.resolve(alertId);
    toast.success("Alert resolved");
    if (selectedAlert?.id === alertId) {
      setAlertDetailOpen(false);
    }
  }, [alertActions, selectedAlert]);

  const handleBulkResolve = useCallback(async (alertIds: string[]) => {
    await alertActions.bulkResolve(alertIds);
    toast.success(`${alertIds.length} alerts resolved`);
  }, [alertActions]);

  // Tourist handlers
  const handleViewTourist = useCallback((tourist: Tourist) => {
    setSelectedTourist(tourist);
    setTouristDetailOpen(true);
  }, []);

  const handleContactTourist = useCallback((tourist: Tourist) => {
    toast.info(`Contacting ${tourist.name}...`);
    // Implement contact logic (e.g. open mailto or tel)
    window.location.href = `tel:${tourist.phoneNumber}`;
  }, []);

  const handleTrackTourist = useCallback((tourist: Tourist) => {
    onTabChange("zones");
    toast.info(`Tracking ${tourist.name} on map`);
    // Logic to focus map on tourist would go here
  }, [onTabChange]);

  // Zone handlers
  const handleAddZone = useCallback(() => {
    setSelectedZone(null);
    setZoneDialogOpen(true);
  }, []);

  const handleEditZone = useCallback((zone: RiskZone) => {
    setSelectedZone(zone);
    setZoneDialogOpen(true);
  }, []);

  const handleDeleteZone = useCallback((zone: RiskZone) => {
    setDeleteConfirmation({
      type: "zone",
      id: String(zone.id),
      name: zone.name,
    });
    setConfirmDeleteOpen(true);
  }, []);

  const handleSaveZone = useCallback(async (formData: ZoneFormData) => {
    const success = await zoneActions.save(formData, selectedZone?.id ? String(selectedZone.id) : undefined);
    if (success) {
      setZoneDialogOpen(false);
      setSelectedZone(null);
      setIsAddingZone(false);
      setNewZonePosition(null);
      toast.success(selectedZone ? "Zone updated" : "Zone created");
    } else {
      toast.error("Failed to save zone");
    }
  }, [zoneActions, selectedZone]);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (isAddingZone) {
      setNewZonePosition({ lat, lng });
      setZoneDialogOpen(true); // Open dialog immediately after picking point? Or just set point? 
      // Based on UI flow, usually selecting point then filling form.
      // Let's open dialog if they click while adding.
      // Actually usually user clicks "Add Zone", then clicks map.
    }
  }, [isAddingZone]);

  const handleToggleAddMode = useCallback(() => {
    setIsAddingZone((prev) => !prev);
    if (!isAddingZone) { // transitioning to true
      setNewZonePosition(null);
      toast.info("Click on map to place new zone");
    }
  }, [isAddingZone]);

  // Police handlers
  const handleAddPolice = useCallback(() => {
    setSelectedPolice(null);
    setPoliceDialogOpen(true);
  }, []);

  const handleEditPolice = useCallback((police: PoliceDepartment) => {
    setSelectedPolice(police);
    setPoliceDialogOpen(true);
  }, []);

  const handleDeletePolice = useCallback((police: PoliceDepartment) => {
    setDeleteConfirmation({
      type: "police",
      id: police.id,
      name: police.name,
    });
    setConfirmDeleteOpen(true);
  }, []);

  const handleContactPolice = useCallback((police: PoliceDepartment) => {
    toast.info(`Dispatching to ${police.name}...`);
    window.location.href = `tel:${police.contactNumber}`;
  }, []);

  const handleSavePolice = useCallback(async (formData: PoliceFormData) => {
    const success = await policeActions.save(formData, selectedPolice?.id);
    if (success) {
      setPoliceDialogOpen(false);
      setSelectedPolice(null);
      toast.success(selectedPolice ? "Station updated" : "Station added");
    } else {
      toast.error("Failed to save station");
    }
  }, [policeActions, selectedPolice]);

  // Delete confirmation handler
  const handleConfirmDelete = useCallback(async () => {
    if (!deleteConfirmation) return;

    try {
      if (deleteConfirmation.type === "zone") {
        await zoneActions.delete(deleteConfirmation.id);
        toast.success("Zone deleted");
      } else if (deleteConfirmation.type === "police") {
        await policeActions.delete(deleteConfirmation.id);
        toast.success("Station deleted");
      } else if (deleteConfirmation.type === "hospital") {
        await hospitalActions.delete(deleteConfirmation.id);
        toast.success("Hospital deleted");
      } else if (deleteConfirmation.type === "advisory") {
        await advisoryActions.delete(deleteConfirmation.id);
        toast.success("Advisory deleted");
      }
    } catch (err) {
      toast.error("Delete failed");
    }

    setDeleteConfirmation(null);
    setConfirmDeleteOpen(false);
  }, [deleteConfirmation, zoneActions, policeActions, hospitalActions, advisoryActions]);

  // Broadcast handler — real API call
  const handleBroadcast = useCallback(async (type: BroadcastType, message: string) => {
    const result = await sendBroadcastApi({
      title: "Admin Broadcast",
      message,
      target: type === "emergency" ? "all" : (type as "all" | "zone" | "district"),
      priority: type === "emergency" ? "critical" : "medium",
    });
    if (result) {
      toast.success(`Broadcast sent to ${result.recipientCount} recipients`);
    } else {
      toast.error("Failed to send broadcast");
    }
    setBroadcastDialogOpen(false);
  }, [sendBroadcastApi]);

  // Render login screen if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} error={authError} />;
  }

  // Render active section
  const renderSection = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardSection
            data={data}

            onNavigate={onTabChange}
            onAlertClick={handleViewAlert}
            onZoneClick={handleEditZone}
            onBroadcast={() => setBroadcastDialogOpen(true)}
          />
        );
      case "alerts":
        return (
          <AlertsSection
            alerts={data.alerts}
            isLoading={isLoading}
            onResolve={handleResolveAlert}
            onBulkResolve={handleBulkResolve}
            onViewAlert={handleViewAlert}
            onRefresh={refresh}
          />
        );
      case "tourists":
        return (
          <TouristsSection
            tourists={data.tourists}
            isLoading={isLoading}
            onViewTourist={handleViewTourist}
            onContactTourist={handleContactTourist}
            onTrackTourist={handleTrackTourist}
            onBroadcast={() => setBroadcastDialogOpen(true)}
            onRefresh={refresh}
          />
        );
      case "zones":
        return (
          <ZonesSection
            zones={data.zones}
            alerts={data.alerts}
            tourists={data.tourists}
            police={data.policeUnits}
            isLoading={isLoading}
            onAddZone={handleAddZone}
            onEditZone={handleEditZone}
            onDeleteZone={handleDeleteZone}
            onRefresh={refresh}
            isAddingZone={isAddingZone}
            onMapClick={handleMapClick}
            newZonePosition={newZonePosition}
            onToggleAddMode={handleToggleAddMode}
          />
        );
      case "police":
        return (
          <PoliceSection
            police={data.policeUnits}
            zones={data.zones}
            alerts={data.alerts}
            tourists={data.tourists}
            isLoading={isLoading}
            onAddPolice={handleAddPolice}
            onEditPolice={handleEditPolice}
            onDeletePolice={handleDeletePolice}
            onContactPolice={handleContactPolice}
            onRefresh={refresh}
          />
        );
      case "hospitals":
        return (
          <HospitalsSection
            hospitals={data.hospitals}
            isLoading={isLoading}
            onSave={hospitalActions.save}
            onDelete={(hospital: HospitalAdmin) => {
              setDeleteConfirmation({ type: "hospital", id: hospital.id, name: hospital.name });
              setConfirmDeleteOpen(true);
            }}
            onRefresh={refresh}
          />
        );
      case "advisories":
        return (
          <AdvisoriesSection
            advisories={data.advisories}
            isLoading={isLoading}
            onSave={advisoryActions.save}
            onDelete={(advisory: TravelAdvisoryAdmin) => {
              setDeleteConfirmation({ type: "advisory", id: advisory.id, name: advisory.title });
              setConfirmDeleteOpen(true);
            }}
            onRefresh={refresh}
          />
        );
      case "auditlog":
        return (
          <AuditLogSection
            initialLogs={data.auditLogs}
            initialTotal={data.auditLogTotal}
          />
        );
      default:
        return (
          <DashboardSection
            data={data}

            onNavigate={onTabChange}
            onAlertClick={handleViewAlert}
            onZoneClick={handleEditZone}
            onBroadcast={() => setBroadcastDialogOpen(true)}
          />
        );
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-100">
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {renderSection()}
      </div>

      {/* Dialogs */}
      <ZoneDialog
        open={zoneDialogOpen}
        onOpenChange={setZoneDialogOpen}
        zone={selectedZone}
        onSave={handleSaveZone}
        initialPosition={newZonePosition}
      />

      <PoliceDialog
        open={policeDialogOpen}
        onOpenChange={setPoliceDialogOpen}
        police={selectedPolice}
        onSave={handleSavePolice}
      />

      <AlertDetailDialog
        open={alertDetailOpen}
        onOpenChange={setAlertDetailOpen}
        alert={selectedAlert}
        onResolve={handleResolveAlert}
      />

      <TouristDetailDialog
        open={touristDetailOpen}
        onOpenChange={setTouristDetailOpen}
        tourist={selectedTourist}
        onContact={handleContactTourist}
        onTrack={handleTrackTourist}
      />

      <BroadcastDialog
        open={broadcastDialogOpen}
        onOpenChange={setBroadcastDialogOpen}
        onSend={handleBroadcast}
        recipientCount={data.tourists.filter((t) => t.isActive).length}
      />

      <SettingsDialog
        open={settingsDialogOpen}
        onOpenChange={setSettingsDialogOpen}
      />

      <ReportsDialog
        open={reportsDialogOpen}
        onOpenChange={setReportsDialogOpen}
      />

      <ConfirmDeleteDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        onConfirm={handleConfirmDelete}
        itemName={deleteConfirmation?.name}
        itemType={deleteConfirmation?.type}
      />
    </div>
  );
}

// Default export for compatibility
export default AdminPanel;
