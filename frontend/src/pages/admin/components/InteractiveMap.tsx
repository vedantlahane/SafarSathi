import { useMemo, useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Circle, Marker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Plus, X, Layers, ZoomIn, ZoomOut, Locate, Eye, EyeOff,
  Shield, User, AlertTriangle, MapPin,
} from "lucide-react";
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

// ── Zoom Controls ────────────────────────────────────────
function ZoomControls() {
  const map = useMap();
  return (
    <div className="absolute top-3 right-3 z-1000 flex flex-col gap-1">
      <button
        onClick={() => map.zoomIn()}
        className="glass-elevated w-8 h-8 flex items-center justify-center rounded-xl border border-white/40 hover:bg-white/70 transition-all shadow-sm"
        title="Zoom in"
      >
        <ZoomIn className="w-3.5 h-3.5 text-slate-700" />
      </button>
      <button
        onClick={() => map.zoomOut()}
        className="glass-elevated w-8 h-8 flex items-center justify-center rounded-xl border border-white/40 hover:bg-white/70 transition-all shadow-sm"
        title="Zoom out"
      >
        <ZoomOut className="w-3.5 h-3.5 text-slate-700" />
      </button>
      <button
        onClick={() => map.setView(CENTER, 13)}
        className="glass-elevated w-8 h-8 flex items-center justify-center rounded-xl border border-white/40 hover:bg-white/70 transition-all shadow-sm mt-1"
        title="Reset view"
      >
        <Locate className="w-3.5 h-3.5 text-slate-700" />
      </button>
    </div>
  );
}

