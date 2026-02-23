import type { Request, Response } from "express";
import { normalizeParam } from "../utils/params.js";
import { createSOS, recordLocation } from "../services/sosService.js";

export async function postLocation(req: Request, res: Response) {
  const touristId = normalizeParam(req.params.touristId);
  if (!touristId) {
    return res.status(400).json({ message: "Invalid tourist ID." });
  }
  const { lat, lng, accuracy } = req.body as { lat?: number; lng?: number; accuracy?: number };
  if (typeof lat !== "number" || typeof lng !== "number") {
    return res.status(400).json({ message: "lat and lng required" });
  }
  try {
    await recordLocation(touristId, { lat, lng, accuracy });
    return res.status(204).send();
  } catch (error) {
    const message = (error as Error).message;
    if (message === "Tourist not found.") {
      return res.status(404).json({ message: "Tourist not found." });
    }
    throw error;
  }
}

export async function postSOS(req: Request, res: Response) {
  const touristId = normalizeParam(req.params.touristId);
  if (!touristId) {
    return res.status(400).json({ message: "Invalid tourist ID." });
  }
  const { lat, lng } = req.body as { lat?: number; lng?: number };
  await createSOS(touristId, lat, lng);
  return res.json({ status: "SOS Alert initiated. Emergency response notified." });
}
