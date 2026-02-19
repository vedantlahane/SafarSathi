import { memo } from "react";
import { Shield, QrCode, Verified } from "lucide-react";
import { Card } from "@/components/ui/card";
import { hapticFeedback } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { TouristProfile } from "@/lib/api";

interface IDCardProps {
    profile: TouristProfile | null;
    sessionName?: string;
    safetyScore: number;
    safetyColor: { bg: string; text: string };
    onShowQR: () => void;
}

function IDCardInner({ profile, sessionName, safetyScore, safetyColor, onShowQR }: IDCardProps) {
    return (
        <Card className="overflow-hidden border-0 shadow-2xl rounded-3xl">
            <div className="relative bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white min-h-70">
                <div className="absolute inset-0 bg-linrear-to-tr from-blue-500/20 via-transparent to-purple-500/20 opacity-50" />
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/30 to-transparent" />
                </div>
                <div className="absolute inset-0 opacity-5">
                    <svg width="100%" height="100%"><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5" /></pattern><rect width="100%" height="100%" fill="url(#grid)" /></svg>
                </div>
                <div className="relative z-10">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <div className="flex items-center gap-2 mb-1"><Shield className="h-5 w-5 text-blue-400" /><span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">SafarSathi</span></div>
                            <h2 className="text-lg font-bold tracking-wide">TOURIST SAFETY PASS</h2>
                        </div>
                        <button onClick={() => { hapticFeedback("light"); onShowQR(); }} className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur border border-white/20 hover:bg-white/20 transition-colors">
                            <QrCode className="h-7 w-7" />
                        </button>
                    </div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-10 w-14 rounded-lg bg-linear-to-br from-amber-300 via-amber-400 to-amber-500 p-0.5">
                            <div className="h-full w-full rounded-md bg-linear-to-br from-amber-200 to-amber-400 flex items-center justify-center">
                                <div className="grid grid-cols-3 gap-0.5">{[...Array(6)].map((_, i) => <div key={i} className="h-1.5 w-2 bg-amber-600/40 rounded-sm" />)}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /><span className="text-[10px] text-emerald-300 font-medium">ACTIVE</span></div>
                    </div>
                    <div className="space-y-1 mb-6">
                        <p className="text-2xl font-bold tracking-wide">{profile?.name?.toUpperCase() || sessionName?.toUpperCase()}</p>
                        <p className="text-sm text-slate-400 font-mono tracking-wider">ID: {profile?.id?.slice(0, 8)}...{profile?.id?.slice(-4)}</p>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div>
                                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Verified</p>
                                <div className="flex items-center gap-1.5 mt-0.5"><Verified className="h-4 w-4 text-emerald-400" /><span className="text-xs font-medium text-emerald-300">Blockchain</span></div>
                            </div>
                            <div className="h-8 w-px bg-slate-700" />
                            <div><p className="text-[10px] text-slate-500 uppercase tracking-wider">Safety</p><p className={cn("text-lg font-bold", safetyColor.text)}>{safetyScore}</p></div>
                        </div>
                        <div className="text-right"><p className="text-[10px] text-slate-500 uppercase tracking-wider">Valid Thru</p><p className="text-sm font-medium text-slate-300">{profile?.idExpiry || "12/26"}</p></div>
                    </div>
                </div>
                <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/5 to-transparent transform -skew-x-12" />
            </div>
        </Card>
    );
}

export const IDCard = memo(IDCardInner);
