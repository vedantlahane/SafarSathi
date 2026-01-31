import type { Request, Response } from "express";
import { listActiveRiskZones } from "../services/RiskZoneService.js";

export function listPublicActiveZones(_req: Request, res: Response) {
  res.json(listActiveRiskZones());
}
