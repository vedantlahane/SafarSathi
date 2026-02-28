import type { Request, Response } from "express";
import { normalizeParam } from "../utils/params.js";
import {
  getProfile,
  login as issueLoginToken,
  registerTourist,
  updateProfile,
  validateTouristLoginByEmail,
  requestPasswordReset as requestReset,
  confirmPasswordReset as confirmReset
} from "../services/authService.js";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import type { VerifiedRegistrationResponse, VerifiedAuthenticationResponse } from "@simplewebauthn/server";
import { getTouristById, getTouristByEmail, updateTourist } from "../services/mongoStore.js";
import { env } from "../config/env.js";
import type { JwtPayload } from "../middleware/authMiddleware.js";

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
    emergencyContact: payload.emergencyContact as { name?: string; phone?: string } | undefined,
    bloodType: payload.bloodType as string | undefined,
    allergies: payload.allergies as string[] | undefined,
    medicalConditions: payload.medicalConditions as string[] | undefined,
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
  if (!touristId || !isValidIdFormat(touristId)) {
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
  if (!touristId || !isValidIdFormat(touristId)) {
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

export async function requestPasswordReset(req: Request, res: Response) {
  const { email } = req.body as { email?: string };
  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  const result = await requestReset(email);
  return res.json({ acknowledged: true, resetToken: result.resetToken });
}

export async function confirmPasswordReset(req: Request, res: Response) {
  const { token, password } = req.body as { token?: string; password?: string };
  if (!token || !password) {
    return res.status(400).json({ message: "Token and password required." });
  }

  const result = await confirmReset(token, password);
  if (!result.ok) {
    return res.status(400).json({ message: result.message });
  }
  return res.json({ acknowledged: true });
}

const webauthnChallenges = new Map<string, string>();

export async function biometricRegistrationOptions(req: Request, res: Response) {
  const user = req.user as JwtPayload | undefined;
  if (!user?.sub) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const tourist = await getTouristById(user.sub);
  if (!tourist) {
    return res.status(404).json({ message: "Tourist not found." });
  }

  const options = await generateRegistrationOptions({
    rpName: "YatraX",
    rpID: env.webauthnRpId,
    userID: Buffer.from(tourist._id),
    userName: tourist.email,
    userDisplayName: tourist.name,
    attestationType: "none",
    authenticatorSelection: {
      userVerification: "preferred",
      residentKey: "preferred",
    },
  });

  webauthnChallenges.set(tourist._id, options.challenge);
  return res.json(options);
}

export async function biometricRegistrationVerify(req: Request, res: Response) {
  const user = req.user as JwtPayload | undefined;
  if (!user?.sub) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const tourist = await getTouristById(user.sub);
  if (!tourist) {
    return res.status(404).json({ message: "Tourist not found." });
  }

  const expectedChallenge = webauthnChallenges.get(tourist._id);
  if (!expectedChallenge) {
    return res.status(400).json({ message: "Registration challenge expired." });
  }

  const verification = (await verifyRegistrationResponse({
    response: req.body,
    expectedChallenge,
    expectedOrigin: env.webauthnOrigin,
    expectedRPID: env.webauthnRpId,
  })) as VerifiedRegistrationResponse;

  if (!verification.verified || !verification.registrationInfo) {
    return res.status(400).json({ message: "Registration failed." });
  }

  const { credential } = verification.registrationInfo;

  const credentials = tourist.webauthnCredentials ?? [];
  credentials.push({
    credentialId: credential.id,
    publicKey: Buffer.from(credential.publicKey).toString("base64url"),
    counter: credential.counter,
    transports: credential.transports,
  });

  await updateTourist(tourist._id, { webauthnCredentials: credentials });
  webauthnChallenges.delete(tourist._id);
  return res.json({ acknowledged: true });
}

export async function biometricLoginOptions(req: Request, res: Response) {
  const { email } = req.body as { email?: string };
  if (!email) {
    return res.status(400).json({ message: "Email required." });
  }
  const tourist = await getTouristByEmail(email);
  if (!tourist || !tourist.webauthnCredentials?.length) {
    return res.status(404).json({ message: "No biometrics registered." });
  }

  const options = await generateAuthenticationOptions({
    rpID: env.webauthnRpId,
    allowCredentials: tourist.webauthnCredentials.map((cred) => ({
      id: cred.credentialId,
    })),
    userVerification: "preferred",
  });

  webauthnChallenges.set(tourist._id, options.challenge);
  return res.json({ options, touristId: tourist._id });
}

export async function biometricLoginVerify(req: Request, res: Response) {
  const { touristId, response } = req.body as { touristId?: string; response?: unknown };
  if (!touristId || !response) {
    return res.status(400).json({ message: "Invalid request." });
  }

  const tourist = await getTouristById(touristId);
  if (!tourist || !tourist.webauthnCredentials?.length) {
    return res.status(404).json({ message: "No biometrics registered." });
  }

  const expectedChallenge = webauthnChallenges.get(tourist._id);
  if (!expectedChallenge) {
    return res.status(400).json({ message: "Login challenge expired." });
  }

  const cred = tourist.webauthnCredentials.find((c) => c.credentialId === (response as any).id);
  if (!cred) {
    return res.status(400).json({ message: "Credential not found." });
  }

  const verification = (await verifyAuthenticationResponse({
    response: response as any,
    expectedChallenge,
    expectedOrigin: env.webauthnOrigin,
    expectedRPID: env.webauthnRpId,
    credential: {
      id: cred.credentialId,
      publicKey: Buffer.from(cred.publicKey, "base64url"),
      counter: cred.counter,
    },
  })) as VerifiedAuthenticationResponse;

  if (!verification.verified) {
    return res.status(400).json({ message: "Biometric verification failed." });
  }

  const updatedCredentials = tourist.webauthnCredentials.map((item) =>
    item.credentialId === verification.authenticationInfo.credentialID
      ? { ...item, counter: verification.authenticationInfo.newCounter }
      : item
  );
  await updateTourist(tourist._id, { webauthnCredentials: updatedCredentials });

  const token = issueLoginToken(tourist._id.toString());
  const user = buildUserResponse(tourist);
  return res.json({ touristId: tourist._id, token, user });
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
  emergencyContact?: { name?: string; phone?: string } | string;
  bloodType?: string;
  allergies?: string[];
  medicalConditions?: string[];
  currentLat?: number;
  currentLng?: number;
  lastSeen?: string;
  idHash?: string;
  idExpiry?: string;
}) {
  const emergencyContact = normalizeEmergencyContact(tourist.emergencyContact);
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
    emergencyContact,
    bloodType: tourist.bloodType,
    allergies: tourist.allergies,
    medicalConditions: tourist.medicalConditions,
    currentLat: tourist.currentLat,
    currentLng: tourist.currentLng,
    lastSeen: tourist.lastSeen,
    idHash: tourist.idHash,
    idExpiry: tourist.idExpiry
  };
}

function normalizeEmergencyContact(value?: { name?: string; phone?: string } | string) {
  if (!value) return undefined;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as { name?: string; phone?: string };
      return parsed;
    } catch {
      return { phone: value };
    }
  }
  return value;
}

function isValidIdFormat(value: string) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(value);
  return isUuid || isObjectId;
}
