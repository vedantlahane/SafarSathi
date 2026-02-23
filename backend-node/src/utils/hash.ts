import crypto from "crypto";
import bcrypt from "bcryptjs";

export function sha256(data: string) {
  return crypto.createHash("sha256").update(data, "utf8").digest("hex");
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
