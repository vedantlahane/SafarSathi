import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import {
  listNotifications,
  markAllRead,
  markNotificationRead,
} from "../controllers/notificationsController.js";

const router = Router();

router.get("/tourist/:touristId/notifications", requireAuth, listNotifications);
router.post(
  "/tourist/:touristId/notifications/:notificationId/read",
  requireAuth,
  markNotificationRead
);
router.post(
  "/tourist/:touristId/notifications/read-all",
  requireAuth,
  markAllRead
);

export default router;