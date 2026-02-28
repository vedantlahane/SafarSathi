import { z } from "zod";

// ── Auth Validation ─────────────────────────────────────────────────────

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(5, "Phone is required").max(20),
  passportNumber: z.string().min(3, "Passport number is required").max(30),
  passwordHash: z.string().min(6, "Password must be at least 6 characters"), // actually raw password from frontend
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  gender: z.enum(["Male", "Female", "Non-binary", "Prefer not to say"]).optional(),
  nationality: z.string().optional(),
  emergencyContact: z
    .object({
      name: z.string().optional(),
      phone: z.string().optional(),
      relationship: z.string().optional(),
    })
    .optional(),
  bloodType: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]).optional(),
  allergies: z.array(z.string()).optional(),
  medicalConditions: z.array(z.string()).optional(),
  currentLat: z.number().optional(),
  currentLng: z.number().optional(),
  travelType: z.enum(["solo", "family", "group", "adventure"]).optional(),
  preferredLanguage: z.string().optional(),
  visaType: z.string().optional(),
  visaExpiry: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const passwordResetRequestSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export const passwordResetConfirmSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// ── SOS Validation ──────────────────────────────────────────────────────

export const locationUpdateSchema = z.object({
  lat: z.number({ error: "lat is required" }),
  lng: z.number({ error: "lng is required" }),
  accuracy: z.number().optional(),
  speed: z.number().optional(),
  heading: z.number().min(0).max(360).optional(),
});

export const sosSchema = z.object({
  lat: z.number().optional(),
  lng: z.number().optional(),
  message: z.string().optional(),
  media: z.array(z.string().url()).optional(),
});

export const preAlertSchema = z.object({
  lat: z.number().optional(),
  lng: z.number().optional(),
});

// ── Risk Zone Validation ────────────────────────────────────────────────

export const riskZoneSchema = z.object({
  name: z.string().min(1, "Name is required").max(300),
  description: z.string().optional(),
  centerLat: z.number({ error: "centerLat is required" }),
  centerLng: z.number({ error: "centerLng is required" }),
  radiusMeters: z.number().positive("radiusMeters must be positive"),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  active: z.boolean().optional(),
  category: z.enum(["flood", "wildlife", "crime", "traffic", "political_unrest", "other"]).optional(),
  expiresAt: z.string().datetime().optional(),
  source: z.enum(["admin", "ml_pipeline", "crowd_report"]).optional(),
});

// ── Police Department Validation ────────────────────────────────────────

export const policeDepartmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  passwordHash: z.string().min(6, "Password must be at least 6 characters"),
  departmentCode: z.string().min(1, "Department code is required"),
  latitude: z.number(),
  longitude: z.number(),
  city: z.string().min(1),
  district: z.string().min(1),
  state: z.string().min(1),
  contactNumber: z.string().min(5),
  stationType: z.enum(["outpost", "station", "district_hq"]).optional(),
  jurisdictionRadiusKm: z.number().positive().optional(),
  officerCount: z.number().int().min(0).optional(),
});

// ── Hospital Validation ─────────────────────────────────────────────────

export const hospitalSchema = z.object({
  name: z.string().min(1, "Name is required"),
  latitude: z.number(),
  longitude: z.number(),
  contact: z.string().min(3),
  type: z.enum(["hospital", "clinic", "pharmacy"]).optional(),
  tier: z.enum(["PHC", "CHC", "DH", "Medical_College"]).optional().nullable(),
  emergency: z.boolean().optional(),
  city: z.string().min(1),
  district: z.string().min(1),
  state: z.string().min(1),
  specialties: z.array(z.string()).optional(),
  bedCapacity: z.number().int().min(0).optional(),
  availableBeds: z.number().int().min(0).optional(),
  operatingHours: z
    .object({
      open: z.string().optional(),
      close: z.string().optional(),
      is24Hours: z.boolean().optional(),
    })
    .optional(),
  ambulanceAvailable: z.boolean().optional(),
});

// ── Travel Advisory Validation ──────────────────────────────────────────

export const travelAdvisorySchema = z.object({
  title: z.string().min(1, "Title is required").max(300),
  body: z.string().min(1, "Body is required"),
  region: z.string().min(1, "Region is required"),
  severity: z.enum(["info", "warning", "critical"]).optional(),
  effectiveFrom: z.string().datetime(),
  effectiveTo: z.string().datetime(),
  source: z.enum(["admin", "ml_pipeline", "government"]).optional(),
  affectedZoneIds: z.array(z.number().int()).optional(),
});

// ── Broadcast Validation ────────────────────────────────────────────────

export const broadcastSchema = z.object({
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  target: z.string().default("all"), // "all" | "zone:<id>" | "tourist:<id>"
  priority: z.enum(["low", "normal", "urgent", "critical"]).optional(),
});
