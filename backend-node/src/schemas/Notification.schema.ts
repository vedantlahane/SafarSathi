import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  notificationId: number;
  touristId: string;
  title: string;
  message: string;
  type: string;
  sourceTab?: string;
  read: boolean;
  // New enrichment fields
  priority: string;
  expiresAt?: Date;
  channel: string;
  broadcastTarget?: string; // "all" | "zone:<id>" | "tourist:<id>"
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    notificationId: { type: Number, required: true, unique: true },
    touristId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    type: { type: String, default: "system" },
    sourceTab: { type: String, default: "home" },
    read: { type: Boolean, default: false },
    priority: {
      type: String,
      enum: ["low", "normal", "urgent", "critical"],
      default: "normal",
    },
    expiresAt: Date,
    channel: {
      type: String,
      enum: ["push", "ws", "sms", "in_app"],
      default: "in_app",
    },
    broadcastTarget: String,
  },
  { timestamps: true }
);

NotificationSchema.index({ touristId: 1, createdAt: -1 });
NotificationSchema.index({ read: 1 });
NotificationSchema.index({ priority: 1 });

export const NotificationModel = mongoose.model<INotification>(
  "Notification",
  NotificationSchema
);