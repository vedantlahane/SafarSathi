import { useMemo, useState } from "react";
import { MapPin, Plus } from "lucide-react";
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
}: ZonesSectionProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ZoneFilter>("all");
  const [selectedZone, setSelectedZone] = useState<RiskZone | null>(null);

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
  const activeCount = zones.filter((z) => z.isActive).length;

  const handleZoneClick = (zone: RiskZone) => {
    setSelectedZone(zone);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">Risk Zone Management</h2>
            <p className="text-sm text-slate-500">Define and manage geofenced risk areas</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-lg border border-red-200">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-sm font-medium text-red-700">{criticalCount} Critical</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-sm font-medium text-emerald-700">{activeCount} Active</span>
            </div>
          </div>
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
      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
        {/* Map */}
        <Card className="lg:col-span-2 overflow-hidden">
          <CardHeader className="py-2 px-4 border-b">
            <CardTitle className="text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              {isAddingZone ? "Click on map to place zone center" : "Zone Map"}
            </CardTitle>
          </CardHeader>
          <div className="h-[calc(100%-44px)]">
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
            />
          </div>
        </Card>

        {/* Zone List */}
        <Card className="flex flex-col">
          <CardHeader className="py-2 px-4 border-b">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>Zones ({filteredZones.length})</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={onToggleAddMode}
                className={isAddingZone ? "text-red-600" : "text-blue-600"}
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

      {/* Zone Add Helper */}
      {isAddingZone && newZonePosition && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl shadow-xl border border-slate-200">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-sm">Position selected</p>
              <p className="text-xs text-slate-500">
                {newZonePosition.lat.toFixed(4)}, {newZonePosition.lng.toFixed(4)}
              </p>
            </div>
            <Button size="sm" onClick={onAddZone} className="bg-blue-600 hover:bg-blue-700 ml-2">
              Continue
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
