import { Router } from "express";
import { requireAdmin, requireAuth } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { travelAdvisorySchema } from "../middleware/validationSchemas.js";
import {
  listAllAdvisories,
  listCurrent,
  getAdvisory,
  createAdvisoryHandler,
  updateAdvisoryHandler,
  deleteAdvisoryHandler,
} from "../controllers/travelAdvisoryController.js";

const router = Router();

// Public: current active advisories (tourists see these)
router.get("/current", requireAuth, listCurrent);

// Admin: full CRUD
router.get("/", requireAdmin, listAllAdvisories);
router.get("/:advisoryId", requireAdmin, getAdvisory);
router.post("/", requireAdmin, validate(travelAdvisorySchema), createAdvisoryHandler);
router.put("/:advisoryId", requireAdmin, validate(travelAdvisorySchema.partial()), updateAdvisoryHandler);
router.delete("/:advisoryId", requireAdmin, deleteAdvisoryHandler);

export default router;
