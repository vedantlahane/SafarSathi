import type { Request, Response } from "express";
import { getProfile, loginTourist, registerTourist } from "../services/authService.js";

export function register(req: Request, res: Response) {
  const { name, email, phone } = req.body as { name?: string; email?: string; phone?: string };
  if (!name || !email) {
    return res.status(400).json({ success: false, error: "name and email required", timestamp: new Date().toISOString() });
  }
  const result = registerTourist({ name, email, phone });
  return res.status(result.ok ? 201 : 400).json({ success: result.ok, data: result, error: result.ok ? undefined : result.message, timestamp: new Date().toISOString() });
}

export function login(req: Request, res: Response) {
  const { email } = req.body as { email?: string };
  if (!email) {
    return res.status(400).json({ success: false, error: "email required", timestamp: new Date().toISOString() });
  }
  const result = loginTourist(email);
  return res.status(result.ok ? 200 : 404).json({ success: result.ok, data: result, error: result.ok ? undefined : result.message, timestamp: new Date().toISOString() });
}

export function profile(req: Request, res: Response) {
  const profileData = getProfile(req.params.touristId);
  if (!profileData) {
    return res.status(404).json({ success: false, error: "Not found", timestamp: new Date().toISOString() });
  }
  return res.json({ success: true, data: profileData, timestamp: new Date().toISOString() });
}
