import {
  TravelAdvisoryModel,
  type ITravelAdvisory,
} from "../schemas/index.js";
import mongoose from "mongoose";

const CounterModel = mongoose.model("Counter");

async function getNextId(name: string): Promise<number> {
  const counter = await CounterModel.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter!.get("seq") as number;
}

// ── CRUD ────────────────────────────────────────────────────────────────

export async function createAdvisory(
  data: Partial<ITravelAdvisory>
): Promise<ITravelAdvisory> {
  const advisoryId = await getNextId("advisoryId");
  const advisory = new TravelAdvisoryModel({ ...data, advisoryId });
  await advisory.save();
  return advisory.toObject();
}

export async function getAdvisoryById(
  advisoryId: number
): Promise<ITravelAdvisory | null> {
  return TravelAdvisoryModel.findOne({ advisoryId }).lean();
}

export async function listAdvisories(
  filter: { active?: boolean; region?: string } = {}
): Promise<ITravelAdvisory[]> {
  const query: Record<string, unknown> = {};
  if (filter.active !== undefined) query.active = filter.active;
  if (filter.region) query.region = { $regex: filter.region, $options: "i" };
  return TravelAdvisoryModel.find(query).sort({ createdAt: -1 }).lean();
}

/**
 * Active advisories whose effectiveFrom ≤ now ≤ effectiveTo
 */
export async function listCurrentAdvisories(): Promise<ITravelAdvisory[]> {
  const now = new Date();
  return TravelAdvisoryModel.find({
    active: true,
    effectiveFrom: { $lte: now },
    effectiveTo: { $gte: now },
  })
    .sort({ severity: -1, createdAt: -1 })
    .lean();
}

export async function updateAdvisory(
  advisoryId: number,
  data: Partial<ITravelAdvisory>
): Promise<ITravelAdvisory | null> {
  return TravelAdvisoryModel.findOneAndUpdate({ advisoryId }, data, {
    new: true,
  }).lean();
}

export async function deleteAdvisory(advisoryId: number): Promise<boolean> {
  const result = await TravelAdvisoryModel.findOneAndDelete({ advisoryId });
  return !!result;
}
