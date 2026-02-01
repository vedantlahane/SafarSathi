import { format } from "date-fns";
import {
  AlertTriangle,
  MapPin,
  Phone,
  User,
  Clock,
  CheckCircle,
  Shield,
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
  onResolve?: (alertId: string) => void;
  onDispatchPolice?: (alertId: string) => void;
}

const statusConfig = {
  ACTIVE: { label: "Active", class: "bg-red-100 text-red-700 border-red-200" },
  PENDING: { label: "Pending", class: "bg-amber-100 text-amber-700 border-amber-200" },
  RESOLVED: { label: "Resolved", class: "bg-emerald-100 text-emerald-700 border-emerald-200" },
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
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${status.class}`}>
              {status.label}
            </span>
            <span className="text-sm text-slate-500 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {format(new Date(alert.timestamp), "MMM d, yyyy h:mm a")}
            </span>
          </div>

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
                <span className="text-slate-500">Phone</span>
                <p className="font-medium">{alert.touristPhone || "N/A"}</p>
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
                  {alert.location.coordinates[1].toFixed(6)}, {alert.location.coordinates[0].toFixed(6)}
                </p>
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
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {alert.status === "ACTIVE" && (
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
