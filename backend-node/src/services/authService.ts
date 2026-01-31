import type { Tourist } from "../models/Tourist.js";
import { tourists } from "./dataStore.js";
import { generateId } from "../utils/id.js";

export function registerTourist(payload: Pick<Tourist, "name" | "email" | "phone">) {
  const existing = tourists.find((t) => t.email === payload.email);
  if (existing) {
    return { ok: false, message: "Email already registered" };
  }
  const tourist: Tourist = {
    id: generateId("tourist"),
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    verified: false
  };
  tourists.push(tourist);
  return { ok: true, tourist };
}

export function loginTourist(email: string) {
  const tourist = tourists.find((t) => t.email === email);
  if (!tourist) {
    return { ok: false, message: "Tourist not found" };
  }
  return { ok: true, tourist, token: `token_${tourist.id}` };
}

export function getProfile(touristId: string) {
  return tourists.find((t) => t.id === touristId);
}
