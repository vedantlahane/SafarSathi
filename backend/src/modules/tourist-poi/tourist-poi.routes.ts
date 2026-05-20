// src/modules/tourist-poi/tourist-poi.routes.ts
import { Router } from 'express';
import { db } from '../../shared/db/client.js';
import { touristPOIs } from '../../shared/db/schema.js';
import { eq, sql, inArray } from 'drizzle-orm';

const router = Router();

// GET /api/tourist-pois?type=gurudwara,fire_station&limit=500
router.get('/', async (req, res, next) => {
  try {
    const typeParam = req.query.type as string | undefined;
    const limit = Math.min(Number(req.query.limit ?? 500), 2000);

    let rows;
    if (typeParam) {
      const types = typeParam.split(',').map(t => t.trim()).filter(Boolean);
      if (types.length === 1) {
        rows = await db
          .select()
          .from(touristPOIs)
          .where(sql`is_active = true AND type = ${types[0]}`)
          .limit(limit);
      } else {
        rows = await db
          .select()
          .from(touristPOIs)
          .where(sql`is_active = true AND type = ANY(${types})`)
          .limit(limit);
      }
    } else {
      rows = await db
        .select()
        .from(touristPOIs)
        .where(eq(touristPOIs.isActive, true))
        .limit(limit);
    }

    res.json({ ok: true, data: rows });
  } catch (err) {
    next(err);
  }
});

export default router;
