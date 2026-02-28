import { Search, Download, RefreshCw, Filter, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ActionBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterOptions?: { value: string; label: string }[];
  filterPlaceholder?: string;
  onRefresh?: () => void;
  onExport?: () => void;
  onAdd?: () => void;
  addLabel?: string;
  isRefreshing?: boolean;
  showFilter?: boolean;
  showExport?: boolean;
  showAdd?: boolean;
  children?: React.ReactNode;
}

export function ActionBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filterValue,
  onFilterChange,
  filterOptions,
  filterPlaceholder = "Filter",
  onRefresh,
  onExport,
  onAdd,
  addLabel = "Add New",
  isRefreshing = false,
  showFilter = true,
  showExport = true,
  showAdd = false,
  children,
}: ActionBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-white/40 backdrop-blur-lg border-b border-white/60">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="pl-9 bg-white/70 backdrop-blur-sm border-slate-200/60 rounded-xl"
        />
      </div>

      {/* Filter */}
      {showFilter && filterOptions && onFilterChange && (
        <Select value={filterValue} onValueChange={onFilterChange}>
          <SelectTrigger className="w-[160px] bg-white/70 backdrop-blur-sm border-slate-200/60 rounded-xl">
            <Filter className="w-4 h-4 mr-2 text-slate-400" />
            <SelectValue placeholder={filterPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            {filterOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Custom Actions */}
      {children}

      <div className="flex items-center gap-2 ml-auto">
        {/* Add Button */}
        {showAdd && onAdd && (
          <Button onClick={onAdd} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-1.5" />
            {addLabel}
          </Button>
        )}

        {/* Export */}
        {showExport && onExport && (
          <Button variant="outline" onClick={onExport} className="border-slate-200">
            <Download className="w-4 h-4 mr-1.5" />
            Export
          </Button>
        )}

        {/* Refresh */}
        {onRefresh && (
          <Button
            variant="outline"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="border-slate-200"
            aria-label="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        )}
      </div>
    </div>
  );
}
