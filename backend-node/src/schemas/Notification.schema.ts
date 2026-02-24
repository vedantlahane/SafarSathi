import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  notificationId: number;
  touristId: string;
  title: string;
  message: string;
  type: string;
  sourceTab?: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    notificationId: { type: Number, required: true, unique: true },
    touristId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, default: "system" },
    sourceTab: { type: String, default: "home" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationSchema.index({ touristId: 1, createdAt: -1 });

export const NotificationModel = mongoose.model<INotification>(
  "Notification",
  NotificationSchema
);