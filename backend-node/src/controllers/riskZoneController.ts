import type { Request, Response } from "express";
import {
  createRiskZone,
  deleteRiskZone,
  listActiveRiskZones,
  listRiskZones,
  toggleZoneStatus,
  updateRiskZone,
  getZoneStats,
  bulkToggleStatus,
} from "../services/RiskZoneService.js";
import {
  createRiskZoneSchema,
  updateRiskZoneSchema,
  bulkStatusSchema,
} from "../validators/riskZone.validator.js";

export async function listZones(_req: Request, res: Response) {
  res.json(await listRiskZones());
}

export async function listActiveZones(_req: Request, res: Response) {
  res.json(await listActiveRiskZones());
}

export async function createZone(req: Request, res: Response) {
  const parsed = createRiskZoneSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: parsed.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      })),
    });
  }
  const zone = await createRiskZone(parsed.data);
  res.status(201).json(zone);
}

export async function updateZone(req: Request, res: Response) {
  const zoneId = Number(req.params.zoneId);
  const parsed = updateRiskZoneSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: parsed.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      })),
    });
  }
  const zone = await updateRiskZone(zoneId, parsed.data);
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

export async function zoneStats(_req: Request, res: Response) {
  const stats = await getZoneStats();
  return res.json(stats);
}

export async function bulkStatus(req: Request, res: Response) {
  const parsed = bulkStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: parsed.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      })),
    });
  }
  const modifiedCount = await bulkToggleStatus(parsed.data.zoneIds, parsed.data.active);
  return res.json({ modifiedCount });
}
