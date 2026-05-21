import { memo } from "react";
import { CheckCircle2, Shield, LogIn, Bell } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { NAVIGATE_TAB_EVENT, type NavigateTabDetail } from "../types";
import { hapticFeedback } from "@/lib/store";

interface EmptyStatesProps {
  variant: "all-clear" | "not-signed-in";
}

function EmptyStatesInner({ variant }: EmptyStatesProps) {
  if (variant === "all-clear") {
    return (
      <GlassCard level={3} className="flex flex-col items-center py-6 px-4 text-center">
        <div
          className="h-10 w-10 rounded-2xl flex items-center justify-center mb-3"
          style={{ background: "color-mix(in oklch, var(--theme-primary) 12%, transparent)" }}
        >
          <CheckCircle2
            className="h-5 w-5 transition-colors duration-2000"
            style={{ color: "var(--theme-primary)" }}
          />
        </div>
        <p className="text-sm font-bold">All Clear</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          No active alerts in your area
        </p>
      </GlassCard>
    );
  }

  // ── Not signed in ───────────────────────────────────────────────
  const handleSignIn = () => {
    hapticFeedback("light");
    window.dispatchEvent(
      new CustomEvent<NavigateTabDetail>(NAVIGATE_TAB_EVENT, {
        detail: { tab: "settings" },
      })
    );
  };

  return (
    <GlassCard
      level={2}
      className="flex flex-col items-center py-7 px-5 text-center gap-0 overflow-hidden relative"
    >
      {/* Decorative glow */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, var(--theme-primary) 0%, transparent 70%)",
        }}
      />

      {/* Icon cluster */}
      <div className="relative mb-4">
        <div
          className="h-12 w-12 rounded-2xl flex items-center justify-center"
          style={{ background: "color-mix(in oklch, var(--theme-primary) 14%, transparent)" }}
        >
          <Shield
            className="h-6 w-6 transition-colors duration-2000"
            style={{ color: "var(--theme-primary)" }}
          />
        </div>
        {/* Bell badge */}
        <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-amber-400 flex items-center justify-center shadow-sm">
          <Bell className="h-2.5 w-2.5 text-white" />
        </div>
      </div>

      <p className="text-sm font-bold">Sign in to see your alerts</p>
      <p className="text-xs text-muted-foreground mt-1 max-w-[220px] leading-relaxed">
        Real-time alerts, personalised safety scores and emergency features are available after signing in.
      </p>

      <Button
        size="sm"
        className="mt-5 gap-2 rounded-xl px-5 h-9 shadow-md active:scale-95 transition-transform"
        style={{
          background: "var(--theme-primary)",
          color: "var(--theme-primary-foreground)",
        }}
        onClick={handleSignIn}
        aria-label="Sign in to YatraX"
      >
        <LogIn className="h-3.5 w-3.5" />
        Sign In
      </Button>
    </GlassCard>
  );
}

export const EmptyStates = memo(EmptyStatesInner);