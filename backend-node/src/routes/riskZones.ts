import { Router } from "express";
import {
  createZone,
  deleteZone,
  listActiveZones,
  listZones,
  toggleZone,
  updateZone,
  zoneStats,
  bulkStatus,
} from "../controllers/riskZoneController.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", requireAdmin, listZones);
router.get("/active", requireAdmin, listActiveZones);
router.get("/stats", requireAdmin, zoneStats);
router.post("/", requireAdmin, createZone);
router.post("/bulk-status", requireAdmin, bulkStatus);
router.put("/:zoneId", requireAdmin, updateZone);
router.patch("/:zoneId/status", requireAdmin, toggleZone);
router.delete("/:zoneId", requireAdmin, deleteZone);

export default router;
