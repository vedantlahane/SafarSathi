import type { Request, Response } from "express";
import { generateAdminToken, validateAdminLogin } from "../services/adminService.js";
import { getActiveAlerts, getAllAlerts, updateAlertStatus } from "../services/AlertService.js";
import { listTourists, verifyIdHash } from "../services/authService.js";
import { verifyIDProof } from "../services/BlockchainService.js";

export function adminLogin(req: Request, res: Response) {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }
  try {
    const admin = validateAdminLogin(email, password);
    if (!admin) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    const token = generateAdminToken(admin);
    return res.json({
      success: true,
      message: "Login successful",
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        departmentCode: admin.departmentCode,
        city: admin.city,
        district: admin.district,
        state: admin.state
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Login failed: ${(error as Error).message}` });
  }
}

export function verifyId(req: Request, res: Response) {
  const hash = String(req.query.hash ?? "");
  if (!hash) {
    return res.status(400).json({ message: "hash is required" });
  }
  try {
    const tourist = verifyIdHash(hash);
    const isProofValid = verifyIDProof(hash);
    const passportPartial = tourist.passportNumber ? `${tourist.passportNumber.slice(0, 2)}****` : "";
    return res.json({
      valid: isProofValid,
      name: tourist.name,
      passport_partial: passportPartial,
      id_expiry: tourist.idExpiry,
      blockchain_status: isProofValid ? "VERIFIED ON IMMUTABLE LOG" : "PROOF FAILED"
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: (error as Error).message });
  }
}

export function getAlerts(_req: Request, res: Response) {
  res.json(getActiveAlerts());
}

export function getAlertHistory(_req: Request, res: Response) {
  res.json(getAllAlerts());
}

export function updateAlert(req: Request, res: Response) {
  const { alertId } = req.params;
  const status =
    (req.query.status as string | undefined) ??
    (req.body as { status?: string }).status;
  if (!status) {
    return res.status(400).json({ message: "status required" });
  }
  const updated = updateAlertStatus(Number(alertId), status.toUpperCase());
  return res.json(updated);
}

export function getTourists(_req: Request, res: Response) {
  res.json(listTourists());
}
