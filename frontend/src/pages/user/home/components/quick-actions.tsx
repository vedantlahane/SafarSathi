import { memo, useCallback } from "react";
import { Navigation, CheckCircle2, Loader2, Map } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import { hapticFeedback } from "@/lib/store";
import { NAVIGATE_TAB_EVENT, type NavigateTabDetail } from "../types";
import type { LocationShareState } from "../types";

interface QuickActionsProps {
  locationShare: LocationShareState;
  hasSession: boolean;
}

function QuickActionsInner({ locationShare, hasSession }: QuickActionsProps) {
  const navigateToMap = useCallback(() => {
    hapticFeedback("light");
    window.dispatchEvent(
      new CustomEvent<NavigateTabDetail>(NAVIGATE_TAB_EVENT, {
        detail: { tab: "map" },
      })
    );
  }, []);

  const handleShareLocation = useCallback(() => {
    if (hasSession && !locationShare.loading) {
      locationShare.share();
    }
  }, [hasSession, locationShare]);

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Share Location */}
      <GlassCard
        level={2}
        className={cn(
          "flex items-center gap-3 h-14 px-4",
          "active:scale-[0.97] transition-transform duration-150 cursor-pointer",
          !hasSession && "opacity-50 pointer-events-none"
        )}
        onClick={handleShareLocation}
        role="button"
        tabIndex={hasSession ? 0 : -1}
        aria-label="Share your current location"
        aria-disabled={!hasSession}
      >
        {locationShare.loading ? (
          <Loader2
            className="h-5 w-5 animate-spin shrink-0"
            style={{ color: "var(--theme-primary)" }}
          />
        ) : locationShare.shared ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
        ) : (
          <Navigation
            className="h-5 w-5 shrink-0 transition-colors duration-2000"
            style={{ color: "var(--theme-primary)" }}
          />
        )}
        <span className="text-sm font-semibold truncate">
          {locationShare.shared ? "Shared!" : "Share Location"}
        </span>
      </GlassCard>

      {/* View Map */}
      <GlassCard
        level={2}
        className={cn(
          "flex items-center gap-3 h-14 px-4",
          "active:scale-[0.97] transition-transform duration-150 cursor-pointer"
        )}
        onClick={navigateToMap}
        role="button"
        tabIndex={0}
        aria-label="Open the safety map"
      >
        <Map
          className="h-5 w-5 shrink-0 transition-colors duration-2000"
          style={{ color: "var(--theme-primary)" }}
        />
        <span className="text-sm font-semibold">View Map</span>
      </GlassCard>
    </div>
  );
}

export const QuickActions = memo(QuickActionsInner);