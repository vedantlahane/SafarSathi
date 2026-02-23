import { memo } from "react";
import { WifiOff } from "lucide-react";
import { useAppState } from "@/lib/store";

/**
 * Global offline banner displayed at the top of the app.
 * Uses glassmorphism amber styling for visibility.
 */
function OfflineBannerInner() {
    const { isOnline } = useAppState();

    if (isOnline) return null;

    return (
        <div className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-500/90 backdrop-blur-sm text-white text-sm font-medium">
            <WifiOff className="h-4 w-4 shrink-0" />
            <span>You're offline — some features may be limited</span>
        </div>
    );
}

export const OfflineBanner = memo(OfflineBannerInner);
