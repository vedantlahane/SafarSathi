import type { Request, Response, NextFunction } from 'express';
import { safetyService } from './safety.service.js';
import type { SafetyCheckQuery, SafetyEvaluateBody } from './safety.schema.js';

export const safetyController = {
  async check(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = ((req as unknown as Record<string, unknown>).parsedQuery ?? req.query) as unknown as SafetyCheckQuery;
      const data = await safetyService.check(query);
      res.json({ ok: true, data });
    } catch (e) {
      next(e);
    }
  },

  async evaluate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as SafetyEvaluateBody;
      const data = await safetyService.evaluate(body);
      res.json({ ok: true, data });
    } catch (e) {
      next(e);
    }
  },
};
