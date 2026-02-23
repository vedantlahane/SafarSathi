// src/pages/user/map/components/layers-sheet.tsx
import { memo } from "react";
import {
  Layers,
  AlertCircle,
  AlertTriangle,
  Shield,
  Cross,
  Map as MapIcon,
  Moon,
  Sun,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { hapticFeedback } from "@/lib/store";
import type { RiskFilter, LayerVisibility } from "../types";

interface LayersSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userInZone: boolean;
  zoneName: string | null;
  riskFilter: RiskFilter;
  setRiskFilter: (f: RiskFilter) => void;
  showLayers: LayerVisibility;
  setShowLayers: React.Dispatch<React.SetStateAction<LayerVisibility>>;
  zoneCount: number;
  stationCount: number;
  hospitalCount: number;
  isDarkMode: boolean;
}

function LayersSheetInner({
  open,
  onOpenChange,
  userInZone,
  zoneName,
  riskFilter,
  setRiskFilter,
  showLayers,
  setShowLayers,
  zoneCount,
  stationCount,
  hospitalCount,
  isDarkMode,
}: LayersSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl h-auto max-h-[70vh] pb-8"
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Map Layers & Filters
          </SheetTitle>
          <SheetDescription>
            Customize what you see on the map
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6 pb-4 overflow-y-auto">
          {/* Zone Warning */}
          {userInZone && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900 dark:text-red-200">
                  You're in a Risk Zone
                </p>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                  {zoneName
                    ? `Currently in: ${zoneName}`
                    : "Stay alert and keep emergency contacts ready."}
                </p>
              </div>
            </div>
          )}

          {/* Risk Level Filter */}
          <div>
            <p className="text-sm font-semibold mb-3 text-foreground">
              Risk Level Filter
            </p>
            <div className="flex flex-wrap gap-2">
              {(["all", "high", "medium", "low"] as const).map((level) => (
                <Button
                  key={level}
                  variant={riskFilter === level ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "rounded-full capitalize h-10 px-4",
                    riskFilter === level &&
                      level === "high" &&
                      "bg-red-500 hover:bg-red-600 text-white",
                    riskFilter === level &&
                      level === "medium" &&
                      "bg-amber-500 hover:bg-amber-600 text-white",
                    riskFilter === level &&
                      level === "low" &&
                      "bg-yellow-500 hover:bg-yellow-600 text-white"
                  )}
                  onClick={() => {
                    hapticFeedback("light");
                    setRiskFilter(level);
                  }}
                >
                  {level === "all" ? `All Zones (${zoneCount})` : `${level} Risk`}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Layer Toggles */}
          <div>
            <p className="text-sm font-semibold mb-3 text-foreground">
              Show on Map
            </p>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant={showLayers.zones ? "default" : "outline"}
                className={cn(
                  "h-14 rounded-xl gap-1 flex-col text-xs",
                  showLayers.zones && "bg-amber-500 hover:bg-amber-600 text-white"
                )}
                onClick={() => {
                  hapticFeedback("light");
                  setShowLayers((l) => ({ ...l, zones: !l.zones }));
                }}
              >
                <AlertTriangle className="h-5 w-5" />
                Zones
              </Button>
              <Button
                variant={showLayers.police ? "default" : "outline"}
                className={cn(
                  "h-14 rounded-xl gap-1 flex-col text-xs",
                  showLayers.police && "bg-blue-500 hover:bg-blue-600 text-white"
                )}
                onClick={() => {
                  hapticFeedback("light");
                  setShowLayers((l) => ({ ...l, police: !l.police }));
                }}
              >
                <Shield className="h-5 w-5" />
                Police
              </Button>
              <Button
                variant={showLayers.hospitals ? "default" : "outline"}
                className={cn(
                  "h-14 rounded-xl gap-1 flex-col text-xs",
                  showLayers.hospitals && "bg-rose-500 hover:bg-rose-600 text-white"
                )}
                onClick={() => {
                  hapticFeedback("light");
                  setShowLayers((l) => ({ ...l, hospitals: !l.hospitals }));
                }}
              >
                <Cross className="h-5 w-5" />
                Hospitals
              </Button>
            </div>
          </div>

          {/* Route Visibility */}
          <div>
            <p className="text-sm font-semibold mb-3 text-foreground">
              Route Display
            </p>
            <Button
              variant={showLayers.routes ? "default" : "outline"}
              className={cn(
                "w-full h-12 rounded-xl gap-2",
                showLayers.routes && "bg-emerald-500 hover:bg-emerald-600 text-white"
              )}
              onClick={() => {
                hapticFeedback("light");
                setShowLayers((l) => ({ ...l, routes: !l.routes }));
              }}
            >
              <MapIcon className="h-5 w-5" />
              Show Safe Routes
            </Button>
          </div>

          <Separator />

          {/* Map Style */}
          <div>
            <p className="text-sm font-semibold mb-3 text-foreground">
              Map Style
            </p>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              {isDarkMode ? (
                <Moon className="h-5 w-5 text-indigo-400" />
              ) : (
                <Sun className="h-5 w-5 text-amber-500" />
              )}
              <span className="text-sm">
                {isDarkMode ? "Dark (CartoDB Dark Matter)" : "Light (OpenStreetMap)"}
              </span>
              <span className="text-xs text-muted-foreground ml-auto">
                Follows app theme
              </span>
            </div>
          </div>

          <Separator />

          {/* Legend */}
          <div>
            <p className="text-sm font-semibold mb-3 text-foreground">Legend</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50">
                <div className="h-4 w-4 rounded-full bg-red-500 opacity-60" />
                <span className="text-sm">High Risk</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50">
                <div className="h-4 w-4 rounded-full bg-amber-500 opacity-60" />
                <span className="text-sm">Medium Risk</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50">
                <div className="h-4 w-4 rounded-full bg-yellow-500 opacity-60" />
                <span className="text-sm">Low Risk</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50">
                <Shield className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Police ({stationCount})</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50">
                <Cross className="h-4 w-4 text-rose-600" />
                <span className="text-sm">Hospital ({hospitalCount})</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50">
                <div className="h-1 w-6 rounded bg-emerald-500" />
                <span className="text-sm">Safest Route</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50">
                <div className="h-1 w-6 rounded bg-blue-500 border-dashed border-b-2 border-blue-500 bg-transparent" />
                <span className="text-sm">Fastest Route</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50">
                <div className="h-4 w-4 rounded-full bg-blue-600 border-2 border-white shadow" />
                <span className="text-sm">You</span>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export const LayersSheet = memo(LayersSheetInner);