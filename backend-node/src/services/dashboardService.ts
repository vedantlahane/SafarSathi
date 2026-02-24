import { getRecentLogs } from "./BlockchainService.js";
import {
  getAllTourists,
  getTouristById,
  getAllAlerts,
  getAllPoliceDepartments,
  getActiveRiskZones,
  getAlertsByTouristId,
  type ITourist,
  type IAlert,
  type IPoliceDepartment,
  type IRiskZone,
} from "./mongoStore.js";

export async function getAdminDashboardState() {
  const [allAlerts, allTourists, allPoliceDepartments] = await Promise.all([
    getAllAlerts(),
    getAllTourists(),
    getAllPoliceDepartments(),
  ]);

  const recentAlerts = allAlerts.slice(0, 50);
  const touristLookup = new Map(allTourists.map((t) => [t._id, t]));
  const alertsByTourist = new Map<string, IAlert[]>();
  for (const alert of recentAlerts) {
    if (!alert.touristId) {
      continue;
    }
    const bucket = alertsByTourist.get(alert.touristId) ?? [];
    bucket.push(alert);
    alertsByTourist.set(alert.touristId, bucket);
  }

  const alertViews = recentAlerts
    .map((alert) => toAlertView(alert, touristLookup.get(alert.touristId)))
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  const touristSummaries = allTourists
    .map((tourist) => toTouristSummary(tourist, alertsByTourist.get(tourist._id) ?? []))
    .sort((a, b) => (b.lastPing ?? "").localeCompare(a.lastPing ?? ""));

  const stats = {
    criticalAlerts: alertViews.filter((alert) => alert.priority === "critical" && isAlertActive(alert.status)).length,
    activeAlerts: alertViews.filter((alert) => isAlertActive(alert.status)).length,
    monitoredTourists: touristSummaries.filter((summary) => summary.status !== "safe").length,
    totalTourists: touristSummaries.length
  };

  const responseUnits = allPoliceDepartments.map((dept) => toResponseUnit(dept));

  return {
    stats,
    alerts: alertViews,
    tourists: touristSummaries,
    responseUnits
  };
}

export async function getTouristDashboard(touristId: string) {
  const tourist = await getTouristById(touristId);
  if (!tourist) {
    return null;
  }

  const [touristAlertsRaw, activeRiskZones, blockchainLogsRaw] = await Promise.all([
    getAlertsByTouristId(touristId),
    getActiveRiskZones(),
    getRecentLogs(touristId, 10),
  ]);

  const touristAlerts = touristAlertsRaw.map((alert) => toTouristAlert(alert));

  const safetyScore = tourist.safetyScore ?? 100;
  const status = deriveTouristStatus(safetyScore, touristAlerts);

  const profile = {
    id: tourist._id,
    name: tourist.name,
    email: tourist.email,
    phone: tourist.phone,
    passportNumber: tourist.passportNumber,
    dateOfBirth: tourist.dateOfBirth,
    address: tourist.address,
    gender: tourist.gender,
    nationality: tourist.nationality,
    emergencyContact: tourist.emergencyContact,
    bloodType: tourist.bloodType,
    allergies: tourist.allergies,
    medicalConditions: tourist.medicalConditions,
    safetyScore,
    idHash: tourist.idHash
  };

  const lastLocation = {
    lat: tourist.currentLat,
    lng: tourist.currentLng,
    lastSeen: tourist.lastSeen ?? null
  };

  const riskZoneViews = activeRiskZones.map((zone) => toRiskZoneView(zone));

  const blockchainLogs = blockchainLogsRaw.map((log) => ({
    id: log.logId,
    transactionId: log.transactionId,
    status: log.status,
    timestamp: log.createdAt?.toISOString() ?? new Date().toISOString()
  }));

  const openAlerts = touristAlerts.filter((alert) => isAlertActive(alert.status)).length;

  return {
    profile,
    alerts: touristAlerts,
    safetyScore,
    status,
    lastLocation,
    riskZones: riskZoneViews,
    openAlerts,
    blockchainLogs
  };
}

function toAlertView(alert: IAlert, tourist?: ITourist) {
  const priority = derivePriority(alert);
  const description = alert.message ?? alert.alertType;
  return {
    id: alert.alertId,
    touristId: alert.touristId,
    touristName: tourist?.name ?? "Unknown",
    alertType: alert.alertType,
    priority,
    status: alert.status,
    description,
    timestamp: alert.createdAt?.toISOString() ?? new Date().toISOString(),
    lat: alert.latitude ?? null,
    lng: alert.longitude ?? null,
    assignedUnit: null
  };
}

function toTouristSummary(tourist: ITourist, alertsForTourist: IAlert[]) {
  const safetyScore = tourist.safetyScore ?? 100;
  const status = deriveTouristStatus(
    safetyScore,
    alertsForTourist.map((alert) => toTouristAlert(alert))
  );
  const lastKnownArea = buildLastKnownArea(tourist.currentLat, tourist.currentLng);
  return {
    id: tourist._id,
    name: tourist.name,
    status,
    safetyScore,
    lastPing: tourist.lastSeen ?? null,
    lat: tourist.currentLat ?? null,
    lng: tourist.currentLng ?? null,
    lastKnownArea
  };
}

function toResponseUnit(dept: IPoliceDepartment) {
  const status = dept.isActive ? "available" : "offline";
  const type = dept.departmentCode?.toUpperCase().includes("CONTROL") ? "Control Center" : "Response Unit";
  const etaMinutes = dept.isActive ? 6 : 15;
  return {
    id: dept._id,
    name: dept.name,
    status,
    type,
    city: dept.city,
    district: dept.district,
    state: dept.state,
    lat: dept.latitude,
    lng: dept.longitude,
    etaMinutes,
    contactNumber: dept.contactNumber
  };
}

function toTouristAlert(alert: IAlert) {
  return {
    id: alert.alertId,
    alertType: alert.alertType,
    priority: derivePriority(alert),
    status: alert.status,
    message: alert.message ?? null,
    timestamp: alert.createdAt?.toISOString() ?? new Date().toISOString()
  };
}

function toRiskZoneView(zone: IRiskZone) {
  return {
    id: zone.zoneId,
    name: zone.name,
    description: zone.description ?? null,
    centerLat: zone.centerLat,
    centerLng: zone.centerLng,
    radiusMeters: zone.radiusMeters,
    riskLevel: zone.riskLevel ?? null,
    active: zone.active,
    updatedAt: zone.updatedAt?.toISOString() ?? null
  };
}

function deriveTouristStatus(safetyScore: number, alertsList: Array<{ priority: string; status?: string }>) {
  const hasCriticalAlert = alertsList.some(
    (alert) => isAlertActive(alert.status) && alert.priority.toLowerCase() === "critical"
  );
  if (hasCriticalAlert) {
    return "sos";
  }
  const hasWarningAlert = alertsList.some((alert) => isAlertActive(alert.status));
  if (hasWarningAlert || safetyScore < 70.0) {
    return "warning";
  }
  return "safe";
}

function derivePriority(alert: IAlert) {
  const type = alert.alertType ? alert.alertType.toUpperCase() : "";
  switch (type) {
    case "SOS":
      return "critical";
    case "RISK_ZONE":
    case "DEVIATION":
    case "INACTIVITY":
      return "high";
    default:
      return "info";
  }
}

function isAlertActive(status?: string) {
  return !status || status.toUpperCase() !== "RESOLVED";
}

function buildLastKnownArea(lat?: number, lng?: number) {
  if (typeof lat !== "number" || typeof lng !== "number") {
    return "Unknown";
  }
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}
