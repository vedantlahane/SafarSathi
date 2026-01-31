import { Router } from "express";
import { adminLogin, getAlertHistory, getAlerts, getTourists, updateAlert, verifyId } from "../controllers/adminController.js";

const router = Router();

router.post("/login", adminLogin);
router.get("/id/verify", verifyId);
router.get("/alerts", getAlerts);
router.get("/alerts/all", getAlertHistory);
router.post("/alerts/:alertId/status", updateAlert);
router.get("/tourists", getTourists);

export default router;
