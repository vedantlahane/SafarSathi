import { format } from "date-fns";
import {
  AlertTriangle,
  MapPin,
  User,
  Clock,
  CheckCircle,
  Shield,
  ArrowUpCircle,
  Timer,
  Image,
  Ban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Alert } from "../types";

interface AlertDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alert: Alert | null;
  onResolve?: (alertId: string | number) => void;
  onDispatchPolice?: (alertId: string | number) => void;
}

const statusConfig = {
  ACTIVE: { label: "Active", class: "bg-red-100 text-red-700 border-red-200" },
  PENDING: { label: "Pending", class: "bg-amber-100 text-amber-700 border-amber-200" },
  RESOLVED: { label: "Resolved", class: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  CANCELLED: { label: "Cancelled", class: "bg-slate-100 text-slate-600 border-slate-200" },
  PRE_ALERT: { label: "Pre-Alert", class: "bg-purple-100 text-purple-700 border-purple-200" },
};

const priorityConfig: Record<string, { label: string; class: string }> = {
  critical: { label: "Critical", class: "bg-red-600 text-white" },
  high: { label: "High", class: "bg-orange-500 text-white" },
  medium: { label: "Medium", class: "bg-amber-400 text-amber-900" },
  low: { label: "Low", class: "bg-blue-100 text-blue-700" },
};

const typeConfig = {
  SOS: { label: "SOS Emergency", class: "text-red-600", icon: AlertTriangle },
  GEOFENCE_BREACH: { label: "Geofence Breach", class: "text-orange-600", icon: MapPin },
  ANOMALY: { label: "Anomaly Detected", class: "text-amber-600", icon: AlertTriangle },
};

export function AlertDetailDialog({
  open,
  onOpenChange,
  alert,
  onResolve,
  onDispatchPolice,
}: AlertDetailDialogProps) {
  if (!alert) return null;

  const status = statusConfig[alert.status as keyof typeof statusConfig] || statusConfig.PENDING;
  const type = typeConfig[alert.type as keyof typeof typeConfig] || typeConfig.ANOMALY;
  const TypeIcon = type.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TypeIcon className={`w-5 h-5 ${type.class}`} />
            {type.label}
          </DialogTitle>
          <DialogDescription>Alert ID: {alert.id}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Status + Priority Row */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${status.class}`}>
                {status.label}
              </span>
              {alert.priority && priorityConfig[alert.priority] && (
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${priorityConfig[alert.priority].class}`}>
                  {priorityConfig[alert.priority].label} Priority
                </span>
              )}
              {alert.preAlertTriggered && (
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                  Pre-Alert
                </span>
              )}
            </div>
            <span className="text-sm text-slate-500 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {format(new Date(alert.timestamp), "MMM d, yyyy h:mm a")}
            </span>
          </div>

          {/* Escalation & Response Metrics */}
          {(alert.escalationLevel != null || alert.responseTimeMs != null || alert.assignedUnit) && (
            <div className="grid grid-cols-3 gap-3">
              {alert.escalationLevel != null && (
                <div className="p-3 bg-orange-50 rounded-lg text-center">
                  <ArrowUpCircle className="w-4 h-4 mx-auto text-orange-500 mb-1" />
                  <p className="text-xs text-slate-500">Escalation</p>
                  <p className="font-semibold text-orange-700">Level {alert.escalationLevel}</p>
                </div>
              )}
              {alert.responseTimeMs != null && (
                <div className="p-3 bg-blue-50 rounded-lg text-center">
                  <Timer className="w-4 h-4 mx-auto text-blue-500 mb-1" />
                  <p className="text-xs text-slate-500">Response</p>
                  <p className="font-semibold text-blue-700">
                    {alert.responseTimeMs >= 60000
                      ? `${(alert.responseTimeMs / 60000).toFixed(1)}m`
                      : `${(alert.responseTimeMs / 1000).toFixed(0)}s`}
                  </p>
                </div>
              )}
              {alert.assignedUnit && (
                <div className="p-3 bg-emerald-50 rounded-lg text-center">
                  <Shield className="w-4 h-4 mx-auto text-emerald-500 mb-1" />
                  <p className="text-xs text-slate-500">Assigned</p>
                  <p className="font-semibold text-emerald-700 text-xs truncate">{alert.assignedUnit}</p>
                </div>
              )}
            </div>
          )}

          {/* Tourist Info */}
          <div className="p-4 bg-slate-50 rounded-lg space-y-3">
            <h4 className="font-medium text-slate-700 flex items-center gap-2">
              <User className="w-4 h-4" /> Tourist Information
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-slate-500">Name</span>
                <p className="font-medium">{alert.touristName || "Unknown"}</p>
              </div>
              <div>
                <span className="text-slate-500">Tourist ID</span>
                <p className="font-medium font-mono text-xs">{alert.touristId || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="p-4 bg-slate-50 rounded-lg space-y-3">
            <h4 className="font-medium text-slate-700 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Location
            </h4>
            {alert.location ? (
              <div className="text-sm">
                <p className="font-mono text-slate-600">
                  {alert.location.lat.toFixed(6)}, {alert.location.lng.toFixed(6)}
                </p>
                {alert.nearestStationId && (
                  <p className="text-xs text-slate-500 mt-1">
                    Nearest Station: <span className="font-medium">{alert.nearestStationId}</span>
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Location not available</p>
            )}
          </div>

          {/* Message */}
          {alert.message && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h4 className="font-medium text-amber-800 mb-2">Alert Message</h4>
              <p className="text-sm text-amber-700">{alert.message}</p>
            </div>
          )}

          {/* Media Attachments */}
          {alert.media && alert.media.length > 0 && (
            <div className="p-4 bg-slate-50 rounded-lg space-y-2">
              <h4 className="font-medium text-slate-700 flex items-center gap-2">
                <Image className="w-4 h-4" /> Media ({alert.media.length})
              </h4>
              <div className="flex gap-2 flex-wrap">
                {alert.media.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                     className="px-3 py-1.5 text-xs bg-white border rounded hover:bg-slate-100 transition-colors">
                    Attachment {i + 1}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Resolution / Cancellation Info */}
          {(alert.resolvedBy || alert.cancelledAt) && (
            <div className={`p-4 rounded-lg ${alert.cancelledAt ? "bg-slate-50 border border-slate-200" : "bg-emerald-50 border border-emerald-200"}`}>
              {alert.resolvedBy && (
                <p className="text-sm text-emerald-700">
                  <CheckCircle className="w-4 h-4 inline mr-1" />
                  Resolved by: <span className="font-medium">{alert.resolvedBy}</span>
                </p>
              )}
              {alert.cancelledAt && (
                <p className="text-sm text-slate-600">
                  <Ban className="w-4 h-4 inline mr-1" />
                  Cancelled at: <span className="font-medium">{format(new Date(alert.cancelledAt), "MMM d, yyyy h:mm a")}</span>
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {(alert.status === "ACTIVE" || alert.status === "PENDING" || alert.status === "PRE_ALERT") && (
            <>
              {onDispatchPolice && (
                <Button
                  variant="outline"
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  onClick={() => onDispatchPolice(alert.id)}
                >
                  <Shield className="w-4 h-4 mr-1.5" />
                  Dispatch Police
                </Button>
              )}
              {onResolve && (
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => { onResolve(alert.id); onOpenChange(false); }}
                >
                  <CheckCircle className="w-4 h-4 mr-1.5" />
                  Mark Resolved
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
