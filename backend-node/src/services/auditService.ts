import {
  AuditLogModel,
  type IAuditLog,
} from "../schemas/index.js";
import mongoose from "mongoose";

// Counter reuse from mongoStore (shared counter collection)
const CounterModel = mongoose.model("Counter");

async function getNextId(name: string): Promise<number> {
  const counter = await CounterModel.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter!.get("seq") as number;
}

/**
 * Write an audit log entry. Called by services after admin mutations.
 */
export async function writeAuditLog(entry: {
  actor: string;
  actorType?: string;
  action: string;
  targetCollection: string;
  targetId: string;
  changes?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}): Promise<IAuditLog> {
  const logId = await getNextId("auditLogId");
  const log = new AuditLogModel({
    logId,
    actor: entry.actor,
    actorType: entry.actorType ?? "admin",
    action: entry.action,
    targetCollection: entry.targetCollection,
    targetId: entry.targetId,
    changes: entry.changes,
    ipAddress: entry.ipAddress,
    userAgent: entry.userAgent,
    timestamp: new Date(),
  });
  await log.save();
  return log.toObject();
}

/**
 * Paginated audit log retrieval for the admin panel.
 */
export async function getAuditLogs(options: {
  page?: number;
  limit?: number;
  actor?: string;
  action?: string;
  targetCollection?: string;
} = {}): Promise<{ items: IAuditLog[]; total: number; page: number; pages: number }> {
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(100, Math.max(1, options.limit ?? 50));
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (options.actor) filter.actor = options.actor;
  if (options.action) filter.action = options.action;
  if (options.targetCollection) filter.targetCollection = options.targetCollection;

  const [items, total] = await Promise.all([
    AuditLogModel.find(filter).sort({ timestamp: -1 }).skip(skip).limit(limit).lean(),
    AuditLogModel.countDocuments(filter),
  ]);

  return {
    items,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
}
