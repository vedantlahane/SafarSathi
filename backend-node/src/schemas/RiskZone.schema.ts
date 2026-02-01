import mongoose, { Schema, Document } from "mongoose";

export interface IRiskZone extends Document {
  zoneId: number;
  name: string;
  description?: string;
  centerLat: number;
  centerLng: number;
  radiusMeters: number;
  riskLevel: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RiskZoneSchema = new Schema<IRiskZone>(
  {
    zoneId: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    description: String,
    centerLat: { type: Number, required: true },
    centerLng: { type: Number, required: true },
    radiusMeters: { type: Number, required: true },
    riskLevel: { type: String, enum: ["LOW", "MEDIUM", "HIGH"], default: "MEDIUM" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

RiskZoneSchema.index({ centerLat: 1, centerLng: 1 });
RiskZoneSchema.index({ active: 1 });

export const RiskZoneModel = mongoose.model<IRiskZone>("RiskZone", RiskZoneSchema);
