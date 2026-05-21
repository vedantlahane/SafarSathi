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
  globalSearch?: string;
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
  globalSearch = "",
}: TouristsSectionProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<TouristFilter>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  const effectiveSearch = search || globalSearch;

  const filteredTourists = useMemo(() => {
    return tourists.filter((tourist) => {
      const matchesSearch = !effectiveSearch ||
        tourist.name?.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
        tourist.email?.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
        tourist.phoneNumber?.includes(effectiveSearch);

      let matchesFilter = true;
      if (filter === "online") matchesFilter = tourist.isActive === true;
      else if (filter === "offline") matchesFilter = tourist.isActive !== true;
      else if (filter === "high-risk") matchesFilter = tourist.riskLevel === "high";
      else if (filter === "medium-risk") matchesFilter = tourist.riskLevel === "medium";
      else if (filter === "low-risk") matchesFilter = tourist.riskLevel === "low" || !tourist.riskLevel;

      return matchesSearch && matchesFilter;
    });
  }, [tourists, effectiveSearch, filter]);

  const totalPages = Math.max(1, Math.ceil(filteredTourists.length / pageSize));
  const paginatedTourists = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTourists.slice(start, start + pageSize);
  }, [filteredTourists, currentPage]);

  useMemo(() => { setCurrentPage(1); }, [effectiveSearch, filter]);

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

  const handleExport = () => {
    const headers = ["Name", "Email", "Phone", "Status", "Risk Level"];
    const rows = filteredTourists.map(t => [
      t.name || "Unknown",
      t.email || "",
      t.phoneNumber || "",
      t.isActive ? "Online" : "Offline",
      t.riskLevel || "low",
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tourists-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-5 glass-bar border-b border-white/30">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-800">Tourist Management</h2>
            <p className="text-sm font-medium text-slate-500 mt-1">Monitor and communicate with tourists</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5 px-3.5 py-2 glass-thin bg-emerald-500/10 rounded-xl border border-emerald-500/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              <span className="text-sm font-bold text-emerald-700 tracking-wide">{onlineCount} Online</span>
            </div>
            <div className="flex items-center gap-2.5 px-3.5 py-2 glass-thin bg-red-500/10 rounded-xl border border-red-500/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
              <span className="text-sm font-bold text-red-700 tracking-wide">{highRiskCount} High Risk</span>
            </div>
            <Button onClick={onBroadcast} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 border-0 font-semibold px-4">
              <Radio className="w-4 h-4 mr-2" />
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
        onExport={handleExport}
      />

      {/* Tourist Table */}
      <div className="flex-1 p-6" style={{ minHeight: 0 }}>
        <Card className="flex flex-col glass-card border-white/30 shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.8),0_4px_16px_-4px_rgba(0,0,0,0.06),0_12px_40px_-8px_rgba(0,0,0,0.04)] rounded-2xl overflow-hidden" style={{ height: 'calc(100vh - 280px)', minHeight: 320 }}>
          {/* Table Header */}
          <div className="grid grid-cols-[40px_1fr_100px_80px_120px_100px_100px] gap-3 px-5 py-3.5 glass-bar border-b border-white/20 text-[13px] font-semibold text-slate-500 uppercase tracking-wider">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedIds.size === filteredTourists.length && filteredTourists.length > 0}
                onChange={handleSelectAll}
                className="rounded border-slate-300 focus:ring-blue-500/40 text-blue-600 transition-colors"
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
            {paginatedTourists.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {paginatedTourists.map((tourist) => (
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

          {/* Footer with Pagination */}
          <div className="px-4 py-3 border-t border-slate-200/60 bg-white/40 backdrop-blur-sm flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Showing {((currentPage - 1) * pageSize) + 1}–{Math.min(currentPage * pageSize, filteredTourists.length)} of {filteredTourists.length} tourists
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-slate-600 px-2">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
