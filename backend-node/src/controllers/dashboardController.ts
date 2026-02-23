import type { Request, Response } from "express";
import { normalizeParam } from "../utils/params.js";
import { getAdminDashboardState, getTouristDashboard } from "../services/dashboardService.js";

export async function adminDashboard(_req: Request, res: Response) {
  const data = await getAdminDashboardState();
  res.json(data);
}

export async function touristDashboard(req: Request, res: Response) {
  const touristId = normalizeParam(req.params.touristId);
  if (!touristId) {
    return res.status(400).json({ message: "Invalid tourist ID." });
  }
  const data = await getTouristDashboard(touristId);
  if (!data) {
    return res.status(404).json({ message: "Tourist not found" });
  }
  return res.json(data);
}
