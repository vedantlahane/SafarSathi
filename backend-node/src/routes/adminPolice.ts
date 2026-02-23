import { Router } from "express";
import {
  createPolice,
  deletePolice,
  getPolice,
  listPolice,
  updatePolice
} from "../controllers/adminPoliceController.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", requireAdmin, createPolice);
router.get("/", requireAdmin, listPolice);
router.get("/:id", requireAdmin, getPolice);
router.put("/:id", requireAdmin, updatePolice);
router.delete("/:id", requireAdmin, deletePolice);

export default router;
