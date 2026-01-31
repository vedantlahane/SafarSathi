import type { Alert } from "../models/Alert.js";
import type { PoliceDepartment } from "../models/PoliceDepartment.js";
import type { RiskZone } from "../models/RiskZone.js";
import type { Tourist } from "../models/Tourist.js";
import { alerts, policeDepartments, riskZones, tourists } from "./dataStore.js";
import { getRecentLogs } from "./BlockchainService.js";

export function getAdminDashboardState() {
  const recentAlerts = getRecentAlerts(50);
  const touristLookup = new Map(tourists.map((t) => [t.id, t]));
  const alertsByTourist = new Map<string, Alert[]>();
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

  const touristSummaries = tourists
    .map((tourist) => toTouristSummary(tourist, alertsByTourist.get(tourist.id) ?? []))
    .sort((a, b) => (b.lastPing ?? "").localeCompare(a.lastPing ?? ""));

  const stats = {
    criticalAlerts: alertViews.filter((alert) => alert.priority === "critical" && isAlertActive(alert.status)).length,
    activeAlerts: alertViews.filter((alert) => isAlertActive(alert.status)).length,
    monitoredTourists: touristSummaries.filter((summary) => summary.status !== "safe").length,
    totalTourists: touristSummaries.length
  };

  const responseUnits = policeDepartments.map((dept) => toResponseUnit(dept));

  return {
    stats,
    alerts: alertViews,
    tourists: touristSummaries,
    responseUnits
  };
}

export function getTouristDashboard(touristId: string) {
  const tourist = tourists.find((t) => t.id === touristId) ?? null;
  if (!tourist) {
    return null;
  }

  const touristAlerts = alerts
    .filter((alert) => alert.touristId === touristId)
    .sort((a, b) => b.createdTime.localeCompare(a.createdTime))
    .map((alert) => toTouristAlert(alert));

  const safetyScore = tourist.safetyScore ?? 100;
  const status = deriveTouristStatus(safetyScore, touristAlerts);

  const profile = {
    id: tourist.id,
    name: tourist.name,
    email: tourist.email,
    phone: tourist.phone,
    passportNumber: tourist.passportNumber,
    dateOfBirth: tourist.dateOfBirth,
    address: tourist.address,
    gender: tourist.gender,
    nationality: tourist.nationality,
    emergencyContact: tourist.emergencyContact,
    safetyScore,
    idHash: tourist.idHash
  };

  const lastLocation = {
    lat: tourist.currentLat,
    lng: tourist.currentLng,
    lastSeen: tourist.lastSeen ?? null
  };

  const riskZoneViews = riskZones
    .filter((zone) => zone.active)
    .map((zone) => toRiskZoneView(zone));

  const blockchainLogs = getRecentLogs(touristId, 10).map((log) => ({
    id: log.id,
    transactionId: log.transactionId,
    status: log.status,
    timestamp: log.timestamp
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

function getRecentAlerts(limit: number) {
  const sorted = [...alerts].sort((a, b) => b.createdTime.localeCompare(a.createdTime));
  if (limit <= 0 || sorted.length <= limit) {
    return sorted;
  }
  return sorted.slice(0, limit);
}

function toAlertView(alert: Alert, tourist?: Tourist) {
  const priority = derivePriority(alert);
  const description = alert.message ?? alert.alertType;
  return {
    id: alert.id,
    touristId: alert.touristId,
    touristName: tourist?.name ?? "Unknown",
    alertType: alert.alertType,
    priority,
    status: alert.status,
    description,
    timestamp: alert.createdTime,
    lat: alert.lat ?? null,
    lng: alert.lng ?? null,
    assignedUnit: null
  };
}

function toTouristSummary(tourist: Tourist, alertsForTourist: Alert[]) {
  const safetyScore = tourist.safetyScore ?? 100;
  const status = deriveTouristStatus(
    safetyScore,
    alertsForTourist.map((alert) => toTouristAlert(alert))
  );
  const lastKnownArea = buildLastKnownArea(tourist.currentLat, tourist.currentLng);
  return {
    id: tourist.id,
    name: tourist.name,
    status,
    safetyScore,
    lastPing: tourist.lastSeen ?? null,
    lat: tourist.currentLat ?? null,
    lng: tourist.currentLng ?? null,
    lastKnownArea
  };
}

function toResponseUnit(dept: PoliceDepartment) {
  const status = dept.isActive ? "available" : "offline";
  const type = dept.departmentCode?.toUpperCase().includes("CONTROL") ? "Control Center" : "Response Unit";
  const etaMinutes = dept.isActive ? 6 : 15;
  return {
    id: dept.id,
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

function toTouristAlert(alert: Alert) {
  return {
    id: alert.id,
    alertType: alert.alertType,
    priority: derivePriority(alert),
    status: alert.status,
    message: alert.message ?? null,
    timestamp: alert.createdTime
  };
}

function toRiskZoneView(zone: RiskZone) {
  return {
    id: zone.id,
    name: zone.name,
    description: zone.description ?? null,
    centerLat: zone.centerLat,
    centerLng: zone.centerLng,
    radiusMeters: zone.radiusMeters,
    riskLevel: zone.riskLevel ?? null,
    active: zone.active,
    updatedAt: zone.updatedAt ?? null
  };
}

function deriveTouristStatus(safetyScore: number, alertsList: Array<{ priority: string; status: string }>) {
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

function derivePriority(alert: Alert) {
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
