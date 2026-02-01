import mongoose from "mongoose";
import { env } from "./env.js";

let isConnected = false;

export async function connectDatabase(): Promise<boolean> {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(env.mongoUri, {
      dbName: "safarsathi",
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    isConnected = true;
    console.log("✅ MongoDB connected successfully");
    return true;
  } catch (error) {
    console.error("⚠️ MongoDB connection failed:", (error as Error).message);
    console.log("📝 Note: If using MongoDB Atlas, whitelist your IP at https://cloud.mongodb.com");
    console.log("🔄 Starting server without database (will use in-memory fallback)...");
    return false;
  }
}

export function isDatabaseConnected() {
  return isConnected;
}

mongoose.connection.on("disconnected", () => {
  isConnected = false;
  console.log("⚠️ MongoDB disconnected");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB error:", err);
});
