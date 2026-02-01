import type { Request, Response } from "express";
import {
  createRiskZone,
  deleteRiskZone,
  listActiveRiskZones,
  listRiskZones,
  toggleZoneStatus,
  updateRiskZone
} from "../services/RiskZoneService.js";

export async function listZones(_req: Request, res: Response) {
  res.json(await listRiskZones());
}

export async function listActiveZones(_req: Request, res: Response) {
  res.json(await listActiveRiskZones());
}

export async function createZone(req: Request, res: Response) {
  const zone = await createRiskZone(req.body);
  res.status(201).json(zone);
}

export async function updateZone(req: Request, res: Response) {
  const zoneId = Number(req.params.zoneId);
  const zone = await updateRiskZone(zoneId, req.body);
  if (!zone) {
    return res.status(404).json({ message: "Not found" });
  }
  return res.json(zone);
}

export async function deleteZone(req: Request, res: Response) {
  const zoneId = Number(req.params.zoneId);
  const ok = await deleteRiskZone(zoneId);
  if (!ok) {
    return res.status(404).json({ message: "Not found" });
  }
  return res.status(204).send();
}

export async function toggleZone(req: Request, res: Response) {
  const zoneId = Number(req.params.zoneId);
  const active = String(req.query.active ?? "true") === "true";
  const zone = await toggleZoneStatus(zoneId, active);
  if (!zone) {
    return res.status(404).json({ message: "Not found" });
  }
  return res.json(zone);
}
