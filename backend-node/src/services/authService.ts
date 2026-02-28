import { sha256, hashPassword, comparePassword } from "../utils/hash.js";
import { randomBytes } from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { issueDigitalID } from "./BlockchainService.js";
import { randomUUID } from "crypto";
import { processLocation } from "./AnomalyService.js";
import {
  getAllTourists,
  getTouristById,
  getTouristByEmail,
  createTourist,
  updateTourist,
  type ITourist,
} from "./mongoStore.js";
import { TouristModel } from "../schemas/index.js";

type TouristRegistration = {
  name: string;
  email: string;
  phone: string;
  passportNumber: string;
  dateOfBirth?: string;
  address?: string;
  gender?: string;
  nationality?: string;
  emergencyContact?: { name?: string; phone?: string };
  bloodType?: string;
  allergies?: string[];
  medicalConditions?: string[];
  passwordHash: string; // Actually raw password from frontend
  currentLat?: number;
  currentLng?: number;
};

export async function registerTourist(
  payload: TouristRegistration
): Promise<{ ok: true; tourist: ITourist } | { ok: false; message: string }> {
  const existing = await getTouristByEmail(payload.email);
  if (existing) {
    return { ok: false, message: "Email already registered" };
  }

  const rawPassword = payload.passwordHash;
  const hashedPassword = await hashPassword(rawPassword);
  const idHashInput = `${payload.passportNumber}${payload.phone}${new Date().toISOString()}`;
  const idHash = sha256(idHashInput);

  const now = new Date();
  const expiry = new Date(now.getTime());
  expiry.setFullYear(expiry.getFullYear() + 1);

  const tourist = await createTourist({
    _id: randomUUID(),
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    passportNumber: payload.passportNumber,
    dateOfBirth: payload.dateOfBirth,
    address: payload.address,
    gender: payload.gender,
    nationality: payload.nationality,
    emergencyContact: payload.emergencyContact,
    bloodType: payload.bloodType,
    allergies: payload.allergies,
    medicalConditions: payload.medicalConditions,
    passwordHash: hashedPassword,
    idHash,
    idExpiry: expiry.toISOString(),
    lastSeen: now.toISOString(),
    safetyScore: 100,
    currentLat: payload.currentLat,
    currentLng: payload.currentLng,
  });

  await issueDigitalID(tourist._id, tourist.idHash!);
  return { ok: true, tourist };
}

export async function validateTouristLoginByEmail(email: string, rawPassword: string) {
  const tourist = await getTouristByEmail(email);
  if (!tourist) {
    return null;
  }
  const isValid = await comparePassword(rawPassword, tourist.passwordHash);
  if (!isValid) {
    return null;
  }
  return tourist;
}

export function login(touristId: string) {
  return jwt.sign({ sub: touristId, role: "tourist" }, env.jwtSecret, { expiresIn: env.jwtExpiry as any });
}

export async function getProfile(touristId: string) {
  return getTouristById(touristId);
}

export async function updateProfile(touristId: string, payload: Record<string, unknown>) {
  const tourist = await getTouristById(touristId);
  if (!tourist) {
    return null;
  }

  const email = payload.email as string | undefined;
  if (email) {
    const existingWithEmail = await getTouristByEmail(email);
    if (existingWithEmail && existingWithEmail._id !== touristId) {
      throw new Error("Email already registered");
    }
  }

  const updates: Partial<ITourist> = {};
  if (payload.name !== undefined) updates.name = payload.name as string;
  if (payload.email !== undefined) updates.email = payload.email as string;
  if (payload.phone !== undefined) updates.phone = payload.phone as string;
  if (payload.passportNumber !== undefined) updates.passportNumber = payload.passportNumber as string;
  if (payload.dateOfBirth !== undefined) updates.dateOfBirth = payload.dateOfBirth as string;
  if (payload.address !== undefined) updates.address = payload.address as string;
  if (payload.gender !== undefined) updates.gender = payload.gender as string;
  if (payload.nationality !== undefined) updates.nationality = payload.nationality as string;
  if (payload.emergencyContact !== undefined) {
    updates.emergencyContact = payload.emergencyContact as { name?: string; phone?: string };
  }
  if (payload.bloodType !== undefined) updates.bloodType = payload.bloodType as string;
  if (payload.allergies !== undefined) updates.allergies = payload.allergies as string[];
  if (payload.medicalConditions !== undefined) {
    updates.medicalConditions = payload.medicalConditions as string[];
  }

  return updateTourist(touristId, updates);
}

export async function verifyIdHash(idHash: string) {
  const tourist = await TouristModel.findOne({ idHash }).lean();
  if (!tourist) {
    throw new Error("Digital ID not found or invalid.");
  }
  return tourist;
}

export async function updateLocation(touristId: string, lat: number, lng: number, accuracy?: number, speed?: number, heading?: number) {
  const tourist = await getTouristById(touristId);
  if (!tourist) {
    throw new Error("Tourist not found.");
  }

  const updated = await updateTourist(touristId, {
    currentLat: lat,
    currentLng: lng,
    speed,
    heading,
    locationAccuracy: accuracy,
    lastSeen: new Date().toISOString(),
  });

  if (updated) {
    // Write to location log (time-series) for ML pipeline
    const { createLocationLog } = await import("./mongoStore.js");
    await createLocationLog({
      touristId,
      latitude: lat,
      longitude: lng,
      speed,
      heading,
      accuracy,
      safetyScoreAtTime: updated.safetyScore ?? 100,
    }).catch((err) => console.error("Location log write failed:", err));

    await processLocation(updated, accuracy);
  }

  return updated;
}

export async function listTourists() {
  return getAllTourists();
}

export async function requestPasswordReset(email: string) {
  const tourist = await getTouristByEmail(email);
  if (!tourist) {
    return { ok: true };
  }

  const resetToken = randomBytes(20).toString("hex");
  const resetTokenHash = sha256(resetToken);
  const expires = new Date(Date.now() + 1000 * 60 * 30);

  await updateTourist(tourist._id, {
    resetTokenHash,
    resetTokenExpires: expires,
  });

  return { ok: true, resetToken };
}

export async function confirmPasswordReset(token: string, newPassword: string) {
  const tokenHash = sha256(token);
  const tourist = await TouristModel.findOne({
    resetTokenHash: tokenHash,
    resetTokenExpires: { $gt: new Date() },
  });

  if (!tourist) {
    return { ok: false, message: "Invalid or expired reset token." };
  }

  const hashedPassword = await hashPassword(newPassword);
  tourist.passwordHash = hashedPassword;
  tourist.resetTokenHash = undefined;
  tourist.resetTokenExpires = undefined;
  await tourist.save();

  return { ok: true };
}
