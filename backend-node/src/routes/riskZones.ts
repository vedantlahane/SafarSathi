import { Router } from "express";
import {
  createZone,
  deleteZone,
  listActiveZones,
  listZones,
  toggleZone,
  updateZone
} from "../controllers/riskZoneController.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", requireAdmin, listZones);
router.get("/active", requireAdmin, listActiveZones);
router.post("/", requireAdmin, createZone);
router.put("/:zoneId", requireAdmin, updateZone);
router.patch("/:zoneId/status", requireAdmin, toggleZone);
router.delete("/:zoneId", requireAdmin, deleteZone);

export default router;
