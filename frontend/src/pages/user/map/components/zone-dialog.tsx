// src/pages/user/map/components/zone-dialog.tsx
import { memo, useMemo } from "react";
import L from "leaflet";
import { AlertTriangle, MapPin, Navigation, Shield, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDistance, formatETA } from "../types";
import type { RiskZone, PoliceStation } from "../types";

interface ZoneDialogProps {
  zone: RiskZone | null;
  onClose: () => void;
  onFlyTo: (pos: [number, number]) => void;
  userPosition: [number, number] | null;
  nearestStation: PoliceStation | null;
}

function ZoneDialogInner({
  zone,
  onClose,
  onFlyTo,
  userPosition,
  nearestStation,
}: ZoneDialogProps) {
  const level = zone?.riskLevel?.toLowerCase();

  const distanceFromUser = useMemo(() => {
    if (!zone || !userPosition) return null;
    return L.latLng(userPosition).distanceTo(
      L.latLng(zone.centerLat, zone.centerLng)
    );
  }, [zone, userPosition]);

  return (
    <Dialog open={!!zone} onOpenChange={() => onClose()}>
      <DialogContent className="rounded-3xl max-w-sm mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle
              className={cn(
                "h-5 w-5",
                level === "high" && "text-red-500",
                level === "medium" && "text-amber-500",
                level === "low" && "text-yellow-500"
              )}
            />
            {zone?.name}
          </DialogTitle>
          <DialogDescription>
            Risk zone details and safety information
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Badge
            className={cn(
              level === "high" && "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
              level === "medium" && "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
              level === "low" && "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300"
            )}
          >
            {zone?.riskLevel || "Medium"} Risk Zone
          </Badge>

          <p className="text-sm text-muted-foreground">
            {zone?.description ||
              "Stay alert and exercise caution in this area. Keep emergency contacts accessible."}
          </p>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              Radius: {((zone?.radiusMeters || 0) / 1000).toFixed(1)} km
            </div>
            {distanceFromUser !== null && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Navigation className="h-4 w-4 shrink-0" />
                {formatDistance(distanceFromUser)} from you ·{" "}
                {formatETA(distanceFromUser, "walk")}
              </div>
            )}
            {nearestStation && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 shrink-0 text-blue-500" />
                Nearest: {nearestStation.name}
                {nearestStation.eta && (
                  <>
                    {" · "}
                    <Clock className="h-3 w-3 inline" /> {nearestStation.eta}
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={() => {
                if (zone) onFlyTo([zone.centerLat, zone.centerLng]);
                onClose();
              }}
            >
              <Navigation className="h-4 w-4 mr-2" />
              View on Map
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export const ZoneDialog = memo(ZoneDialogInner);