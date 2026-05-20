import type { Request, Response, NextFunction } from 'express';
import { safetyService } from './safety.service.js';
import type { SafetyCheckQuery } from './safety.schema.js';

export const safetyController = {
  async check(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = ((req as unknown as Record<string, unknown>).parsedQuery ?? req.query) as unknown as SafetyCheckQuery;
      const data = await safetyService.check(query);
      res.json({
        ok: true,
        safety_score: data.safety_score,
        status: data.status,
        source: data.source,
        data,
      });
    } catch (e) {
      next(e);
    }
  },
};
