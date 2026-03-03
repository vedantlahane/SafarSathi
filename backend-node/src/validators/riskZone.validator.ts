import { z } from "zod/v4";

// Shared base fields
const baseFields = {
  name: z.string().min(2, "Name must be at least 2 characters").max(200),
  description: z.string().max(1000).optional(),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  active: z.boolean().default(true),
  category: z.enum(["flood", "wildlife", "crime", "traffic", "political_unrest", "other"]).optional(),
  expiresAt: z.coerce.date().optional(),
  source: z.enum(["admin", "ml_pipeline", "crowd_report"]).default("admin"),
};

// Circle zone schema
const circleZoneSchema = z.object({
  ...baseFields,
  shapeType: z.literal("circle").default("circle"),
  centerLat: z.number().min(-90).max(90),
  centerLng: z.number().min(-180).max(180),
  radiusMeters: z.number().min(50, "Radius must be at least 50m").max(50000, "Radius must be at most 50km"),
});

// Polygon zone schema — polygonCoordinates is [[lat, lng], ...]
const polygonZoneSchema = z.object({
  ...baseFields,
  shapeType: z.literal("polygon"),
  polygonCoordinates: z
    .array(z.tuple([z.number().min(-90).max(90), z.number().min(-180).max(180)]))
    .min(3, "Polygon must have at least 3 points")
    .max(100, "Polygon can have at most 100 points"),
});

export const createRiskZoneSchema = z.union([circleZoneSchema, polygonZoneSchema]);

// For updates, all fields are optional but we still validate what's provided
export const updateRiskZoneSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  description: z.string().max(1000).optional(),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  active: z.boolean().optional(),
  category: z.enum(["flood", "wildlife", "crime", "traffic", "political_unrest", "other"]).optional(),
  expiresAt: z.coerce.date().optional(),
  source: z.enum(["admin", "ml_pipeline", "crowd_report"]).optional(),
  shapeType: z.enum(["circle", "polygon"]).optional(),
  centerLat: z.number().min(-90).max(90).optional(),
  centerLng: z.number().min(-180).max(180).optional(),
  radiusMeters: z.number().min(50).max(50000).optional(),
  polygonCoordinates: z
    .array(z.tuple([z.number().min(-90).max(90), z.number().min(-180).max(180)]))
    .min(3)
    .max(100)
    .optional(),
});

export const nearbyQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radiusKm: z.coerce.number().min(0.1).max(200).default(10),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
});

export const bulkStatusSchema = z.object({
  zoneIds: z.array(z.number()).min(1, "At least one zone ID required"),
  active: z.boolean(),
});

export type CreateRiskZoneInput = z.infer<typeof createRiskZoneSchema>;
export type UpdateRiskZoneInput = z.infer<typeof updateRiskZoneSchema>;
export type NearbyQuery = z.infer<typeof nearbyQuerySchema>;
export type BulkStatusInput = z.infer<typeof bulkStatusSchema>;
