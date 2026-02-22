import { Router } from "express";
import { listPublicStations } from "../controllers/publicStationsController.js";

const router = Router();

router.get("/", listPublicStations);

export default router;
