import { Pencil, Trash2, MoreHorizontal, Map, Target, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { RiskZone } from "../types";

interface ZoneCardProps {
  zone: RiskZone;
  onEdit: (zone: RiskZone) => void;
  onDelete: (zone: RiskZone) => void;
  onViewOnMap: (zone: RiskZone) => void;
  isSelected?: boolean;
}

const severityConfig = {
  critical: { color: "bg-red-500", text: "text-red-700", bg: "bg-red-50", border: "border-red-200", glow: "shadow-red-200" },
  high: { color: "bg-orange-500", text: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200", glow: "shadow-orange-200" },
  medium: { color: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", glow: "shadow-amber-200" },
  low: { color: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", glow: "shadow-emerald-200" },
};

export function ZoneCard({ zone, onEdit, onDelete, onViewOnMap, isSelected }: ZoneCardProps) {
  const cfg = severityConfig[zone.severity as keyof typeof severityConfig] || severityConfig.medium;

  return (
    <div className={`relative rounded-xl border-2 ${isSelected ? "border-blue-500 shadow-lg" : cfg.border} ${cfg.bg} p-4 transition-all hover:shadow-md ${cfg.glow}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${cfg.color}`} />
          <span className={`text-xs font-bold uppercase tracking-wide ${cfg.text}`}>{zone.severity}</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-white/50">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onViewOnMap(zone)}>
              <Map className="h-4 w-4 mr-2" /> View on Map
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(zone)}>
              <Pencil className="h-4 w-4 mr-2" /> Edit Zone
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(zone)} className="text-red-600">
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <h4 className="font-semibold text-slate-900 mb-1 truncate">{zone.name}</h4>
      <p className="text-xs text-slate-600 mb-3 line-clamp-2 min-h-8">{zone.description || "No description provided"}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Target className="h-3 w-3" />
            {zone.radius}m
          </span>
          <span className="flex items-center gap-1">
            <Globe className="h-3 w-3" />
            {zone.center.lat.toFixed(4)}
          </span>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${zone.isActive ? "bg-emerald-200 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
          {zone.isActive ? "Active" : "Inactive"}
        </span>
      </div>
    </div>
  );
}
