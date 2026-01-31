import type { RiskZone } from "../models/RiskZone.js";
import { riskZones, nextRiskZoneId, saveStore } from "./dataStore.js";

export function listRiskZones() {
  return riskZones;
}

export function listActiveRiskZones() {
  return riskZones.filter((z) => z.active);
}

export function createRiskZone(payload: Omit<RiskZone, "id" | "createdAt" | "updatedAt">) {
  const now = new Date().toISOString();
  const zone: RiskZone = {
    id: nextRiskZoneId(),
    createdAt: now,
    updatedAt: now,
    ...payload,
    riskLevel: payload.riskLevel ?? "MEDIUM",
    active: payload.active ?? true
  };
  riskZones.push(zone);
  saveStore();
  return zone;
}

export function updateRiskZone(id: number, payload: Partial<RiskZone>) {
  const zone = riskZones.find((z) => z.id === id);
  if (!zone) {
    return null;
  }
  Object.assign(zone, payload);
  zone.updatedAt = new Date().toISOString();
  saveStore();
  return zone;
}

export function toggleZoneStatus(id: number, active: boolean) {
  const zone = riskZones.find((z) => z.id === id);
  if (!zone) {
    return null;
  }
  zone.active = active;
  zone.updatedAt = new Date().toISOString();
  saveStore();
  return zone;
}

export function deleteRiskZone(id: number) {
  const index = riskZones.findIndex((z) => z.id === id);
  if (index === -1) {
    return false;
  }
  riskZones.splice(index, 1);
  saveStore();
  return true;
}
