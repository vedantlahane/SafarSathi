import {
  getAllRiskZones,
  getActiveRiskZones,
  getRiskZoneById,
  createRiskZone as createZone,
  updateRiskZone as updateZone,
  deleteRiskZone as deleteZone,
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
