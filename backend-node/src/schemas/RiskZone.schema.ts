import mongoose, { Schema, Document } from "mongoose";

export interface IRiskZone extends Document {
  zoneId: number;
  name: string;
  description?: string;
  // Shape discriminator: "circle" (default) or "polygon"
  shapeType: "circle" | "polygon";
  // Circle fields (only for shapeType === "circle")
  centerLat: number;
  centerLng: number;
  radiusMeters: number;
  // Polygon fields (only for shapeType === "polygon")
  // Each element is [lat, lng] — stored as user-friendly order
  polygonCoordinates?: number[][];
  // GeoJSON for geo queries (auto-synced)
  geometry?: {
    type: string;
    coordinates: number[] | number[][][];
  };
  riskLevel: string;
  active: boolean;
  // Enrichment fields
  category?: string;
  createdBy?: string; // admin (police dept) _id
  expiresAt?: Date; // TTL for temporary zones
  source: string;
  createdAt: Date;
  updatedAt: Date;
}

const RiskZoneSchema = new Schema<IRiskZone>(
  {
    zoneId: { type: Number, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    description: String,
    shapeType: {
      type: String,
      enum: ["circle", "polygon"],
      default: "circle",
    },
    centerLat: { type: Number },
    centerLng: { type: Number },
    radiusMeters: { type: Number, min: 0 },
    polygonCoordinates: {
      type: [[Number]],
      default: undefined,
    },
    geometry: {
      type: {
        type: String,
        enum: ["Point", "Polygon"],
        default: "Point",
      },
      coordinates: { type: Schema.Types.Mixed, default: [0, 0] },
    },
    riskLevel: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "MEDIUM",
    },
    active: { type: Boolean, default: true },
    category: {
      type: String,
      enum: ["flood", "wildlife", "crime", "traffic", "political_unrest", "other", null],
    },
    createdBy: { type: String, ref: "PoliceDepartment" },
    expiresAt: { type: Date, index: { expires: 0 } }, // TTL index: auto-deletes when expired
    source: {
      type: String,
      enum: ["admin", "ml_pipeline", "crowd_report"],
      default: "admin",
    },
  },
  { timestamps: true }
);

// Helper: build a closed GeoJSON polygon ring from [lat,lng][] → [[lng,lat], ...]
function toGeoJSONPolygon(coords: number[][]): number[][][] {
  const ring = coords.map(([lat, lng]) => [lng, lat]);
  // Ensure the ring is closed
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    ring.push([...first]);
  }
  return [ring];
}

// Auto-sync GeoJSON from flat fields
RiskZoneSchema.pre("save", function () {
  if (this.shapeType === "polygon" && Array.isArray(this.polygonCoordinates) && this.polygonCoordinates.length >= 3) {
    this.geometry = {
      type: "Polygon",
      coordinates: toGeoJSONPolygon(this.polygonCoordinates),
    };
    // Compute centroid for backward compat / nearby queries fallback
    const lats = this.polygonCoordinates.map((c) => c[0]);
    const lngs = this.polygonCoordinates.map((c) => c[1]);
    this.centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;
    this.centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
  } else {
    // Circle (default)
    if (typeof this.centerLat === "number" && typeof this.centerLng === "number") {
      this.geometry = {
        type: "Point",
        coordinates: [this.centerLng, this.centerLat],
      };
    }
  }
});

RiskZoneSchema.pre("findOneAndUpdate", function () {
  const update = this.getUpdate() as Record<string, unknown> | null;
  if (!update) return;

  const shape = (update.shapeType as string) || undefined;
  const polyCoords = update.polygonCoordinates as number[][] | undefined;

  if (shape === "polygon" && Array.isArray(polyCoords) && polyCoords.length >= 3) {
    (update as any).geometry = {
      type: "Polygon",
      coordinates: toGeoJSONPolygon(polyCoords),
    };
    const lats = polyCoords.map((c) => c[0]);
    const lngs = polyCoords.map((c) => c[1]);
    (update as any).centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;
    (update as any).centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
  } else if (typeof update.centerLat === "number" && typeof update.centerLng === "number") {
    (update as any).geometry = {
      type: "Point",
      coordinates: [update.centerLng, update.centerLat],
    };
  }
});

RiskZoneSchema.index({ geometry: "2dsphere" });
RiskZoneSchema.index({ active: 1 });
RiskZoneSchema.index({ source: 1 });

export const RiskZoneModel = mongoose.model<IRiskZone>("RiskZone", RiskZoneSchema);
