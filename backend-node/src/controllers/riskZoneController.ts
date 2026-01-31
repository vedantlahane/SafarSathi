import type { Request, Response } from "express";
import {
  createRiskZone,
  deleteRiskZone,
  listActiveRiskZones,
  listRiskZones,
  updateRiskZone
} from "../services/RiskZoneService.js";

export function listZones(_req: Request, res: Response) {
  res.json({ success: true, data: listRiskZones(), timestamp: new Date().toISOString() });
}

export function listActiveZones(_req: Request, res: Response) {
  res.json({ success: true, data: listActiveRiskZones(), timestamp: new Date().toISOString() });
}

export function createZone(req: Request, res: Response) {
  const zone = createRiskZone(req.body);
  res.status(201).json({ success: true, data: zone, timestamp: new Date().toISOString() });
}

export function updateZone(req: Request, res: Response) {
  const zone = updateRiskZone(req.params.zoneId, req.body);
  if (!zone) {
    return res.status(404).json({ success: false, error: "Not found", timestamp: new Date().toISOString() });
  }
  return res.json({ success: true, data: zone, timestamp: new Date().toISOString() });
}

export function deleteZone(req: Request, res: Response) {
  const ok = deleteRiskZone(req.params.zoneId);
  return res.status(ok ? 200 : 404).json({ success: ok, timestamp: new Date().toISOString() });
}
