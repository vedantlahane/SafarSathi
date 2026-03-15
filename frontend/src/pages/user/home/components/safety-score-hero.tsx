import { memo, useMemo } from "react";
import { Shield, Sparkles, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { SafetyFactorPills } from "./safety-factor-pills";
import type { SafetyFactor } from "../types";

interface SafetyScoreHeroProps {
  dangerScore: number;
  recommendation: string;
  factors: SafetyFactor[];
  loading: boolean;
  scanning: boolean;
}

function SafetyScoreHeroInner({
  dangerScore,
  recommendation,
  factors,
  loading,
  scanning,
}: SafetyScoreHeroProps) {
  const normalizedDangerScore = Math.max(0, Math.min(1, dangerScore ?? 0));
  const riskPercent = Math.round(normalizedDangerScore * 100);

  const riskState = useMemo(() => {
    if (normalizedDangerScore > 0.7) {
      return {
        label: "High Danger" as const,
        color: "#dc2626",
        badgeClass: "bg-red-100 text-red-700 border-red-200",
      };
    }
    if (normalizedDangerScore >= 0.3) {
      return {
        label: "Caution" as const,
        color: "#ea580c",
        badgeClass: "bg-orange-100 text-orange-700 border-orange-200",
      };
    }
    return {
      label: "Low Risk" as const,
      color: "#16a34a",
      badgeClass: "bg-emerald-100 text-emerald-700 border-emerald-200",
    };
  }, [normalizedDangerScore]);

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = useMemo(
    () => circumference - (riskPercent / 100) * circumference,
    [riskPercent, circumference]
  );

  const shouldPulse = !scanning && normalizedDangerScore > 0.7;
  const message = scanning
    ? "Scanning..."
    : recommendation ||
    (riskState.label === "High Danger"
      ? "High risk activity likely nearby. Consider rerouting immediately."
      : riskState.label === "Caution"
        ? "Proceed with caution and stay aware of your surroundings."
        : "Low risk detected. Continue with normal precautions.");

  if (loading) {
    return <Skeleton className="h-56 w-full rounded-2xl" />;
  }

  return (
    <GlassCard
      level={1}
      className={`relative overflow-hidden p-5 space-y-4 ${shouldPulse ? "animate-pulse" : ""}`}
    >
      {/* Ambient glow blob */}
      <div
        className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full blur-3xl transition-colors duration-2000"
        style={{
          backgroundColor: riskState.color,
          opacity: 0.16,
        }}
        aria-hidden="true"
      />

      {/* AI label */}
      <div className="flex items-center gap-1.5">
        <Sparkles
          className="h-3.5 w-3.5 transition-colors duration-2000"
          style={{ color: riskState.color }}
        />
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
          AI Safety Analysis
        </span>
      </div>

      {/* Score + Ring row */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          {/* Large score */}
          {scanning ? (
            <span
              className="text-3xl font-extrabold leading-none transition-colors duration-2000"
              style={{ color: riskState.color }}
            >
              Scanning...
            </span>
          ) : (
            <div className="flex items-end gap-1">
              <AnimatedNumber
                value={riskPercent}
                className="text-5xl font-extrabold tabular-nums leading-none transition-colors duration-2000"
                style={{ color: riskState.color }}
              />
              <span
                className="text-xl font-bold leading-none mb-1"
                style={{ color: riskState.color }}
              >
                %
              </span>
            </div>
          )}

          {/* Status badge */}
          <Badge variant="secondary" className={`text-[10px] h-5 font-semibold border ${riskState.badgeClass}`}>
            {scanning ? "Scanning..." : riskState.label}
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
              style={{ stroke: riskState.color }}
            />
          </svg>
          {/* Center icon instead of duplicate number */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Shield
              className="h-8 w-8 transition-colors duration-2000"
              style={{ color: riskState.color }}
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
              width: `${riskPercent}%`,
              backgroundColor: riskState.color,
            }}
          />
        </div>
      </div>

      {/* AI Recommendation */}
      {message && (
        <div
          className="flex items-start gap-2 rounded-lg p-2.5 text-xs"
          style={{
            backgroundColor: `color-mix(in oklch, ${riskState.color} 10%, transparent)`,
          }}
        >
          <Info
            className="h-3.5 w-3.5 mt-0.5 shrink-0 transition-colors duration-2000"
            style={{ color: riskState.color }}
          />
          <p className="text-muted-foreground leading-relaxed">
            {message}
          </p>
        </div>
      )}

      {/* Safety factor pills */}
      {factors.length > 0 && <SafetyFactorPills factors={factors} />}

      {/* Source note */}
      <p className="text-[10px] text-muted-foreground/60">
        Based on AI history, real-time location, and recent movement context
      </p>
    </GlassCard>
  );
}

export const SafetyScoreHero = memo(SafetyScoreHeroInner);