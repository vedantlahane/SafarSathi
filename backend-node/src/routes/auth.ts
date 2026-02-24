import { Router } from "express";
import {
	login,
	profile,
	register,
	updateProfileDetails,
	requestPasswordReset,
	confirmPasswordReset,
	biometricRegistrationOptions,
	biometricRegistrationVerify,
	biometricLoginOptions,
	biometricLoginVerify,
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/password-reset/request", requestPasswordReset);
router.post("/password-reset/confirm", confirmPasswordReset);

router.post("/biometric/register/options", requireAuth, biometricRegistrationOptions);
router.post("/biometric/register/verify", requireAuth, biometricRegistrationVerify);
router.post("/biometric/login/options", biometricLoginOptions);
router.post("/biometric/login/verify", biometricLoginVerify);
router.get("/profile/:touristId", requireAuth, profile);
router.put("/profile/:touristId", requireAuth, updateProfileDetails);

export default router;
