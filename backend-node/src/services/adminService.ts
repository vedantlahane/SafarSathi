import { sha256 } from "../utils/hash.js";
import { getPoliceDepartmentByEmail, type IPoliceDepartment } from "./mongoStore.js";

export async function validateAdminLogin(email: string, password: string) {
  if (!email || !password) {
    return null;
  }
  const admin = await getPoliceDepartmentByEmail(email.trim().toLowerCase());
  if (!admin) {
    return null;
  }
  const hashedPassword = sha256(password);
  if (hashedPassword !== admin.passwordHash) {
    return null;
  }
  return admin;
}

export function generateAdminToken(policeDepartment: IPoliceDepartment) {
  const tokenData = `${policeDepartment.email}:${Date.now()}`;
  return Buffer.from(tokenData, "utf8").toString("base64");
}