// ── FitBounds helper ─────────────────────────────────────
function FitBoundsOnData({ zones, tourists, alerts, policeUnits }: { zones: RiskZone[]; tourists: Tourist[]; alerts: Alert[]; policeUnits?: PoliceDepartment[] }) {
  const map = useMap();
  useEffect(() => {
    const points: [number, number][] = [];
    zones.forEach(z => points.push([z.center.lat, z.center.lng]));
    tourists.filter(t => t.location).forEach(t => points.push([t.location!.lat, t.location!.lng]));
    alerts.filter(a => a.location).forEach(a => points.push([a.location!.lat, a.location!.lng]));
    policeUnits?.forEach(p => points.push([p.location.lat, p.location.lng]));
    if (points.length >= 2) {
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 15 });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only on mount
  return null;
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
  showPolice: initialShowPolice = true,
  showTourists: initialShowTourists = true,
  showAlerts: initialShowAlerts = true,
}: InteractiveMapProps) {
  const [layerToggles, setLayerToggles] = useState({
    zones: true,
    police: initialShowPolice,
    tourists: initialShowTourists,
    alerts: initialShowAlerts,
  });
  const [showLayerPanel, setShowLayerPanel] = useState(false);

  const toggleLayer = useCallback((layer: keyof typeof layerToggles) => {
    setLayerToggles(prev => ({ ...prev, [layer]: !prev[layer] }));
  }, []);

  const activeAlerts = useMemo(
    () => alerts.filter((a) => a.status === "ACTIVE" && a.location?.lat && a.location?.lng),
    [alerts]
  );

  const visibleTourists = useMemo(
    () => tourists.filter((t) => t.location?.lat && t.location?.lng).slice(0, 50),
    [tourists]
  );

  const mapStats = useMemo(() => ({
    zones: zones.filter(z => z.isActive).length,
    tourists: visibleTourists.filter(t => t.isActive).length,
    alerts: activeAlerts.length,
    police: policeUnits?.filter(p => p.isActive).length ?? 0,
  }), [zones, visibleTourists, activeAlerts, policeUnits]);

  return (
    <div className="relative h-full w-full group">
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
        <FitBoundsOnData zones={zones} tourists={tourists} alerts={alerts} policeUnits={policeUnits} />

        {/* Zone Add Click */}
        {isAddingZone && <ClickHandler onMapClick={onMapClick} />}

        {/* Risk Zones */}
        {layerToggles.zones && zones.map((zone) => {
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
                weight: isSelected ? 3 : 1.5,
                dashArray: zone.isActive ? undefined : "6 4",
              }}
              eventHandlers={{ click: () => onZoneClick?.(zone) }}
            >
              <Tooltip direction="center" permanent={false}>
                <div className="text-center">
                  <p className="text-xs font-semibold">{zone.name}</p>
                  <p className="text-[10px] text-slate-500">{zone.severity} severity · {zone.radius}m radius</p>
                  {!zone.isActive && <p className="text-[10px] text-amber-600 font-medium">Inactive</p>}
                </div>
              </Tooltip>
            </Circle>
          );
        })}

        {/* Police Stations */}
        {layerToggles.police &&
          policeUnits?.map((p) => (
            <Marker
              key={p.id}
              position={[p.location.lat, p.location.lng]}
              icon={p.isActive ? PoliceIcon : PoliceInactiveIcon}
            >
              <Tooltip>
                <div>
                  <p className="text-xs font-semibold">{p.name}</p>
                  <p className="text-[10px] text-slate-500">
                    {p.isActive ? "🟢 On Duty" : "⚫ Off Duty"}
                    {p.officerCount ? ` · ${p.officerCount} officers` : ""}
                  </p>
                  {p.jurisdictionRadiusKm && <p className="text-[10px] text-slate-400">{p.jurisdictionRadiusKm}km jurisdiction</p>}
                </div>
              </Tooltip>
            </Marker>
          ))}

        {/* Tourists */}
        {layerToggles.tourists &&
          visibleTourists.map((t) => (
            <Marker
              key={t.id}
              position={[t.location!.lat, t.location!.lng]}
              icon={TouristDot(t.isActive)}
            >
              <Tooltip>
                <div>
                  <p className="text-xs font-medium">{t.name}</p>
                  <p className="text-[10px] text-slate-500">
                    {t.isActive ? "Online" : "Offline"} · Risk: {t.riskLevel}
                  </p>
                </div>
              </Tooltip>
            </Marker>
          ))}

        {/* Active Alerts */}
        {layerToggles.alerts &&
          activeAlerts.map((a) => (
            <Marker
              key={a.id}
              position={[a.location!.lat, a.location!.lng]}
              icon={AlertIcon}
            >
              <Tooltip>
                <div>
                  <p className="text-xs font-semibold text-red-600">{a.type.replaceAll("_", " ")}</p>
                  <p className="text-[10px] text-slate-500">{a.touristName || "Unknown tourist"}</p>
                  {a.assignedUnit && <p className="text-[10px] text-blue-600">Assigned: {a.assignedUnit}</p>}
                </div>
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

        {/* Map-level zoom controls */}
        <ZoomControls />
      </MapContainer>

      {/* ── Live Stats Overlay (top-left) ─────────────────── */}
      <div className="absolute top-3 left-3 z-1000 flex flex-col gap-1.5">
        {/* Add Zone Toggle */}
        {onAddZone && (
          <Button
            size="sm"
            onClick={onAddZone}
            className={`shadow-lg h-8 text-xs ${isAddingZone ? "bg-red-500 hover:bg-red-600" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {isAddingZone ? (
              <><X className="h-3.5 w-3.5 mr-1" /> Cancel</>
            ) : (
              <><Plus className="h-3.5 w-3.5 mr-1" /> Add Zone</>
            )}
          </Button>
        )}

        {/* Live counters */}
        <div className="glass-elevated rounded-xl border border-white/40 p-2 shadow-lg">
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-semibold text-slate-700">{mapStats.alerts} Alert{mapStats.alerts !== 1 ? "s" : ""}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-[10px] font-semibold text-slate-700">{mapStats.tourists} Online</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span className="text-[10px] font-semibold text-slate-700">{mapStats.zones} Zone{mapStats.zones !== 1 ? "s" : ""}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-semibold text-slate-700">{mapStats.police} On Duty</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Layer Toggle Panel (bottom-right) ─────────────── */}
      <div className="absolute bottom-3 right-3 z-1000">
        <div className="flex flex-col items-end gap-1.5">
          {showLayerPanel && (
            <div className="glass-elevated rounded-xl border border-white/40 p-2.5 shadow-lg animate-in scale-in space-y-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Map Layers</p>
              {([
                { key: "zones" as const, label: "Risk Zones", icon: MapPin, color: "text-purple-600" },
                { key: "police" as const, label: "Police", icon: Shield, color: "text-blue-600" },
                { key: "tourists" as const, label: "Tourists", icon: User, color: "text-cyan-600" },
                { key: "alerts" as const, label: "Alerts", icon: AlertTriangle, color: "text-red-600" },
              ]).map(({ key, label, icon: Icon, color }) => (
                <button
                  key={key}
                  onClick={() => toggleLayer(key)}
                  className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                    layerToggles[key]
                      ? "bg-white/50 text-slate-800"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {layerToggles[key] ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  <Icon className={`w-3 h-3 ${layerToggles[key] ? color : "text-slate-400"}`} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          )}
          <button
            onClick={() => setShowLayerPanel(prev => !prev)}
            className={`glass-elevated w-8 h-8 flex items-center justify-center rounded-xl border border-white/40 hover:bg-white/70 transition-all shadow-sm ${showLayerPanel ? "bg-white/60" : ""}`}
            title="Toggle layers"
          >
            <Layers className="w-3.5 h-3.5 text-slate-700" />
          </button>
        </div>
      </div>

      {/* ── Map Legend (bottom-left) ───────────────────────── */}
      <div className="absolute bottom-3 left-3 z-1000 glass-elevated rounded-xl p-2.5 shadow-lg border border-white/40">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Legend</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full border-2 border-red-500 bg-red-500/30" />
            <span className="text-[10px] text-slate-600">Critical</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full border-2 border-orange-500 bg-orange-500/30" />
            <span className="text-[10px] text-slate-600">High</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full border-2 border-amber-500 bg-amber-500/30" />
            <span className="text-[10px] text-slate-600">Medium</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full border-2 border-emerald-500 bg-emerald-500/30" />
            <span className="text-[10px] text-slate-600">Low</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-[10px] text-slate-600">Tourist</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-blue-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <span className="text-[10px] text-slate-600">Police</span>
          </div>
        </div>
      </div>
    </div>
  );
}
