import { memo } from "react";
import { AlertTriangle, Shield, Layers, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsPillProps {
    zones: number;
    stations: number;
    userInZone: boolean;
    onPress: () => void;
}

function StatsPillInner({ zones, stations, userInZone, onPress }: StatsPillProps) {
    return (
        <button onClick={onPress} className={cn(
            "absolute top-[76px] left-1/2 -translate-x-1/2 z-[1000]",
            "flex items-center gap-3 px-4 py-2.5 rounded-full shadow-lg",
            "bg-white/95 backdrop-blur-lg border border-slate-100",
            "transition-all active:scale-95",
            userInZone && "bg-red-50 border-red-200",
        )}>
            {userInZone && (
                <div className="flex items-center gap-1.5 text-red-600 pr-2 border-r border-red-200">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-xs font-semibold">In Risk Zone</span>
                </div>
            )}
            <div className="flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-medium">{zones}</span>
            </div>
            <div className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-blue-500" />
                <span className="text-xs font-medium">{stations}</span>
            </div>
            <Layers className="h-4 w-4 text-muted-foreground" />
        </button>
    );
}

export const StatsPill = memo(StatsPillInner);
