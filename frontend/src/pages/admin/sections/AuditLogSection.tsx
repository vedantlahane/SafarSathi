import { useState, useCallback, useEffect } from "react";
import {
  ScrollText,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  User,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuditLogPagination } from "../hooks";
import type { AuditLogEntry } from "../types";

interface AuditLogSectionProps {
  initialLogs?: AuditLogEntry[];
  initialTotal?: number;
}

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-emerald-100 text-emerald-700",
  UPDATE: "bg-blue-100 text-blue-700",
  DELETE: "bg-red-100 text-red-700",
  LOGIN: "bg-purple-100 text-purple-700",
  RESOLVE: "bg-amber-100 text-amber-700",
  BROADCAST: "bg-cyan-100 text-cyan-700",
};

export function AuditLogSection({ initialLogs, initialTotal }: AuditLogSectionProps) {
  const { logs, total, page, loading, fetchPage } = useAuditLogPagination();
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");

  // Use initial data or fetched data
  const displayLogs = logs.length > 0 ? logs : initialLogs ?? [];
  const displayTotal = total > 0 ? total : initialTotal ?? 0;
  const totalPages = Math.max(1, Math.ceil(displayTotal / 50));

  useEffect(() => {
    // Fetch first page on mount
    fetchPage(1);
  }, [fetchPage]);

  const handleSearch = useCallback(() => {
    fetchPage(1, {
      action: actionFilter !== "all" ? actionFilter : undefined,
      performedBy: search || undefined,
      entityType: entityFilter !== "all" ? entityFilter : undefined,
    });
  }, [fetchPage, actionFilter, search, entityFilter]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      fetchPage(newPage, {
        action: actionFilter !== "all" ? actionFilter : undefined,
        performedBy: search || undefined,
        entityType: entityFilter !== "all" ? entityFilter : undefined,
      });
    },
    [fetchPage, actionFilter, search, entityFilter]
  );

  const formatTimestamp = (ts: string) => {
    const d = new Date(ts);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <ScrollText className="h-5 w-5 text-slate-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Audit Log</h2>
            <p className="text-xs text-muted-foreground">{displayTotal} total entries</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search by performer..."
            className="pl-10"
          />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="CREATE">Create</SelectItem>
            <SelectItem value="UPDATE">Update</SelectItem>
            <SelectItem value="DELETE">Delete</SelectItem>
            <SelectItem value="LOGIN">Login</SelectItem>
            <SelectItem value="RESOLVE">Resolve</SelectItem>
            <SelectItem value="BROADCAST">Broadcast</SelectItem>
          </SelectContent>
        </Select>
        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Entity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Entities</SelectItem>
            <SelectItem value="Alert">Alert</SelectItem>
            <SelectItem value="Tourist">Tourist</SelectItem>
            <SelectItem value="RiskZone">Risk Zone</SelectItem>
            <SelectItem value="Hospital">Hospital</SelectItem>
            <SelectItem value="Advisory">Advisory</SelectItem>
            <SelectItem value="PoliceDepartment">Police</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={handleSearch} disabled={loading}>
          <Filter className="h-4 w-4 mr-1" />
          Apply
        </Button>
        <Button variant="outline" size="sm" onClick={() => fetchPage(page)} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Log Entries */}
      <ScrollArea className="h-[calc(100vh-22rem)]">
        <div className="space-y-2">
          {displayLogs.length === 0 && !loading && (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                No audit log entries found
              </CardContent>
            </Card>
          )}
          {loading && displayLogs.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                Loading audit logs...
              </CardContent>
            </Card>
          )}
          {displayLogs.map((entry) => {
            const actionColor = ACTION_COLORS[entry.action] || "bg-slate-100 text-slate-700";

            return (
              <Card key={entry.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <Badge className={`${actionColor} text-[10px] font-semibold shrink-0`}>
                      {entry.action}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium truncate">{entry.entityType}</span>
                        <span className="text-muted-foreground">#{entry.entityId}</span>
                      </div>
                      {entry.details && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {entry.details}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" /> {entry.performedBy}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {formatTimestamp(entry.timestamp)}
                      </span>
                      {entry.ipAddress && (
                        <span className="hidden lg:inline text-[10px]">{entry.ipAddress}</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>

      {/* Pagination */}
      {displayTotal > 50 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages} ({displayTotal} entries)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1 || loading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages || loading}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
