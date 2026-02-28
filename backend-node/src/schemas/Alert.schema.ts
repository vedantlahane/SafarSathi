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
  location?: { type: string; coordinates: number[] };
  // Resolution tracking
  resolvedBy?: string; // police department _id
  resolvedAt?: Date;
  cancelledAt?: Date;
  // SOS lifecycle
  preAlertTriggered: boolean;
  escalationLevel: number; // 1-3
  responseTimeMs?: number; // computed on resolution
  // Attachments
  media?: string[]; // URLs to images/audio
  // Nearest responder
  nearestStationId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AlertSchema = new Schema<IAlert>(
  {
    alertId: { type: Number, required: true, unique: true },
    touristId: { type: String, required: true, index: true },
    alertType: {
      type: String,
      required: true,
      enum: ["SOS", "PRE_ALERT", "RISK_ZONE", "INACTIVITY", "DEVIATION", "GEOFENCE", "SYSTEM"],
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "MEDIUM",
    },
    status: {
      type: String,
      enum: ["PENDING", "OPEN", "ACKNOWLEDGED", "RESOLVED", "DISMISSED", "CANCELLED"],
      default: "OPEN",
    },
    message: String,
    latitude: Number,
    longitude: Number,
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: { type: [Number], default: [0, 0] },
    },
    // Resolution
    resolvedBy: { type: String, ref: "PoliceDepartment" },
    resolvedAt: Date,
    cancelledAt: Date,
    // SOS lifecycle
    preAlertTriggered: { type: Boolean, default: false },
    escalationLevel: { type: Number, default: 1, min: 1, max: 3 },
    responseTimeMs: Number,
    // Attachments
    media: [String],
    // Nearest responder
    nearestStationId: { type: String, ref: "PoliceDepartment" },
  },
  { timestamps: true }
);

// Auto-sync GeoJSON from flat lat/lng
AlertSchema.pre("save", function () {
  if (typeof this.latitude === "number" && typeof this.longitude === "number") {
    this.location = {
      type: "Point",
      coordinates: [this.longitude, this.latitude],
    };
  }
});

// Compute responseTimeMs on resolution
AlertSchema.pre("findOneAndUpdate", function () {
  const update = this.getUpdate() as Record<string, unknown> | null;
  if (update && (update.status === "RESOLVED" || update.status === "DISMISSED")) {
    update.resolvedAt = update.resolvedAt ?? new Date();
  }
  if (update && update.status === "CANCELLED") {
    update.cancelledAt = update.cancelledAt ?? new Date();
  }
});

AlertSchema.index({ status: 1 });
AlertSchema.index({ createdAt: -1 });
AlertSchema.index({ "location": "2dsphere" });
AlertSchema.index({ touristId: 1, status: 1 });

export const AlertModel = mongoose.model<IAlert>("Alert", AlertSchema);
