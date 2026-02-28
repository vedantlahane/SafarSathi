import { Router } from "express";
import { requireAdmin } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { hospitalSchema } from "../middleware/validationSchemas.js";
import {
  listHospitals,
  getHospital,
  createHospitalHandler,
  updateHospitalHandler,
  deleteHospitalHandler,
  nearbyHospitals,
} from "../controllers/hospitalController.js";

const router = Router();

router.get("/", requireAdmin, listHospitals);
router.get("/nearby", requireAdmin, nearbyHospitals);
router.get("/:hospitalId", requireAdmin, getHospital);
router.post("/", requireAdmin, validate(hospitalSchema), createHospitalHandler);
router.put("/:hospitalId", requireAdmin, validate(hospitalSchema.partial()), updateHospitalHandler);
router.delete("/:hospitalId", requireAdmin, deleteHospitalHandler);

export default router;
