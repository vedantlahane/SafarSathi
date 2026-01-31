import type { RiskZone } from "../models/RiskZone.js";
import { riskZones } from "./dataStore.js";
import { generateId } from "../utils/id.js";

export function listRiskZones() {
  return riskZones;
}

export function listActiveRiskZones() {
  return riskZones.filter((z) => z.active);
}

export function createRiskZone(payload: Omit<RiskZone, "id">) {
  const zone: RiskZone = { id: generateId("zone"), ...payload };
  riskZones.push(zone);
  return zone;
}

export function updateRiskZone(id: string, payload: Partial<RiskZone>) {
  const zone = riskZones.find((z) => z.id === id);
  if (!zone) {
    return null;
  }
  Object.assign(zone, payload);
  return zone;
}

export function deleteRiskZone(id: string) {
  const index = riskZones.findIndex((z) => z.id === id);
  if (index === -1) {
    return false;
  }
  riskZones.splice(index, 1);
  return true;
}
