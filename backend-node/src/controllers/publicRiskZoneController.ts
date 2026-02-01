import type { Request, Response } from "express";
import { listActiveRiskZones } from "../services/RiskZoneService.js";

export async function listPublicActiveZones(_req: Request, res: Response) {
  res.json(await listActiveRiskZones());
}
