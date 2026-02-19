import { memo } from "react";
import { Navigation, CheckCircle2, Loader2, MapPin } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import { hapticFeedback } from "@/lib/store";
import type { LocationShareState } from "../types";

interface QuickActionsProps {
    locationShare: LocationShareState;
    hasSession: boolean;
}

function QuickActionsInner({ locationShare, hasSession }: QuickActionsProps) {
    return (
        <div className="grid grid-cols-2 gap-3" id="quick-actions">
            {/* Share Location */}
            <GlassCard
                level={2}
                className={cn(
                    "flex items-center justify-center gap-3 h-16 px-4",
                    "active:scale-95 transition-transform cursor-pointer",
                    !hasSession && "opacity-60 pointer-events-none",
                )}
                onClick={() => {
                    if (hasSession && !locationShare.loading) {
                        hapticFeedback("light");
                        locationShare.share();
                    }
                }}
                role="button"
                tabIndex={0}
                aria-label="Share your current location"
                id="share-location-btn"
            >
                {locationShare.loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" style={{ color: "var(--theme-primary)" }} />
                ) : locationShare.shared ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                    <Navigation className="h-5 w-5" style={{ color: "var(--theme-primary)" }} />
                )}
                <div className="text-left">
                    <span className="text-sm font-semibold block">
                        {locationShare.shared ? "Shared!" : "Share Location"}
                    </span>
                </div>
            </GlassCard>

            {/* View Map */}
            <GlassCard
                level={2}
                className={cn(
                    "flex items-center justify-center gap-3 h-16 px-4",
                    "active:scale-95 transition-transform cursor-pointer",
                )}
                onClick={() => {
                    hapticFeedback("light");
                    window.location.hash = "#/map";
                }}
                role="button"
                tabIndex={0}
                aria-label="View safety map"
                id="view-map-btn"
            >
                <MapPin className="h-5 w-5" style={{ color: "var(--theme-primary)" }} />
                <span className="text-sm font-semibold">View Map</span>
            </GlassCard>
        </div>
    );
}

export const QuickActions = memo(QuickActionsInner);
