// src/pages/user/map/components/tourist-poi-markers.tsx
import { memo, useState } from "react";
import { Marker, Popup } from "react-map-gl/mapbox";
import { MapPin, Phone, Globe, Clock, Navigation, ExternalLink } from "lucide-react";
import { hapticFeedback } from "@/lib/store";
import { POIIcon, POI_LABELS } from "./poi-icons";
import type { TouristPOI } from "@/lib/api/public";

interface TouristPOIMarkersProps {
  pois: TouristPOI[];
}

// Colour accent per POI category for the popup header
const HEADER_BG: Record<string, string> = {
  gurudwara:    "linear-gradient(135deg,rgba(180,83,9,0.85),rgba(217,119,6,0.65))",
  temple:       "linear-gradient(135deg,rgba(185,28,28,0.85),rgba(220,38,38,0.65))",
  mosque:       "linear-gradient(135deg,rgba(6,95,70,0.85),rgba(5,150,105,0.65))",
  church:       "linear-gradient(135deg,rgba(30,58,138,0.85),rgba(29,78,216,0.65))",
  attraction:   "linear-gradient(135deg,rgba(124,58,237,0.85),rgba(139,92,246,0.65))",
  monument:     "linear-gradient(135deg,rgba(107,114,128,0.85),rgba(156,163,175,0.65))",
  museum:       "linear-gradient(135deg,rgba(146,64,14,0.85),rgba(180,83,9,0.65))",
  fort:         "linear-gradient(135deg,rgba(120,53,15,0.85),rgba(217,119,6,0.65))",
  hotel:        "linear-gradient(135deg,rgba(3,105,161,0.85),rgba(2,132,199,0.65))",
  tourist_info: "linear-gradient(135deg,rgba(21,128,61,0.85),rgba(22,163,74,0.65))",
  fire_station: "linear-gradient(135deg,rgba(185,28,28,0.85),rgba(239,68,68,0.65))",
  pharmacy:     "linear-gradient(135deg,rgba(13,148,136,0.85),rgba(20,184,166,0.65))",
};

function POIMarkerItem({ poi }: { poi: TouristPOI }) {
  const [showPopup, setShowPopup] = useState(false);
  const label = POI_LABELS[poi.type] ?? poi.type;
  const headerBg = HEADER_BG[poi.type] ?? HEADER_BG.attraction;

  return (
    <>
      <Marker
        latitude={poi.latitude}
        longitude={poi.longitude}
        anchor="bottom"
        onClick={(e: any) => {
          e.originalEvent.stopPropagation();
          hapticFeedback("light");
          setShowPopup(!showPopup);
        }}
      >
        <POIIcon type={poi.type} />
      </Marker>

      {showPopup && (
        <Popup
          latitude={poi.latitude}
          longitude={poi.longitude}
          closeButton={false}
          closeOnClick
          onClose={() => setShowPopup(false)}
          anchor="top"
          offset={14}
          className="map-popup-override"
        >
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              minWidth: 210,
              maxWidth: 270,
              background: "rgba(15,23,42,0.93)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.45)",
            }}
          >
            {/* Header */}
            <div className="px-3 py-2.5 flex items-center gap-2.5" style={{ background: headerBg }}>
              <span style={{ fontSize: 20 }}>{poi.type === "gurudwara" ? "🛕"
                : poi.type === "temple" ? "⛩️"
                : poi.type === "mosque" ? "🕌"
                : poi.type === "church" ? "⛪"
                : poi.type === "museum" ? "🏛️"
                : poi.type === "fort" ? "🏯"
                : poi.type === "fire_station" ? "🚒"
                : poi.type === "pharmacy" ? "💊"
                : poi.type === "hotel" ? "🏨"
                : poi.type === "tourist_info" ? "ℹ️"
                : poi.type === "monument" ? "🗿"
                : "📍"}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white leading-tight truncate">{poi.name}</p>
                <p className="text-[10px] text-white/60 mt-0.5">{label}</p>
              </div>
            </div>

            {/* Body */}
            <div className="px-3 py-2.5 space-y-1.5">
              {(poi.city || poi.district) && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                  <span className="text-[11px] text-slate-300 truncate">
                    {poi.city}{poi.district && poi.district !== poi.city ? `, ${poi.district}` : ""}
                  </span>
                </div>
              )}
              {poi.phone && poi.phone !== "N/A" && (
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                  <span className="text-[11px] text-slate-300">{poi.phone}</span>
                </div>
              )}
              {poi.openingHours && (
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-slate-400 shrink-0" />
                  <span className="text-[11px] text-slate-300">{poi.openingHours}</span>
                </div>
              )}
              {poi.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-3 w-3 text-slate-400 shrink-0" />
                  <a
                    href={poi.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-blue-400 hover:underline truncate"
                  >
                    {poi.website.replace(/^https?:\/\//, "").slice(0, 28)}
                  </a>
                </div>
              )}
              {poi.description && (
                <p className="text-[10px] text-slate-400 mt-0.5 leading-snug line-clamp-2">
                  {poi.description}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="px-3 pb-3 flex gap-1.5">
              <button
                className="flex-1 h-7 rounded-xl text-[11px] font-medium flex items-center justify-center gap-1 transition-all active:scale-95"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#94a3b8",
                }}
                onClick={() => {
                  hapticFeedback("light");
                  window.open(
                    `https://www.google.com/maps/dir/?api=1&destination=${poi.latitude},${poi.longitude}`,
                    "_blank"
                  );
                }}
              >
                <Navigation className="h-3 w-3" /> Navigate
              </button>
              {poi.website && (
                <button
                  className="h-7 w-7 rounded-xl flex items-center justify-center transition-all active:scale-95"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#94a3b8",
                  }}
                  onClick={() => window.open(poi.website, "_blank")}
                >
                  <ExternalLink className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        </Popup>
      )}
    </>
  );
}

function TouristPOIMarkersInner({ pois }: TouristPOIMarkersProps) {
  return (
    <>
      {pois.map((p) => (
        <POIMarkerItem key={`poi-${p.osmId ?? p._id}`} poi={p} />
      ))}
    </>
  );
}

export const TouristPOIMarkers = memo(TouristPOIMarkersInner);
