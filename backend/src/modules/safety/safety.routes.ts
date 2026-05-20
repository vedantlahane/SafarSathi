import { Router } from 'express';
import { validate } from '../../shared/http/middleware/validate.js';
import { generalLimiter } from '../../shared/http/middleware/rate-limit.js';
import { safetyController } from './safety.controller.js';
import { SafetyCheckQuerySchema, SafetyEvaluateBodySchema } from './safety.schema.js';

const router: Router = Router();

router.get(
  '/check',
  generalLimiter,
  validate(SafetyCheckQuerySchema, 'query'),
  safetyController.check,
);

router.post(
  '/evaluate',
  generalLimiter,
  validate(SafetyEvaluateBodySchema, 'body'),
  safetyController.evaluate,
);

export default router;
