// src/pages/user/map/components/bottom-cards.tsx
import { memo } from "react";
import { motion, AnimatePresence } from "motion/react";
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
} from "lucide-react";
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
  onStartNavigation: () => void;
}

function DestinationBarInner({
  destination,
  routeInfo,
  onClear,
  onStartNavigation,
}: DestinationBarProps) {
  const safest = routeInfo.safest;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 100, opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="absolute bottom-[100px] left-4 right-4 z-[1000] pointer-events-none"
      >
        <div className="rounded-3xl overflow-hidden pointer-events-auto bg-white/80 dark:bg-black/60 backdrop-blur-3xl backdrop-saturate-200 border border-white/20 dark:border-white/10 shadow-2xl">
          <div className="p-4 space-y-3 relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                <Target className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold truncate text-slate-900 dark:text-slate-100">{destination.name}</p>
                <p className="text-xs text-slate-500 font-medium">Destination</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-10 w-10 p-0 rounded-xl bg-white/50 dark:bg-black/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all active:scale-95"
                  onClick={() =>
                    openInMaps(destination.lat, destination.lng, destination.name)
                  }
                  aria-label="Open in Google Maps"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  className="h-10 px-4 rounded-xl gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-emerald-500/25 shadow-lg transition-all active:scale-95"
                  onClick={onStartNavigation}
                  aria-label="Start active navigation"
                >
                  Start
                </Button>
              </div>
              <button
                className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors active:scale-90 text-slate-600 dark:text-slate-300"
                onClick={onClear}
                aria-label="Clear destination"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {routeInfo.loading && (
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full w-fit">
                <Loader2 className="h-3 w-3 animate-spin" />
                Calculating safe routes...
              </div>
            )}

            {safest && !routeInfo.loading && (
              <div className="flex items-center gap-2 flex-wrap pt-1 relative z-10">
                <Badge
                  variant="secondary"
                  className="text-[11px] font-bold px-2.5 py-1 gap-1.5 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  Safety: {safest.safetyScore}/100
                </Badge>
                <Badge variant="outline" className="text-[11px] font-medium px-2.5 py-1 gap-1.5 bg-white/50 dark:bg-black/20 border-white/20">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {formatDistance(safest.distanceMeters)}
                </Badge>
                <Badge variant="outline" className="text-[11px] font-medium px-2.5 py-1 gap-1.5 bg-white/50 dark:bg-black/20 border-white/20">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  {Math.round(safest.durationSeconds / 60)} min
                </Badge>
                {safest.intersections.high > 0 && (
                  <Badge
                    variant="destructive"
                    className="text-[11px] font-medium px-2.5 py-1 gap-1.5 bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/20"
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {safest.intersections.high} high risk
                  </Badge>
                )}
                {(safest.intersections as any).critical > 0 && (
                  <Badge
                    className="text-[11px] font-bold px-2.5 py-1 gap-1.5 bg-red-500 text-white shadow-lg shadow-red-500/30"
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {(safest.intersections as any).critical} critical
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
export const DestinationBar = memo(DestinationBarInner);

// ── Nearest Station Bar ──
interface NearestStationBarProps {
  station: PoliceStation;
  className?: string;
  onDismiss?: () => void;
}

function NearestStationBarInner({ station, className, onDismiss }: NearestStationBarProps) {
  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 30, delay: 0.1 }}
      className={`absolute left-4 right-[68px] z-[998] pointer-events-none ${className || "bottom-[100px]"}`}
    >
      <div className="rounded-2xl overflow-hidden pointer-events-auto bg-white/80 dark:bg-black/60 backdrop-blur-2xl backdrop-saturate-200 border border-white/20 dark:border-white/10 shadow-xl">
        <div className="p-3.5 flex items-center gap-3 relative overflow-hidden">
          <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 relative z-10">
            <Shield className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0 relative z-10">
            <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Nearest Police
            </p>
            <p className="text-sm font-bold truncate text-slate-900 dark:text-slate-100">{station.name}</p>
            <div className="flex items-center gap-2 mt-1">
              {station.eta && (
                <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {station.eta}
                </span>
              )}
              {station.distance !== undefined && (
                <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5 border-l border-slate-300 dark:border-slate-700 pl-2">
                  <MapPin className="h-3.5 w-3.5" />
                  {formatDistance(station.distance)}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 relative z-10 shrink-0">
            {station.contact ? (
              <a href={`tel:${station.contact}`}>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-10 px-3 rounded-xl gap-2 bg-white/50 dark:bg-black/50 border-blue-200 dark:border-blue-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                  aria-label={`Call ${station.name}`}
                >
                  <Phone className="h-4 w-4" />
                  Call
                </Button>
              </a>
            ) : null}
            {onDismiss && (
              <button
                className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-500 dark:text-slate-400 transition-colors pointer-events-auto active:scale-90"
                onClick={onDismiss}
                aria-label="Dismiss police panel"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
export const NearestStationBar = memo(NearestStationBarInner);

// ── Nearest Hospital Bar ──
interface NearestHospitalBarProps {
  hospital: Hospital;
  className?: string;
  onDismiss?: () => void;
}

function NearestHospitalBarInner({ hospital, className, onDismiss }: NearestHospitalBarProps) {
  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 30, delay: 0.2 }}
      className={`absolute left-4 right-[68px] z-[997] pointer-events-none ${className || "bottom-[176px]"}`}
    >
      <div className="rounded-2xl overflow-hidden pointer-events-auto bg-white/80 dark:bg-black/60 backdrop-blur-2xl backdrop-saturate-200 border border-white/20 dark:border-white/10 shadow-xl">
        <div className="p-3.5 flex items-center gap-3 relative overflow-hidden">
          <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-rose-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 relative z-10">
            <Cross className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0 relative z-10">
            <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              Nearest Hospital
            </p>
            <p className="text-sm font-bold truncate text-slate-900 dark:text-slate-100">{hospital.name}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {hospital.eta && (
                <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {hospital.eta}
                </span>
              )}
              {hospital.distance !== undefined && (
                <span className="text-xs font-medium text-slate-500 flex items-center gap-1 border-l border-slate-300 dark:border-slate-700 pl-2">
                  <MapPin className="h-3.5 w-3.5" />
                  {formatDistance(hospital.distance)}
                </span>
              )}
              {hospital.tier && (
                <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 bg-rose-500/10 text-rose-600 dark:text-rose-400 border-0">
                  {hospital.tier}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 relative z-10 shrink-0">
            {hospital.contact ? (
              <a href={`tel:${hospital.contact}`}>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-10 px-3 rounded-xl gap-2 bg-white/50 dark:bg-black/50 border-rose-200 dark:border-rose-800/50 hover:bg-rose-50 dark:hover:bg-rose-900/30 text-rose-700 dark:text-rose-400"
                  aria-label={`Call ${hospital.name}`}
                >
                  <Phone className="h-4 w-4" />
                  Call
                </Button>
              </a>
            ) : null}
            {onDismiss && (
              <button
                className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-500 dark:text-slate-400 transition-colors pointer-events-auto active:scale-90"
                onClick={onDismiss}
                aria-label="Dismiss hospital panel"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
export const NearestHospitalBar = memo(NearestHospitalBarInner);