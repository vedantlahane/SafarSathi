import { sha256 } from "../utils/hash.js";
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
  emergencyContact?: string;
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
  const hashedPassword = sha256(rawPassword);
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
    passwordHash: hashedPassword,
    idHash,
    idExpiry: expiry.toISOString(),
    lastSeen: now.toISOString(),
    safetyScore: 100,
    currentLat: payload.currentLat,
    currentLng: payload.currentLng,
  });

  await issueDigitalID(tourist._id, tourist.idHash);
  return { ok: true, tourist };
}

export async function validateTouristLoginByEmail(email: string, rawPassword: string) {
  const tourist = await getTouristByEmail(email);
  if (!tourist) {
    return null;
  }
  const hashedInputPassword = sha256(rawPassword);
  if (hashedInputPassword !== tourist.passwordHash) {
    return null;
  }
  return tourist;
}

export function login(phone: string) {
  return `MOCK_JWT_TOKEN_${sha256(phone).substring(0, 10)}`;
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
  if (payload.emergencyContact !== undefined) updates.emergencyContact = payload.emergencyContact as string;

  return updateTourist(touristId, updates);
}

export async function verifyIdHash(idHash: string) {
  const tourist = await TouristModel.findOne({ idHash }).lean();
  if (!tourist) {
    throw new Error("Digital ID not found or invalid.");
  }
  return tourist;
}

export async function updateLocation(touristId: string, lat: number, lng: number, accuracy?: number) {
  const tourist = await getTouristById(touristId);
  if (!tourist) {
    throw new Error("Tourist not found.");
  }

  const updated = await updateTourist(touristId, {
    currentLat: lat,
    currentLng: lng,
    lastSeen: new Date().toISOString(),
  });

  if (updated) {
    await processLocation(updated, accuracy);
  }

  return updated;
}

export async function listTourists() {
  return getAllTourists();
}
