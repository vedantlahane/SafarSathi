import { Router } from "express";
import { login, profile, register, updateProfileDetails } from "../controllers/authController.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile/:touristId", profile);
router.put("/profile/:touristId", updateProfileDetails);

export default router;
