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
    <tr className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${isSelected ? "bg-blue-50" : ""}`}>
      <td className="py-3 px-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(String(alert.id))}
          className="rounded border-slate-300"
        />
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <TypeIcon className="h-4 w-4 text-slate-400" />
          <span className="font-medium text-slate-900 text-sm">{alert.type.replace("_", " ")}</span>
        </div>
      </td>
      <td className="py-3 px-4">
        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          {alert.status}
        </span>
      </td>
      <td className="py-3 px-4 text-sm text-slate-600 font-mono">{alert.touristId?.slice(0, 12)}...</td>
      <td className="py-3 px-4 text-sm text-slate-500">{new Date(alert.timestamp).toLocaleString()}</td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onView(alert)}>
            <Eye className="h-3.5 w-3.5" />
          </Button>
          {alert.status !== "RESOLVED" && (
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-emerald-600" onClick={() => onResolve(String(alert.id))}>
              <CheckCircle2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}
