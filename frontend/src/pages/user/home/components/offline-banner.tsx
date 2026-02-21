import { memo } from "react";
import { WifiOff } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

function OfflineBannerInner() {
  return (
    <GlassCard
      level={3}
      className="flex items-center gap-3 p-3 border-orange-300/50 dark:border-orange-500/30"
      role="alert"
    >
      <WifiOff className="h-4 w-4 text-orange-600 dark:text-orange-400 shrink-0" />
      <p className="text-xs font-medium text-orange-800 dark:text-orange-200">
        You&apos;re offline. Some features may be limited.
      </p>
    </GlassCard>
  );
}

export const OfflineBanner = memo(OfflineBannerInner);