import mongoose, { Schema } from "mongoose";

export interface IHospital {
    hospitalId: number;
    name: string;
    latitude: number;
    longitude: number;
    contact: string;
    type: "hospital" | "clinic" | "pharmacy";
    emergency: boolean;
    city: string;
    district: string;
    state: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const HospitalSchema = new Schema<IHospital>(
    {
        hospitalId: { type: Number, required: true, unique: true },
        name: { type: String, required: true },
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        contact: { type: String, required: true },
        type: { type: String, enum: ["hospital", "clinic", "pharmacy"], default: "hospital" },
        emergency: { type: Boolean, default: false },
        city: { type: String, required: true },
        district: { type: String, required: true },
        state: { type: String, required: true },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

HospitalSchema.index({ latitude: 1, longitude: 1 });
HospitalSchema.index({ isActive: 1 });

export const HospitalModel = mongoose.model<IHospital>("Hospital", HospitalSchema);
