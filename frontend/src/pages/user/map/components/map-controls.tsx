// src/pages/user/map/components/map-controls.tsx
import { memo } from "react";
import { useMap } from "react-leaflet";
import { ZoomIn, ZoomOut, LocateFixed, Loader2, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MapControlsProps {
  onLocate: () => void;
  locating: boolean;
  bearing: number;
  onResetBearing: () => void;
}

function MapControlsInner({
  onLocate,
  locating,
  bearing,
  onResetBearing,
}: MapControlsProps) {
  const map = useMap();

  return (
    <div className="absolute top-1/2 -translate-y-1/2 right-4 z-[1000] flex flex-col gap-2">
      <Button
        variant="secondary"
        size="icon"
        onClick={onResetBearing}
        aria-label="Reset map north"
        className="h-11 w-11 rounded-xl shadow-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-0"
      >
        <Navigation
          className={cn(
            "h-5 w-5 text-slate-600 dark:text-slate-300 transition-transform duration-300",
            bearing !== 0 && "text-primary"
          )}
          style={{ transform: `rotate(${bearing}deg)` }}
        />
      </Button>
      <Button
        variant="secondary"
        size="icon"
        onClick={() => map.zoomIn()}
        aria-label="Zoom in"
        className="h-11 w-11 rounded-xl shadow-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-0"
      >
        <ZoomIn className="h-5 w-5" />
      </Button>
      <Button
        variant="secondary"
        size="icon"
        onClick={() => map.zoomOut()}
        aria-label="Zoom out"
        className="h-11 w-11 rounded-xl shadow-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-0"
      >
        <ZoomOut className="h-5 w-5" />
      </Button>
      <Button
        variant="secondary"
        size="icon"
        onClick={onLocate}
        disabled={locating}
        aria-label="Center on my location"
        className="h-11 w-11 rounded-xl shadow-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-0"
      >
        {locating ? (
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        ) : (
          <LocateFixed className="h-5 w-5 text-primary" />
        )}
      </Button>
    </div>
  );
}

export const MapControls = memo(MapControlsInner);