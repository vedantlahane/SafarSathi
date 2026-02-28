import mongoose, { Schema } from "mongoose";

const OperatingHoursSchema = new Schema(
  {
    open: { type: String, default: "08:00" }, // HH:mm
    close: { type: String, default: "20:00" },
    is24Hours: { type: Boolean, default: false },
  },
  { _id: false }
);

export interface IHospital {
  hospitalId: number;
  name: string;
  latitude: number;
  longitude: number;
  location?: { type: string; coordinates: number[] };
  contact: string;
  type: "hospital" | "clinic" | "pharmacy";
  tier?: string;
  emergency: boolean;
  city: string;
  district: string;
  state: string;
  isActive: boolean;
  // New enrichment fields
  specialties: string[];
  bedCapacity: number;
  availableBeds: number;
  operatingHours?: { open?: string; close?: string; is24Hours?: boolean };
  ambulanceAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HospitalSchema = new Schema<IHospital>(
  {
    hospitalId: { type: Number, required: true, unique: true },
    name: { type: String, required: true, trim: true },
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
    contact: { type: String, required: true },
    type: {
      type: String,
      enum: ["hospital", "clinic", "pharmacy"],
      default: "hospital",
    },
    tier: {
      type: String,
      enum: ["PHC", "CHC", "DH", "Medical_College", null],
    },
    emergency: { type: Boolean, default: false },
    city: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
    specialties: { type: [String], default: [] },
    bedCapacity: { type: Number, default: 0, min: 0 },
    availableBeds: { type: Number, default: 0, min: 0 },
    operatingHours: OperatingHoursSchema,
    ambulanceAvailable: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Auto-sync GeoJSON from flat lat/lng
HospitalSchema.pre("save", function () {
  if (typeof this.latitude === "number" && typeof this.longitude === "number") {
    this.location = {
      type: "Point",
      coordinates: [this.longitude, this.latitude],
    };
  }
});

HospitalSchema.pre("findOneAndUpdate", function () {
  const update = this.getUpdate() as Record<string, unknown> | null;
  if (update && typeof update.latitude === "number" && typeof update.longitude === "number") {
    (update as any).location = {
      type: "Point",
      coordinates: [update.longitude, update.latitude],
    };
  }
});

HospitalSchema.index({ location: "2dsphere" });
HospitalSchema.index({ isActive: 1 });
HospitalSchema.index({ type: 1 });
HospitalSchema.index({ tier: 1 });

export const HospitalModel = mongoose.model<IHospital>("Hospital", HospitalSchema);
