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

function SafetyFactorPillsInner({ factors }: SafetyFactorPillsProps) {
    return (
        <div
            className="flex gap-2 overflow-x-auto no-scrollbar py-1"
            role="list"
            aria-label="Safety factor breakdown"
        >
            {factors.map((factor) => {
                const Icon = TREND_ICON[factor.trend];
                return (
                    <Badge
                        key={factor.label}
                        variant="outline"
                        className={cn(
                            "shrink-0 gap-1 px-2.5 py-1 text-[11px] font-medium rounded-full",
                            factor.trend === "up" && "border-emerald-300 text-emerald-700 dark:text-emerald-400",
                            factor.trend === "down" && "border-red-300 text-red-700 dark:text-red-400",
                            factor.trend === "stable" && "border-muted text-muted-foreground",
                        )}
                        role="listitem"
                    >
                        <Icon className="h-3 w-3" />
                        {factor.label} {factor.score}
                    </Badge>
                );
            })}
        </div>
    );
}

export const SafetyFactorPills = memo(SafetyFactorPillsInner);
