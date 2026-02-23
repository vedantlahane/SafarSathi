import { memo } from "react";
import type { TouristProfile } from "../types";

interface IDCardFrontProps {
    profile: TouristProfile | null;
    sessionName?: string;
}

function IDCardFrontInner({ profile, sessionName }: IDCardFrontProps) {
    const name = profile?.name || sessionName || "Tourist";
    const touristId = profile?.touristId || profile?.id?.slice(0, 16) || "YTX-2026-AS-000000";
    const country = profile?.country || profile?.nationality || "India";
    const validFrom = profile?.validFrom || "2026-01-01";
    const validUntil = profile?.validUntil || profile?.idExpiry || "2027-01-01";
    const isVerified = profile?.verified !== false;
    const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

    return (
        <div className="absolute inset-0 flex flex-col justify-between p-5 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-white">
            {/* Holographic shimmer overlay */}
            <div className="absolute inset-0 pointer-events-none z-10 rounded-2xl animate-holo-shift"
                style={{
                    background: "linear-gradient(135deg, transparent 20%, rgba(255,255,255,0.1) 25%, transparent 30%, transparent 45%, rgba(255,255,255,0.15) 50%, transparent 55%, transparent 70%, rgba(255,255,255,0.1) 75%, transparent 80%)",
                    backgroundSize: "200% 200%",
                }} />

            {/* Top row: Logo + Flag */}
            <div className="relative z-20 flex items-start justify-between">
                <div>
                    <p className="text-sm font-bold tracking-widest">YatraX</p>
                    <p className="text-[10px] uppercase tracking-wider text-white/70">Tourist Identity Card</p>
                </div>
                <span className="text-2xl" aria-label={`Flag of ${country}`}>🇮🇳</span>
            </div>

            {/* Main content: Photo + Info */}
            <div className="relative z-20 flex items-center gap-3">
                {profile?.photoUrl ? (
                    <img src={profile.photoUrl} alt={name} className="h-16 w-16 rounded-lg border-2 border-white/20 object-cover shrink-0" />
                ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-white/20 bg-white/10 text-xl font-bold shrink-0">
                        {initials}
                    </div>
                )}
                <div className="min-w-0">
                    <p className="text-lg font-bold text-white truncate">{name}</p>
                    <p className="text-xs text-white/70 font-mono truncate">{touristId}</p>
                    <p className="text-sm text-white/80 mt-0.5">{country}</p>
                </div>
            </div>

            {/* Bottom: Validity dates + Verified badge */}
            <div className="relative z-20 flex items-end justify-between">
                <div className="flex gap-6">
                    <div>
                        <p className="text-[9px] uppercase text-white/50 tracking-wider">Valid From</p>
                        <p className="text-sm text-white font-medium">{formatDate(validFrom)}</p>
                    </div>
                    <div>
                        <p className="text-[9px] uppercase text-white/50 tracking-wider">Valid Until</p>
                        <p className="text-sm text-white font-medium">{formatDate(validUntil)}</p>
                    </div>
                </div>
                {isVerified && (
                    <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        <span className="text-[10px] uppercase font-medium text-emerald-300 tracking-wider">Verified</span>
                    </div>
                )}
            </div>
        </div>
    );
}

function formatDate(dateStr: string): string {
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
    } catch {
        return dateStr;
    }
}

export const IDCardFront = memo(IDCardFrontInner);
