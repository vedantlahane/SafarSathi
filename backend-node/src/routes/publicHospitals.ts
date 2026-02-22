import { Router } from "express";
import { listPublicHospitals } from "../controllers/publicHospitalsController.js";

const router = Router();

router.get("/", listPublicHospitals);

export default router;
