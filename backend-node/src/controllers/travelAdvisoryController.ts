import type { Request, Response } from "express";
import type { JwtPayload } from "../middleware/authMiddleware.js";
import {
  createAdvisory,
  getAdvisoryById,
  listAdvisories,
  listCurrentAdvisories,
  updateAdvisory,
  deleteAdvisory,
} from "../services/advisoryService.js";
import { writeAuditLog } from "../services/auditService.js";
import { broadcastToRoom } from "../services/websocketHub.js";

export async function listAllAdvisories(req: Request, res: Response) {
  const active = req.query.active !== undefined ? req.query.active === "true" : undefined;
  const region = req.query.region as string | undefined;
  const advisories = await listAdvisories({ active, region });
  return res.json(advisories);
}

export async function listCurrent(_req: Request, res: Response) {
  const advisories = await listCurrentAdvisories();
  return res.json(advisories);
}

export async function getAdvisory(req: Request, res: Response) {
  const id = Number(req.params.advisoryId);
  if (isNaN(id)) return res.status(400).json({ message: "Invalid advisory ID" });
  const advisory = await getAdvisoryById(id);
  if (!advisory) return res.status(404).json({ message: "Advisory not found" });
  return res.json(advisory);
}

export async function createAdvisoryHandler(req: Request, res: Response) {
  const admin = req.user as JwtPayload | undefined;

  const advisory = await createAdvisory({
    ...req.body,
    issuedBy: admin?.sub,
  });

  if (admin?.sub) {
    await writeAuditLog({
      actor: admin.sub,
      actorType: "admin",
      action: "created",
      targetCollection: "traveladvisories",
      targetId: String(advisory.advisoryId),
      changes: req.body,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });
  }

  // Broadcast new advisory to all connected clients
  broadcastToRoom("admin", {
    type: "ADVISORY_CREATED",
    payload: { advisoryId: advisory.advisoryId, title: advisory.title, severity: advisory.severity },
  });

  return res.status(201).json(advisory);
}

export async function updateAdvisoryHandler(req: Request, res: Response) {
  const admin = req.user as JwtPayload | undefined;
  const id = Number(req.params.advisoryId);
  if (isNaN(id)) return res.status(400).json({ message: "Invalid advisory ID" });

  const updated = await updateAdvisory(id, req.body);
  if (!updated) return res.status(404).json({ message: "Advisory not found" });

  if (admin?.sub) {
    await writeAuditLog({
      actor: admin.sub,
      actorType: "admin",
      action: "updated",
      targetCollection: "traveladvisories",
      targetId: String(id),
      changes: req.body,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });
  }

  return res.json(updated);
}

export async function deleteAdvisoryHandler(req: Request, res: Response) {
  const admin = req.user as JwtPayload | undefined;
  const id = Number(req.params.advisoryId);
  if (isNaN(id)) return res.status(400).json({ message: "Invalid advisory ID" });

  const deleted = await deleteAdvisory(id);
  if (!deleted) return res.status(404).json({ message: "Advisory not found" });

  if (admin?.sub) {
    await writeAuditLog({
      actor: admin.sub,
      actorType: "admin",
      action: "deleted",
      targetCollection: "traveladvisories",
      targetId: String(id),
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });
  }

  return res.json({ acknowledged: true });
}
