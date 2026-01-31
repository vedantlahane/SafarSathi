import type { PoliceDepartment } from "../models/PoliceDepartment.js";
import { policeDepartments } from "./dataStore.js";
import { sha256 } from "../utils/hash.js";

export function validateAdminLogin(email: string, password: string) {
  if (!email || !password) {
    return null;
  }
  const admin = policeDepartments.find((dept) => dept.email.toLowerCase() === email.trim().toLowerCase());
  if (!admin) {
    return null;
  }
  const hashedPassword = sha256(password);
  if (hashedPassword !== admin.passwordHash) {
    return null;
  }
  return admin;
}

export function generateAdminToken(policeDepartment: PoliceDepartment) {
  const tokenData = `${policeDepartment.email}:${Date.now()}`;
  return Buffer.from(tokenData, "utf8").toString("base64");
}
