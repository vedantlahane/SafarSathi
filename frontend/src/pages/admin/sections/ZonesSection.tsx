import { useMemo, useState } from "react";
import { MapPin, Plus, AlertTriangle, Shield, Clock, Pentagon } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ActionBar, ZoneCard, InteractiveMap } from "../components";
import type { RiskZone, ZoneFilter, Alert, Tourist, PoliceDepartment } from "../types";

interface ZonesSectionProps {
  zones: RiskZone[];
  alerts: Alert[];
  tourists: Tourist[];
  police: PoliceDepartment[];
  isLoading: boolean;
  onAddZone: () => void;
  onEditZone: (zone: RiskZone) => void;
  onDeleteZone: (zone: RiskZone) => void;
  onRefresh: () => void;
  isAddingZone: boolean;
  onMapClick: (lat: number, lng: number) => void;
  newZonePosition: { lat: number; lng: number } | null;
  onToggleAddMode: () => void;
  // Polygon drawing state (lifted to parent)
  drawMode: "circle" | "polygon";
  onDrawModeChange: (mode: "circle" | "polygon") => void;
  polygonVertices: [number, number][];
  onPolygonVertexAdd: (lat: number, lng: number) => void;
  onPolygonUndo: () => void;
  onPolygonComplete: () => void;
}

