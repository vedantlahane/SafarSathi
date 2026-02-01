import mongoose, { Schema, Document } from "mongoose";

export interface IAlert extends Document {
  alertId: number;
  touristId: string;
  alertType: string;
  priority: string;
  status: string;
  message?: string;
  latitude?: number;
  longitude?: number;
  createdAt: Date;
  updatedAt: Date;
}

const AlertSchema = new Schema<IAlert>(
  {
    alertId: { type: Number, required: true, unique: true },
    touristId: { type: String, required: true, index: true },
    alertType: { type: String, required: true },
    priority: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"], default: "MEDIUM" },
    status: { type: String, enum: ["OPEN", "ACKNOWLEDGED", "RESOLVED", "DISMISSED"], default: "OPEN" },
    message: String,
    latitude: Number,
    longitude: Number,
  },
  { timestamps: true }
);

AlertSchema.index({ status: 1 });
AlertSchema.index({ createdAt: -1 });

export const AlertModel = mongoose.model<IAlert>("Alert", AlertSchema);
