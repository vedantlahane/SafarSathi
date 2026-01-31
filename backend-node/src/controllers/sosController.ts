import type { Request, Response } from "express";
import { createSOS, recordLocation } from "../services/sosService.js";

export function postLocation(req: Request, res: Response) {
  const touristId = normalizeParam(req.params.touristId);
  if (!touristId) {
    return res.status(400).json({ message: "Invalid tourist ID." });
  }
  const { lat, lng, accuracy } = req.body as { lat?: number; lng?: number; accuracy?: number };
  if (typeof lat !== "number" || typeof lng !== "number") {
    return res.status(400).json({ message: "lat and lng required" });
  }
  try {
    recordLocation(touristId, { lat, lng, accuracy });
    return res.status(204).send();
  } catch (error) {
    const message = (error as Error).message;
    if (message === "Tourist not found.") {
      return res.status(404).json({ message: "Tourist not found." });
    }
    throw error;
  }
}

export function postSOS(req: Request, res: Response) {
  const touristId = normalizeParam(req.params.touristId);
  if (!touristId) {
    return res.status(400).json({ message: "Invalid tourist ID." });
  }
  const { lat, lng } = req.body as { lat?: number; lng?: number };
  createSOS(touristId, lat, lng);
  return res.json({ status: "SOS Alert initiated. Emergency response notified." });
}

function normalizeParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}