const filterOptions = [
  { value: "all", label: "All Zones" },
  { value: "active", label: "Active Only" },
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export function ZonesSection({
  zones,
  alerts,
  tourists,
  police,
  isLoading,
  onAddZone,
  onEditZone,
  onDeleteZone,
  onRefresh,
  isAddingZone,
  onMapClick,
  newZonePosition,
  onToggleAddMode,
  drawMode,
  onDrawModeChange,
  polygonVertices,
  onPolygonVertexAdd,
  onPolygonUndo,
  onPolygonComplete,
}: ZonesSectionProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ZoneFilter>("all");
  const [selectedZone, setSelectedZone] = useState<RiskZone | null>(null);

  const handleDrawModeChange = onDrawModeChange;
  const handlePolygonVertexAdd = onPolygonVertexAdd;
  const handlePolygonUndo = onPolygonUndo;
  const handlePolygonComplete = onPolygonComplete;

  const filteredZones = useMemo(() => {
    return zones.filter((zone) => {
      const matchesSearch = !search ||
        zone.name.toLowerCase().includes(search.toLowerCase()) ||
        zone.description?.toLowerCase().includes(search.toLowerCase());

      let matchesFilter = true;
      if (filter === "active") matchesFilter = zone.isActive === true;
      else if (filter === "critical") matchesFilter = zone.severity === "critical";
      else if (filter === "high") matchesFilter = zone.severity === "high";
      else if (filter === "medium") matchesFilter = zone.severity === "medium";
      else if (filter === "low") matchesFilter = zone.severity === "low";

      return matchesSearch && matchesFilter;
    });
  }, [zones, search, filter]);

  const criticalCount = zones.filter((z) => z.severity === "critical").length;
  const highCount = zones.filter((z) => z.severity === "high").length;
  const mediumCount = zones.filter((z) => z.severity === "medium").length;
  const lowCount = zones.filter((z) => z.severity === "low").length;
  const activeCount = zones.filter((z) => z.isActive).length;
  const expiringSoonCount = zones.filter((z) => {
    if (!z.expiresAt) return false;
    const diff = new Date(z.expiresAt).getTime() - Date.now();
    return diff > 0 && diff < 7 * 86400000;
  }).length;

  const handleZoneClick = (zone: RiskZone) => {
    setSelectedZone(zone);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="glass-bar px-6 py-4 border-b border-white/30">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-800 tracking-tight">Risk Zone Management</h2>
            <p className="text-sm text-slate-500">Define and manage geofenced risk areas</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="glass-thin flex items-center gap-2 px-3.5 py-2 rounded-2xl border border-purple-200/40">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse shadow-[0_0_6px_rgba(168,85,247,0.4)]" />
              <span className="text-sm font-semibold text-purple-700">{criticalCount} Critical</span>
            </div>
            <div className="glass-thin flex items-center gap-2 px-3.5 py-2 rounded-2xl border border-emerald-200/40">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
              <span className="text-sm font-semibold text-emerald-700">{activeCount} Active</span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-6 gap-2">
          {[
            { label: "Critical", count: criticalCount, color: "text-purple-700", bg: "bg-purple-500/10", icon: AlertTriangle },
            { label: "High", count: highCount, color: "text-red-700", bg: "bg-red-500/10", icon: AlertTriangle },
            { label: "Medium", count: mediumCount, color: "text-amber-700", bg: "bg-amber-500/10", icon: Shield },
            { label: "Low", count: lowCount, color: "text-emerald-700", bg: "bg-emerald-500/10", icon: Shield },
            { label: "Active", count: activeCount, color: "text-blue-700", bg: "bg-blue-500/10", icon: MapPin },
            { label: "Expiring", count: expiringSoonCount, color: "text-orange-700", bg: "bg-orange-500/10", icon: Clock },
          ].map((stat) => (
            <div key={stat.label} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-2xl border border-white/40 backdrop-blur-sm ${stat.bg} transition-transform hover:scale-[1.02]`}>
              <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
              <div>
                <p className={`text-lg font-bold leading-none ${stat.color}`}>{stat.count}</p>
                <p className="text-[10px] text-slate-500 font-medium">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Bar */}
      <ActionBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search zones..."
        filterValue={filter}
        onFilterChange={(v) => setFilter(v as ZoneFilter)}
        filterOptions={filterOptions}
        filterPlaceholder="Filter by severity"
        onRefresh={onRefresh}
        isRefreshing={isLoading}
        showAdd={true}
        addLabel="Add Zone"
        onAdd={onToggleAddMode}
      />

      {/* Main Content - Map + Zone List */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
        {/* Map */}
        <Card className="lg:col-span-2 overflow-hidden min-h-130 glass-elevated border-white/30" style={{boxShadow:'inset 0 0.5px 0 0 rgba(255,255,255,0.8), 0 1px 2px 0 rgba(0,0,0,0.03), 0 4px 16px -4px rgba(0,0,0,0.06), 0 12px 40px -8px rgba(0,0,0,0.04)'}}>
          <CardHeader className="py-2.5 px-4 border-b border-white/30 bg-white/20">
            <CardTitle className="text-sm flex items-center gap-2 font-semibold">
              <div className="relative">
                <MapPin className="w-4 h-4 text-blue-600" />
                {isAddingZone && <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />}
              </div>
              {isAddingZone ? "Click on map to place zone center" : "Zone Map"}
            </CardTitle>
          </CardHeader>
          <div className="h-[calc(100%-44px)] min-h-115">
            <InteractiveMap
              zones={zones}
              tourists={tourists}
              alerts={alerts}
              policeUnits={police}
              selectedZone={selectedZone}
              onZoneClick={handleZoneClick}
              isAddingZone={isAddingZone}
              newZonePosition={newZonePosition}
              onMapClick={onMapClick}
              onAddZone={onToggleAddMode}
              showPolice={true}
              showTourists={false}
              showAlerts={true}
              drawMode={drawMode}
              onDrawModeChange={handleDrawModeChange}
              polygonVertices={polygonVertices}
              onPolygonVertexAdd={handlePolygonVertexAdd}
              onPolygonComplete={handlePolygonComplete}
              onPolygonUndo={handlePolygonUndo}
            />
          </div>
        </Card>

        {/* Zone List */}
        <Card className="flex flex-col glass-card border-white/30" style={{boxShadow:'inset 0 0.5px 0 0 rgba(255,255,255,0.8), 0 1px 2px 0 rgba(0,0,0,0.03), 0 4px 16px -4px rgba(0,0,0,0.06), 0 12px 40px -8px rgba(0,0,0,0.04)'}}>
          <CardHeader className="py-2.5 px-4 border-b border-white/30 bg-white/20">
            <CardTitle className="text-sm flex items-center justify-between font-semibold">
              <span>Zones ({filteredZones.length})</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={onToggleAddMode}
                className={`rounded-xl ${isAddingZone ? "text-red-600 hover:bg-red-500/10" : "text-blue-600 hover:bg-blue-500/10"}`}
              >
                {isAddingZone ? "Cancel" : <><Plus className="w-3.5 h-3.5 mr-1" /> New</>}
              </Button>
            </CardTitle>
          </CardHeader>
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-2">
              {filteredZones.length > 0 ? (
                filteredZones.map((zone) => (
                  <ZoneCard
                    key={zone.id}
                    zone={zone}
                    onEdit={() => onEditZone(zone)}
                    onDelete={() => onDeleteZone(zone)}
                    onViewOnMap={() => handleZoneClick(zone)}
                    isSelected={selectedZone?.id === zone.id}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <MapPin className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="font-medium">No zones found</p>
                  <p className="text-sm">Click "Add Zone" to create one</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* Zone Add Helper — Circle mode */}
      {isAddingZone && drawMode === "circle" && newZonePosition && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="glass-elevated flex items-center gap-3 px-5 py-3.5 rounded-2xl border border-white/40">
            <div className="w-10 h-10 bg-blue-500/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-blue-200/30">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-800">Position selected</p>
              <p className="text-xs text-slate-500 font-mono">
                {newZonePosition.lat.toFixed(4)}, {newZonePosition.lng.toFixed(4)}
              </p>
            </div>
            <Button size="sm" onClick={onAddZone} className="bg-blue-600 hover:bg-blue-700 ml-2 rounded-xl shadow-lg shadow-blue-600/20">
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Zone Add Helper — Polygon mode */}
      {isAddingZone && drawMode === "polygon" && polygonVertices.length >= 3 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="glass-elevated flex items-center gap-3 px-5 py-3.5 rounded-2xl border border-white/40">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-indigo-200/30">
              <Pentagon className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-800">Polygon drawn</p>
              <p className="text-xs text-slate-500">{polygonVertices.length} vertices defined</p>
            </div>
            <Button size="sm" onClick={handlePolygonComplete} className="bg-indigo-600 hover:bg-indigo-700 ml-2 rounded-xl shadow-lg shadow-indigo-600/20">
              Continue
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
