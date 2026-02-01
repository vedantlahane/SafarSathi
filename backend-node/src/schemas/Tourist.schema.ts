import mongoose, { Schema, Document } from "mongoose";

export interface ITourist extends Document {
  _id: string;
  name: string;
  email: string;
  phone: string;
  passportNumber: string;
  dateOfBirth?: string;
  address?: string;
  gender?: string;
  nationality?: string;
  emergencyContact?: string;
  passwordHash: string;
  idHash?: string;
  idExpiry?: string;
  currentLat?: number;
  currentLng?: number;
  lastSeen?: string;
  safetyScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const TouristSchema = new Schema<ITourist>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    passportNumber: { type: String, required: true },
    dateOfBirth: String,
    address: String,
    gender: String,
    nationality: String,
    emergencyContact: String,
    passwordHash: { type: String, required: true },
    idHash: String,
    idExpiry: String,
    currentLat: Number,
    currentLng: Number,
    lastSeen: String,
    safetyScore: { type: Number, default: 100 },
  },
  { timestamps: true, _id: false }
);

TouristSchema.index({ currentLat: 1, currentLng: 1 });

export const TouristModel = mongoose.model<ITourist>("Tourist", TouristSchema);
