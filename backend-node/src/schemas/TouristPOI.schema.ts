import mongoose, { Schema } from "mongoose";

export type TouristPOIType =
  | "gurudwara"
  | "temple"
  | "mosque"
  | "church"
  | "attraction"
  | "monument"
  | "museum"
  | "fort"
  | "hotel"
  | "tourist_info"
  | "fire_station"
  | "pharmacy";

export interface ITouristPOI {
  osmId: number;
  name: string;
  type: TouristPOIType;
  latitude: number;
  longitude: number;
  location?: { type: string; coordinates: number[] };
  city: string;
  district: string;
  state: string;
  phone?: string;
  website?: string;
  openingHours?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TouristPOISchema = new Schema<ITouristPOI>(
  {
    osmId:    { type: Number, required: true, unique: true },
    name:     { type: String, required: true, trim: true },
    type:     {
      type: String,
      required: true,
      enum: [
        "gurudwara","temple","mosque","church",
        "attraction","monument","museum","fort",
        "hotel","tourist_info","fire_station","pharmacy",
      ],
    },
    latitude:  { type: Number, required: true },
    longitude: { type: Number, required: true },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    },
    city:         { type: String, required: true, trim: true },
    district:     { type: String, default: "Punjab", trim: true },
    state:        { type: String, default: "Punjab", trim: true },
    phone:        { type: String },
    website:      { type: String },
    openingHours: { type: String },
    description:  { type: String },
    isActive:     { type: Boolean, default: true },
  },
  { timestamps: true }
);

TouristPOISchema.pre("save", function () {
  if (typeof this.latitude === "number" && typeof this.longitude === "number") {
    this.location = { type: "Point", coordinates: [this.longitude, this.latitude] };
  }
});

TouristPOISchema.index({ location: "2dsphere" });
TouristPOISchema.index({ type: 1 });
TouristPOISchema.index({ isActive: 1 });

export const TouristPOIModel = mongoose.model<ITouristPOI>("TouristPOI", TouristPOISchema);
