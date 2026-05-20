// src/pages/user/map/components/station-markers.tsx
import { memo, useState } from "react";
import { Marker, Popup } from "react-map-gl/mapbox";
import { Shield, Phone, Clock, Navigation, MapPin, CheckCircle2, XCircle } from "lucide-react";
import { hapticFeedback } from "@/lib/store";
import { PoliceIcon } from "./map-icons";
import { formatDistance } from "../types";
import type { PoliceStation } from "../types";

interface StationMarkersProps {
  stations: PoliceStation[];
}

function openExternal(lat: number, lng: number, name: string) {
  hapticFeedback("light");
  window.open(
    `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(name)}`,
    "_blank"
  );
}

function StationMarkerItem({ s }: { s: PoliceStation }) {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <>
      <Marker
        latitude={s.position[0]}
        longitude={s.position[1]}
        anchor="bottom"
        onClick={(e: any) => {
          e.originalEvent.stopPropagation();
          hapticFeedback("light");
          setShowPopup(!showPopup);
        }}
      >
        <PoliceIcon />
      </Marker>

      {showPopup && (
        <Popup
          latitude={s.position[0]}
          longitude={s.position[1]}
          closeButton={false}
          closeOnClick={true}
          onClose={() => setShowPopup(false)}
          anchor="top"
          offset={16}
          className="map-popup-override"
        >
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              minWidth: 220,
              background: "rgba(15,23,42,0.92)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
            }}
          >
            {/* Header */}
            <div
              className="px-4 py-3 flex items-center gap-3"
              style={{ background: "linear-gradient(135deg,rgba(30,64,175,0.8),rgba(37,99,235,0.6))" }}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/15">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{s.name}</p>
                <p className="text-[10px] text-blue-200">Police Station</p>
              </div>
              {/* Status pill */}
              <div
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                style={{
                  background: s.available ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)",
                  border: `1px solid ${s.available ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.4)"}`,
                  color: s.available ? "#34d399" : "#f87171",
                }}
              >
                {s.available
                  ? <CheckCircle2 className="h-2.5 w-2.5" />
                  : <XCircle className="h-2.5 w-2.5" />}
                {s.available ? "Active" : "Inactive"}
              </div>
            </div>

            {/* Body */}
            <div className="px-4 py-3 space-y-2">
              {s.contact && (
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                  <span className="text-xs text-slate-300">{s.contact}</span>
                </div>
              )}
              {s.distance !== undefined && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                  <span className="text-xs text-slate-300">{formatDistance(s.distance)}</span>
                  {s.eta && (
                    <span className="ml-auto flex items-center gap-1 text-[10px] text-slate-400">
                      <Clock className="h-3 w-3" />{s.eta}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-4 pb-3 flex gap-2">
              {s.contact && (
                <a href={`tel:${s.contact}`} className="flex-1">
                  <button
                    className="w-full h-8 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all active:scale-95"
                    style={{
                      background: "linear-gradient(135deg,#1d4ed8,#2563eb)",
                      color: "white",
                      boxShadow: "0 2px 8px rgba(37,99,235,0.4)",
                    }}
                  >
                    <Phone className="h-3 w-3" /> Call
                  </button>
                </a>
              )}
              <button
                className="h-8 w-8 rounded-xl flex items-center justify-center transition-all active:scale-95"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#94a3b8",
                }}
                onClick={() => openExternal(s.position[0], s.position[1], s.name)}
                aria-label={`Navigate to ${s.name}`}
              >
                <Navigation className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </Popup>
      )}
    </>
  );
}

function StationMarkersInner({ stations }: StationMarkersProps) {
  return (
    <>
      {stations.map((s) => (
        <StationMarkerItem key={`police-${s.id}`} s={s} />
      ))}
    </>
  );
}

export const StationMarkers = memo(StationMarkersInner);