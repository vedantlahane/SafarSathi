import type { Request, Response } from "express";
import { createSOS, recordLocation } from "../services/sosService.js";

export function postLocation(req: Request, res: Response) {
  const { touristId } = req.params;
  const { lat, lng } = req.body as { lat?: number; lng?: number };
  if (typeof lat !== "number" || typeof lng !== "number") {
    return res.status(400).json({ success: false, error: "lat and lng required", timestamp: new Date().toISOString() });
  }
  const data = recordLocation(touristId, { lat, lng });
  return res.json({ success: true, data, timestamp: new Date().toISOString() });
}

export function postSOS(req: Request, res: Response) {
  const { touristId } = req.params;
  const { message } = req.body as { message?: string };
  const alert = createSOS(touristId, message);
  return res.status(201).json({ success: true, data: alert, timestamp: new Date().toISOString() });
}
