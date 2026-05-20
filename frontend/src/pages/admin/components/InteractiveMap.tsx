import { useMemo, useEffect, useRef, useState, useCallback } from "react";
import Map, { Source, Layer, Marker, NavigationControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import type { MapRef, MapMouseEvent } from "react-map-gl/mapbox";
import {
  Plus, X, Layers, Eye, EyeOff,
  Shield, User, AlertTriangle, MapPin, Pentagon, Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RiskZone, Tourist, Alert, PoliceDepartment } from "../types";
import { createCirclePolygon } from "@/lib/geo";

// ── Map defaults (Punjab-centred, same as user map) ────────
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string;
const INITIAL_VIEW = { longitude: 75.7048, latitude: 31.2554, zoom: 10 };
const MAX_BOUNDS: [[number, number], [number, number]] = [[73.5, 29.3], [77.0, 32.5]];

// ── Severity colour palette ─────────────────────────────────
const SEVERITY_COLORS: Record<string, { fill: string; stroke: string }> = {
  critical: { fill: "#ef4444", stroke: "#b91c1c" },
  high:     { fill: "#f97316", stroke: "#c2410c" },
  medium:   { fill: "#f59e0b", stroke: "#b45309" },
  low:      { fill: "#22c55e", stroke: "#15803d" },
};

// ── Props ───────────────────────────────────────────────────
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
  // Polygon drawing mode
  drawMode?: "circle" | "polygon";
  onDrawModeChange?: (mode: "circle" | "polygon") => void;
  polygonVertices?: [number, number][];
  onPolygonVertexAdd?: (lat: number, lng: number) => void;
  onPolygonComplete?: () => void;
  onPolygonUndo?: () => void;
}

// ── Build zone GeoJSON (same logic as user-side ZoneOverlay) ─
function buildZoneGeoJSON(zones: RiskZone[], selectedId?: number | string | null) {
  const features: GeoJSON.Feature[] = [];

  zones.forEach((zone) => {
    const c = SEVERITY_COLORS[zone.severity] ?? SEVERITY_COLORS.medium;
    const isSelected = selectedId != null && zone.id === selectedId;
    const level = zone.severity?.toLowerCase();
    const isCritical = level === "critical";

    let coordinates: [number, number][][];
    if (zone.shape === "polygon" && zone.polygonCoordinates && zone.polygonCoordinates.length >= 3) {
      // polygonCoordinates are stored as [lat, lng]; Mapbox needs [lng, lat]
      coordinates = [zone.polygonCoordinates.map(([lat, lng]) => [lng, lat] as [number, number])];
    } else {
      coordinates = [createCirclePolygon({ lat: zone.center.lat, lon: zone.center.lng }, zone.radius)];
    }

    const height = isCritical ? 200 : level === "high" ? 120 : level === "medium" ? 60 : 25;

    features.push({
      type: "Feature",
      properties: {
        id: zone.id,
        fillColor: c.fill,
        strokeColor: c.stroke,
        height,
        opacity: zone.isActive ? (isSelected ? 0.55 : 0.32) : 0.14,
        strokeWidth: isSelected ? 3 : isCritical ? 2.5 : 2,
        name: zone.name,
        severity: zone.severity,
        isActive: zone.isActive,
        radius: zone.radius,
      },
      geometry: { type: "Polygon", coordinates },
    });
  });

  return { type: "FeatureCollection" as const, features };
}

// ── Build polygon-drawing preview GeoJSON ───────────────────
function buildDrawingGeoJSON(vertices: [number, number][]) {
  if (vertices.length < 2) return null;
  // vertices are [lat, lng]; Mapbox needs [lng, lat]
  const coords = vertices.map(([lat, lng]) => [lng, lat] as [number, number]);
  return {
    type: "FeatureCollection" as const,
    features: [
      {
        type: "Feature" as const,
        properties: {},
        geometry: {
          type: "LineString" as const,
          coordinates: [...coords, coords[0]], // close visually
        },
      },
      ...(vertices.length >= 3
        ? [{
            type: "Feature" as const,
            properties: {},
            geometry: {
              type: "Polygon" as const,
              coordinates: [[...coords, coords[0]]],
            },
          }]
        : []),
    ],
  };
}

