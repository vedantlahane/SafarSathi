import type { Request, Response } from "express";
import { normalizeParam } from "../utils/params.js";
import {
  createSOS,
  recordLocation,
  createPreAlert,
  cancelSOSAlert,
  getSOSStatus,
} from "../services/sosService.js";

export async function postLocation(req: Request, res: Response) {
  const touristId = normalizeParam(req.params.touristId);
  if (!touristId) {
    return res.status(400).json({ message: "Invalid tourist ID." });
  }
  const { lat, lng, accuracy, speed, heading } = req.body as {
    lat: number;
    lng: number;
    accuracy?: number;
    speed?: number;
    heading?: number;
  };
  try {
    await recordLocation(touristId, { lat, lng, accuracy, speed, heading });
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
  const { lat, lng, message, media } = req.body as {
    lat?: number;
    lng?: number;
    message?: string;
    media?: string[];
  };
  const alert = await createSOS(touristId, lat, lng, message, media);
  return res.json({
    status: "SOS Alert initiated. Emergency response notified.",
    alertId: alert.alertId,
  });
}

export async function postPreAlert(req: Request, res: Response) {
  const touristId = normalizeParam(req.params.touristId);
  if (!touristId) {
    return res.status(400).json({ message: "Invalid tourist ID." });
  }
  const { lat, lng } = req.body as { lat?: number; lng?: number };
  const alert = await createPreAlert(touristId, lat, lng);
  return res.json({
    status: "Pre-alert registered. Monitoring initiated.",
    alertId: alert.alertId,
  });
}

export async function cancelSOS(req: Request, res: Response) {
  const alertId = Number(req.params.alertId);
  if (isNaN(alertId)) {
    return res.status(400).json({ message: "Invalid alert ID." });
  }
  const alert = await cancelSOSAlert(alertId);
  if (!alert) {
    return res.status(404).json({ message: "Alert not found." });
  }
  return res.json({ status: "Alert cancelled.", alertId: alert.alertId, alertStatus: alert.status });
}

export async function getAlertStatus(req: Request, res: Response) {
  const alertId = Number(req.params.alertId);
  if (isNaN(alertId)) {
    return res.status(400).json({ message: "Invalid alert ID." });
  }
  const status = await getSOSStatus(alertId);
  if (!status) {
    return res.status(404).json({ message: "Alert not found." });
  }
  return res.json(status);
}
