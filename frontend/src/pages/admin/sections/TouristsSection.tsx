import { useMemo, useState } from "react";
import { Users, Radio } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ActionBar, TouristTableRow } from "../components";
import type { Tourist, TouristFilter } from "../types";

interface TouristsSectionProps {
  tourists: Tourist[];
  isLoading: boolean;
  onViewTourist: (tourist: Tourist) => void;
  onContactTourist: (tourist: Tourist) => void;
  onTrackTourist: (tourist: Tourist) => void;
  onBroadcast: () => void;
  onRefresh: () => void;
}

const filterOptions = [
  { value: "all", label: "All Tourists" },
  { value: "online", label: "Online" },
  { value: "offline", label: "Offline" },
  { value: "high-risk", label: "High Risk" },
  { value: "medium-risk", label: "Medium Risk" },
  { value: "low-risk", label: "Low Risk" },
];

export function TouristsSection({
  tourists,
  isLoading,
  onViewTourist,
  onContactTourist,
  onTrackTourist,
  onBroadcast,
  onRefresh,
}: TouristsSectionProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<TouristFilter>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filteredTourists = useMemo(() => {
    return tourists.filter((tourist) => {
      const matchesSearch = !search ||
        tourist.name?.toLowerCase().includes(search.toLowerCase()) ||
        tourist.email?.toLowerCase().includes(search.toLowerCase()) ||
        tourist.phoneNumber?.includes(search);

      let matchesFilter = true;
      if (filter === "online") matchesFilter = tourist.isActive === true;
      else if (filter === "offline") matchesFilter = tourist.isActive !== true;
      else if (filter === "high-risk") matchesFilter = tourist.riskLevel === "high";
      else if (filter === "medium-risk") matchesFilter = tourist.riskLevel === "medium";
      else if (filter === "low-risk") matchesFilter = tourist.riskLevel === "low" || !tourist.riskLevel;

      return matchesSearch && matchesFilter;
    });
  }, [tourists, search, filter]);

  const handleSelectAll = () => {
    if (selectedIds.size === filteredTourists.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredTourists.map((t) => t.id)));
    }
  };

  const handleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const onlineCount = tourists.filter((t) => t.isActive).length;
  const highRiskCount = tourists.filter((t) => t.riskLevel === "high").length;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">Tourist Management</h2>
            <p className="text-sm text-slate-500">Monitor and communicate with tourists</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-medium text-emerald-700">{onlineCount} Online</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-lg border border-red-200">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-sm font-medium text-red-700">{highRiskCount} High Risk</span>
            </div>
            <Button onClick={onBroadcast} className="bg-blue-600 hover:bg-blue-700">
              <Radio className="w-4 h-4 mr-1.5" />
              Broadcast
            </Button>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <ActionBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, email, or phone..."
        filterValue={filter}
        onFilterChange={(v) => setFilter(v as TouristFilter)}
        filterOptions={filterOptions}
        filterPlaceholder="Filter tourists"
        onRefresh={onRefresh}
        isRefreshing={isLoading}
        showExport={true}
        onExport={() => console.log("Export tourists")}
      />

      {/* Tourist Table */}
      <div className="flex-1 overflow-hidden">
        <Card className="h-full m-4 flex flex-col">
          {/* Table Header */}
          <div className="grid grid-cols-[40px_1fr_120px_100px_140px_120px_100px] gap-4 px-4 py-3 bg-slate-50 border-b text-sm font-medium text-slate-600">
            <div>
              <input
                type="checkbox"
                checked={selectedIds.size === filteredTourists.length && filteredTourists.length > 0}
                onChange={handleSelectAll}
                className="rounded border-slate-300"
              />
            </div>
            <div>Tourist</div>
            <div>Status</div>
            <div>Risk</div>
            <div>Last Seen</div>
            <div>Location</div>
            <div className="text-right">Actions</div>
          </div>

          {/* Table Body */}
          <ScrollArea className="flex-1">
            {filteredTourists.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {filteredTourists.map((tourist) => (
                  <TouristTableRow
                    key={tourist.id}
                    tourist={tourist}
                    onView={() => onViewTourist(tourist)}
                    onContact={() => onContactTourist(tourist)}
                    onTrack={() => onTrackTourist(tourist)}
                    isSelected={selectedIds.has(tourist.id)}
                    onSelect={() => handleSelect(tourist.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                <Users className="w-12 h-12 mb-3 opacity-50" />
                <p className="font-medium">No tourists found</p>
                <p className="text-sm">
                  {search || filter !== "all"
                    ? "Try adjusting your search or filters"
                    : "No tourists registered yet"}
                </p>
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          <div className="px-4 py-3 border-t bg-slate-50 text-sm text-slate-500">
            Showing {filteredTourists.length} of {tourists.length} tourists
          </div>
        </Card>
      </div>
    </div>
  );
}
