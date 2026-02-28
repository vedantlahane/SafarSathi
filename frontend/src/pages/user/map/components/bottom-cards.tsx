// src/pages/user/map/components/bottom-cards.tsx
import { memo } from "react";
import {
  Target,
  Shield,
  Phone,
  ExternalLink,
  X,
  Clock,
  MapPin,
  Cross,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Ambulance,
  BedDouble,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { hapticFeedback } from "@/lib/store";
import { formatDistance } from "../types";
import type { Destination, PoliceStation, Hospital, RouteInfo } from "../types";

function openInMaps(lat: number, lng: number, name: string) {
  hapticFeedback("light");
  window.open(
    `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(name)}`,
    "_blank"
  );
}

// ── Destination Bar ──
interface DestinationBarProps {
  destination: Destination;
  routeInfo: RouteInfo;
  onClear: () => void;
}

function DestinationBarInner({
  destination,
  routeInfo,
  onClear,
}: DestinationBarProps) {
  const safest = routeInfo.safest;
  return (
    <div className="absolute bottom-36 left-4 right-4 z-[1000] pointer-events-none">
      <GlassCard level={1} className="overflow-hidden pointer-events-auto">
        <div className="p-3 space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
              <Target className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{destination.name}</p>
              <p className="text-xs text-muted-foreground">Destination</p>
            </div>
            <Button
              size="sm"
              className="h-9 gap-1.5 bg-emerald-500 hover:bg-emerald-600"
              onClick={() =>
                openInMaps(destination.lat, destination.lng, destination.name)
              }
              aria-label="Open in Google Maps"
            >
              <ExternalLink className="h-4 w-4" />
              Navigate
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9"
              onClick={onClear}
              aria-label="Clear destination"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {routeInfo.loading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Calculating safe routes...
            </div>
          )}

          {safest && !routeInfo.loading && (
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="secondary"
                className="text-[10px] gap-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
              >
                <CheckCircle className="h-3 w-3" />
                Safety: {safest.safetyScore}/100
              </Badge>
              <Badge variant="secondary" className="text-[10px] gap-1">
                <MapPin className="h-3 w-3" />
                {formatDistance(safest.distanceMeters)}
              </Badge>
              <Badge variant="secondary" className="text-[10px] gap-1">
                <Clock className="h-3 w-3" />
                {Math.round(safest.durationSeconds / 60)} min
              </Badge>
              {safest.intersections.high > 0 && (
                <Badge
                  variant="destructive"
                  className="text-[10px] gap-1"
                >
                  <AlertTriangle className="h-3 w-3" />
                  {safest.intersections.high} high risk
                </Badge>
              )}
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
export const DestinationBar = memo(DestinationBarInner);

// ── Nearest Station Bar ──
interface NearestStationBarProps {
  station: PoliceStation;
}

function NearestStationBarInner({ station }: NearestStationBarProps) {
  return (
    <div className="absolute bottom-36 left-4 right-[65px] z-[1000] pointer-events-none">
      <GlassCard level={2} className="overflow-hidden pointer-events-auto">
        <div className="p-3 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/40">
            <Shield className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">
              Nearest Police Station
            </p>
            <p className="text-sm font-medium truncate">{station.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              {station.eta && (
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {station.eta}
                </span>
              )}
              {station.distance !== undefined && (
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {formatDistance(station.distance)}
                </span>
              )}
            </div>
          </div>
          {station.contact ? (
            <a href={`tel:${station.contact}`}>
              <Button
                size="sm"
                variant="outline"
                className="h-9 gap-1.5"
                aria-label={`Call ${station.name}`}
              >
                <Phone className="h-4 w-4" />
                Call
              </Button>
            </a>
          ) : null}
        </div>
      </GlassCard>
    </div>
  );
}
export const NearestStationBar = memo(NearestStationBarInner);

// ── Nearest Hospital Bar ──
interface NearestHospitalBarProps {
  hospital: Hospital;
}

function NearestHospitalBarInner({ hospital }: NearestHospitalBarProps) {
  return (
    <div className="absolute bottom-52 left-4 right-[65px] z-[999] pointer-events-none">
      <GlassCard level={2} className="overflow-hidden pointer-events-auto">
        <div className="p-2.5 flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-900/40">
            <Cross className="h-4 w-4 text-rose-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-muted-foreground">
              Nearest Hospital
            </p>
            <p className="text-xs font-medium truncate">{hospital.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              {hospital.eta && (
                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  <Clock className="h-3 w-3" />
                  {hospital.eta}
                </span>
              )}
              {hospital.distance !== undefined && (
                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  <MapPin className="h-3 w-3" />
                  {formatDistance(hospital.distance)}
                </span>
              )}
              {hospital.tier && (
                <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
                  {hospital.tier}
                </Badge>
              )}
              {hospital.availableBeds !== undefined && hospital.bedCapacity !== undefined && (
                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  <BedDouble className="h-3 w-3" />
                  {hospital.availableBeds}/{hospital.bedCapacity}
                </span>
              )}
              {hospital.ambulanceAvailable && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                  <Ambulance className="h-3 w-3" />
                </span>
              )}
            </div>
          </div>
          {hospital.contact ? (
            <a href={`tel:${hospital.contact}`}>
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1 text-[10px]"
                aria-label={`Call ${hospital.name}`}
              >
                <Phone className="h-3 w-3" />
                Call
              </Button>
            </a>
          ) : null}
        </div>
      </GlassCard>
    </div>
  );
}
export const NearestHospitalBar = memo(NearestHospitalBarInner);