// src/pages/user/map/components/stats-pill.tsx
import { memo } from "react";
import {
  AlertTriangle,
  Shield,
  Layers,
  AlertCircle,
  Cross,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsPillProps {
  zones: number;
  stations: number;
  hospitals: number;
  userInZone: boolean;
  zoneName: string | null;
  onPress: () => void;
}

function StatsPillInner({
  zones,
  stations,
  hospitals,
  userInZone,
  zoneName,
  onPress,
}: StatsPillProps) {
  return (
    <button
      onClick={onPress}
      aria-label="Open map layers and filters"
      className={cn(
        "absolute top-[76px] left-1/2 -translate-x-1/2 z-[1000]",
        "flex items-center gap-3 px-4 py-2.5 rounded-full shadow-lg",
        "bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl",
        "border border-slate-100 dark:border-slate-800",
        "transition-all active:scale-95",
        userInZone && "bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800"
      )}
    >
      {userInZone && (
        <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 pr-2 border-r border-red-200 dark:border-red-800">
          <AlertCircle className="h-4 w-4" />
          <span className="text-xs font-semibold truncate max-w-24">
            {zoneName ?? "In Risk Zone"}
          </span>
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
      <div className="flex items-center gap-1.5">
        <Cross className="h-4 w-4 text-rose-500" />
        <span className="text-xs font-medium">{hospitals}</span>
      </div>
      <Layers className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}

export const StatsPill = memo(StatsPillInner);