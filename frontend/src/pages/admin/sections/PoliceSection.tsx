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

  const handleExport = () => {
    const headers = ["Name", "Code", "City", "Status", "Phone", "Latitude", "Longitude"];
    const rows = filteredPolice.map(s => [
      s.name, s.departmentCode, s.city,
      s.isActive ? "On Duty" : "Off Duty",
      s.contactNumber || "", String(s.location?.lat || ""), String(s.location?.lng || ""),
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `police-stations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="glass-bar px-6 py-5 border-b border-white/30">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-800">Police Station Management</h2>
            <p className="text-sm font-medium text-slate-500 mt-1">Manage and coordinate with police stations</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="glass-thin flex items-center gap-2 px-3.5 py-2 rounded-2xl border border-emerald-200/40">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
              <span className="text-sm font-semibold text-emerald-700">{activeCount} On Duty</span>
            </div>
            <div className="glass-thin flex items-center gap-2 px-3.5 py-2 rounded-2xl border border-slate-200/40">
              <Shield className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-sm font-semibold text-slate-700">{totalStations} Total</span>
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
        showExport={true}
        onExport={handleExport}
      />

      {/* Main Content */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4 p-6">
        {/* Map */}
        <Card className="lg:col-span-2 overflow-hidden min-h-[500px] glass-card border-white/30 shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.8),0_4px_16px_-4px_rgba(0,0,0,0.06),0_12px_40px_-8px_rgba(0,0,0,0.04)] rounded-2xl">
          <CardHeader className="py-3 px-5 border-b border-white/20 glass-bar">
            <CardTitle className="text-[13px] uppercase tracking-wider flex items-center gap-2 font-bold text-slate-500">
              <div className="relative">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              </div>
              Police Station Locations
            </CardTitle>
          </CardHeader>
          <div className="h-[calc(100%-44px)] min-h-0">
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
        <Card className="flex flex-col glass-card border-white/30 shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.8),0_4px_16px_-4px_rgba(0,0,0,0.06),0_12px_40px_-8px_rgba(0,0,0,0.04)] rounded-2xl">
          <CardHeader className="py-3 px-5 border-b border-white/20 glass-bar">
            <CardTitle className="text-[13px] uppercase tracking-wider flex items-center justify-between font-bold text-slate-500">
              <span>Stations ({filteredPolice.length})</span>
              <Button size="sm" variant="ghost" onClick={onAddPolice} className="rounded-xl h-8 px-3 text-[11px] font-bold tracking-wide transition-all bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Add
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
          <div className="p-3 border-t border-white/30 bg-white/20 backdrop-blur-sm space-y-2">
            <Button
              variant="outline"
              className="w-full rounded-xl border-blue-200/50 text-blue-700 hover:bg-blue-500/10 backdrop-blur-sm"
              disabled={filteredPolice.filter(p => p.isActive).length === 0}
              onClick={() => {
                const activeStations = filteredPolice.filter(p => p.isActive);
                if (activeStations.length === 0) return;
                const nearest = activeStations[0];
                if (confirm(`Dispatch to ${nearest.name} (${nearest.city})?`)) {
                  onContactPolice(nearest);
                }
              }}
            >
              <Phone className="w-4 h-4 mr-1.5" />
              Quick Dispatch {filteredPolice.filter(p => p.isActive).length > 0
                ? `— ${filteredPolice.filter(p => p.isActive)[0].name}`
                : "(No active stations)"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
