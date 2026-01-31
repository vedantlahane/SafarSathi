import { Router } from "express";
import {
  createZone,
  deleteZone,
  listActiveZones,
  listZones,
  updateZone
} from "../controllers/riskZoneController.js";

const router = Router();

router.get("/", listZones);
router.get("/active", listActiveZones);
router.post("/", createZone);
router.put("/:zoneId", updateZone);
router.delete("/:zoneId", deleteZone);

export default router;
