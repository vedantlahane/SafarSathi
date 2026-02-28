import mongoose, { Schema, Document } from "mongoose";

export interface IRiskZone extends Document {
  zoneId: number;
  name: string;
  description?: string;
  // Flat coords kept for backward compat
  centerLat: number;
  centerLng: number;
  radiusMeters: number;
  // GeoJSON for geo queries
  geometry?: { type: string; coordinates: number[] };
  riskLevel: string;
  active: boolean;
  // New enrichment fields
  category?: string;
  createdBy?: string; // admin (police dept) _id
  expiresAt?: Date; // TTL for temporary zones
  source: string;
  createdAt: Date;
  updatedAt: Date;
}

const RiskZoneSchema = new Schema<IRiskZone>(
  {
    zoneId: { type: Number, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    description: String,
    centerLat: { type: Number, required: true },
    centerLng: { type: Number, required: true },
    radiusMeters: { type: Number, required: true, min: 0 },
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: { type: [Number], default: [0, 0] },
    },
    riskLevel: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "MEDIUM",
    },
    active: { type: Boolean, default: true },
    category: {
      type: String,
      enum: ["flood", "wildlife", "crime", "traffic", "political_unrest", "other", null],
    },
    createdBy: { type: String, ref: "PoliceDepartment" },
    expiresAt: { type: Date, index: { expires: 0 } }, // TTL index: auto-deletes when expired
    source: {
      type: String,
      enum: ["admin", "ml_pipeline", "crowd_report"],
      default: "admin",
    },
  },
  { timestamps: true }
);

// Auto-sync GeoJSON from flat lat/lng
RiskZoneSchema.pre("save", function () {
  if (typeof this.centerLat === "number" && typeof this.centerLng === "number") {
    this.geometry = {
      type: "Point",
      coordinates: [this.centerLng, this.centerLat],
    };
  }
});

RiskZoneSchema.pre("findOneAndUpdate", function () {
  const update = this.getUpdate() as Record<string, unknown> | null;
  if (update && typeof update.centerLat === "number" && typeof update.centerLng === "number") {
    (update as any).geometry = {
      type: "Point",
      coordinates: [update.centerLng, update.centerLat],
    };
  }
});

RiskZoneSchema.index({ geometry: "2dsphere" });
RiskZoneSchema.index({ active: 1 });
RiskZoneSchema.index({ source: 1 });

export const RiskZoneModel = mongoose.model<IRiskZone>("RiskZone", RiskZoneSchema);
