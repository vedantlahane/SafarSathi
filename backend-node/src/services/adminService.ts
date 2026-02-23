import { comparePassword, sha256 } from "../utils/hash.js";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { getPoliceDepartmentByEmail, type IPoliceDepartment } from "./mongoStore.js";

export async function validateAdminLogin(email: string, password: string) {
  if (!email || !password) {
    return null;
  }
  const admin = await getPoliceDepartmentByEmail(email.trim().toLowerCase());
  if (!admin) {
    return null;
  }
  const isValid = await comparePassword(password, admin.passwordHash);
  if (!isValid) {
    return null;
  }
  return admin;
}

export function generateAdminToken(policeDepartment: IPoliceDepartment) {
  return jwt.sign({ sub: policeDepartment._id, role: "admin" }, env.jwtSecret, { expiresIn: env.jwtExpiry });
}
