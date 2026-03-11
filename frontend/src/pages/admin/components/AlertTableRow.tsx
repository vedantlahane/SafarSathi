import { Eye, CheckCircle2, MapPin, Activity, Siren, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Alert } from "../types";

interface AlertTableRowProps {
  alert: Alert;
  onResolve: (id: string) => void;
  onView: (alert: Alert) => void;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const statusConfig = {
  ACTIVE: { color: "bg-red-100 text-red-700", dot: "bg-red-500 animate-pulse" },
  PENDING: { color: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  RESOLVED: { color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
};

const typeIcons = {
  SOS: Siren,
  GEOFENCE_BREACH: MapPin,
  ANOMALY: Activity,
};

export function AlertTableRow({ alert, onResolve, onView, isSelected, onSelect }: AlertTableRowProps) {
  const cfg = statusConfig[alert.status as keyof typeof statusConfig] || statusConfig.PENDING;
  const TypeIcon = typeIcons[alert.type as keyof typeof typeIcons] || AlertTriangle;

  return (
    <div className={`grid grid-cols-[40px_1fr_120px_140px_120px_100px_100px] gap-4 items-center border-b border-slate-100 hover:bg-white/50 transition-colors ${isSelected ? "bg-blue-50" : ""}`}>
      <div className="py-3 px-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(String(alert.id))}
          className="rounded border-slate-300"
          aria-label={`Select alert ${alert.type}`}
        />
      </div>
      <div className="py-3 px-4">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shrink-0">
            <TypeIcon className="h-3.5 w-3.5 text-slate-600" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-slate-900 text-sm truncate">{alert.touristName || "Unknown Tourist"}</p>
            <p className="text-xs text-slate-500 truncate font-mono">{alert.touristId ? `${alert.touristId.slice(0, 10)}…` : "N/A"}</p>
          </div>
        </div>
      </div>
      <div className="py-3 px-4">
        <span className="text-sm font-medium text-slate-700">{alert.type.replaceAll("_", " ")}</span>
      </div>
      <div className="py-3 px-4 text-sm text-slate-500 truncate">{new Date(alert.timestamp).toLocaleString()}</div>
      <div className="py-3 px-4">
        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          {alert.status}
        </span>
      </div>
      <div className="py-3 px-4 text-xs text-slate-500 truncate">
        {alert.location ? `${alert.location.lat.toFixed(2)}, ${alert.location.lng.toFixed(2)}` : "—"}
      </div>
      <div className="py-3 px-4">
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onView(alert)} title="View details">
            <Eye className="h-3.5 w-3.5" />
          </Button>
          {alert.status !== "RESOLVED" && (
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-emerald-600" onClick={() => onResolve(String(alert.id))} title="Resolve alert">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
