import mongoose, { Schema, Document } from "mongoose";

// ── Sub-schemas ──────────────────────────────────────────────────────────────

const GeoPointSchema = new Schema(
  {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
  },
  { _id: false }
);

const EmergencyContactSchema = new Schema(
  {
    name: String,
    phone: String,
    relationship: String,
  },
  { _id: false }
);

const ItineraryStopSchema = new Schema(
  {
    destination: { type: String, required: true },
    arrivalDate: String,
    departureDate: String,
    accommodation: String,
    notes: String,
  },
  { _id: false }
);

// ── Interface ────────────────────────────────────────────────────────────────

export interface ITourist {
  _id: string;
  name: string;
  email: string;
  phone: string;
  passportNumber: string;
  dateOfBirth?: string;
  address?: string;
  gender?: string;
  nationality?: string;
  emergencyContact?: { name?: string; phone?: string; relationship?: string };
  bloodType?: string;
  allergies?: string[];
  medicalConditions?: string[];
  passwordHash: string;
  idHash?: string;
  idExpiry?: string;
  resetTokenHash?: string;
  resetTokenExpires?: Date;
  webauthnCredentials?: Array<{
    credentialId: string;
    publicKey: string;
    counter: number;
    transports?: string[];
  }>;
  // Location (flat fields kept for backward compat)
  currentLat?: number;
  currentLng?: number;
  currentLocation?: { type: string; coordinates: number[] };
  speed?: number;
  heading?: number;
  locationAccuracy?: number;
  lastSeen?: string;
  // Safety
  safetyScore: number;
  lastScoreUpdate?: Date;
  // Travel profile
  travelType?: string;
  preferredLanguage?: string;
  visaType?: string;
  visaExpiry?: string;
  travelItinerary?: Array<{
    destination: string;
    arrivalDate?: string;
    departureDate?: string;
    accommodation?: string;
    notes?: string;
  }>;
  // Device & status
  deviceToken?: string;
  isActive: boolean;
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// ── Schema ───────────────────────────────────────────────────────────────────

const TouristSchema = new Schema<ITourist>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    phone: { type: String, required: true, trim: true },
    passportNumber: { type: String, required: true, trim: true },
    dateOfBirth: String,
    address: String,
    gender: {
      type: String,
      enum: ["Male", "Female", "Non-binary", "Prefer not to say", null],
    },
    nationality: String,
    emergencyContact: EmergencyContactSchema,
    bloodType: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", null],
    },
    allergies: [String],
    medicalConditions: [String],
    passwordHash: { type: String, required: true },
    idHash: String,
    idExpiry: String,
    resetTokenHash: String,
    resetTokenExpires: Date,
    webauthnCredentials: [
      {
        credentialId: String,
        publicKey: String,
        counter: Number,
        transports: [String],
      },
    ],
    // Location — flat fields for backward compat, GeoJSON for geo queries
    currentLat: Number,
    currentLng: Number,
    currentLocation: {
      type: GeoPointSchema,
      index: "2dsphere",
    },
    speed: Number, // km/h
    heading: Number, // degrees 0-360
    locationAccuracy: Number, // meters
    lastSeen: String,
    // Safety
    safetyScore: { type: Number, default: 100, min: 0, max: 100 },
    lastScoreUpdate: Date,
    // Travel profile
    travelType: {
      type: String,
      enum: ["solo", "family", "group", "adventure", null],
    },
    preferredLanguage: { type: String, default: "en" },
    visaType: String,
    visaExpiry: String,
    travelItinerary: [ItineraryStopSchema],
    // Device & status
    deviceToken: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, _id: false }
);

// Auto-sync GeoJSON from flat lat/lng on save
TouristSchema.pre("save", function () {
  if (typeof this.currentLat === "number" && typeof this.currentLng === "number") {
    this.currentLocation = {
      type: "Point",
      coordinates: [this.currentLng, this.currentLat],
    };
  }
});

TouristSchema.pre("findOneAndUpdate", function () {
  const update = this.getUpdate() as Record<string, unknown> | null;
  if (update && typeof update.currentLat === "number" && typeof update.currentLng === "number") {
    (update as any).currentLocation = {
      type: "Point",
      coordinates: [update.currentLng, update.currentLat],
    };
  }
});

// Indexes
TouristSchema.index({ email: 1 });
TouristSchema.index({ idHash: 1 });
TouristSchema.index({ isActive: 1 });

export const TouristModel = mongoose.model<ITourist>("Tourist", TouristSchema);

export { GeoPointSchema };
