import type { Request, Response } from "express";
import {
  listAlerts,
  listTourists,
  loginAdmin,
  updateAlertStatus,
  verifyTouristId
} from "../services/adminService.js";

export function adminLogin(req: Request, res: Response) {
  const { email } = req.body as { email?: string };
  const result = email ? loginAdmin(email) : { ok: false, message: "Email required" };
  res.status(result.ok ? 200 : 400).json({ success: result.ok, data: result, timestamp: new Date().toISOString() });
}

export function verifyId(req: Request, res: Response) {
  const idNumber = String(req.query.idNumber ?? "");
  const result = verifyTouristId(idNumber);
  res.json({ success: true, data: result, timestamp: new Date().toISOString() });
}

export function getAlerts(_req: Request, res: Response) {
  res.json({ success: true, data: listAlerts(), timestamp: new Date().toISOString() });
}

export function updateAlert(req: Request, res: Response) {
  const { alertId } = req.params;
  const { status } = req.body as { status?: "open" | "acknowledged" | "resolved" };
  if (!status) {
    return res.status(400).json({ success: false, error: "status required", timestamp: new Date().toISOString() });
  }
  const result = updateAlertStatus(alertId, status);
  return res.status(result.ok ? 200 : 404).json({ success: result.ok, data: result, error: result.ok ? undefined : result.message, timestamp: new Date().toISOString() });
}

export function getTourists(_req: Request, res: Response) {
  res.json({ success: true, data: listTourists(), timestamp: new Date().toISOString() });
}
