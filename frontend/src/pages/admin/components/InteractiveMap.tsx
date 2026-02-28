import { useMemo, useEffect } from "react";
import { MapContainer, TileLayer, Circle, Marker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RiskZone, Tourist, Alert, PoliceDepartment } from "../types";

// ── Fix default marker icon ─────────────────────────────
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
L.Marker.prototype.options.icon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// ── Custom Icons ─────────────────────────────────────────
const PoliceIcon = L.divIcon({
  html: `<div style="background:#2563eb;padding:4px;border-radius:9999px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  </div>`,
  className: "",
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const PoliceInactiveIcon = L.divIcon({
  html: `<div style="background:#94a3b8;padding:4px;border-radius:9999px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.2);display:flex;align-items:center;justify-content:center">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  </div>`,
  className: "",
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const AlertIcon = L.divIcon({
  html: `<div style="position:relative">
    <div style="position:absolute;inset:-6px;background:rgba(239,68,68,.3);border-radius:9999px;animation:ping 1.5s cubic-bezier(0,0,.2,1) infinite"></div>
    <div style="background:#ef4444;padding:4px;border-radius:9999px;border:2px solid #fff;box-shadow:0 2px 8px rgba(239,68,68,.5);display:flex;align-items:center;justify-content:center;position:relative">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
    </div>
  </div>`,
  className: "",
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const TouristDot = (active: boolean) =>
  L.divIcon({
    html: `<div style="width:10px;height:10px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.3);background:${active ? "#3b82f6" : "#94a3b8"}"></div>`,
    className: "",
    iconSize: [10, 10],
    iconAnchor: [5, 5],
  });

const CrosshairIcon = L.divIcon({
  html: `<div style="background:#2563eb;padding:6px;border-radius:9999px;border:3px solid #fff;box-shadow:0 4px 12px rgba(37,99,235,.4);display:flex;align-items:center;justify-content:center">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M22 12h-4"/><path d="M6 12H2"/><path d="M12 6V2"/><path d="M12 22v-4"/></svg>
  </div>`,
  className: "",
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

// ── Zone severity colors ─────────────────────────────────
const severityColor: Record<string, { stroke: string; fill: string }> = {
  critical: { stroke: "#ef4444", fill: "#ef4444" },
  high: { stroke: "#f97316", fill: "#f97316" },
  medium: { stroke: "#f59e0b", fill: "#f59e0b" },
  low: { stroke: "#22c55e", fill: "#22c55e" },
};

// ── Map defaults ─────────────────────────────────────────
const CENTER: [number, number] = [26.1445, 91.7362];
const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

// ── Resize handler (fixes map inside flex containers) ────
function ResizeHandler() {
  const map = useMap();
  useEffect(() => {
    const obs = new ResizeObserver(() => map.invalidateSize());
    obs.observe(map.getContainer());
    return () => obs.disconnect();
  }, [map]);
  return null;
}

// ── Click handler for adding zones ───────────────────────
function ClickHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  const map = useMap();
  useEffect(() => {
    if (!onMapClick) return;
    const handler = (e: L.LeafletMouseEvent) => onMapClick(e.latlng.lat, e.latlng.lng);
    map.on("click", handler);
    return () => { map.off("click", handler); };
  }, [map, onMapClick]);
  return null;
}

// ── Props ────────────────────────────────────────────────
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

// ── Component ────────────────────────────────────────────
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
  showPolice = true,
  showTourists = true,
  showAlerts = true,
}: InteractiveMapProps) {
  const activeAlerts = useMemo(
    () => alerts.filter((a) => a.status === "ACTIVE" && a.location?.lat && a.location?.lng),
    [alerts]
  );

  const visibleTourists = useMemo(
    () => tourists.filter((t) => t.location?.lat && t.location?.lng).slice(0, 50),
    [tourists]
  );

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={CENTER}
        zoom={13}
        minZoom={8}
        maxZoom={18}
        scrollWheelZoom
        zoomControl={false}
        style={{ height: "100%", width: "100%" }}
        className="z-0 rounded-b-lg"
      >
        <ResizeHandler />
        <TileLayer attribution={TILE_ATTR} url={TILE_URL} />

        {/* Zone Add Click */}
        {isAddingZone && <ClickHandler onMapClick={onMapClick} />}

        {/* Risk Zones */}
        {zones.map((zone) => {
          const c = severityColor[zone.severity] || severityColor.medium;
          const isSelected = selectedZone?.id === zone.id;
          return (
            <Circle
              key={zone.id}
              center={[zone.center.lat, zone.center.lng]}
              radius={zone.radius}
              pathOptions={{
                color: c.stroke,
                fillColor: c.fill,
                fillOpacity: isSelected ? 0.25 : 0.12,
                weight: isSelected ? 3 : 2,
              }}
              eventHandlers={{ click: () => onZoneClick?.(zone) }}
            >
              <Tooltip direction="center" permanent={false}>
                <span className="text-xs font-medium">
                  {zone.name} · {zone.severity} severity
                  {zone.isActive ? "" : " (inactive)"}
                </span>
              </Tooltip>
            </Circle>
          );
        })}

        {/* Police Stations */}
        {showPolice &&
          policeUnits?.map((p) => (
            <Marker
              key={p.id}
              position={[p.location.lat, p.location.lng]}
              icon={p.isActive ? PoliceIcon : PoliceInactiveIcon}
            >
              <Tooltip>
                <span className="text-xs font-medium">
                  {p.name} — {p.isActive ? "On Duty" : "Off Duty"}
                </span>
              </Tooltip>
            </Marker>
          ))}

        {/* Tourists */}
        {showTourists &&
          visibleTourists.map((t) => (
            <Marker
              key={t.id}
              position={[t.location!.lat, t.location!.lng]}
              icon={TouristDot(t.isActive)}
            >
              <Tooltip>
                <span className="text-xs">{t.name}{t.isActive ? " (online)" : ""}</span>
              </Tooltip>
            </Marker>
          ))}

        {/* Active Alerts */}
        {showAlerts &&
          activeAlerts.map((a) => (
            <Marker
              key={a.id}
              position={[a.location!.lat, a.location!.lng]}
              icon={AlertIcon}
            >
              <Tooltip>
                <span className="text-xs font-medium text-red-600">
                  {a.type} — {a.touristName || "Unknown"}
                </span>
              </Tooltip>
            </Marker>
          ))}

        {/* New Zone Marker */}
        {newZonePosition && (
          <Marker
            position={[newZonePosition.lat, newZonePosition.lng]}
            icon={CrosshairIcon}
          >
            <Tooltip direction="top" permanent>
              <span className="text-xs font-medium">
                {newZonePosition.lat.toFixed(4)}, {newZonePosition.lng.toFixed(4)}
              </span>
            </Tooltip>
          </Marker>
        )}
      </MapContainer>

      {/* Add Zone Toggle */}
      {onAddZone && (
        <div className="absolute top-3 left-3 z-[1000]">
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

      {/* Map Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg p-3 text-xs space-y-2 shadow-lg border border-slate-200/60">
        <p className="font-semibold text-slate-700 mb-2">Legend</p>
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
            <div className="w-4 h-4 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <span className="text-slate-600">Police</span>
          </div>
        </div>
      </div>
    </div>
  );
}
