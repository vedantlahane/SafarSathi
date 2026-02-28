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
import { validate } from "../middleware/validate.js";
import { registerSchema, loginSchema, passwordResetRequestSchema, passwordResetConfirmSchema } from "../middleware/validationSchemas.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/password-reset/request", authLimiter, validate(passwordResetRequestSchema), requestPasswordReset);
router.post("/password-reset/confirm", authLimiter, validate(passwordResetConfirmSchema), confirmPasswordReset);

router.post("/biometric/register/options", requireAuth, biometricRegistrationOptions);
router.post("/biometric/register/verify", requireAuth, biometricRegistrationVerify);
router.post("/biometric/login/options", biometricLoginOptions);
router.post("/biometric/login/verify", biometricLoginVerify);
router.get("/profile/:touristId", requireAuth, profile);
router.put("/profile/:touristId", requireAuth, updateProfileDetails);

export default router;
