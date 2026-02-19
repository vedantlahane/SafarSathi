import { memo, useMemo } from "react";
import { Shield, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { SafetyFactorPills } from "./safety-factor-pills";
import { useThemeColors } from "@/lib/theme/use-theme-colors";
import type { SafetyFactor } from "../types";

interface SafetyScoreHeroProps {
    score: number;
    status: string;
    factors: SafetyFactor[];
    loading: boolean;
}

function SafetyScoreHeroInner({ score, status, factors, loading }: SafetyScoreHeroProps) {
    const { colors } = useThemeColors();

    // SVG ring calculations
    const radius = 28;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = useMemo(
        () => `${(score / 100) * circumference} ${circumference}`,
        [score, circumference],
    );

    if (loading) {
        return <Skeleton className="h-48 w-full rounded-2xl" />;
    }

    return (
        <GlassCard level={1} className="p-5 space-y-4" id="safety-score-hero">
            <div className="flex items-center justify-between">
                {/* Left side: score + status */}
                <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 transition-colors duration-2000" style={{ color: "var(--theme-primary)" }} />
                        <div className="flex items-center gap-1.5">
                            <Sparkles className="h-3 w-3 text-muted-foreground" />
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                                AI Safety Analysis
                            </span>
                        </div>
                    </div>

                    {/* Large animated number */}
                    <AnimatedNumber
                        value={score}
                        className="text-4xl font-bold tabular-nums transition-colors duration-2000"
                        style={{ color: "var(--theme-primary)" } as React.CSSProperties}
                    />

                    {/* Status badge */}
                    <Badge
                        variant={
                            score >= 80 ? "secondary" : score >= 50 ? "default" : "destructive"
                        }
                        className="text-[10px] h-5"
                    >
                        {colors.statusLabel}
                    </Badge>
                </div>

                {/* Right side: circular SVG ring */}
                <div className="relative h-20 w-20 shrink-0">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 64 64">
                        <circle
                            cx="32"
                            cy="32"
                            r={radius}
                            className="stroke-muted/30"
                            strokeWidth="5"
                            fill="none"
                        />
                        <circle
                            cx="32"
                            cy="32"
                            r={radius}
                            strokeWidth="5"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={strokeDasharray}
                            className="transition-all duration-1000 ease-out"
                            style={{ stroke: "var(--theme-primary)" }}
                        />
                    </svg>
                    <AnimatedNumber
                        value={score}
                        className="absolute inset-0 flex items-center justify-center text-lg font-bold transition-colors duration-2000"
                        style={{ color: "var(--theme-primary)" } as React.CSSProperties}
                    />
                </div>
            </div>

            {/* Safety factor pills */}
            {factors.length > 0 && <SafetyFactorPills factors={factors} />}

            {/* Subtitle */}
            <p className="text-[10px] text-muted-foreground">
                Based on real-time location, crowd density, time, and historical data
            </p>
        </GlassCard>
    );
}

export const SafetyScoreHero = memo(SafetyScoreHeroInner);
