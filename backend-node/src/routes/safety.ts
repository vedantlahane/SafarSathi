import { Router } from "express";
import { safetyCheck } from "../controllers/safetyController.js";
import { generalLimiter } from "../middleware/rateLimiter.js";

const router = Router();

/** GET /api/v1/safety/check?lat=<f>&lon=<f>&hour=<i>[&networkType=<s>][&weatherSeverity=<f>][&aqi=<f>] */
router.get("/check", generalLimiter, safetyCheck);

export default router;
