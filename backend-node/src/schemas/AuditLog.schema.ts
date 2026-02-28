import mongoose, { Schema, Document } from "mongoose";

/**
 * Tracks every admin mutation for accountability and data reliability.
 * Every create/update/delete on admin-controlled collections is logged here.
 */
export interface IAuditLog extends Document {
  logId: number;
  actor: string; // admin _id or "system"
  actorType: string;
  action: string;
  targetCollection: string;
  targetId: string;
  changes?: Record<string, unknown>; // diff of what changed
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    logId: { type: Number, required: true, unique: true },
    actor: { type: String, required: true },
    actorType: {
      type: String,
      enum: ["admin", "system", "tourist"],
      default: "admin",
    },
    action: {
      type: String,
      required: true,
      enum: [
        "created",
        "updated",
        "deleted",
        "status_changed",
        "login",
        "broadcast",
        "score_recalculated",
      ],
    },
    targetCollection: { type: String, required: true },
    targetId: { type: String, required: true },
    changes: { type: Schema.Types.Mixed },
    ipAddress: String,
    userAgent: String,
    timestamp: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: false, // We use our own `timestamp` field
  }
);

AuditLogSchema.index({ actor: 1, timestamp: -1 });
AuditLogSchema.index({ targetCollection: 1, targetId: 1 });
AuditLogSchema.index({ action: 1 });

// Auto-expire audit logs after 1 year
AuditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

export const AuditLogModel = mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
