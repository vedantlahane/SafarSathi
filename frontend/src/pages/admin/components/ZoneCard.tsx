import { Pencil, Trash2, MoreHorizontal, Map, Target, Globe, Clock, Pentagon } from "lucide-react";
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
  critical: { color: "bg-purple-500", text: "text-purple-700", tint: "bg-purple-500/8", border: "border-purple-300/40", glow: "shadow-[0_0_20px_-4px_rgba(168,85,247,0.15)]", ring: "ring-1 ring-purple-400/30", dot: "shadow-[0_0_6px_rgba(168,85,247,0.5)]" },
  high: { color: "bg-red-500", text: "text-red-700", tint: "bg-red-500/8", border: "border-red-300/40", glow: "shadow-[0_0_20px_-4px_rgba(239,68,68,0.12)]", ring: "", dot: "" },
  medium: { color: "bg-amber-500", text: "text-amber-700", tint: "bg-amber-500/8", border: "border-amber-300/40", glow: "shadow-[0_0_20px_-4px_rgba(245,158,11,0.1)]", ring: "", dot: "" },
  low: { color: "bg-emerald-500", text: "text-emerald-700", tint: "bg-emerald-500/8", border: "border-emerald-300/40", glow: "shadow-[0_0_20px_-4px_rgba(16,185,129,0.1)]", ring: "", dot: "" },
};

const categoryIcons: Record<string, string> = {
  flood: "🌊",
  wildlife: "🐾",
  crime: "⚠️",
  traffic: "🚗",
  political_unrest: "🚨",
  other: "⛔",
};

const sourceLabels: Record<string, { label: string; style: string }> = {
  ai_detected: { label: "AI Detected", style: "bg-indigo-100 text-indigo-700" },
  crowd_report: { label: "Crowd Report", style: "bg-teal-100 text-teal-700" },
  admin: { label: "Admin", style: "bg-slate-100 text-slate-700" },
};

function formatExpiry(dateStr?: string): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  if (diff < 0) return "Expired";
  const days = Math.ceil(diff / 86400000);
  if (days <= 1) return "Expires today";
  if (days <= 7) return `Expires in ${days}d`;
  return `Expires ${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
}

export function ZoneCard({ zone, onEdit, onDelete, onViewOnMap, isSelected }: ZoneCardProps) {
  const cfg = severityConfig[zone.severity as keyof typeof severityConfig] || severityConfig.medium;
  const isCritical = zone.severity === "critical";
  const expiryText = formatExpiry(zone.expiresAt);
  const source = zone.source ? sourceLabels[zone.source] : null;
  const catIcon = zone.category ? categoryIcons[zone.category] : null;

  return (
    <div className={`relative rounded-2xl border backdrop-blur-xl transition-all duration-200 hover:scale-[1.01] ${isSelected ? "border-blue-400/60 shadow-[0_0_24px_-4px_rgba(59,130,246,0.2)] bg-blue-500/5" : cfg.border + " " + cfg.tint} ${cfg.glow} ${isCritical ? cfg.ring : ""} p-4`}
      style={{ background: isSelected ? undefined : 'rgba(255,255,255,0.45)', boxShadow: isSelected ? undefined : 'inset 0 0.5px 0 0 rgba(255,255,255,0.7)' }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <div className={`w-2.5 h-2.5 rounded-full ${cfg.color} ${isCritical ? "animate-pulse " + cfg.dot : ""}`} />
          <span className={`text-[11px] font-bold uppercase tracking-wider ${cfg.text}`}>{zone.severity}</span>
          {catIcon && (
            <span className="text-xs px-1.5 py-0.5 rounded-lg bg-white/50 backdrop-blur-sm border border-white/40" title={zone.category}>
              {catIcon}
            </span>
          )}
          {source && (
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full backdrop-blur-sm ${source.style}`}>
              {source.label}
            </span>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-white/40 rounded-lg">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 glass-elevated border-white/30 rounded-xl">
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

      {/* Body */}
      <h4 className="font-semibold text-slate-800 mb-1 truncate text-[13px]">{zone.name}</h4>
      <p className="text-xs text-slate-500 mb-3 line-clamp-2 min-h-8">{zone.description || "No description provided"}</p>

      {/* Footer */}
      <div className="flex items-center justify-between flex-wrap gap-y-1">
        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          {zone.shape === "polygon" && zone.polygonCoordinates ? (
            <span className="flex items-center gap-1">
              <Pentagon className="h-3 w-3 text-slate-400" />
              {zone.polygonCoordinates.length} pts
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Target className="h-3 w-3 text-slate-400" />
              {zone.radius >= 1000 ? `${(zone.radius / 1000).toFixed(1)}km` : `${zone.radius}m`}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Globe className="h-3 w-3 text-slate-400" />
            {zone.center.lat.toFixed(4)}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {expiryText && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5 backdrop-blur-sm ${
              expiryText === "Expired" ? "bg-red-500/10 text-red-700" :
              expiryText === "Expires today" ? "bg-amber-500/10 text-amber-700" :
              "bg-slate-500/10 text-slate-600"
            }`}>
              <Clock className="h-2.5 w-2.5" />
              {expiryText}
            </span>
          )}
          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full backdrop-blur-sm ${zone.isActive ? "bg-emerald-500/12 text-emerald-700" : "bg-slate-500/10 text-slate-500"}`}>
            {zone.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>
    </div>
  );
}
