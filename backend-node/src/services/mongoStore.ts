import { randomUUID } from "crypto";
import { sha256 } from "../utils/hash.js";
import {
  TouristModel,
  RiskZoneModel,
  PoliceDepartmentModel,
  AlertModel,
  BlockchainLogModel,
  HospitalModel,
  ITourist,
  IRiskZone,
  IPoliceDepartment,
  IAlert,
  IBlockchainLog,
  IHospital,
} from "../schemas/index.js";

// Re-export the types for use by other services
export type { ITourist, IRiskZone, IPoliceDepartment, IAlert, IBlockchainLog, IHospital };

// Counter collection for auto-increment IDs
import mongoose from "mongoose";

const CounterSchema = new mongoose.Schema({
  _id: String,
  seq: { type: Number, default: 0 },
});
const CounterModel = mongoose.model("Counter", CounterSchema);

async function getNextId(name: string): Promise<number> {
  const counter = await CounterModel.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter!.seq;
}

// ==================== TOURISTS ====================

export async function getAllTourists(): Promise<ITourist[]> {
  return TouristModel.find().lean();
}

export async function getTouristById(id: string): Promise<ITourist | null> {
  return TouristModel.findById(id).lean();
}

export async function getTouristByEmail(email: string): Promise<ITourist | null> {
  return TouristModel.findOne({ email }).lean();
}

export async function createTourist(data: Partial<ITourist>): Promise<ITourist> {
  const id = data._id || randomUUID();
  const tourist = new TouristModel({ ...data, _id: id });
  await tourist.save();
  return tourist.toObject();
}

export async function updateTourist(id: string, data: Partial<ITourist>): Promise<ITourist | null> {
  return TouristModel.findByIdAndUpdate(id, data, { new: true }).lean();
}

export async function deleteTourist(id: string): Promise<boolean> {
  const result = await TouristModel.findByIdAndDelete(id);
  return !!result;
}

// ==================== RISK ZONES ====================

export async function getAllRiskZones(): Promise<IRiskZone[]> {
  return RiskZoneModel.find().lean();
}

export async function getActiveRiskZones(): Promise<IRiskZone[]> {
  return RiskZoneModel.find({ active: true }).lean();
}

export async function getRiskZoneById(zoneId: number): Promise<IRiskZone | null> {
  return RiskZoneModel.findOne({ zoneId }).lean();
}

export async function createRiskZone(data: Partial<IRiskZone>): Promise<IRiskZone> {
  const zoneId = await getNextId("riskZoneId");
  const zone = new RiskZoneModel({ ...data, zoneId });
  await zone.save();
  return zone.toObject();
}

export async function updateRiskZone(zoneId: number, data: Partial<IRiskZone>): Promise<IRiskZone | null> {
  return RiskZoneModel.findOneAndUpdate({ zoneId }, data, { new: true }).lean();
}

export async function deleteRiskZone(zoneId: number): Promise<boolean> {
  const result = await RiskZoneModel.findOneAndDelete({ zoneId });
  return !!result;
}

// ==================== POLICE DEPARTMENTS ====================

export async function getAllPoliceDepartments(): Promise<IPoliceDepartment[]> {
  return PoliceDepartmentModel.find().lean();
}

export async function getPoliceDepartmentById(id: string): Promise<IPoliceDepartment | null> {
  return PoliceDepartmentModel.findById(id).lean();
}

export async function getPoliceDepartmentByEmail(email: string): Promise<IPoliceDepartment | null> {
  return PoliceDepartmentModel.findOne({ email }).lean();
}

export async function createPoliceDepartment(data: Partial<IPoliceDepartment>): Promise<IPoliceDepartment> {
  const id = data._id || randomUUID();
  const dept = new PoliceDepartmentModel({ ...data, _id: id });
  await dept.save();
  return dept.toObject();
}

export async function updatePoliceDepartment(id: string, data: Partial<IPoliceDepartment>): Promise<IPoliceDepartment | null> {
  return PoliceDepartmentModel.findByIdAndUpdate(id, data, { new: true }).lean();
}

export async function deletePoliceDepartment(id: string): Promise<boolean> {
  const result = await PoliceDepartmentModel.findByIdAndDelete(id);
  return !!result;
}

// ==================== ALERTS ====================

export async function getAllAlerts(): Promise<IAlert[]> {
  return AlertModel.find().sort({ createdAt: -1 }).lean();
}

export async function getAlertsByTouristId(touristId: string): Promise<IAlert[]> {
  return AlertModel.find({ touristId }).sort({ createdAt: -1 }).lean();
}

export async function getOpenAlerts(): Promise<IAlert[]> {
  return AlertModel.find({ status: "OPEN" }).sort({ createdAt: -1 }).lean();
}

export async function getAlertById(alertId: number): Promise<IAlert | null> {
  return AlertModel.findOne({ alertId }).lean();
}

export async function createAlert(data: Partial<IAlert>): Promise<IAlert> {
  const alertId = await getNextId("alertId");
  const alert = new AlertModel({ ...data, alertId });
  await alert.save();
  return alert.toObject();
}

export async function updateAlert(alertId: number, data: Partial<IAlert>): Promise<IAlert | null> {
  return AlertModel.findOneAndUpdate({ alertId }, data, { new: true }).lean();
}

// ==================== HOSPITALS ====================

export async function getAllHospitals(): Promise<IHospital[]> {
  return HospitalModel.find().lean();
}

export async function getActiveHospitals(): Promise<IHospital[]> {
  return HospitalModel.find({ isActive: true }).lean();
}

