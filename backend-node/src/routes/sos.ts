import { Router } from "express";
import { postLocation, postSOS } from "../controllers/sosController.js";

const router = Router();

router.post("/location/:touristId", postLocation);
router.post("/sos/:touristId", postSOS);

export default router;
