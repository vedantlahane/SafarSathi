import { Router } from "express";
import {
  postLocation,
  postSOS,
  postPreAlert,
  cancelSOS,
  getAlertStatus,
} from "../controllers/sosController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { locationUpdateSchema, sosSchema, preAlertSchema } from "../middleware/validationSchemas.js";
import { sosLimiter, locationLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.post("/location/:touristId", requireAuth, locationLimiter, validate(locationUpdateSchema), postLocation);
router.post("/sos/:touristId", requireAuth, sosLimiter, validate(sosSchema), postSOS);
router.post("/sos/:touristId/pre-alert", requireAuth, sosLimiter, validate(preAlertSchema), postPreAlert);
router.post("/sos/:alertId/cancel", requireAuth, cancelSOS);
router.get("/sos/:alertId/status", requireAuth, getAlertStatus);

export default router;
