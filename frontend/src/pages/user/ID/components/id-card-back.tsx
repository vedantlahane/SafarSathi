import { memo } from "react";
import { QRCodeDisplay } from "./qr-code-display";
import type { TouristProfile } from "../types";

interface IDCardBackProps {
    profile: TouristProfile | null;
}

function IDCardBackInner({ profile }: IDCardBackProps) {
    const touristId = profile?.touristId || profile?.id || "";
    const emergencyPhone = profile?.emergencyContact?.phone || "Not set";
    const bloodType = profile?.bloodType || "Not set";
    const allergies = profile?.allergies?.length ? profile.allergies.join(", ") : "None";

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-between p-5 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-white">
            {/* Holographic shimmer overlay */}
            <div className="absolute inset-0 pointer-events-none z-10 rounded-2xl animate-holo-shift"
                style={{
                    background: "linear-gradient(135deg, transparent 20%, rgba(255,255,255,0.1) 25%, transparent 30%, transparent 45%, rgba(255,255,255,0.15) 50%, transparent 55%, transparent 70%, rgba(255,255,255,0.1) 75%, transparent 80%)",
                    backgroundSize: "200% 200%",
                }} />

            {/* Top: Emergency label */}
            <p className="relative z-20 text-[10px] uppercase tracking-wider font-semibold text-white/80 self-start">
                Emergency Information
            </p>

            {/* Center: QR Code */}
            <div className="relative z-20">
                <QRCodeDisplay touristId={touristId} size={100} />
            </div>

            {/* Bottom: Emergency details */}
            <div className="relative z-20 w-full space-y-1">
                <div className="flex justify-between text-[10px]">
                    <span className="uppercase text-white/50">Emergency Contact</span>
                    <span className="font-medium text-white/90">{emergencyPhone}</span>
                </div>
                <div className="flex gap-4">
                    <div className="flex-1">
                        <span className="text-[9px] uppercase text-white/50">Blood Type</span>
                        <p className="text-xs font-medium">{bloodType}</p>
                    </div>
                    <div className="flex-1">
                        <span className="text-[9px] uppercase text-white/50">Allergies</span>
                        <p className="text-xs font-medium truncate">{allergies}</p>
                    </div>
                </div>
                <p className="text-[9px] text-white/50 text-center pt-1">Scan QR for full emergency profile</p>
            </div>
        </div>
    );
}

export const IDCardBack = memo(IDCardBackInner);
