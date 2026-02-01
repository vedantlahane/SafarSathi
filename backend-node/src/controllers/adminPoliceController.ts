import type { Request, Response } from "express";
import {
  createPoliceDepartment,
  deletePoliceDepartment,
  getPoliceDepartment,
  listPoliceDepartments,
  updatePoliceDepartment
} from "../services/policeService.js";

export async function createPolice(req: Request, res: Response) {
  const dept = await createPoliceDepartment(req.body);
  res.status(201).json(stripPassword(dept));
}

export async function listPolice(_req: Request, res: Response) {
  const depts = await listPoliceDepartments();
  res.json(depts.map(stripPassword));
}

export async function getPolice(req: Request, res: Response) {
  const id = normalizeParam(req.params.id);
  if (!id) {
    return res.status(400).json({ message: "Invalid police ID." });
  }
  const dept = await getPoliceDepartment(id);
  if (!dept) {
    return res.status(404).json({ message: "Not found" });
  }
  return res.json(stripPassword(dept));
}

export async function updatePolice(req: Request, res: Response) {
  const id = normalizeParam(req.params.id);
  if (!id) {
    return res.status(400).json({ message: "Invalid police ID." });
  }
  const dept = await updatePoliceDepartment(id, req.body);
  if (!dept) {
    return res.status(404).json({ message: "Not found" });
  }
  return res.json(stripPassword(dept));
}

export async function deletePolice(req: Request, res: Response) {
  const id = normalizeParam(req.params.id);
  if (!id) {
    return res.status(400).json({ message: "Invalid police ID." });
  }
  const ok = await deletePoliceDepartment(id);
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
