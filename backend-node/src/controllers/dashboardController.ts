import type { Request, Response } from "express";
import { getAdminDashboardState, getTouristDashboard } from "../services/dashboardService.js";

export function adminDashboard(_req: Request, res: Response) {
  const data = getAdminDashboardState();
  res.json({ success: true, data, timestamp: new Date().toISOString() });
}

export function touristDashboard(req: Request, res: Response) {
  const data = getTouristDashboard(req.params.touristId);
  res.json({ success: true, data, timestamp: new Date().toISOString() });
}
