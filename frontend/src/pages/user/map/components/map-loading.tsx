// src/pages/user/map/components/map-loading.tsx
import { Loader2, Map as MapIcon } from "lucide-react";

export function MapLoading() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-50">
      <div className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-2xl">
        <div className="relative">
          <MapIcon className="h-12 w-12 text-primary/30" />
          <Loader2 className="h-6 w-6 text-primary animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold">Loading Map</p>
          <p className="text-xs text-muted-foreground mt-1">
            Fetching safety data...
          </p>
        </div>
      </div>
    </div>
  );
}