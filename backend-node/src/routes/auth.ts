import { Router } from "express";
import { login, profile, register, updateProfileDetails } from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile/:touristId", requireAuth, profile);
router.put("/profile/:touristId", requireAuth, updateProfileDetails);

export default router;
