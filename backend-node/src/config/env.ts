import dotenv from "dotenv";

dotenv.config();

const parsedMlTimeoutMs = Number(process.env.SAFETY_ML_TIMEOUT_MS ?? 2500);

export const env = {
  port: Number(process.env.PORT ?? 8081),
  corsOrigin: process.env.CORS_ORIGIN ?? "*",
  logLevel: process.env.LOG_LEVEL ?? "info",
  mongoUri: process.env.MONGO_URI ?? "mongodb://localhost:27017/safarsathi",
  jwtSecret: process.env.JWT_SECRET ?? "default_unsafe_secret",
  jwtExpiry: process.env.JWT_EXPIRY ?? "7d",
  webauthnRpId: process.env.WEBAUTHN_RP_ID ?? "localhost",
  webauthnOrigin: process.env.WEBAUTHN_ORIGIN ?? "http://localhost:5173",
  safetyMlApiUrl: (process.env.SAFETY_ML_API_URL ?? "").trim(),
  safetyMlTimeoutMs:
    Number.isFinite(parsedMlTimeoutMs) && parsedMlTimeoutMs > 0
      ? parsedMlTimeoutMs
      : 2500,
};
