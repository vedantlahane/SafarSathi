import mongoose, { Schema, Document } from "mongoose";

/**
 * Rich incident record for post-resolution analytics.
 * Superset of Alert — aggregates resolution data, timeline, and media.
 * Serves as training data for the ML pipeline.
 */
export interface IIncident extends Document {
  incidentId: number;
  alertId: number; // reference to the originating Alert
  zoneId?: number; // reference to RiskZone, if applicable
  category: string;
  description: string;
  severity: string;
  casualties: number;
  mediaUrls: string[];
  reportedBy: string; // tourist or admin ID
  verifiedBy?: string; // admin who verified
  verifiedAt?: Date;
  timeline: Array<{
    event: string;
    timestamp: Date;
    actor: string;
  }>;
  status: string;
  latitude?: number;
  longitude?: number;
  location?: { type: string; coordinates: number[] };
  createdAt: Date;
  updatedAt: Date;
}

const TimelineEntrySchema = new Schema(
  {
    event: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    actor: { type: String, required: true },
  },
  { _id: false }
);

const IncidentSchema = new Schema<IIncident>(
  {
    incidentId: { type: Number, required: true, unique: true },
    alertId: { type: Number, required: true, index: true },
    zoneId: { type: Number, index: true },
    category: {
      type: String,
      enum: ["medical", "crime", "natural_disaster", "accident", "wildlife", "other"],
      required: true,
    },
    description: { type: String, required: true, trim: true },
    severity: {
      type: String,
      enum: ["minor", "moderate", "major", "critical"],
      default: "moderate",
    },
    casualties: { type: Number, default: 0, min: 0 },
    mediaUrls: { type: [String], default: [] },
    reportedBy: { type: String, required: true },
    verifiedBy: { type: String, ref: "PoliceDepartment" },
    verifiedAt: Date,
    timeline: { type: [TimelineEntrySchema], default: [] },
    status: {
      type: String,
      enum: ["reported", "investigating", "confirmed", "resolved", "false_alarm"],
      default: "reported",
    },
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
  },
  { timestamps: true }
);

// Auto-sync GeoJSON
IncidentSchema.pre("save", function () {
  if (typeof this.latitude === "number" && typeof this.longitude === "number") {
    this.location = {
      type: "Point",
      coordinates: [this.longitude, this.latitude],
    };
  }
});

IncidentSchema.index({ location: "2dsphere" });
IncidentSchema.index({ status: 1 });
IncidentSchema.index({ category: 1 });
IncidentSchema.index({ createdAt: -1 });

export const IncidentModel = mongoose.model<IIncident>("Incident", IncidentSchema);
