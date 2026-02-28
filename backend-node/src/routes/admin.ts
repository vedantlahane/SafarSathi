import { Router } from "express";
import { adminLogin, getAlertHistory, getAlerts, getTourists, updateAlert, verifyId } from "../controllers/adminController.js";
import { sendBroadcast } from "../controllers/broadcastController.js";
import { requireAdmin } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { broadcastSchema } from "../middleware/validationSchemas.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.post("/login", authLimiter, adminLogin);
router.get("/id/verify", verifyId);
router.get("/alerts", requireAdmin, getAlerts);
router.get("/alerts/all", requireAdmin, getAlertHistory);
router.post("/alerts/:alertId/status", requireAdmin, updateAlert);
router.get("/tourists", requireAdmin, getTourists);
router.post("/broadcast", requireAdmin, validate(broadcastSchema), sendBroadcast);

export default router;
