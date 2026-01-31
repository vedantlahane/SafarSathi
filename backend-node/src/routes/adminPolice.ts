import { Router } from "express";
import {
  createPolice,
  deletePolice,
  getPolice,
  listPolice,
  updatePolice
} from "../controllers/adminPoliceController.js";

const router = Router();

router.post("/", createPolice);
router.get("/", listPolice);
router.get("/:id", getPolice);
router.put("/:id", updatePolice);
router.delete("/:id", deletePolice);

export default router;
