// src/pages/user/map/components/hospital-markers.tsx
import { memo, useState } from "react";
import { Marker, Popup } from "react-map-gl/mapbox";
import { HeartPulse, Phone, Clock, Navigation, MapPin, Ambulance } from "lucide-react";
import { hapticFeedback } from "@/lib/store";
import { HospitalIcon } from "./map-icons";
import { formatDistance } from "../types";
import type { Hospital } from "../types";

interface HospitalMarkersProps {
  hospitals: Hospital[];
}

function openExternal(lat: number, lng: number, name: string) {
  hapticFeedback("light");
  window.open(
    `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(name)}`,
    "_blank"
  );
}

const TYPE_LABELS: Record<string, string> = {
  hospital: "Hospital",
  clinic: "Clinic",
  pharmacy: "Pharmacy",
};

function HospitalMarkerItem({ h }: { h: Hospital }) {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <>
      <Marker
        latitude={h.position[0]}
        longitude={h.position[1]}
        anchor="bottom"
        onClick={(e: any) => {
          e.originalEvent.stopPropagation();
          hapticFeedback("light");
          setShowPopup(!showPopup);
        }}
      >
        <HospitalIcon />
      </Marker>

      {showPopup && (
        <Popup
          latitude={h.position[0]}
          longitude={h.position[1]}
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
              style={{ background: "linear-gradient(135deg,rgba(190,18,60,0.8),rgba(225,29,72,0.6))" }}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/15">
                <HeartPulse className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{h.name}</p>
                <p className="text-[10px] text-rose-200">{TYPE_LABELS[h.type] ?? "Medical"}</p>
              </div>
              {/* Emergency badge with pulse dot */}
              {h.emergency && (
                <div
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                  style={{
                    background: "rgba(239,68,68,0.2)",
                    border: "1px solid rgba(239,68,68,0.4)",
                    color: "#f87171",
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ background: "#f87171" }}
                  />
                  24/7
                </div>
              )}
            </div>

            {/* Body */}
            <div className="px-4 py-3 space-y-2">
              {h.contact && (
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                  <span className="text-xs text-slate-300">{h.contact}</span>
                </div>
              )}
              {h.distance !== undefined && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                  <span className="text-xs text-slate-300">{formatDistance(h.distance)}</span>
                  {h.eta && (
                    <span className="ml-auto flex items-center gap-1 text-[10px] text-slate-400">
                      <Clock className="h-3 w-3" />{h.eta}
                    </span>
                  )}
                </div>
              )}
              {h.ambulanceAvailable && (
                <div className="flex items-center gap-2">
                  <Ambulance className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                  <span className="text-xs text-emerald-400 font-medium">Ambulance available</span>
                </div>
              )}
              {h.specialties && h.specialties.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {h.specialties.slice(0, 3).map((sp) => (
                    <span
                      key={sp}
                      className="text-[9px] px-1.5 py-0.5 rounded-full"
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#94a3b8",
                      }}
                    >
                      {sp}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-4 pb-3 flex gap-2">
              {h.contact && (
                <a href={`tel:${h.contact}`} className="flex-1">
                  <button
                    className="w-full h-8 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all active:scale-95"
                    style={{
                      background: "linear-gradient(135deg,#be123c,#e11d48)",
                      color: "white",
                      boxShadow: "0 2px 8px rgba(225,29,72,0.4)",
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
                onClick={() => openExternal(h.position[0], h.position[1], h.name)}
                aria-label={`Navigate to ${h.name}`}
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

function HospitalMarkersInner({ hospitals }: HospitalMarkersProps) {
  return (
    <>
      {hospitals.map((h) => (
        <HospitalMarkerItem key={`hospital-${h.id}`} h={h} />
      ))}
    </>
  );
}

export const HospitalMarkers = memo(HospitalMarkersInner);