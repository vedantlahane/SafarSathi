import { format } from "date-fns";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  Activity,
  AlertTriangle,
  Navigation,
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
import type { Tourist } from "../types";

interface TouristDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tourist: Tourist | null;
  onContact?: (tourist: Tourist) => void;
  onTrack?: (tourist: Tourist) => void;
  onSendAlert?: (tourist: Tourist) => void;
}

const riskColors = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export function TouristDetailDialog({
  open,
  onOpenChange,
  tourist,
  onContact,
  onTrack,
  onSendAlert,
}: TouristDetailDialogProps) {
  if (!tourist) return null;

  const risk = tourist.riskLevel || "low";
  const riskClass = riskColors[risk as keyof typeof riskColors] || riskColors.low;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                {tourist.name?.charAt(0) || "T"}
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${tourist.isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
            </div>
            <div>
              <span className="block">{tourist.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${riskClass}`}>
                {risk.charAt(0).toUpperCase() + risk.slice(1)} Risk
              </span>
            </div>
          </DialogTitle>
          <DialogDescription>Tourist ID: {tourist.id}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Contact Info */}
          <div className="p-4 bg-slate-50 rounded-lg space-y-3">
            <h4 className="font-medium text-slate-700">Contact Information</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{tourist.phoneNumber || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="truncate">{tourist.email || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Location & Activity */}
          <div className="p-4 bg-slate-50 rounded-lg space-y-3">
            <h4 className="font-medium text-slate-700 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Current Location
            </h4>
            {tourist.lastLocation ? (
              <p className="text-sm font-mono text-slate-600">
                {tourist.lastLocation.coordinates[1].toFixed(6)}, {tourist.lastLocation.coordinates[0].toFixed(6)}
              </p>
            ) : (
              <p className="text-sm text-slate-500">Location not available</p>
            )}
          </div>

          {/* Status Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                <Activity className="w-4 h-4" /> Status
              </div>
              <p className={`font-medium ${tourist.isActive ? "text-emerald-600" : "text-slate-500"}`}>
                {tourist.isActive ? "Online" : "Offline"}
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                <Clock className="w-4 h-4" /> Last Seen
              </div>
              <p className="font-medium text-slate-700">
                {tourist.lastSeen
                  ? format(new Date(tourist.lastSeen), "MMM d, h:mm a")
                  : "N/A"}
              </p>
            </div>
          </div>

          {/* Emergency Contact */}
          {tourist.emergencyContact && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Emergency Contact
              </h4>
              <p className="text-sm text-red-700">
                {tourist.emergencyContact.name}: {tourist.emergencyContact.phone}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {onContact && (
            <Button
              variant="outline"
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
              onClick={() => onContact(tourist)}
            >
              <Phone className="w-4 h-4 mr-1.5" />
              Contact
            </Button>
          )}
          {onTrack && (
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => { onTrack(tourist); onOpenChange(false); }}
            >
              <Navigation className="w-4 h-4 mr-1.5" />
              Track on Map
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
