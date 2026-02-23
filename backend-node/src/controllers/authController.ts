import type { Request, Response } from "express";
import { normalizeParam } from "../utils/params.js";
import {
  getProfile,
  login as issueLoginToken,
  registerTourist,
  updateProfile,
  validateTouristLoginByEmail
} from "../services/authService.js";

export async function register(req: Request, res: Response) {
  const payload = req.body as Record<string, unknown>;
  const name = payload.name as string | undefined;
  const email = payload.email as string | undefined;
  const phone = payload.phone as string | undefined;
  const passportNumber = payload.passportNumber as string | undefined;
  const passwordHash = payload.passwordHash as string | undefined;

  if (!name || !email || !phone || !passportNumber || !passwordHash) {
    return res.status(400).json({ message: "Required fields missing." });
  }

  const result = await registerTourist({
    name,
    email,
    phone,
    passportNumber,
    passwordHash,
    dateOfBirth: payload.dateOfBirth as string | undefined,
    address: payload.address as string | undefined,
    gender: payload.gender as string | undefined,
    nationality: payload.nationality as string | undefined,
    emergencyContact: payload.emergencyContact as string | undefined,
    currentLat: payload.currentLat as number | undefined,
    currentLng: payload.currentLng as number | undefined
  });
  if (!result.ok) {
    return res.status(400).json({ message: result.message });
  }

  const token = issueLoginToken(result.tourist._id.toString());
  const user = buildUserResponse(result.tourist);
  return res.status(201).json({
    touristId: result.tourist._id,
    qr_content: `/api/admin/id/verify?hash=${result.tourist.idHash}`,
    token,
    user
  });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password || !email.trim() || !password.trim()) {
    return res.status(400).json({ message: "Email and password are required." });
  }
  const tourist = await validateTouristLoginByEmail(email, password);
  if (!tourist) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const token = issueLoginToken(tourist._id.toString());
  const user = buildUserResponse(tourist);
  return res.json({
    touristId: tourist._id,
    qr_content: `/api/admin/id/verify?hash=${tourist.idHash}`,
    token,
    user
  });
}

export async function profile(req: Request, res: Response) {
  const touristId = normalizeParam(req.params.touristId);
  if (!touristId || !isValidUuid(touristId)) {
    return res.status(400).json({ message: "Invalid tourist ID format." });
  }
  const profileData = await getProfile(touristId);
  if (!profileData) {
    return res.status(404).json({ message: "Tourist not found." });
  }
  return res.json(buildUserResponse(profileData));
}

export async function updateProfileDetails(req: Request, res: Response) {
  const touristId = normalizeParam(req.params.touristId);
  if (!touristId || !isValidUuid(touristId)) {
    return res.status(400).json({ message: "Invalid tourist ID format." });
  }
  try {
    const updated = await updateProfile(touristId, req.body as Record<string, unknown>);
    if (!updated) {
      return res.status(404).json({ message: "Tourist not found." });
    }
    return res.json(buildUserResponse(updated));
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

function buildUserResponse(tourist: {
  _id: string;
  name: string;
  email: string;
  phone: string;
  passportNumber: string;
  dateOfBirth?: string;
  address?: string;
  gender?: string;
  nationality?: string;
  emergencyContact?: string;
  currentLat?: number;
  currentLng?: number;
  lastSeen?: string;
  idHash?: string;
  idExpiry?: string;
}) {
  return {
    id: tourist._id,
    name: tourist.name,
    email: tourist.email,
    phone: tourist.phone,
    passportNumber: tourist.passportNumber,
    dateOfBirth: tourist.dateOfBirth,
    address: tourist.address,
    gender: tourist.gender,
    nationality: tourist.nationality,
    emergencyContact: tourist.emergencyContact,
    currentLat: tourist.currentLat,
    currentLng: tourist.currentLng,
    lastSeen: tourist.lastSeen,
    idHash: tourist.idHash,
    idExpiry: tourist.idExpiry
  };
}

function isValidUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}
