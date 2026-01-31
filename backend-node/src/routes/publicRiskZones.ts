import { Router } from "express";
import { listPublicActiveZones } from "../controllers/publicRiskZoneController.js";

const router = Router();

router.get("/active", listPublicActiveZones);

export default router;
