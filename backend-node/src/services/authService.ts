import type { Tourist } from "../models/Tourist.js";
import { tourists, saveStore } from "./dataStore.js";
import { sha256 } from "../utils/hash.js";
import { issueDigitalID } from "./BlockchainService.js";
import { randomUUID } from "crypto";
import { processLocation } from "./AnomalyService.js";

type TouristRegistration = Omit<Tourist, "id" | "idHash" | "idExpiry" | "lastSeen" | "safetyScore">;

export function registerTourist(
  payload: TouristRegistration
): { ok: true; tourist: Tourist } | { ok: false; message: string } {
  const existing = tourists.find((t) => t.email === payload.email);
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

  const tourist: Tourist = {
    id: randomUUID(),
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
    currentLng: payload.currentLng
  };
  tourists.push(tourist);
  issueDigitalID(tourist.id, tourist.idHash);
  saveStore();
  return { ok: true, tourist };
}

export function validateTouristLoginByEmail(email: string, rawPassword: string) {
  const tourist = tourists.find((t) => t.email === email);
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

export function getProfile(touristId: string) {
  return tourists.find((t) => t.id === touristId) ?? null;
}

export function verifyIdHash(idHash: string) {
  const tourist = tourists.find((t) => t.idHash === idHash);
  if (!tourist) {
    throw new Error("Digital ID not found or invalid.");
  }
  return tourist;
}

export function updateLocation(touristId: string, lat: number, lng: number, accuracy?: number) {
  const tourist = tourists.find((t) => t.id === touristId);
  if (!tourist) {
    throw new Error("Tourist not found.");
  }
  tourist.currentLat = lat;
  tourist.currentLng = lng;
  tourist.lastSeen = new Date().toISOString();
  processLocation(tourist, accuracy);
  saveStore();
  return tourist;
}

export function listTourists() {
  return tourists;
}
