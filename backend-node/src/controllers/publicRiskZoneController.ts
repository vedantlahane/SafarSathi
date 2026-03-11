import type { Request, Response } from "express";
import { listActiveRiskZones, findNearbyZones } from "../services/RiskZoneService.js";
import { nearbyQuerySchema } from "../validators/riskZone.validator.js";

export async function listPublicActiveZones(_req: Request, res: Response) {
  res.json(await listActiveRiskZones());
}

export async function listNearbyZones(req: Request, res: Response) {
  const parsed = nearbyQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid query parameters",
      errors: parsed.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      })),
    });
  }
  const { lat, lng, radiusKm, riskLevel } = parsed.data;
  const zones = await findNearbyZones(lat, lng, radiusKm, riskLevel);
  return res.json(zones);
}
