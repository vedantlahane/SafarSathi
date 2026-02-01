import { Plus, X, Layers, Maximize2, Shield, AlertTriangle, Crosshair } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RiskZone, Tourist, Alert, PoliceDepartment } from "../types";

interface InteractiveMapProps {
  zones: RiskZone[];
  tourists: Tourist[];
  alerts: Alert[];
  policeUnits?: PoliceDepartment[];
  onZoneClick?: (zone: RiskZone) => void;
  onAddZone?: () => void;
  selectedZone?: RiskZone | null;
  isAddingZone?: boolean;
  newZonePosition?: { lat: number; lng: number } | null;
  onMapClick?: (lat: number, lng: number) => void;
  showPolice?: boolean;
  showTourists?: boolean;
  showAlerts?: boolean;
}

const MAP_BOUNDS = { minLat: 25.5, maxLat: 27.0, minLng: 90.5, maxLng: 93.0 };
const MAP_CENTER = { lat: 26.1445, lng: 91.7362 };

const toPixel = (lat: number, lng: number) => {
  const x = ((lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) * 100;
  const y = ((MAP_BOUNDS.maxLat - lat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * 100;
  return { x, y };
};

const severityColors = {
  critical: "bg-red-500/25 border-red-500 shadow-red-500/30",
  high: "bg-orange-500/25 border-orange-500 shadow-orange-500/30",
  medium: "bg-amber-500/25 border-amber-500 shadow-amber-500/30",
  low: "bg-emerald-500/25 border-emerald-500 shadow-emerald-500/30",
};

export function InteractiveMap({
  zones,
  tourists,
  alerts,
  policeUnits,
  onZoneClick,
  onAddZone,
  selectedZone,
  isAddingZone,
  newZonePosition,
  onMapClick,
  showPolice,
  showTourists = true,
  showAlerts = true,
}: InteractiveMapProps) {
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddingZone || !onMapClick) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const lat = MAP_BOUNDS.maxLat - (y / rect.height) * (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat);
    const lng = MAP_BOUNDS.minLng + (x / rect.width) * (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng);
    onMapClick(lat, lng);
  };

  return (
    <div className="relative h-full w-full bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 overflow-hidden">
      {/* Grid Pattern */}
      <div className="absolute inset-0">
        <svg width="100%" height="100%" className="opacity-30">
          <defs>
            <pattern id="mapGrid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#cbd5e1" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mapGrid)" />
        </svg>
      </div>

      {/* Clickable Area */}
      <div
        className={`absolute inset-0 ${isAddingZone ? "cursor-crosshair" : ""}`}
        onClick={handleMapClick}
      >
        {/* Risk Zones */}
        {zones.map((zone) => {
          const pos = toPixel(zone.center.coordinates[1], zone.center.coordinates[0]);
          const color = severityColors[zone.severity as keyof typeof severityColors] || severityColors.medium;
          const isSelected = selectedZone?.id === zone.id;

          return (
            <div
              key={zone.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full border-2 ${color} cursor-pointer transition-all hover:scale-110 ${isSelected ? "ring-4 ring-blue-500/50 scale-110" : ""} shadow-lg`}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                width: `${Math.max(zone.radius / 40, 30)}px`,
                height: `${Math.max(zone.radius / 40, 30)}px`,
              }}
              onClick={(e) => { e.stopPropagation(); onZoneClick?.(zone); }}
              title={zone.name}
            >
              {isSelected && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[8px] font-bold text-slate-700">{zone.name.slice(0, 3)}</span>
                </div>
              )}
            </div>
          );
        })}

        {/* Police Stations */}
        {showPolice && policeUnits?.map((police, idx) => {
          const pos = toPixel(police.latitude || MAP_CENTER.lat, police.longitude || MAP_CENTER.lng);
          return (
            <div
              key={police.id || idx}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              title={police.name}
            >
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center shadow-md border-2 border-white ${police.isActive ? "bg-blue-600" : "bg-slate-400"}`}>
                <Shield className="w-3 h-3 text-white" />
              </div>
            </div>
          );
        })}

        {/* Tourists */}
        {showTourists && tourists.slice(0, 30).map((tourist, idx) => {
          const lat = tourist.lastLocation?.coordinates?.[1] || MAP_CENTER.lat + (Math.random() - 0.5) * 0.5;
          const lng = tourist.lastLocation?.coordinates?.[0] || MAP_CENTER.lng + (Math.random() - 0.5) * 0.5;
          const pos = toPixel(lat, lng);

          return (
            <div
              key={tourist.id || idx}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-150"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              title={tourist.name}
            >
              <div className={`w-2.5 h-2.5 rounded-full border-2 border-white shadow ${tourist.isActive ? "bg-blue-500" : "bg-slate-400"}`} />
            </div>
          );
        })}

        {/* Active Alerts */}
        {showAlerts && alerts.filter((a) => a.status === "ACTIVE").map((alert, idx) => {
          const lat = alert.location?.coordinates?.[1] || MAP_CENTER.lat + (Math.random() - 0.5) * 0.3;
          const lng = alert.location?.coordinates?.[0] || MAP_CENTER.lng + (Math.random() - 0.5) * 0.3;
          const pos = toPixel(lat, lng);

          return (
            <div
              key={alert.id || idx}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <AlertTriangle className="w-3 h-3 text-white" />
              </div>
              <div className="absolute inset-0 bg-red-500/30 rounded-full animate-ping" />
            </div>
          );
        })}

        {/* New Zone Marker */}
        {newZonePosition && (
          <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${toPixel(newZonePosition.lat, newZonePosition.lng).x}%`,
              top: `${toPixel(newZonePosition.lat, newZonePosition.lng).y}%`,
            }}
          >
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-xl border-4 border-white animate-bounce">
              <Crosshair className="w-5 h-5 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur rounded-lg p-3 text-xs space-y-2 shadow-lg border border-slate-200">
        <p className="font-semibold text-slate-700 mb-2">Map Legend</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/40 border-2 border-red-500" />
            <span className="text-slate-600">Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500/40 border-2 border-orange-500" />
            <span className="text-slate-600">High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-slate-600">Tourist</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-600 flex items-center justify-center">
              <Shield className="w-2 h-2 text-white" />
            </div>
            <span className="text-slate-600">Police</span>
          </div>
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute top-3 right-3 flex flex-col gap-1.5">
        <Button variant="secondary" size="sm" className="h-8 w-8 p-0 bg-white shadow-md border">
          <Plus className="h-4 w-4" />
        </Button>
        <Button variant="secondary" size="sm" className="h-8 w-8 p-0 bg-white shadow-md border">
          <span className="text-lg leading-none">−</span>
        </Button>
        <Button variant="secondary" size="sm" className="h-8 w-8 p-0 bg-white shadow-md border">
          <Layers className="h-4 w-4" />
        </Button>
        <Button variant="secondary" size="sm" className="h-8 w-8 p-0 bg-white shadow-md border">
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Add Zone Toggle */}
      {onAddZone && (
        <div className="absolute top-3 left-3">
          <Button
            size="sm"
            onClick={onAddZone}
            className={`shadow-lg ${isAddingZone ? "bg-red-500 hover:bg-red-600" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {isAddingZone ? (
              <><X className="h-4 w-4 mr-1.5" /> Cancel</>
            ) : (
              <><Plus className="h-4 w-4 mr-1.5" /> Add Zone</>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
