import { alerts, riskZones, tourists } from "./dataStore.js";

export function getAdminDashboardState() {
  return {
    totalTourists: tourists.length,
    activeRiskZones: riskZones.filter((z) => z.active).length,
    openAlerts: alerts.filter((a) => a.status === "open").length
  };
}

export function getTouristDashboard(touristId: string) {
  const tourist = tourists.find((t) => t.id === touristId);
  return {
    tourist,
    activeRiskZones: riskZones.filter((z) => z.active),
    recentAlerts: alerts.filter((a) => a.touristId === touristId)
  };
}
