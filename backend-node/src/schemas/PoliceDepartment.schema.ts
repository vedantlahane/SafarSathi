import mongoose, { Schema, Document } from "mongoose";

export interface IPoliceDepartment {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  departmentCode: string;
  latitude: number;
  longitude: number;
  location?: { type: string; coordinates: number[] };
  city: string;
  district: string;
  state: string;
  contactNumber: string;
  isActive: boolean;
  // New enrichment fields
  stationType: string;
  jurisdictionRadiusKm: number;
  officerCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const PoliceDepartmentSchema = new Schema<IPoliceDepartment>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    departmentCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: { type: [Number], default: [0, 0] },
    },
    city: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    contactNumber: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    stationType: {
      type: String,
      enum: ["outpost", "station", "district_hq"],
      default: "station",
    },
    jurisdictionRadiusKm: { type: Number, default: 10, min: 0 },
    officerCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true, _id: false }
);

// Auto-sync GeoJSON from flat lat/lng
PoliceDepartmentSchema.pre("save", function () {
  if (typeof this.latitude === "number" && typeof this.longitude === "number") {
    this.location = {
      type: "Point",
      coordinates: [this.longitude, this.latitude],
    };
  }
});

PoliceDepartmentSchema.pre("findOneAndUpdate", function () {
  const update = this.getUpdate() as Record<string, unknown> | null;
  if (update && typeof update.latitude === "number" && typeof update.longitude === "number") {
    (update as any).location = {
      type: "Point",
      coordinates: [update.longitude, update.latitude],
    };
  }
});

PoliceDepartmentSchema.index({ location: "2dsphere" });
PoliceDepartmentSchema.index({ isActive: 1 });
PoliceDepartmentSchema.index({ stationType: 1 });

export const PoliceDepartmentModel = mongoose.model<IPoliceDepartment>(
  "PoliceDepartment",
  PoliceDepartmentSchema
);
