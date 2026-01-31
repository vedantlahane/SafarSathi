import type { Request, Response } from "express";
import {
  createRiskZone,
  deleteRiskZone,
  listActiveRiskZones,
  listRiskZones,
  toggleZoneStatus,
  updateRiskZone
} from "../services/RiskZoneService.js";

export function listZones(_req: Request, res: Response) {
  res.json(listRiskZones());
}

export function listActiveZones(_req: Request, res: Response) {
  res.json(listActiveRiskZones());
}

export function createZone(req: Request, res: Response) {
  const zone = createRiskZone(req.body);
  res.status(201).json(zone);
}

export function updateZone(req: Request, res: Response) {
  const zoneId = Number(req.params.zoneId);
  const zone = updateRiskZone(zoneId, req.body);
  if (!zone) {
    return res.status(404).json({ message: "Not found" });
  }
  return res.json(zone);
}

export function deleteZone(req: Request, res: Response) {
  const zoneId = Number(req.params.zoneId);
  const ok = deleteRiskZone(zoneId);
  if (!ok) {
    return res.status(404).json({ message: "Not found" });
  }
  return res.status(204).send();
}

export function toggleZone(req: Request, res: Response) {
  const zoneId = Number(req.params.zoneId);
  const active = String(req.query.active ?? "true") === "true";
  const zone = toggleZoneStatus(zoneId, active);
  if (!zone) {
    return res.status(404).json({ message: "Not found" });
  }
  return res.json(zone);
}
