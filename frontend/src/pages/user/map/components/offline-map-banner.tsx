// src/pages/user/map/components/offline-map-banner.tsx
import { memo } from "react";
import { WifiOff } from "lucide-react";

interface OfflineMapBannerProps {
  isOnline: boolean;
}

function OfflineMapBannerInner({ isOnline }: OfflineMapBannerProps) {
  if (isOnline) return null;

  return (
    <div className="absolute top-20 left-4 right-4 z-[1001]">
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/90 dark:bg-amber-600/90 backdrop-blur-lg shadow-lg">
        <WifiOff className="h-4 w-4 text-white shrink-0" />
        <p className="text-xs font-medium text-white">
          You're offline — Map data may be outdated. SOS still available.
        </p>
      </div>
    </div>
  );
}

export const OfflineMapBanner = memo(OfflineMapBannerInner);