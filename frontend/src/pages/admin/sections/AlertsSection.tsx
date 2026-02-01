import { useMemo, useState } from "react";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
}: AlertsSectionProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<AlertFilter>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      // Search filter
      const matchesSearch = !search || 
        alert.touristName?.toLowerCase().includes(search.toLowerCase()) ||
        alert.type.toLowerCase().includes(search.toLowerCase()) ||
        alert.id.toLowerCase().includes(search.toLowerCase());

      // Status/type filter
      let matchesFilter = true;
      if (filter === "active") matchesFilter = alert.status === "ACTIVE";
      else if (filter === "pending") matchesFilter = alert.status === "PENDING";
      else if (filter === "resolved") matchesFilter = alert.status === "RESOLVED";
      else if (filter === "sos") matchesFilter = alert.type === "SOS";
      else if (filter === "geofence") matchesFilter = alert.type === "GEOFENCE_BREACH";

      return matchesSearch && matchesFilter;
    });
  }, [alerts, search, filter]);

  const handleSelectAll = () => {
    if (selectedIds.size === filteredAlerts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAlerts.map((a) => a.id)));
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
    onBulkResolve(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  const activeCount = alerts.filter((a) => a.status === "ACTIVE").length;
  const pendingCount = alerts.filter((a) => a.status === "PENDING").length;

  return (
    <div className="h-full flex flex-col">
      {/* Header Stats */}
      <div className="px-6 py-4 border-b bg-white">
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
        onExport={() => console.log("Export alerts")}
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
        <Card className="h-full m-4 flex flex-col">
          {/* Table Header */}
          <div className="grid grid-cols-[40px_1fr_120px_140px_120px_100px_100px] gap-4 px-4 py-3 bg-slate-50 border-b text-sm font-medium text-slate-600">
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
            {filteredAlerts.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {filteredAlerts.map((alert) => (
                  <AlertTableRow
                    key={alert.id}
                    alert={alert}
                    onResolve={onResolve}
                    onView={onViewAlert}
                    isSelected={selectedIds.has(alert.id)}
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

          {/* Footer */}
          <div className="px-4 py-3 border-t bg-slate-50 text-sm text-slate-500">
            Showing {filteredAlerts.length} of {alerts.length} alerts
          </div>
        </Card>
      </div>
    </div>
  );
}
