import { memo, useMemo } from "react";
import { Shield, Sparkles, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { SafetyFactorPills } from "./safety-factor-pills";
import { useThemeColors } from "@/lib/theme/use-theme-colors";
import type { SafetyFactor, SafetyStatus } from "../types";

interface SafetyScoreHeroProps {
  score: number;
  status: SafetyStatus;
  recommendation: string;
  factors: SafetyFactor[];
  loading: boolean;
}

function SafetyScoreHeroInner({
  score,
  status,
  recommendation,
  factors,
  loading,
}: SafetyScoreHeroProps) {
  const { colors } = useThemeColors();

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = useMemo(
    () => circumference - (score / 100) * circumference,
    [score, circumference]
  );

  if (loading) {
    return <Skeleton className="h-56 w-full rounded-2xl" />;
  }

  return (
    <GlassCard level={1} className="relative overflow-hidden p-5 space-y-4">
      {/* Ambient glow blob */}
      <div
        className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full blur-3xl transition-colors duration-2000"
        style={{
          backgroundColor: "var(--theme-primary)",
          opacity: "var(--theme-glow-opacity, 0.15)",
        }}
        aria-hidden="true"
      />

      {/* AI label */}
      <div className="flex items-center gap-1.5">
        <Sparkles
          className="h-3.5 w-3.5 transition-colors duration-2000"
          style={{ color: "var(--theme-primary)" }}
        />
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
          AI Safety Analysis
        </span>
      </div>

      {/* Score + Ring row */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          {/* Large score */}
          <AnimatedNumber
            value={score}
            className="text-5xl font-extrabold tabular-nums leading-none transition-colors duration-2000"
            style={{ color: "var(--theme-primary)" } as React.CSSProperties}
          />

          {/* Status badge */}
          <Badge
            variant={
              status === "safe"
                ? "secondary"
                : status === "caution"
                  ? "default"
                  : "destructive"
            }
            className="text-[10px] h-5 font-semibold"
          >
            {colors.statusLabel}
          </Badge>
        </div>

        {/* SVG Ring with Shield icon center */}
        <div className="relative h-24 w-24 shrink-0" aria-hidden="true">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 96 96">
            {/* Track */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              className="stroke-muted/20"
              strokeWidth="6"
              fill="none"
            />
            {/* Fill arc */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
              style={{ stroke: "var(--theme-primary)" }}
            />
          </svg>
          {/* Center icon instead of duplicate number */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Shield
              className="h-8 w-8 transition-colors duration-2000"
              style={{ color: "var(--theme-primary)" }}
            />
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="h-1.5 w-full rounded-full bg-muted/30 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${score}%`,
              backgroundColor: "var(--theme-primary)",
            }}
          />
        </div>
      </div>

      {/* AI Recommendation */}
      {recommendation && (
        <div
          className="flex items-start gap-2 rounded-lg p-2.5 text-xs"
          style={{
            backgroundColor:
              "color-mix(in oklch, var(--theme-primary) 8%, transparent)",
          }}
        >
          <Info
            className="h-3.5 w-3.5 mt-0.5 shrink-0 transition-colors duration-2000"
            style={{ color: "var(--theme-primary)" }}
          />
          <p className="text-muted-foreground leading-relaxed">
            {recommendation}
          </p>
        </div>
      )}

      {/* Safety factor pills */}
      {factors.length > 0 && <SafetyFactorPills factors={factors} />}

      {/* Source note */}
      <p className="text-[10px] text-muted-foreground/60">
        Based on real-time location, crowd density, time, and historical data
      </p>
    </GlassCard>
  );
}

export const SafetyScoreHero = memo(SafetyScoreHeroInner);