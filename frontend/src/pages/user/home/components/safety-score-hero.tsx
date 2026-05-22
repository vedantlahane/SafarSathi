import { memo, useMemo } from "react";
import { Shield, Sparkles, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard } from "@/components/ui/glass-card";
import type { SafetyFactor } from "../types";

interface SafetyScoreHeroProps {
  dangerScore: number;
  recommendation: string;
  factors: SafetyFactor[];
  anomaly?: {
    detected: boolean;
    severity: string;
    explanation: string;
  };
  loading: boolean;
  scanning: boolean;
}

function SafetyScoreHeroInner({
  dangerScore,
  recommendation,
  factors,
  anomaly,
  loading,
  scanning,
}: SafetyScoreHeroProps) {
  const normalizedDangerScore = Math.max(0, Math.min(1, dangerScore ?? 0));
  const riskPercent = Math.round(normalizedDangerScore * 100);
  const safetyScore = 100 - riskPercent;

  const riskState = useMemo(() => {
    if (normalizedDangerScore > 0.7) {
      return {
        label: "High Danger",
        title: "Critical Hazard Alert",
        colorClass: "text-red-500 dark:text-red-400",
        badgeClass: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20",
        bgGradient: "from-red-500/10 to-red-600/5",
        ringColor: "#ef4444",
      };
    }
    if (normalizedDangerScore >= 0.3) {
      return {
        label: "Caution Required",
        title: "Elevated Risk Advisory",
        colorClass: "text-amber-500 dark:text-amber-400",
        badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
        bgGradient: "from-amber-500/10 to-amber-600/5",
        ringColor: "#f59e0b",
      };
    }
    return {
      label: "Safe Travel Zone",
      title: "Normal Safety Conditions",
      colorClass: "text-emerald-500 dark:text-emerald-400",
      badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
      bgGradient: "from-emerald-500/10 to-emerald-600/5",
      ringColor: "#10b981",
    };
  }, [normalizedDangerScore]);

  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = useMemo(
    () => circumference - (safetyScore / 100) * circumference,
    [safetyScore, circumference]
  );

  const shouldPulse = !scanning && normalizedDangerScore > 0.7;
  const message = scanning
    ? "Scanning..."
    : anomaly?.detected
      ? anomaly.explanation
      : recommendation ||
      (normalizedDangerScore > 0.7
        ? "High risk activity likely nearby. Consider rerouting immediately."
        : normalizedDangerScore >= 0.3
          ? "Proceed with caution and stay aware of your surroundings."
          : "Low risk detected. Continue with normal precautions.");

  if (loading) {
    return <Skeleton className="h-56 w-full rounded-2xl" />;
  }

  return (
    <GlassCard
      level={1}
      className={`relative overflow-hidden p-6 space-y-5 border border-white/10 shadow-lg ${shouldPulse ? "animate-pulse" : ""}`}
    >
      {/* Ambient background blob */}
      <div
        className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full blur-3xl opacity-15 transition-all duration-1000"
        style={{ backgroundColor: riskState.ringColor }}
        aria-hidden="true"
      />

      {/* Top row: Brand & Mini Gauge */}
      <div className="flex items-center justify-between border-b border-muted/20 pb-3.5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary animate-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            AI Travel Safety Insight
          </span>
        </div>

        {/* Smaller Gauge: Safety Score as secondary */}
        {!scanning && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-muted-foreground block leading-none font-semibold">Safety Score</span>
              <span className="text-sm font-extrabold tabular-nums">
                {safetyScore}<span className="text-[10px] text-muted-foreground font-semibold">/100</span>
              </span>
            </div>
            <div className="relative h-11 w-11 shrink-0" aria-hidden="true">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 48 48">
                <circle
                  cx="24"
                  cy="24"
                  r={radius}
                  className="stroke-muted/20"
                  strokeWidth="3.5"
                  fill="none"
                />
                <circle
                  cx="24"
                  cy="24"
                  r={radius}
                  strokeWidth="3.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-out"
                  style={{ stroke: riskState.ringColor }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Shield className="h-4 w-4" style={{ color: riskState.ringColor }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hero Semantic Label */}
      <div className="space-y-1">
        {scanning ? (
          <div className="h-8 w-48 animate-pulse rounded bg-muted/30" />
        ) : (
          <div className="flex items-center gap-2.5">
            <h2 className={`text-2xl font-extrabold tracking-tight ${riskState.colorClass}`}>
              {riskState.label}
            </h2>
            <Badge variant="outline" className={`text-[10px] px-2 py-0.5 font-bold ${riskState.badgeClass}`}>
              {riskState.title}
            </Badge>
          </div>
        )}
      </div>

      {/* Action-Oriented Framing Recommendation */}
      <div
        className="rounded-xl p-4 border transition-colors duration-500"
        style={{
          backgroundColor: `color-mix(in oklch, ${riskState.ringColor} 8%, transparent)`,
          borderColor: `color-mix(in oklch, ${riskState.ringColor} 15%, transparent)`,
        }}
      >
        <div className="flex items-start gap-3">
          <Info className="h-4 w-4 mt-0.5 shrink-0" style={{ color: riskState.ringColor }} />
          <div className="space-y-1 flex-1">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/90">
              Smart Guidance
            </h4>
            <p className="text-xs font-semibold text-foreground/90 leading-relaxed">
              {scanning ? "Evaluating live location and environment..." : message || "No current alerts. Continue your travels."}
            </p>
          </div>
        </div>
      </div>

      {/* Deconstructed Factor Cards/List */}
      {!scanning && factors.length > 0 && (
        <div className="space-y-2.5">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/90 px-0.5">
            Verified Environment Factors
          </h3>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {factors.map((factor) => {
              // ML returns SHAP (small decimals, trend "down" = bad).
              // Heuristics return score 0-100 (higher = worse).
              const isSevere = factor.score >= 50 || (factor.score > 0 && factor.score < 1 && factor.trend === "down");
              const isCaution = factor.score >= 20 || (factor.score > 0 && factor.score < 1 && factor.trend === "stable");
              const isGood = factor.trend === "up" || (!isSevere && !isCaution);

              const scoreColor = isSevere
                ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                : isCaution
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";

              return (
                <div
                  key={factor.label}
                  className="rounded-xl border border-white/5 bg-white/[0.02] dark:bg-black/[0.05] p-3 flex flex-col justify-between gap-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground/80">
                      {factor.label}
                    </span>
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0.5 font-bold ${scoreColor}`}>
                      {isSevere ? "Severe" : isCaution ? "Caution" : "Good"}
                    </Badge>
                  </div>
                  {factor.detail && (
                    <p className="text-[11px] text-muted-foreground leading-normal font-medium">
                      {factor.detail}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Source note */}
      <div className="flex items-center justify-between text-[10px] text-muted-foreground/60 pt-1 border-t border-muted/10">
        <span>Based on live regional models & local feeds</span>
        <span>Secure Layer Active</span>
      </div>
    </GlassCard>
  );
}

export const SafetyScoreHero = memo(SafetyScoreHeroInner);