// src/pages/user/map/components/stats-pill.tsx
import { memo } from "react";
import { motion } from "motion/react";
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
    <motion.button
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={onPress}
      aria-label="Open map layers and filters"
      className={cn(
        "absolute top-[76px] left-1/2 -translate-x-1/2 z-[1000]",
        "flex items-center gap-4 px-5 py-3 rounded-full shadow-2xl",
        "bg-white/80 dark:bg-black/60 backdrop-blur-2xl backdrop-saturate-150",
        "border border-white/20 dark:border-white/10",
        "transition-colors",
        userInZone && "bg-red-500/10 dark:bg-red-500/20 border-red-500/30"
      )}
    >
      {userInZone && (
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-red-600 dark:text-red-400 pr-3 border-r border-red-200 dark:border-red-800/50"
        >
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
            <AlertCircle className="h-4 w-4 drop-shadow-md" />
          </motion.div>
          <span className="text-xs font-bold tracking-wide truncate max-w-24">
            {zoneName ?? "In Risk Zone"}
          </span>
        </motion.div>
      )}
      <div className="flex items-center gap-1.5 group">
        <div className="p-1 rounded-full bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
        </div>
        <span className="text-xs font-bold tabular-nums text-slate-700 dark:text-slate-200">{zones}</span>
      </div>
      <div className="flex items-center gap-1.5 group">
        <div className="p-1 rounded-full bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
          <Shield className="h-4 w-4 text-blue-500" />
        </div>
        <span className="text-xs font-bold tabular-nums text-slate-700 dark:text-slate-200">{stations}</span>
      </div>
      <div className="flex items-center gap-1.5 group">
        <div className="p-1 rounded-full bg-rose-500/10 group-hover:bg-rose-500/20 transition-colors">
          <Cross className="h-4 w-4 text-rose-500" />
        </div>
        <span className="text-xs font-bold tabular-nums text-slate-700 dark:text-slate-200">{hospitals}</span>
      </div>
      <div className="ml-1 pl-3 border-l border-slate-200 dark:border-slate-800/50 flex items-center">
        <Layers className="h-4 w-4 text-slate-400 dark:text-slate-500 hover:text-primary transition-colors" />
      </div>
    </motion.button>
  );
}

export const StatsPill = memo(StatsPillInner);