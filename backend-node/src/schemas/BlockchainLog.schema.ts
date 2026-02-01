import mongoose, { Schema, Document } from "mongoose";

export interface IBlockchainLog extends Document {
  logId: number;
  touristId: string;
  transactionId: string;
  status: string;
  dataHash?: string;
  createdAt: Date;
}

const BlockchainLogSchema = new Schema<IBlockchainLog>(
  {
    logId: { type: Number, required: true, unique: true },
    touristId: { type: String, required: true, index: true },
    transactionId: { type: String, required: true },
    status: { type: String, default: "PENDING" },
    dataHash: String,
  },
  { timestamps: true }
);

BlockchainLogSchema.index({ createdAt: -1 });

export const BlockchainLogModel = mongoose.model<IBlockchainLog>(
  "BlockchainLog",
  BlockchainLogSchema
);
