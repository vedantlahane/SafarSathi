import { Router } from "express";
import { adminDashboard, touristDashboard } from "../controllers/dashboardController.js";

const router = Router();

router.get("/admin/dashboard/state", adminDashboard);
router.get("/tourist/:touristId/dashboard", touristDashboard);

export default router;
