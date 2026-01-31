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
  res.status(201).json(stripPassword(dept));
}

export function listPolice(_req: Request, res: Response) {
  res.json(listPoliceDepartments().map(stripPassword));
}

export function getPolice(req: Request, res: Response) {
  const id = normalizeParam(req.params.id);
  if (!id) {
    return res.status(400).json({ message: "Invalid police ID." });
  }
  const dept = getPoliceDepartment(id);
  if (!dept) {
    return res.status(404).json({ message: "Not found" });
  }
  return res.json(stripPassword(dept));
}

export function updatePolice(req: Request, res: Response) {
  const id = normalizeParam(req.params.id);
  if (!id) {
    return res.status(400).json({ message: "Invalid police ID." });
  }
  const dept = updatePoliceDepartment(id, req.body);
  if (!dept) {
    return res.status(404).json({ message: "Not found" });
  }
  return res.json(stripPassword(dept));
}

export function deletePolice(req: Request, res: Response) {
  const id = normalizeParam(req.params.id);
  if (!id) {
    return res.status(400).json({ message: "Invalid police ID." });
  }
  const ok = deletePoliceDepartment(id);
  if (!ok) {
    return res.status(404).json({ message: "Not found" });
  }
  return res.status(204).send();
}

function stripPassword(dept: { passwordHash?: string }) {
  const { passwordHash, ...rest } = dept;
  return rest;
}

function normalizeParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}
