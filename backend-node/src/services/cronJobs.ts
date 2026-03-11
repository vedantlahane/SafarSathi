import cron from "node-cron";
import { TouristModel } from "../schemas/index.js";
import { getActiveRiskZones } from "./mongoStore.js";
import { isPointWithinRadius } from "../utils/geoFence.js";
import { broadcastToRoom } from "./websocketHub.js";

/**
 * Periodic safety-score recomputation.
 * Runs every 5 minutes, recalculates scores for all active tourists
 * based on current risk zone proximity, and pushes changes via WebSocket.
 */
function startSafetyScoreCron() {
  // Every 5 minutes
  cron.schedule("*/5 * * * *", async () => {
    try {
      const activeTourists = await TouristModel.find({ isActive: true }).lean();
      const activeZones = await getActiveRiskZones();

      if (activeTourists.length === 0 || activeZones.length === 0) {
        return;
      }

      for (const tourist of activeTourists) {
        if (typeof tourist.currentLat !== "number" || typeof tourist.currentLng !== "number") {
          continue;
        }

        let score = 100;

        // Penalize based on proximity to risk zones
        for (const zone of activeZones) {
          if (isPointWithinRadius(tourist.currentLat, tourist.currentLng, zone.centerLat, zone.centerLng, zone.radiusMeters)) {
            const penalty = zone.riskLevel === "CRITICAL" ? 25 : zone.riskLevel === "HIGH" ? 18 : zone.riskLevel === "MEDIUM" ? 10 : 5;
            score -= penalty;
          }
        }

        // Check inactivity (reduce score if no update in >30 min)
        if (tourist.lastSeen) {
          const lastSeenMs = new Date(tourist.lastSeen).getTime();
          const minutesSince = (Date.now() - lastSeenMs) / 60000;
          if (minutesSince > 60) {
            score -= 15;
          } else if (minutesSince > 30) {
            score -= 5;
          }
        }

        score = Math.max(0, Math.min(100, score));

        // Only update if score changed
        if (score !== tourist.safetyScore) {
          await TouristModel.findByIdAndUpdate(tourist._id, {
            safetyScore: score,
            lastScoreUpdate: new Date(),
          });

          // Push real-time score update via WebSocket
          broadcastToRoom(`tourist:${tourist._id}`, {
            type: "SCORE_UPDATE",
            payload: {
              touristId: tourist._id,
              safetyScore: score,
              timestamp: new Date().toISOString(),
            },
          });
        }
      }
    } catch (error) {
      console.error("❌ Safety score cron failed:", error);
    }
  });

  console.log("⏰ Safety score cron job started (every 5 minutes)");
}

/**
 * Cron to deactivate expired risk zones (belt-and-suspenders with TTL index).
 * Runs every 15 minutes.
 */
function startExpiredZoneCleanupCron() {
  cron.schedule("*/15 * * * *", async () => {
    try {
      const { RiskZoneModel } = await import("../schemas/index.js");
      const now = new Date();
      const result = await RiskZoneModel.updateMany(
        { expiresAt: { $lte: now }, active: true },
        { $set: { active: false } }
      );

      if (result.modifiedCount > 0) {
        console.log(`🗑️ Deactivated ${result.modifiedCount} expired risk zones`);
        broadcastToRoom("admin", {
          type: "ZONE_UPDATE",
          payload: { event: "zones_expired", count: result.modifiedCount },
        });
      }
    } catch (error) {
      console.error("❌ Expired zone cleanup failed:", error);
    }
  });

  console.log("⏰ Expired zone cleanup cron started (every 15 minutes)");
}

/**
 * Initialize all cron jobs. Called once from index.ts after DB connection.
 */
export function startCronJobs() {
  startSafetyScoreCron();
  startExpiredZoneCleanupCron();
}
