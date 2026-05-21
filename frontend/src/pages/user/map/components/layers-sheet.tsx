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
  Sun,
  Moon,
  Sunset,
  Sunrise
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
  mapboxConfig,
  setMapboxConfig,
}: LayersSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-[2.5rem] h-auto max-h-[85vh] pb-8 bg-white/90 dark:bg-black/80 backdrop-blur-3xl backdrop-saturate-200 border-white/20 dark:border-white/10 shadow-2xl"
      >
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
        <SheetHeader className="mt-4 px-2">
          <SheetTitle className="flex items-center gap-2.5 text-xl">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 text-primary">
              <Layers className="h-5 w-5" />
            </div>
            Map Preferences
          </SheetTitle>
          <SheetDescription className="text-sm font-medium">
            Fine-tune layers, routing, and map aesthetics
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6 pb-4 overflow-y-auto max-h-[calc(85vh-120px)] px-2 custom-scrollbar">
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

          {/* Risk Level Filter (Chips) */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider">
              RISK FILTER
            </p>
            <div className="flex flex-wrap gap-2">
              {(["all", "critical", "high", "medium", "low"] as const).map((level) => (
                <Button
                  key={level}
                  variant={riskFilter === level ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "rounded-full capitalize h-8 px-4 font-semibold transition-all border-0 shadow-sm whitespace-nowrap",
                    riskFilter !== level && "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700",
                    riskFilter === level && level === "critical" && "bg-purple-600 text-white shadow-purple-500/30",
                    riskFilter === level && level === "high" && "bg-red-500 text-white shadow-red-500/30",
                    riskFilter === level && level === "medium" && "bg-amber-500 text-white shadow-amber-500/30",
                    riskFilter === level && level === "low" && "bg-yellow-500 text-white shadow-yellow-500/30",
                    riskFilter === level && level === "all" && "bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 shadow-slate-500/30"
                  )}
                  onClick={() => {
                    hapticFeedback("light");
                    setRiskFilter(level);
                  }}
                >
                  {level === "all" ? `All Zones` : `${level}`}
                </Button>
              ))}
            </div>
          </div>

          <Separator className="bg-slate-200/50 dark:bg-slate-800/50" />

          {/* Interactive Layers (Switches) */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider">
              DISPLAY LAYERS
            </p>
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-200/50 dark:border-white/5 divide-y divide-slate-200/50 dark:divide-white/5">
              
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Safety Zones</p>
                    <p className="text-[10px] text-slate-500">Show {zoneCount} analyzed areas</p>
                  </div>
                </div>
                <Switch 
                  checked={showLayers.zones} 
                  onCheckedChange={(v) => { hapticFeedback("light"); setShowLayers((l) => ({ ...l, zones: v })); }} 
                />
              </div>

              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Police Stations</p>
                    <p className="text-[10px] text-slate-500">{stationCount} nearby stations</p>
                  </div>
                </div>
                <Switch 
                  checked={showLayers.police} 
                  onCheckedChange={(v) => { hapticFeedback("light"); setShowLayers((l) => ({ ...l, police: v })); }} 
                />
              </div>

              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                    <Cross className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Hospitals</p>
                    <p className="text-[10px] text-slate-500">{hospitalCount} medical centers</p>
                  </div>
                </div>
                <Switch 
                  checked={showLayers.hospitals} 
                  onCheckedChange={(v) => { hapticFeedback("light"); setShowLayers((l) => ({ ...l, hospitals: v })); }} 
                />
              </div>

              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <Compass className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Tourist Spots</p>
                    <p className="text-[10px] text-slate-500">{poiCount} verified locations</p>
                  </div>
                </div>
                <Switch 
                  checked={showLayers.pois} 
                  onCheckedChange={(v) => { hapticFeedback("light"); setShowLayers((l) => ({ ...l, pois: v })); }} 
                />
              </div>

              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <MapIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Safe Routing</p>
                    <p className="text-[10px] text-slate-500">Overlay analyzed paths</p>
                  </div>
                </div>
                <Switch 
                  checked={showLayers.routes} 
                  onCheckedChange={(v) => { hapticFeedback("light"); setShowLayers((l) => ({ ...l, routes: v })); }} 
                />
              </div>

            </div>
          </div>

          <Separator className="bg-slate-200/50 dark:bg-slate-800/50" />

          {/* Map Aesthetics (Switches) */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider">
              MAP ENGINE
            </p>
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-200/50 dark:border-white/5 divide-y divide-slate-200/50 dark:divide-white/5">
              
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300">
                    <Building className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">3D Buildings</p>
                </div>
                <Switch 
                  checked={mapboxConfig.show3dBuildings} 
                  onCheckedChange={(v) => { hapticFeedback("light"); setMapboxConfig((c) => ({ ...c, show3dBuildings: v })); }} 
                />
              </div>

              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300">
                    <Landmark className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Mapbox POI Labels</p>
                </div>
                <Switch 
                  checked={mapboxConfig.showPointOfInterestLabels} 
                  onCheckedChange={(v) => { hapticFeedback("light"); setMapboxConfig((c) => ({ ...c, showPointOfInterestLabels: v })); }} 
                />
              </div>

              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300">
                    <Bus className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Transit Labels</p>
                </div>
                <Switch 
                  checked={mapboxConfig.showTransitLabels} 
                  onCheckedChange={(v) => { hapticFeedback("light"); setMapboxConfig((c) => ({ ...c, showTransitLabels: v })); }} 
                />
              </div>

            </div>
          </div>

          <Separator className="bg-slate-200/50 dark:bg-slate-800/50" />

          {/* Lighting Presets */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider">
              LIGHTING PRESET
            </p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "dawn", icon: Sunrise, label: "Dawn" },
                { id: "day", icon: Sun, label: "Day" },
                { id: "dusk", icon: Sunset, label: "Dusk" },
                { id: "night", icon: Moon, label: "Night" }
              ].map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => {
                    hapticFeedback("light");
                    setMapboxConfig((c) => ({ ...c, lightPreset: id as any }));
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center py-3 rounded-2xl gap-1 transition-all border",
                    mapboxConfig.lightPreset === id 
                      ? "bg-primary/10 border-primary/20 text-primary shadow-sm" 
                      : "bg-slate-50 dark:bg-slate-900/50 border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[10px] font-bold">{label}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </SheetContent>
    </Sheet>
  );
}

export const LayersSheet = memo(LayersSheetInner);