import mongoose, { Schema, Document } from "mongoose";

export interface IPoliceDepartment extends Document {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  departmentCode: string;
  latitude: number;
  longitude: number;
  city: string;
  district: string;
  state: string;
  contactNumber: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PoliceDepartmentSchema = new Schema<IPoliceDepartment>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    departmentCode: { type: String, required: true, unique: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true },
    state: { type: String, required: true },
    contactNumber: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, _id: false }
);

PoliceDepartmentSchema.index({ latitude: 1, longitude: 1 });
PoliceDepartmentSchema.index({ isActive: 1 });

export const PoliceDepartmentModel = mongoose.model<IPoliceDepartment>(
  "PoliceDepartment",
  PoliceDepartmentSchema
);
