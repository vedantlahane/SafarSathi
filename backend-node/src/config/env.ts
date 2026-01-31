import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT ?? 8080),
  corsOrigin: process.env.CORS_ORIGIN ?? "*",
  logLevel: process.env.LOG_LEVEL ?? "info"
};
