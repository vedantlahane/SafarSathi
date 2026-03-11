// src/pages/user/map/components/zone-dialog.tsx
import { memo, useMemo } from "react";
import L from "leaflet";
import {
  AlertTriangle,
  MapPin,
  Navigation,
  Shield,
  Clock,
  Lightbulb,
  Tag,
  Radio,
  Calendar,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  formatDistance,
  formatETA,
  getCategoryIcon,
  getCategoryLabel,
  getSafetyTips,
} from "../types";
import type { RiskZone, PoliceStation, Hospital } from "../types";

interface ZoneDialogProps {
  zone: RiskZone | null;
  onClose: () => void;
  onFlyTo: (pos: [number, number]) => void;
  userPosition: [number, number] | null;
  nearestStation: PoliceStation | null;
  nearestHospital: Hospital | null;
}

function ZoneDialogInner({
  zone,
  onClose,
  onFlyTo,
  userPosition,
  nearestStation,
  nearestHospital,
}: ZoneDialogProps) {
  const level = zone?.riskLevel?.toLowerCase();
  const isCritical = level === "critical";
  const isHighOrCritical = isCritical || level === "high";

  const distanceFromUser = useMemo(() => {
    if (!zone || !userPosition) return null;
    return L.latLng(userPosition).distanceTo(
      L.latLng(zone.centerLat, zone.centerLng)
    );
  }, [zone, userPosition]);

  const isInsideZone = useMemo(() => {
    if (!zone || !userPosition) return false;
    // Polygon: ray-casting point-in-polygon
    if (zone.shapeType === "polygon" && zone.polygonCoordinates?.length) {
      const [py, px] = userPosition;
      const coords = zone.polygonCoordinates;
      let inside = false;
      for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
        const [yi, xi] = coords[i];
        const [yj, xj] = coords[j];
        if (((yi > py) !== (yj > py)) && (px < ((xj - xi) * (py - yi)) / (yj - yi) + xi)) {
          inside = !inside;
        }
      }
      return inside;
    }
    // Circle: distance check
    if (!distanceFromUser) return false;
    return distanceFromUser <= zone.radiusMeters;
  }, [distanceFromUser, zone, userPosition]);

  const safetyTips = useMemo(() => {
    if (!zone) return [];
    return getSafetyTips(zone.riskLevel, zone.category);
  }, [zone]);

  const categoryIcon = getCategoryIcon(zone?.category);
  const categoryLabel = getCategoryLabel(zone?.category);

  return (
    <Dialog open={!!zone} onOpenChange={() => onClose()}>
      <DialogContent className="rounded-3xl max-w-sm mx-4 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle
              className={cn(
                "h-5 w-5",
                isCritical && "text-purple-500",
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
          {/* Danger banner for critical zones or if user is inside */}
          {(isCritical || isInsideZone) && (
            <div
              className={cn(
                "p-3 rounded-xl border text-sm font-medium flex items-center gap-2",
                isCritical
                  ? "bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-950/40 dark:border-purple-800 dark:text-purple-200"
                  : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/40 dark:border-red-800 dark:text-red-200"
              )}
            >
              <Radio className="h-4 w-4 shrink-0 animate-pulse" />
              {isCritical
                ? "CRITICAL — Avoid this area entirely"
                : "You are currently inside this risk zone"}
            </div>
          )}

          {/* Risk level + Category badges */}
          <div className="flex flex-wrap gap-2">
            <Badge
              className={cn(
                isCritical && "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
                level === "high" && "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
                level === "medium" && "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
                level === "low" && "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300"
              )}
            >
              {zone?.riskLevel || "Medium"} Risk
            </Badge>
            {zone?.category && (
              <Badge variant="outline" className="gap-1">
                <span>{categoryIcon}</span>
                {categoryLabel}
              </Badge>
            )}
            {zone?.source && zone.source !== "admin" && (
              <Badge variant="secondary" className="gap-1 text-[10px]">
                <Tag className="h-3 w-3" />
                {zone.source === "ml_pipeline" ? "AI Detected" : "Crowd Report"}
              </Badge>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            {zone?.description ||
              "Stay alert and exercise caution in this area. Keep emergency contacts accessible."}
          </p>

          {/* Zone metadata */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              {zone?.shapeType === "polygon" && zone.polygonCoordinates?.length
                ? `Polygon zone · ${zone.polygonCoordinates.length} vertices`
                : `Radius: ${((zone?.radiusMeters || 0) / 1000).toFixed(1)} km`}
            </div>
            {distanceFromUser !== null && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Navigation className="h-4 w-4 shrink-0" />
                {isInsideZone ? (
                  <span className="text-red-600 font-medium dark:text-red-400">
                    You are inside this zone
                  </span>
                ) : (
                  <>
                    {formatDistance(distanceFromUser)} from you ·{" "}
                    {formatETA(distanceFromUser, "walk")}
                  </>
                )}
              </div>
            )}
            {zone?.expiresAt && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 shrink-0" />
                Expires: {new Date(zone.expiresAt).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Nearest emergency services */}
          {(nearestStation || nearestHospital) && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Nearest Emergency Services
                </p>
                {nearestStation && (
                  <div className="flex items-center gap-2 text-sm p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/30">
                    <Shield className="h-4 w-4 shrink-0 text-blue-500" />
                    <div className="flex-1 min-w-0">
                      <span className="font-medium truncate block">
                        {nearestStation.name}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {nearestStation.eta}
                        {nearestStation.distance !== undefined && (
                          <> · {formatDistance(nearestStation.distance)}</>
                        )}
                      </span>
                    </div>
                    {nearestStation.contact && (
                      <a href={`tel:${nearestStation.contact}`}>
                        <Button size="sm" variant="outline" className="h-7 text-xs">
                          Call
                        </Button>
                      </a>
                    )}
                  </div>
                )}
                {nearestHospital && (
                  <div className="flex items-center gap-2 text-sm p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30">
                    <span className="text-rose-500 shrink-0 text-sm">🏥</span>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium truncate block">
                        {nearestHospital.name}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {nearestHospital.eta}
                        {nearestHospital.distance !== undefined && (
                          <> · {formatDistance(nearestHospital.distance)}</>
                        )}
                      </span>
                    </div>
                    {nearestHospital.contact && (
                      <a href={`tel:${nearestHospital.contact}`}>
                        <Button size="sm" variant="outline" className="h-7 text-xs">
                          Call
                        </Button>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Safety tips */}
          {safetyTips.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <Lightbulb className="h-3.5 w-3.5" />
                  Safety Recommendations
                </p>
                <ul className="space-y-1.5">
                  {safetyTips.map((tip, i) => (
                    <li
                      key={i}
                      className={cn(
                        "text-sm flex items-start gap-2 p-2 rounded-lg",
                        i === 0 && isHighOrCritical
                          ? "bg-red-50 text-red-800 font-medium dark:bg-red-950/30 dark:text-red-300"
                          : "text-muted-foreground"
                      )}
                    >
                      <span className="shrink-0 mt-0.5 text-xs">
                        {i === 0 && isHighOrCritical ? "⚠️" : "•"}
                      </span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          <div className="flex gap-2 pt-2">
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