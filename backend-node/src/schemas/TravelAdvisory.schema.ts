import mongoose, { Schema, Document } from "mongoose";

/**
 * Admin-issued or ML-generated travel warnings displayed on map & home page.
 */
export interface ITravelAdvisory extends Document {
  advisoryId: number;
  title: string;
  body: string;
  region: string; // e.g., "Kamrup Metropolitan", "Kaziranga"
  severity: string;
  issuedBy: string; // admin _id or "system"
  effectiveFrom: Date;
  effectiveTo: Date;
  source: string;
  active: boolean;
  affectedZoneIds: number[]; // related risk zone IDs
  createdAt: Date;
  updatedAt: Date;
}

const TravelAdvisorySchema = new Schema<ITravelAdvisory>(
  {
    advisoryId: { type: Number, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    region: { type: String, required: true, trim: true },
    severity: {
      type: String,
      enum: ["info", "warning", "critical"],
      default: "info",
    },
    issuedBy: { type: String, required: true },
    effectiveFrom: { type: Date, required: true },
    effectiveTo: { type: Date, required: true },
    source: {
      type: String,
      enum: ["admin", "ml_pipeline", "government"],
      default: "admin",
    },
    active: { type: Boolean, default: true },
    affectedZoneIds: { type: [Number], default: [] },
  },
  { timestamps: true }
);

TravelAdvisorySchema.index({ active: 1 });
TravelAdvisorySchema.index({ severity: 1 });
TravelAdvisorySchema.index({ effectiveFrom: 1, effectiveTo: 1 });
TravelAdvisorySchema.index({ region: 1 });

export const TravelAdvisoryModel = mongoose.model<ITravelAdvisory>(
  "TravelAdvisory",
  TravelAdvisorySchema
);
