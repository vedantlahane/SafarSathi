//backend/src/modules/auth/auth.routes.ts

import { Router } from 'express';
import { validate } from '../../shared/http/middleware/validate.js';
import { requireAuth } from '../../shared/http/middleware/auth.js';
import { authLimiter } from '../../shared/http/middleware/rate-limit.js';
import { authController } from './auth.controller.js';
import { touristController } from '../tourist/tourist.controller.js';
import {
  RegisterSchema,
  LoginSchema,
  PasswordResetRequestSchema,
  PasswordResetConfirmSchema,
} from './auth.schema.js';

const router = Router();

router.post('/register', authLimiter, validate(RegisterSchema), authController.register);
router.post('/login',    authLimiter, validate(LoginSchema),    authController.login);
router.get('/me',        requireAuth,                            authController.me);

router.post(
  '/password-reset/request',
  authLimiter,
  validate(PasswordResetRequestSchema),
  authController.requestPasswordReset,
);
router.post(
  '/password-reset/confirm',
  authLimiter,
  validate(PasswordResetConfirmSchema),
  authController.confirmPasswordReset,
);

// Map /profile/:touristId routes from the frontend
router.get('/profile/:touristId', requireAuth, (req, res, next) => {
  if (req.user!.role !== 'admin' && req.user!.sub !== req.params.touristId) {
    return res.status(403).json({ ok: false, error: 'Forbidden' });
  }
  return touristController.getById(req, res);
});

router.put('/profile/:touristId', requireAuth, (req, res, next) => {
  if (req.user!.role !== 'admin' && req.user!.sub !== req.params.touristId) {
    return res.status(403).json({ ok: false, error: 'Forbidden' });
  }
  return touristController.updateMe(req, res);
});

router.delete('/profile/:touristId', requireAuth, (req, res, next) => {
  if (req.user!.role !== 'admin' && req.user!.sub !== req.params.touristId) {
    return res.status(403).json({ ok: false, error: 'Forbidden' });
  }
  return touristController.deleteMe(req, res);
});

export default router;