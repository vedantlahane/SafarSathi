import { Router } from "express";
import { postLocation, postSOS } from "../controllers/sosController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/location/:touristId", requireAuth, postLocation);
router.post("/sos/:touristId", requireAuth, postSOS);

export default router;
