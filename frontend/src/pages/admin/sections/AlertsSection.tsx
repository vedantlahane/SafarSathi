import { useMemo, useState } from "react";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ActionBar, AlertTableRow } from "../components";
import type { Alert, AlertFilter } from "../types";

interface AlertsSectionProps {
  alerts: Alert[];
  isLoading: boolean;
  onResolve: (alertId: string) => void;
  onBulkResolve: (alertIds: string[]) => void;
  onViewAlert: (alert: Alert) => void;
  onRefresh: () => void;
  globalSearch?: string;
}

const filterOptions = [
  { value: "all", label: "All Alerts" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "resolved", label: "Resolved" },
  { value: "sos", label: "SOS Only" },
  { value: "geofence", label: "Geofence" },
];

export function AlertsSection({
  alerts,
  isLoading,
  onResolve,
  onBulkResolve,
  onViewAlert,
  onRefresh,
  globalSearch = "",
}: AlertsSectionProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<AlertFilter>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  // Combine local + global search
  const effectiveSearch = search || globalSearch;

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const matchesSearch = !effectiveSearch ||
        alert.touristName?.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
        alert.type.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
        String(alert.id).toLowerCase().includes(effectiveSearch.toLowerCase());

      let matchesFilter = true;
      if (filter === "active") matchesFilter = alert.status === "ACTIVE";
      else if (filter === "pending") matchesFilter = alert.status === "PENDING";
      else if (filter === "resolved") matchesFilter = alert.status === "RESOLVED";
      else if (filter === "sos") matchesFilter = alert.type === "SOS";
      else if (filter === "geofence") matchesFilter = alert.type === "GEOFENCE_BREACH";

      return matchesSearch && matchesFilter;
    });
  }, [alerts, effectiveSearch, filter]);

  // Paginated alerts
  const totalPages = Math.max(1, Math.ceil(filteredAlerts.length / pageSize));
  const paginatedAlerts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAlerts.slice(start, start + pageSize);
  }, [filteredAlerts, currentPage]);

  // Reset page when filters change
  useMemo(() => { setCurrentPage(1); }, [effectiveSearch, filter]);

  const handleSelectAll = () => {
    if (selectedIds.size === filteredAlerts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAlerts.map((a) => String(a.id))));
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

  const handleBulkResolve = () => {
    if (!confirm(`Resolve ${selectedIds.size} selected alerts?`)) return;
    onBulkResolve(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  const handleExport = () => {
    const headers = ["ID", "Type", "Status", "Tourist", "Time", "Location"];
    const rows = filteredAlerts.map(a => [
      a.id,
      a.type,
      a.status,
      a.touristName || "Unknown",
      new Date(a.timestamp).toLocaleString(),
      a.location ? `${a.location.lat.toFixed(4)},${a.location.lng.toFixed(4)}` : "N/A",
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `alerts-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeCount = alerts.filter((a) => a.status === "ACTIVE").length;
  const pendingCount = alerts.filter((a) => a.status === "PENDING").length;

  return (
    <div className="h-full flex flex-col">
      {/* Header Stats */}
      <div className="px-6 py-4 border-b border-white/60 bg-white/60 backdrop-blur-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">Alert Management</h2>
            <p className="text-sm text-slate-500">Monitor and respond to system alerts</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-lg border border-red-200">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-medium text-red-700">{activeCount} Active</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-200">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-sm font-medium text-amber-700">{pendingCount} Pending</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <ActionBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search alerts by tourist, type, or ID..."
        filterValue={filter}
        onFilterChange={(v) => setFilter(v as AlertFilter)}
        filterOptions={filterOptions}
        filterPlaceholder="Filter by status"
        onRefresh={onRefresh}
        isRefreshing={isLoading}
        showExport={true}
        onExport={handleExport}
      >
        {selectedIds.size > 0 && (
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={handleBulkResolve}
          >
            <CheckCircle className="w-4 h-4 mr-1.5" />
            Resolve {selectedIds.size} Selected
          </Button>
        )}
      </ActionBar>

      {/* Alert Table */}
      <div className="flex-1 overflow-hidden">
        <Card className="h-full m-4 flex flex-col bg-white/70 backdrop-blur-sm border-white/60">
          {/* Table Header */}
          <div className="grid grid-cols-[40px_1fr_120px_140px_120px_100px_100px] gap-4 px-4 py-3 bg-white/50 backdrop-blur-sm border-b border-slate-200/60 text-sm font-medium text-slate-600">
            <div>
              <input
                type="checkbox"
                checked={selectedIds.size === filteredAlerts.length && filteredAlerts.length > 0}
                onChange={handleSelectAll}
                className="rounded border-slate-300"
              />
            </div>
            <div>Tourist</div>
            <div>Type</div>
            <div>Time</div>
            <div>Status</div>
            <div>Location</div>
            <div className="text-right">Actions</div>
          </div>

          {/* Table Body */}
          <ScrollArea className="flex-1">
            {paginatedAlerts.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {paginatedAlerts.map((alert) => (
                  <AlertTableRow
                    key={alert.id}
                    alert={alert}
                    onResolve={onResolve}
                    onView={onViewAlert}
                    isSelected={selectedIds.has(String(alert.id))}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                <AlertTriangle className="w-12 h-12 mb-3 opacity-50" />
                <p className="font-medium">No alerts found</p>
                <p className="text-sm">
                  {search || filter !== "all"
                    ? "Try adjusting your search or filters"
                    : "System is running smoothly"}
                </p>
              </div>
            )}
          </ScrollArea>

          {/* Footer with Pagination */}
          <div className="px-4 py-3 border-t border-slate-200/60 bg-white/40 backdrop-blur-sm flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Showing {((currentPage - 1) * pageSize) + 1}–{Math.min(currentPage * pageSize, filteredAlerts.length)} of {filteredAlerts.length} alerts
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
