import { Router } from "express";
import { adminLogin, getAlertHistory, getAlerts, getTourists, updateAlert, verifyId } from "../controllers/adminController.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/login", adminLogin);
router.get("/id/verify", verifyId);
router.get("/alerts", requireAdmin, getAlerts);
router.get("/alerts/all", requireAdmin, getAlertHistory);
router.post("/alerts/:alertId/status", requireAdmin, updateAlert);
router.get("/tourists", requireAdmin, getTourists);

export default router;
