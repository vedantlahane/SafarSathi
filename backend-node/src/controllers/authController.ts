import type { Request, Response } from "express";
import type { Tourist } from "../models/Tourist.js";
import { getProfile, login, registerTourist, validateTouristLoginByEmail } from "../services/authService.js";

export function register(req: Request, res: Response) {
  const payload = req.body as Record<string, unknown>;
  const name = payload.name as string | undefined;
  const email = payload.email as string | undefined;
  const phone = payload.phone as string | undefined;
  const passportNumber = payload.passportNumber as string | undefined;
  const passwordHash = payload.passwordHash as string | undefined;

  if (!name || !email || !phone || !passportNumber || !passwordHash) {
    return res.status(400).json({ message: "Required fields missing." });
  }

  const result = registerTourist(payload as Tourist);
  if (!result.ok) {
    return res.status(400).json({ message: result.message });
  }

  const token = login(result.tourist.phone);
  const user = buildUserResponse(result.tourist);
  return res.status(201).json({
    touristId: result.tourist.id,
    qr_content: `/api/admin/id/verify?hash=${result.tourist.idHash}`,
    token,
    user
  });
}

export function login(req: Request, res: Response) {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password || !email.trim() || !password.trim()) {
    return res.status(400).json({ message: "Email and password are required." });
  }
  const tourist = validateTouristLoginByEmail(email, password);
  if (!tourist) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const token = login(tourist.phone);
  const user = buildUserResponse(tourist);
  return res.json({
    touristId: tourist.id,
    qr_content: `/api/admin/id/verify?hash=${tourist.idHash}`,
    token,
    user
  });
}

export function profile(req: Request, res: Response) {
  if (!isValidUuid(req.params.touristId)) {
    return res.status(400).json({ message: "Invalid tourist ID format." });
  }
  const profileData = getProfile(req.params.touristId);
  if (!profileData) {
    return res.status(404).json({ message: "Tourist not found." });
  }
  return res.json(buildUserResponse(profileData));
}

function buildUserResponse(tourist: {
  id: string;
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
}) {
  return {
    id: tourist.id,
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
    lastSeen: tourist.lastSeen
  };
}

function isValidUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}