// ==================== BLOCKCHAIN LOGS ====================

export async function getAllBlockchainLogs(): Promise<IBlockchainLog[]> {
  return BlockchainLogModel.find().sort({ createdAt: -1 }).lean();
}

export async function getBlockchainLogsByTouristId(touristId: string): Promise<IBlockchainLog[]> {
  return BlockchainLogModel.find({ touristId }).sort({ createdAt: -1 }).lean();
}

export async function createBlockchainLog(data: Partial<IBlockchainLog>): Promise<IBlockchainLog> {
  const logId = await getNextId("blockchainLogId");
  const log = new BlockchainLogModel({ ...data, logId });
  await log.save();
  return log.toObject();
}

// ==================== SEEDING ====================

export async function seedDatabase() {
  const touristCount = await TouristModel.countDocuments();
  if (touristCount > 0) {
    console.log("📦 Database already seeded, skipping...");
    return;
  }

  console.log("🌱 Seeding database...");

  const now = new Date();
  const idExpiry = new Date(now);
  idExpiry.setFullYear(idExpiry.getFullYear() + 1);

  // Seed tourist
  await createTourist({
    _id: "ca4b21f2-ce17-49ef-a829-57d063d20163",
    name: "Aarav Sharma",
    email: "tourist@safarsathi.in",
    phone: "+91-9876543211",
    passportNumber: "IND1234567",
    dateOfBirth: "1993-04-12",
    address: "Pan Bazaar, Guwahati, Assam, India",
    gender: "Male",
    nationality: "Indian",
    emergencyContact: JSON.stringify({ name: "Riya Sharma", relationship: "Sibling", phone: "+91-9876543210" }),
    passwordHash: sha256("password123"),
    idHash: sha256("IND1234567+91-9876543211"),
    idExpiry: idExpiry.toISOString(),
    currentLat: 26.2006,
    currentLng: 92.9376,
    lastSeen: now.toISOString(),
    safetyScore: 87,
  });

  // Seed risk zones
  await RiskZoneModel.insertMany([
    {
      zoneId: 1,
      name: "Kamakhya Hill Restricted Belt",
      description: "Sensitive wildlife and temple security perimeter. Tourists require special pass.",
      centerLat: 26.1667,
      centerLng: 91.7086,
      radiusMeters: 750,
      riskLevel: "HIGH",
      active: true,
    },
    {
      zoneId: 2,
      name: "Deepor Beel Wildlife Buffer",
      description: "Flood-prone wetlands with limited transport access after dusk.",
      centerLat: 26.1226,
      centerLng: 91.65,
      radiusMeters: 1200,
      riskLevel: "MEDIUM",
      active: true,
    },
  ]);

  // Seed police departments
  await PoliceDepartmentModel.insertMany([
    {
      _id: randomUUID(),
      name: "SafarSathi Control Center",
      email: "admin@safarsathi.in",
      passwordHash: sha256("admin123"),
      departmentCode: "SS-CONTROL",
      latitude: 26.1445,
      longitude: 91.7362,
      city: "Guwahati",
      district: "Kamrup Metropolitan",
      state: "Assam",
      contactNumber: "+91-9876543210",
      isActive: true,
    },
    {
      _id: randomUUID(),
      name: "Dispur Police Station",
      email: "dispur@police.assam.gov.in",
      passwordHash: sha256("admin123"),
      departmentCode: "PS-DISPUR",
      latitude: 26.1433,
      longitude: 91.7898,
      city: "Guwahati",
      district: "Kamrup Metropolitan",
      state: "Assam",
      contactNumber: "+91-361-2234567",
      isActive: true,
    },
  ]);

  // Seed hospitals
  await HospitalModel.insertMany([
    {
      hospitalId: 1,
      name: "Gauhati Medical College & Hospital",
      latitude: 26.1840,
      longitude: 91.7456,
      contact: "+91-361-2529457",
      type: "hospital",
      emergency: true,
      city: "Guwahati",
      district: "Kamrup Metropolitan",
      state: "Assam",
      isActive: true,
    },
    {
      hospitalId: 2,
      name: "Down Town Hospital",
      latitude: 26.1330,
      longitude: 91.7890,
      contact: "+91-361-2331003",
      type: "hospital",
      emergency: true,
      city: "Guwahati",
      district: "Kamrup Metropolitan",
      state: "Assam",
      isActive: true,
    },
    {
      hospitalId: 3,
      name: "Nemcare Hospital",
      latitude: 26.1480,
      longitude: 91.7700,
      contact: "+91-361-2463003",
      type: "hospital",
      emergency: true,
      city: "Guwahati",
      district: "Kamrup Metropolitan",
      state: "Assam",
      isActive: true,
    },
    {
      hospitalId: 4,
      name: "Dispur Polyclinic & Nursing Home",
      latitude: 26.1425,
      longitude: 91.7880,
      contact: "+91-361-2260373",
      type: "clinic",
      emergency: false,
      city: "Guwahati",
      district: "Kamrup Metropolitan",
      state: "Assam",
      isActive: true,
    },
  ]);

  // Initialize counters
  await CounterModel.findByIdAndUpdate("riskZoneId", { seq: 2 }, { upsert: true });
  await CounterModel.findByIdAndUpdate("alertId", { seq: 0 }, { upsert: true });
  await CounterModel.findByIdAndUpdate("blockchainLogId", { seq: 0 }, { upsert: true });
  await CounterModel.findByIdAndUpdate("hospitalId", { seq: 4 }, { upsert: true });

  console.log("✅ Database seeded successfully");
}
