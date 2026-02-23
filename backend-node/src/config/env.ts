import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT ?? 8081),
  corsOrigin: process.env.CORS_ORIGIN ?? "*",
  logLevel: process.env.LOG_LEVEL ?? "info",
  mongoUri: process.env.MONGO_URI ?? "mongodb://localhost:27017/safarsathi",
  jwtSecret: process.env.JWT_SECRET ?? "default_unsafe_secret",
  jwtExpiry: process.env.JWT_EXPIRY ?? "7d"
};