// ── Component ───────────────────────────────────────────────
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
  drawMode = "circle",
  onDrawModeChange,
  polygonVertices = [],
  onPolygonVertexAdd,
  onPolygonComplete,
  onPolygonUndo,
}: InteractiveMapProps) {
  const mapRef = useRef<MapRef>(null);

  const [layerToggles, setLayerToggles] = useState({
    zones: true,
    police: initialShowPolice,
    tourists: initialShowTourists,
    alerts: initialShowAlerts,
  });
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [cursor, setCursor] = useState<string>("grab");

  const toggleLayer = useCallback((layer: keyof typeof layerToggles) => {
    setLayerToggles((prev) => ({ ...prev, [layer]: !prev[layer] }));
  }, []);

  // Derived data
  const activeAlerts = useMemo(
    () => alerts.filter((a) => ["ACTIVE", "OPEN"].includes(a.status) && a.location?.lat != null && a.location?.lng != null),
    [alerts]
  );
  const visibleTourists = useMemo(
    () => tourists.filter((t) => t.location?.lat != null && t.location?.lng != null).slice(0, 80),
    [tourists]
  );
  const mapStats = useMemo(() => ({
    zones: zones.filter((z) => z.isActive).length,
    tourists: visibleTourists.filter((t) => t.isActive).length,
    alerts: activeAlerts.length,
    police: policeUnits?.filter((p) => p.isActive).length ?? 0,
  }), [zones, visibleTourists, activeAlerts, policeUnits]);

  // GeoJSON memos
  const zoneGeoJSON = useMemo(() => buildZoneGeoJSON(zones, selectedZone?.id), [zones, selectedZone]);
  const drawingGeoJSON = useMemo(() => buildDrawingGeoJSON(polygonVertices), [polygonVertices]);

  // Auto-fit bounds when data arrives (once)
  const didFit = useRef(false);
  useEffect(() => {
    if (didFit.current) return;
    const points: [number, number][] = [];
    zones.forEach((z) => {
      if (z.shape === "polygon" && z.polygonCoordinates?.length) {
        z.polygonCoordinates.forEach(([lat, lng]) => points.push([lng, lat]));
      } else {
        points.push([z.center.lng, z.center.lat]);
      }
    });
    visibleTourists.forEach((t) => points.push([t.location!.lng, t.location!.lat]));
    activeAlerts.forEach((a) => points.push([a.location!.lng, a.location!.lat]));
    policeUnits?.forEach((p) => points.push([p.location.lng, p.location.lat]));

    if (points.length >= 2) {
      const lngs = points.map((p) => p[0]);
      const lats = points.map((p) => p[1]);
      const bounds: [[number, number], [number, number]] = [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ];
      setTimeout(() => {
        mapRef.current?.fitBounds(bounds, { padding: 60, maxZoom: 14 });
        didFit.current = true;
      }, 300);
    }
  }, [zones, visibleTourists, activeAlerts, policeUnits]);

  // Map click handler
  const handleMapClick = useCallback((e: MapMouseEvent) => {
    if (!isAddingZone) return;
    const { lat, lng } = e.lngLat;
    if (drawMode === "polygon" && onPolygonVertexAdd) {
      onPolygonVertexAdd(lat, lng);
    } else if (drawMode === "circle" && onMapClick) {
      onMapClick(lat, lng);
    }
  }, [isAddingZone, drawMode, onPolygonVertexAdd, onMapClick]);

  // Zone click via layer interaction
  const handleLayerClick = useCallback((e: MapMouseEvent) => {
    const feature = e.features?.[0];
    if (!feature || !onZoneClick) return;
    const zoneId = feature.properties?.id;
    const zone = zones.find((z) => String(z.id) === String(zoneId));
    if (zone) onZoneClick(zone);
  }, [zones, onZoneClick]);

  return (
    <div className="relative h-full w-full">
      <Map
        ref={mapRef}
        initialViewState={INITIAL_VIEW}
        minZoom={8}
        maxZoom={18}
        maxBounds={MAX_BOUNDS}
        mapStyle="mapbox://styles/mapbox/light-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: "100%", height: "100%" }}
        cursor={isAddingZone ? "crosshair" : cursor}
        interactiveLayerIds={onZoneClick ? ["zones-fill"] : []}
        onClick={isAddingZone ? handleMapClick : handleLayerClick}
        onMouseEnter={() => setCursor("pointer")}
        onMouseLeave={() => setCursor("grab")}
      >
        {/* Navigation controls (zoom +/-) */}
        <NavigationControl position="top-right" showCompass={false} />

        {/* ── Zone Fill-Extrusion Layers ──────────────────── */}
        {layerToggles.zones && (
          <Source id="zones-source" type="geojson" data={zoneGeoJSON}>
            <Layer
              id="zones-fill"
              type="fill-extrusion"
              paint={{
                "fill-extrusion-color": ["get", "fillColor"],
                "fill-extrusion-opacity": 0.4,
                "fill-extrusion-height": ["get", "height"],
                "fill-extrusion-base": 0,
              }}
            />
            <Layer
              id="zones-outline"
              type="line"
              paint={{
                "line-color": ["get", "strokeColor"],
                "line-width": ["get", "strokeWidth"],
                "line-dasharray": ["case", ["!", ["get", "isActive"]], ["literal", [6, 4]], ["literal", [1, 0]]],
              }}
            />
          </Source>
        )}

        {/* ── Polygon drawing preview ─────────────────────── */}
        {isAddingZone && drawingGeoJSON && (
          <Source id="drawing-source" type="geojson" data={drawingGeoJSON as any}>
            <Layer
              id="drawing-fill"
              type="fill"
              filter={["==", "$type", "Polygon"]}
              paint={{ "fill-color": "#2563eb", "fill-opacity": 0.08 }}
            />
            <Layer
              id="drawing-line"
              type="line"
              filter={["==", "$type", "LineString"]}
              paint={{ "line-color": "#2563eb", "line-width": 2.5, "line-dasharray": [6, 4] }}
            />
          </Source>
        )}

        {/* ── New-zone crosshair marker (circle mode) ─────── */}
        {isAddingZone && newZonePosition && (
          <Marker longitude={newZonePosition.lng} latitude={newZonePosition.lat} anchor="center">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-[-10px] rounded-full bg-blue-500/20 animate-ping" />
              <div className="w-9 h-9 rounded-full bg-blue-600 border-3 border-white shadow-lg shadow-blue-500/40 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><path d="M22 12h-4M6 12H2M12 6V2M12 22v-4"/>
                </svg>
              </div>
            </div>
          </Marker>
        )}

        {/* ── Polygon vertex markers ──────────────────────── */}
        {isAddingZone && drawMode === "polygon" && polygonVertices.map(([lat, lng], i) => (
          <Marker key={`vertex-${i}`} longitude={lng} latitude={lat} anchor="center">
            <div
              className="rounded-full border-2 border-white shadow"
              style={{
                width: i === 0 ? 14 : 10,
                height: i === 0 ? 14 : 10,
                background: i === 0 ? "#2563eb" : "#60a5fa",
              }}
              title={i === 0 && polygonVertices.length >= 3 ? "First point — click to close" : `Point ${i + 1}`}
            />
          </Marker>
        ))}

        {/* ── Police Station Markers ──────────────────────── */}
        {layerToggles.police && policeUnits?.map((p) => (
          <Marker key={`police-${p.id}`} longitude={p.location.lng} latitude={p.location.lat} anchor="center">
            <div
              title={`${p.name}\n${p.isActive ? "🟢 On Duty" : "⚫ Off Duty"}${p.officerCount ? ` · ${p.officerCount} officers` : ""}`}
              className="flex items-center justify-center rounded-full border-2 border-white shadow-md transition-transform hover:scale-110"
              style={{
                width: 28,
                height: 28,
                background: p.isActive ? "#2563eb" : "#94a3b8",
                boxShadow: p.isActive ? "0 2px 8px rgba(37,99,235,0.45)" : "0 2px 6px rgba(0,0,0,0.2)",
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
          </Marker>
        ))}

        {/* ── Tourist Markers ─────────────────────────────── */}
        {layerToggles.tourists && visibleTourists.map((t) => (
          <Marker key={`tourist-${t.id}`} longitude={t.location!.lng} latitude={t.location!.lat} anchor="center">
            <div
              title={`${t.name}\n${t.isActive ? "Online" : "Offline"} · Risk: ${t.riskLevel}`}
              className="rounded-full border-2 border-white shadow transition-transform hover:scale-125"
              style={{
                width: 11,
                height: 11,
                background: t.riskLevel === "critical" ? "#ef4444"
                  : t.riskLevel === "high" ? "#f97316"
                  : t.isActive ? "#3b82f6"
                  : "#94a3b8",
                boxShadow: t.riskLevel === "critical" ? "0 0 0 3px rgba(239,68,68,0.3)" : undefined,
              }}
            />
          </Marker>
        ))}

        {/* ── Alert Markers ───────────────────────────────── */}
        {layerToggles.alerts && activeAlerts.map((a) => (
          <Marker key={`alert-${a.id}`} longitude={a.location!.lng} latitude={a.location!.lat} anchor="center">
            <div className="relative flex items-center justify-center" title={`${a.type?.replaceAll("_", " ")}\n${a.touristName ?? "Unknown tourist"}${a.assignedUnit ? `\nAssigned: ${a.assignedUnit}` : ""}`}>
              <div className="absolute inset-[-8px] rounded-full bg-red-500/25 animate-ping" />
              <div
                className="relative flex items-center justify-center rounded-full border-2 border-white shadow-lg"
                style={{ width: 26, height: 26, background: "#ef4444", boxShadow: "0 2px 10px rgba(239,68,68,0.55)" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/>
                  <path d="M12 9v4"/><path d="M12 17h.01"/>
                </svg>
              </div>
            </div>
          </Marker>
        ))}
      </Map>

      {/* ── Overlays (rendered outside Map so they sit on top) ── */}

      {/* Top-left: Add-zone controls + live stats */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-auto">
        {/* Add Zone toggle */}
        {onAddZone && (
          <Button
            size="sm"
            onClick={onAddZone}
            className={`shadow-lg h-8 text-xs ${isAddingZone ? "bg-red-500 hover:bg-red-600" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {isAddingZone ? <><X className="h-3.5 w-3.5 mr-1" />Cancel</> : <><Plus className="h-3.5 w-3.5 mr-1" />Add Zone</>}
          </Button>
        )}

        {/* Draw mode toggle when adding */}
        {isAddingZone && onDrawModeChange && (
          <div className="glass-elevated rounded-xl border border-white/40 p-1.5 shadow-lg flex gap-1">
            <button
              onClick={() => onDrawModeChange("circle")}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                drawMode === "circle" ? "bg-blue-500/20 text-blue-700" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Target className="w-3 h-3" />Circle
            </button>
            <button
              onClick={() => onDrawModeChange("polygon")}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                drawMode === "polygon" ? "bg-blue-500/20 text-blue-700" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Pentagon className="w-3 h-3" />Polygon
            </button>
          </div>
        )}

        {/* Polygon drawing controls */}
        {isAddingZone && drawMode === "polygon" && polygonVertices.length > 0 && (
          <div className="glass-elevated rounded-xl border border-white/40 p-2 shadow-lg space-y-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Drawing</p>
            <p className="text-[11px] text-slate-600">{polygonVertices.length} point{polygonVertices.length !== 1 ? "s" : ""}</p>
            <div className="flex gap-1">
              {onPolygonUndo && (
                <button onClick={onPolygonUndo} className="text-[10px] px-2 py-1 rounded-lg bg-slate-500/10 text-slate-600 hover:bg-slate-500/20">
                  Undo
                </button>
              )}
              {polygonVertices.length >= 3 && onPolygonComplete && (
                <button onClick={onPolygonComplete} className="text-[10px] px-2 py-1 rounded-lg bg-blue-500/20 text-blue-700 hover:bg-blue-500/30 font-semibold">
                  Done
                </button>
              )}
            </div>
          </div>
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

      {/* Bottom-right: Layer toggle panel */}
      <div className="absolute bottom-8 right-3 z-10 pointer-events-auto">
        <div className="flex flex-col items-end gap-1.5">
          {showLayerPanel && (
            <div className="glass-elevated rounded-xl border border-white/40 p-2.5 shadow-lg space-y-1">
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
                    layerToggles[key] ? "bg-white/50 text-slate-800" : "text-slate-400 hover:text-slate-600"
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
            onClick={() => setShowLayerPanel((prev) => !prev)}
            className={`glass-elevated w-8 h-8 flex items-center justify-center rounded-xl border border-white/40 hover:bg-white/70 transition-all shadow-sm ${showLayerPanel ? "bg-white/60" : ""}`}
            title="Toggle layers"
          >
            <Layers className="w-3.5 h-3.5 text-slate-700" />
          </button>
        </div>
      </div>

      {/* Bottom-left: Legend */}
      <div className="absolute bottom-8 left-3 z-10 glass-elevated rounded-xl p-2.5 shadow-lg border border-white/40 pointer-events-none">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Legend</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {[
            { color: "#ef4444", label: "Critical" },
            { color: "#f97316", label: "High" },
            { color: "#f59e0b", label: "Medium" },
            { color: "#22c55e", label: "Low" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full border-2" style={{ borderColor: color, background: `${color}44` }} />
              <span className="text-[10px] text-slate-600">{label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full border-2 border-white bg-blue-500" />
            <span className="text-[10px] text-slate-600">Tourist</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full border-2 border-white bg-blue-600" />
            <span className="text-[10px] text-slate-600">Police</span>
          </div>
        </div>
      </div>
    </div>
  );
}
