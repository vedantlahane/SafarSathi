import { useMemo, useState } from "react";
import { Shield, Plus, Phone } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ActionBar, PoliceCard, InteractiveMap } from "../components";
import type { PoliceDepartment, RiskZone, Alert, Tourist } from "../types";

interface PoliceSectionProps {
  police: PoliceDepartment[];
  zones: RiskZone[];
  alerts: Alert[];
  tourists: Tourist[];
  isLoading: boolean;
  onAddPolice: () => void;
  onEditPolice: (police: PoliceDepartment) => void;
  onDeletePolice: (police: PoliceDepartment) => void;
  onContactPolice: (police: PoliceDepartment) => void;
  onRefresh: () => void;
}

const filterOptions = [
  { value: "all", label: "All Stations" },
  { value: "active", label: "On Duty" },
  { value: "inactive", label: "Off Duty" },
];

export function PoliceSection({
  police,
  zones,
  alerts,
  tourists,
  isLoading,
  onAddPolice,
  onEditPolice,
  onDeletePolice,
  onContactPolice,
  onRefresh,
}: PoliceSectionProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");


  const filteredPolice = useMemo(() => {
    return police.filter((station) => {
      const matchesSearch = !search ||
        station.name.toLowerCase().includes(search.toLowerCase()) ||
        station.departmentCode.toLowerCase().includes(search.toLowerCase()) ||
        station.city.toLowerCase().includes(search.toLowerCase());

      let matchesFilter = true;
      if (filter === "active") matchesFilter = station.isActive === true;
      else if (filter === "inactive") matchesFilter = station.isActive !== true;

      return matchesSearch && matchesFilter;
    });
  }, [police, search, filter]);

  const activeCount = police.filter((p) => p.isActive).length;
  const totalStations = police.length;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/60 bg-white/60 backdrop-blur-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">Police Station Management</h2>
            <p className="text-sm text-slate-500">Manage and coordinate with police stations</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-medium text-emerald-700">{activeCount} On Duty</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200">
              <Shield className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">{totalStations} Total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <ActionBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search stations..."
        filterValue={filter}
        onFilterChange={setFilter}
        filterOptions={filterOptions}
        filterPlaceholder="Filter by status"
        onRefresh={onRefresh}
        isRefreshing={isLoading}
        showAdd={true}
        addLabel="Add Station"
        onAdd={onAddPolice}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
        {/* Map */}
        <Card className="lg:col-span-2 overflow-hidden">
          <CardHeader className="py-2 px-4 border-b">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              Police Station Locations
            </CardTitle>
          </CardHeader>
          <div className="h-[calc(100%-44px)]">
            <InteractiveMap
              zones={zones}
              tourists={tourists}
              alerts={alerts}
              policeUnits={police}
              showPolice={true}
              showTourists={false}
              showAlerts={true}
            />
          </div>
        </Card>

        {/* Station List */}
        <Card className="flex flex-col">
          <CardHeader className="py-2 px-4 border-b">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>Stations ({filteredPolice.length})</span>
              <Button size="sm" variant="ghost" onClick={onAddPolice} className="text-blue-600">
                <Plus className="w-3.5 h-3.5 mr-1" /> Add
              </Button>
            </CardTitle>
          </CardHeader>
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-2">
              {filteredPolice.length > 0 ? (
                filteredPolice.map((station) => (
                  <PoliceCard
                    key={station.id}
                    police={station}
                    onEdit={() => onEditPolice(station)}
                    onDelete={() => onDeletePolice(station)}
                    onContact={() => onContactPolice(station)}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Shield className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="font-medium">No stations found</p>
                  <p className="text-sm">Click "Add Station" to register one</p>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Quick Actions */}
          <div className="p-3 border-t border-slate-200/60 bg-white/40 backdrop-blur-sm">
            <Button
              variant="outline"
              className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
              onClick={() => {
                if (filteredPolice.length > 0) {
                  onContactPolice(filteredPolice[0]);
                }
              }}
            >
              <Phone className="w-4 h-4 mr-1.5" />
              Quick Dispatch
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
