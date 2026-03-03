import { Router } from "express";
import { listPublicActiveZones, listNearbyZones } from "../controllers/publicRiskZoneController.js";

const router = Router();

router.get("/active", listPublicActiveZones);
router.get("/nearby", listNearbyZones);

export default router;
