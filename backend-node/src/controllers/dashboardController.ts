import type { Request, Response } from "express";
import { getAdminDashboardState, getTouristDashboard } from "../services/dashboardService.js";

export function adminDashboard(_req: Request, res: Response) {
  const data = getAdminDashboardState();
  res.json(data);
}

export function touristDashboard(req: Request, res: Response) {
  const data = getTouristDashboard(req.params.touristId);
  if (!data) {
    return res.status(404).json({ message: "Tourist not found" });
  }
  return res.json(data);
}
