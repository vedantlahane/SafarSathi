// src/pages/user/map/components/map-controls.tsx
import { memo } from "react";
import { useMap } from "react-map-gl/mapbox";
import { ZoomIn, ZoomOut, LocateFixed, Navigation } from "lucide-react";
import { motion } from "motion/react";
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
  const { current: map } = useMap();

  return (
    <div className="absolute top-1/2 -translate-y-1/2 right-4 z-[1000] flex flex-col gap-3">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
        onClick={onResetBearing}
        aria-label="Reset map north"
        className="h-12 w-12 flex items-center justify-center rounded-full shadow-2xl bg-white/80 dark:bg-black/60 backdrop-blur-2xl backdrop-saturate-200 border border-white/20 dark:border-white/10 text-slate-700 dark:text-slate-200 transition-colors hover:bg-white/90 dark:hover:bg-black/80"
      >
        <Navigation
          className={cn(
            "h-5 w-5 transition-all duration-500",
            bearing !== 0 && "text-primary fill-primary/20"
          )}
          style={{ transform: `rotate(${bearing}deg)` }}
        />
      </motion.button>
      
      <div className="flex flex-col rounded-full overflow-hidden shadow-2xl bg-white/80 dark:bg-black/60 backdrop-blur-2xl backdrop-saturate-200 border border-white/20 dark:border-white/10">
        <motion.button
          whileHover={{ backgroundColor: "rgba(255,255,255,0.1)" }}
          whileTap={{ backgroundColor: "rgba(0,0,0,0.1)" }}
          onClick={() => map?.zoomIn()}
          aria-label="Zoom in"
          className="h-12 w-12 flex items-center justify-center text-slate-700 dark:text-slate-200 border-b border-black/5 dark:border-white/5"
        >
          <ZoomIn className="h-5 w-5" />
        </motion.button>
        <motion.button
          whileHover={{ backgroundColor: "rgba(255,255,255,0.1)" }}
          whileTap={{ backgroundColor: "rgba(0,0,0,0.1)" }}
          onClick={() => map?.zoomOut()}
          aria-label="Zoom out"
          className="h-12 w-12 flex items-center justify-center text-slate-700 dark:text-slate-200"
        >
          <ZoomOut className="h-5 w-5" />
        </motion.button>
      </div>

      <div className="relative mt-2">
        {locating && (
          <motion.div
            initial={{ scale: 0.8, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 rounded-full bg-primary"
          />
        )}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          onClick={onLocate}
          disabled={locating}
          aria-label="Center on my location"
          className={cn(
            "relative h-14 w-14 flex items-center justify-center rounded-full shadow-2xl backdrop-blur-2xl backdrop-saturate-200 border",
            locating
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-white/80 dark:bg-black/60 border-white/20 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-white/90 dark:hover:bg-black/80"
          )}
        >
          <LocateFixed className={cn("h-6 w-6 transition-all", locating ? "animate-pulse" : "text-primary")} />
        </motion.button>
      </div>
    </div>
  );
}

export const MapControls = memo(MapControlsInner);