import type { Request, Response } from "express";
import {
  createPoliceDepartment,
  deletePoliceDepartment,
  getPoliceDepartment,
  listPoliceDepartments,
  updatePoliceDepartment
} from "../services/policeService.js";

export function createPolice(req: Request, res: Response) {
  const dept = createPoliceDepartment(req.body);
  res.status(201).json({ success: true, data: dept, timestamp: new Date().toISOString() });
}

export function listPolice(_req: Request, res: Response) {
  res.json({ success: true, data: listPoliceDepartments(), timestamp: new Date().toISOString() });
}

export function getPolice(req: Request, res: Response) {
  const dept = getPoliceDepartment(req.params.id);
  if (!dept) {
    return res.status(404).json({ success: false, error: "Not found", timestamp: new Date().toISOString() });
  }
  return res.json({ success: true, data: dept, timestamp: new Date().toISOString() });
}

export function updatePolice(req: Request, res: Response) {
  const dept = updatePoliceDepartment(req.params.id, req.body);
  if (!dept) {
    return res.status(404).json({ success: false, error: "Not found", timestamp: new Date().toISOString() });
  }
  return res.json({ success: true, data: dept, timestamp: new Date().toISOString() });
}

export function deletePolice(req: Request, res: Response) {
  const ok = deletePoliceDepartment(req.params.id);
  return res.status(ok ? 200 : 404).json({ success: ok, timestamp: new Date().toISOString() });
}
