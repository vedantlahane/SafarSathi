import type { Request, Response } from "express";
import type { JwtPayload } from "../middleware/authMiddleware.js";
import {
  createHospital,
  getHospitalById,
  listAllHospitals,
  listActiveHospitals,
  updateHospital,
  deleteHospital,
  findNearbyHospitals,
} from "../services/hospitalService.js";
import { writeAuditLog } from "../services/auditService.js";

export async function listHospitals(_req: Request, res: Response) {
  const hospitals = await listAllHospitals();
  return res.json(hospitals);
}

export async function listPublicHospitals(_req: Request, res: Response) {
  const hospitals = await listActiveHospitals();
  // Strip internal admin-only fields from public response
  const sanitized = hospitals.map((h) => ({
    hospitalId: h.hospitalId,
    name: h.name,
    latitude: h.latitude,
    longitude: h.longitude,
    contact: h.contact,
    type: h.type,
    tier: h.tier,
    emergency: h.emergency,
    city: h.city,
    district: h.district,
    state: h.state,
    specialties: h.specialties,
    operatingHours: h.operatingHours,
    ambulanceAvailable: h.ambulanceAvailable,
    isActive: h.isActive,
  }));
  return res.json(sanitized);
}

export async function getHospital(req: Request, res: Response) {
  const id = Number(req.params.hospitalId);
  if (isNaN(id)) return res.status(400).json({ message: "Invalid hospital ID" });
  const hospital = await getHospitalById(id);
  if (!hospital) return res.status(404).json({ message: "Hospital not found" });
  return res.json(hospital);
}

export async function createHospitalHandler(req: Request, res: Response) {
  const admin = req.user as JwtPayload | undefined;
  const hospital = await createHospital(req.body);

  if (admin?.sub) {
    await writeAuditLog({
      actor: admin.sub,
      actorType: "admin",
      action: "created",
      targetCollection: "hospitals",
      targetId: String(hospital.hospitalId),
      changes: req.body,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });
  }

  return res.status(201).json(hospital);
}

export async function updateHospitalHandler(req: Request, res: Response) {
  const admin = req.user as JwtPayload | undefined;
  const id = Number(req.params.hospitalId);
  if (isNaN(id)) return res.status(400).json({ message: "Invalid hospital ID" });

  const updated = await updateHospital(id, req.body);
  if (!updated) return res.status(404).json({ message: "Hospital not found" });

  if (admin?.sub) {
    await writeAuditLog({
      actor: admin.sub,
      actorType: "admin",
      action: "updated",
      targetCollection: "hospitals",
      targetId: String(id),
      changes: req.body,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });
  }

  return res.json(updated);
}

export async function deleteHospitalHandler(req: Request, res: Response) {
  const admin = req.user as JwtPayload | undefined;
  const id = Number(req.params.hospitalId);
  if (isNaN(id)) return res.status(400).json({ message: "Invalid hospital ID" });

  const deleted = await deleteHospital(id);
  if (!deleted) return res.status(404).json({ message: "Hospital not found" });

  if (admin?.sub) {
    await writeAuditLog({
      actor: admin.sub,
      actorType: "admin",
      action: "deleted",
      targetCollection: "hospitals",
      targetId: String(id),
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });
  }

  return res.json({ acknowledged: true });
}

export async function nearbyHospitals(req: Request, res: Response) {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const maxDistance = Number(req.query.maxDistance) || 50000;
  const limit = Number(req.query.limit) || 5;

  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ message: "lat and lng query parameters are required" });
  }

  const hospitals = await findNearbyHospitals(lat, lng, maxDistance, limit);
  return res.json(hospitals);
}
