import { Router } from "express";
import { adminDashboard, touristDashboard } from "../controllers/dashboardController.js";
import { requireAdmin, requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/admin/dashboard/state", requireAdmin, adminDashboard);
router.get("/tourist/:touristId/dashboard", requireAuth, touristDashboard);

export default router;
