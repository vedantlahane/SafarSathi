import {
  HospitalModel,
  type IHospital,
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

export async function createHospital(data: Partial<IHospital>): Promise<IHospital> {
  const hospitalId = await getNextId("hospitalId");
  const hospital = new HospitalModel({ ...data, hospitalId });
  await hospital.save();
  return hospital.toObject();
}

export async function getHospitalById(hospitalId: number): Promise<IHospital | null> {
  return HospitalModel.findOne({ hospitalId }).lean();
}

export async function listAllHospitals(): Promise<IHospital[]> {
  return HospitalModel.find().sort({ name: 1 }).lean();
}

export async function listActiveHospitals(): Promise<IHospital[]> {
  return HospitalModel.find({ isActive: true }).sort({ name: 1 }).lean();
}

export async function updateHospital(
  hospitalId: number,
  data: Partial<IHospital>
): Promise<IHospital | null> {
  return HospitalModel.findOneAndUpdate({ hospitalId }, data, { new: true }).lean();
}

export async function deleteHospital(hospitalId: number): Promise<boolean> {
  const result = await HospitalModel.findOneAndDelete({ hospitalId });
  return !!result;
}

/**
 * Find hospitals near a GeoJSON point using 2dsphere index.
 * Returns up to `limit` hospitals within `maxDistanceMeters`.
 */
export async function findNearbyHospitals(
  lat: number,
  lng: number,
  maxDistanceMeters = 50000,
  limit = 5
): Promise<IHospital[]> {
  return HospitalModel.find({
    isActive: true,
    location: {
      $near: {
        $geometry: { type: "Point", coordinates: [lng, lat] },
        $maxDistance: maxDistanceMeters,
      },
    },
  })
    .limit(limit)
    .lean();
}
