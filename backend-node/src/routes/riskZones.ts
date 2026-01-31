import { Router } from "express";
import {
  createZone,
  deleteZone,
  listActiveZones,
  listZones,
  toggleZone,
  updateZone
} from "../controllers/riskZoneController.js";

const router = Router();

router.get("/", listZones);
router.get("/active", listActiveZones);
router.post("/", createZone);
router.put("/:zoneId", updateZone);
router.patch("/:zoneId/status", toggleZone);
router.delete("/:zoneId", deleteZone);

export default router;
