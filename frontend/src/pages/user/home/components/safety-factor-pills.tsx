import { memo } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SafetyFactor } from "../types";

interface SafetyFactorPillsProps {
  factors: SafetyFactor[];
}

const TREND_ICON = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
} as const;

const TREND_STYLES = {
  up: "border-emerald-400/50 text-emerald-700 dark:text-emerald-400 dark:border-emerald-500/30",
  down: "border-red-400/50 text-red-700 dark:text-red-400 dark:border-red-500/30",
  stable: "border-muted text-muted-foreground",
} as const;

function SafetyFactorPillsInner({ factors }: SafetyFactorPillsProps) {
  if (factors.length === 0) return null;

  return (
    <div
      className="scroll-fade-x"
      role="list"
      aria-label="Safety factor breakdown"
    >
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 px-0.5">
        {factors.map((factor) => {
          const Icon = TREND_ICON[factor.trend];
          return (
            <Badge
              key={factor.label}
              variant="outline"
              className={cn(
                "shrink-0 gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-full",
                TREND_STYLES[factor.trend]
              )}
              role="listitem"
            >
              <Icon className="h-3 w-3" />
              {factor.label}
              <span className="font-bold">{factor.score}</span>
            </Badge>
          );
        })}
      </div>
    </div>
  );
}

export const SafetyFactorPills = memo(SafetyFactorPillsInner);