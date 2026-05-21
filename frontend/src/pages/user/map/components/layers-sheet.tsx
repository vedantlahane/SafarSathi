import { memo } from "react";
import {
  Layers,
  AlertCircle,
  AlertTriangle,
  Shield,
  Cross,
  Map as MapIcon,
  Compass,
  Building,
  Landmark,
  Bus,
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
import type { RiskFilter, LayerVisibility, MapboxConfig } from "../types";

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
  poiCount: number;
  isDarkMode: boolean;
  mapboxConfig: MapboxConfig;
  setMapboxConfig: React.Dispatch<React.SetStateAction<MapboxConfig>>;
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
  poiCount,
  isDarkMode: _isDarkMode, // keeping in props for ABI compat if it's used elsewhere, but unused here
  mapboxConfig,
  setMapboxConfig,
}: LayersSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-[2.5rem] h-auto max-h-[80vh] pb-8 bg-white/80 dark:bg-black/60 backdrop-blur-3xl backdrop-saturate-200 border-white/20 dark:border-white/10 shadow-2xl"
      >
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
        <SheetHeader className="mt-4">
          <SheetTitle className="flex items-center gap-2.5 text-xl">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 text-primary">
              <Layers className="h-5 w-5" />
            </div>
            Map Layers & Filters
          </SheetTitle>
          <SheetDescription className="text-sm font-medium">
            Customize what you see on the map
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6 pb-4 overflow-y-auto max-h-[calc(80vh-120px)] px-1 custom-scrollbar">
          {/* Zone Warning */}
          {userInZone && (
            <div className="flex items-start gap-4 p-4 rounded-3xl bg-red-500/10 border border-red-500/20 shadow-inner">
              <div className="p-2 bg-red-500/20 rounded-xl shrink-0 mt-0.5">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="font-bold text-red-900 dark:text-red-200">
                  You're in a Risk Zone
                </p>
                <p className="text-xs text-red-700 dark:text-red-400 mt-1 font-medium">
                  {zoneName
                    ? `Currently in: ${zoneName}`
                    : "Stay alert and keep emergency contacts ready."}
                </p>
              </div>
            </div>
          )}

          {/* Risk Level Filter */}
          <div className="bg-white/50 dark:bg-white/5 rounded-3xl p-4 border border-slate-200/50 dark:border-white/5">
            <p className="text-sm font-bold mb-3 text-slate-800 dark:text-slate-200 tracking-wide">
              RISK LEVEL FILTER
            </p>
            <div className="flex flex-wrap gap-2">
              {(["all", "critical", "high", "medium", "low"] as const).map((level) => (
                <Button
                  key={level}
                  variant={riskFilter === level ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "rounded-2xl capitalize h-auto py-2 px-4 font-semibold transition-all border-0 shadow-sm whitespace-nowrap",
                    riskFilter !== level && "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700",
                    riskFilter === level && level === "critical" && "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/30 shadow-lg",
                    riskFilter === level && level === "high" && "bg-red-500 hover:bg-red-600 text-white shadow-red-500/30 shadow-lg",
                    riskFilter === level && level === "medium" && "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/30 shadow-lg",
                    riskFilter === level && level === "low" && "bg-yellow-500 hover:bg-yellow-600 text-white shadow-yellow-500/30 shadow-lg",
                    riskFilter === level && level === "all" && "bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 shadow-slate-500/30 shadow-lg"
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

          {/* Layer Toggles */}
          <div className="bg-white/50 dark:bg-white/5 rounded-3xl p-4 border border-slate-200/50 dark:border-white/5">
            <p className="text-sm font-bold mb-3 text-slate-800 dark:text-slate-200 tracking-wide">
              SHOW ON MAP
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={showLayers.zones ? "default" : "outline"}
                className={cn(
                  "h-auto py-3 rounded-2xl gap-2 flex-col text-xs font-bold transition-all duration-300 border-0 shadow-sm",
                  showLayers.zones ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/30 shadow-lg scale-100" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:scale-[1.02]"
                )}
                onClick={() => {
                  hapticFeedback("light");
                  setShowLayers((l) => ({ ...l, zones: !l.zones }));
                }}
              >
                <AlertTriangle className="h-5 w-5" />
                Zones ({zoneCount})
              </Button>
              <Button
                variant={showLayers.police ? "default" : "outline"}
                className={cn(
                  "h-auto py-3 rounded-2xl gap-2 flex-col text-xs font-bold transition-all duration-300 border-0 shadow-sm",
                  showLayers.police ? "bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/30 shadow-lg scale-100" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:scale-[1.02]"
                )}
                onClick={() => {
                  hapticFeedback("light");
                  setShowLayers((l) => ({ ...l, police: !l.police }));
                }}
              >
                <Shield className="h-5 w-5" />
                Police ({stationCount})
              </Button>
              <Button
                variant={showLayers.hospitals ? "default" : "outline"}
                className={cn(
                  "h-auto py-3 rounded-2xl gap-2 flex-col text-xs font-bold transition-all duration-300 border-0 shadow-sm",
                  showLayers.hospitals ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30 shadow-lg scale-100" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:scale-[1.02]"
                )}
                onClick={() => {
                  hapticFeedback("light");
                  setShowLayers((l) => ({ ...l, hospitals: !l.hospitals }));
                }}
              >
                <Cross className="h-5 w-5" />
                Hospitals ({hospitalCount})
              </Button>
              <Button
                variant={showLayers.pois ? "default" : "outline"}
                className={cn(
                  "h-auto py-3 rounded-2xl gap-2 flex-col text-xs font-bold transition-all duration-300 border-0 shadow-sm",
                  showLayers.pois ? "bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-500/30 shadow-lg scale-100" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:scale-[1.02]"
                )}
                onClick={() => {
                  hapticFeedback("light");
                  setShowLayers((l) => ({ ...l, pois: !l.pois }));
                }}
              >
                <Compass className="h-5 w-5" />
                Spots ({poiCount})
              </Button>
            </div>
          </div>

          {/* Route Visibility */}
          <div className="bg-white/50 dark:bg-white/5 rounded-3xl p-4 border border-slate-200/50 dark:border-white/5">
            <p className="text-sm font-bold mb-3 text-slate-800 dark:text-slate-200 tracking-wide">
              ROUTE DISPLAY
            </p>
            <Button
              variant={showLayers.routes ? "default" : "outline"}
              className={cn(
                "w-full h-auto py-4 rounded-2xl gap-2 font-bold text-sm transition-all shadow-sm border-0 whitespace-normal",
                showLayers.routes ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/30 shadow-lg" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
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

          <Separator className="bg-slate-200 dark:bg-slate-800/50" />

          {/* Mapbox Native Config */}
          <div>
            <p className="text-sm font-bold mb-3 text-slate-800 dark:text-slate-200 tracking-wide px-1">
              MAP CONFIGURATION
            </p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Button
                variant={mapboxConfig.show3dBuildings ? "default" : "outline"}
                className={cn(
                  "h-auto py-3 rounded-2xl gap-2 flex-col text-xs font-bold transition-all border-0 shadow-sm",
                  mapboxConfig.show3dBuildings ? "bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 shadow-lg" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                )}
                onClick={() => {
                  hapticFeedback("light");
                  setMapboxConfig((c) => ({ ...c, show3dBuildings: !c.show3dBuildings }));
                }}
              >
                <Building className="h-5 w-5" />
                3D Buildings
              </Button>
              <Button
                variant={mapboxConfig.showPointOfInterestLabels ? "default" : "outline"}
                className={cn(
                  "h-auto py-3 rounded-2xl gap-2 flex-col text-xs font-bold transition-all border-0 shadow-sm",
                  mapboxConfig.showPointOfInterestLabels ? "bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 shadow-lg" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                )}
                onClick={() => {
                  hapticFeedback("light");
                  setMapboxConfig((c) => ({ ...c, showPointOfInterestLabels: !c.showPointOfInterestLabels }));
                }}
              >
                <Landmark className="h-5 w-5" />
                POIs
              </Button>
              <Button
                variant={mapboxConfig.showTransitLabels ? "default" : "outline"}
                className={cn(
                  "h-auto py-3 rounded-2xl gap-2 flex-col text-xs font-bold transition-all border-0 shadow-sm",
                  mapboxConfig.showTransitLabels ? "bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 shadow-lg" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                )}
                onClick={() => {
                  hapticFeedback("light");
                  setMapboxConfig((c) => ({ ...c, showTransitLabels: !c.showTransitLabels }));
                }}
              >
                <Bus className="h-5 w-5" />
                Transit Labels
              </Button>
            </div>
            
            <p className="text-sm font-bold mb-3 text-slate-800 dark:text-slate-200 tracking-wide px-1">
              LIGHTING PRESET
            </p>
            <div className="flex gap-2 p-2 bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 overflow-x-auto custom-scrollbar">
              {(["dawn", "day", "dusk", "night"] as const).map((preset) => (
                <Button
                  key={preset}
                  variant={mapboxConfig.lightPreset === preset ? "default" : "ghost"}
                  className={cn(
                    "rounded-xl capitalize flex-1 shadow-none font-bold text-xs h-auto py-2.5",
                    mapboxConfig.lightPreset === preset 
                      ? "bg-white dark:bg-slate-700 text-primary shadow-sm" 
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                  )}
                  onClick={() => {
                    hapticFeedback("light");
                    setMapboxConfig((c) => ({ ...c, lightPreset: preset }));
                  }}
                >
                  {preset}
                </Button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div>
            <p className="text-sm font-bold mb-3 text-slate-800 dark:text-slate-200 tracking-wide px-1">LEGEND</p>
            <div className="grid grid-cols-2 gap-3 pb-2">
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-100/50 dark:bg-slate-800/50">
                <div className="h-4 w-4 rounded-full bg-purple-600 opacity-80 ring-2 ring-purple-400/50 ring-offset-1 ring-offset-transparent shadow-sm" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Critical Risk</span>
              </div>
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-100/50 dark:bg-slate-800/50">
                <div className="h-4 w-4 rounded-full bg-red-500 opacity-80 shadow-sm" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">High Risk</span>
              </div>
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-100/50 dark:bg-slate-800/50">
                <div className="h-4 w-4 rounded-full bg-amber-500 opacity-80 shadow-sm" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Medium Risk</span>
              </div>
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-100/50 dark:bg-slate-800/50">
                <div className="h-4 w-4 rounded-full bg-yellow-500 opacity-80 shadow-sm" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Low Risk</span>
              </div>
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-100/50 dark:bg-slate-800/50">
                <Shield className="h-4 w-4 text-blue-600 drop-shadow-sm" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Police ({stationCount})</span>
              </div>
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-100/50 dark:bg-slate-800/50">
                <Cross className="h-4 w-4 text-rose-600 drop-shadow-sm" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Hospital ({hospitalCount})</span>
              </div>
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-100/50 dark:bg-slate-800/50">
                <Compass className="h-4 w-4 text-indigo-600 drop-shadow-sm" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Spot ({poiCount})</span>
              </div>
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-100/50 dark:bg-slate-800/50">
                <div className="h-1.5 w-6 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/20" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Safest Route</span>
              </div>
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-100/50 dark:bg-slate-800/50 col-span-2">
                <div className="h-4 w-4 rounded-full bg-blue-600 border-2 border-white shadow shadow-blue-500/30" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">You</span>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export const LayersSheet = memo(LayersSheetInner);