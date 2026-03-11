import {
  getAllRiskZones,
  getActiveRiskZones,
  getRiskZoneById,
  createRiskZone as createZone,
  updateRiskZone as updateZone,
  deleteRiskZone as deleteZone,
  getRiskZonesNearby,
  getRiskZoneStats,
  bulkUpdateRiskZoneStatus,
  type IRiskZone,
} from "./mongoStore.js";

export async function listRiskZones() {
  return getAllRiskZones();
}

export async function listActiveRiskZones() {
  return getActiveRiskZones();
}

export async function createRiskZone(payload: Partial<IRiskZone>) {
  return createZone({
    ...payload,
    riskLevel: payload.riskLevel ?? "MEDIUM",
    active: payload.active ?? true,
  });
}

export async function updateRiskZone(id: number, payload: Partial<IRiskZone>) {
  return updateZone(id, payload);
}

export async function toggleZoneStatus(id: number, active: boolean) {
  return updateZone(id, { active });
}

export async function deleteRiskZone(id: number) {
  return deleteZone(id);
}

export async function findNearbyZones(
  lat: number,
  lng: number,
  radiusKm: number,
  riskLevel?: string
) {
  return getRiskZonesNearby(lat, lng, radiusKm, riskLevel);
}

export async function getZoneStats() {
  return getRiskZoneStats();
}

export async function bulkToggleStatus(zoneIds: number[], active: boolean) {
  return bulkUpdateRiskZoneStatus(zoneIds, active);
}
