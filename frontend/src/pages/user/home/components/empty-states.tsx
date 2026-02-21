import { memo } from "react";
import { CheckCircle2, Shield } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";

interface EmptyStatesProps {
  variant: "all-clear" | "not-signed-in";
}

function EmptyStatesInner({ variant }: EmptyStatesProps) {
  if (variant === "all-clear") {
    return (
      <GlassCard level={3} className="flex flex-col items-center py-6 px-4 text-center">
        <CheckCircle2
          className="h-8 w-8 mb-2 transition-colors duration-2000"
          style={{ color: "var(--theme-primary)" }}
        />
        <p className="text-sm font-bold">All Clear!</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          No active alerts in your area
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard
      level={3}
      className="flex flex-col items-center py-8 px-4 text-center border-dashed border-2 border-muted"
    >
      <Shield className="h-10 w-10 text-muted-foreground/50 mb-3" />
      <h3 className="text-sm font-bold">Sign in to Stay Safe</h3>
      <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
        Access real-time alerts, safety scores, and emergency features
      </p>
      <Button
        size="sm"
        className="mt-4"
        aria-label="Get started with YatraX"
      >
        Get Started
      </Button>
    </GlassCard>
  );
}

export const EmptyStates = memo(EmptyStatesInner);