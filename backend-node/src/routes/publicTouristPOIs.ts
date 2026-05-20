import { Router } from "express";
import { TouristPOIModel } from "../schemas/index.js";

const router = Router();

// GET /api/tourist-pois?type=gurudwara,fire_station&limit=500
router.get("/", async (req, res) => {
  try {
    const typeParam = req.query.type as string | undefined;
    const limit = Math.min(Number(req.query.limit ?? 500), 1000);

    const filter: Record<string, unknown> = { isActive: true };
    if (typeParam) {
      const types = typeParam.split(",").map((t) => t.trim()).filter(Boolean);
      if (types.length === 1) filter.type = types[0];
      else if (types.length > 1) filter.type = { $in: types };
    }

    const pois = await TouristPOIModel.find(filter)
      .select("-__v -createdAt -updatedAt -location")
      .limit(limit)
      .lean();

    res.json({ ok: true, data: pois });
  } catch (err) {
    res.status(500).json({ ok: false, error: "Failed to fetch POIs" });
  }
});

export default router;
