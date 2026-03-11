import mongoose, { Schema, Document } from "mongoose";

/**
 * Time-series collection for tourist location tracking.
 * Decouples hot write path from Tourist document.
 * Feeds the future ML anomaly-detection pipeline.
 */
export interface ITouristLocationLog extends Document {
  touristId: string;
  location: { type: string; coordinates: number[] }; // GeoJSON Point [lng, lat]
  latitude: number;
  longitude: number;
  speed?: number; // km/h
  heading?: number; // degrees 0-360
  accuracy?: number; // meters
  safetyScoreAtTime: number;
  timestamp: Date;
}

const TouristLocationLogSchema = new Schema<ITouristLocationLog>(
  {
    touristId: { type: String, required: true, index: true },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    speed: Number,
    heading: Number,
    accuracy: Number,
    safetyScoreAtTime: { type: Number, default: 100 },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: false, // We use our own `timestamp` field
    // Hint: for MongoDB 5.0+ time-series collections, configure at DB level
  }
);

TouristLocationLogSchema.index({ touristId: 1, timestamp: -1 });
TouristLocationLogSchema.index({ location: "2dsphere" });

// Auto-expire logs older than 90 days (configurable)
TouristLocationLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export const TouristLocationLogModel = mongoose.model<ITouristLocationLog>(
  "TouristLocationLog",
  TouristLocationLogSchema
);
