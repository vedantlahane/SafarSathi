// src/pages/user/map/components/poi-icons.tsx
import type { TouristPOIType } from "@/lib/api/public";

const ICON_MAP: Record<TouristPOIType, { bg: string; shadow: string; emoji: string }> = {
  gurudwara:    { bg: "linear-gradient(135deg,#b45309,#d97706)", shadow: "rgba(217,119,6,0.55)", emoji: "🛕" },
  temple:       { bg: "linear-gradient(135deg,#b91c1c,#dc2626)", shadow: "rgba(220,38,38,0.45)", emoji: "⛩️" },
  mosque:       { bg: "linear-gradient(135deg,#065f46,#059669)", shadow: "rgba(5,150,105,0.45)", emoji: "🕌" },
  church:       { bg: "linear-gradient(135deg,#1e3a8a,#1d4ed8)", shadow: "rgba(29,78,216,0.45)", emoji: "⛪" },
  attraction:   { bg: "linear-gradient(135deg,#7c3aed,#8b5cf6)", shadow: "rgba(139,92,246,0.45)", emoji: "📍" },
  monument:     { bg: "linear-gradient(135deg,#6b7280,#9ca3af)", shadow: "rgba(107,114,128,0.45)", emoji: "🗿" },
  museum:       { bg: "linear-gradient(135deg,#92400e,#b45309)", shadow: "rgba(146,64,14,0.45)", emoji: "🏛️" },
  fort:         { bg: "linear-gradient(135deg,#78350f,#d97706)", shadow: "rgba(120,53,15,0.45)", emoji: "🏯" },
  hotel:        { bg: "linear-gradient(135deg,#0369a1,#0284c7)", shadow: "rgba(2,132,199,0.45)", emoji: "🏨" },
  tourist_info: { bg: "linear-gradient(135deg,#15803d,#16a34a)", shadow: "rgba(22,163,74,0.45)", emoji: "ℹ️" },
  fire_station: { bg: "linear-gradient(135deg,#b91c1c,#ef4444)", shadow: "rgba(239,68,68,0.55)", emoji: "🚒" },
  pharmacy:     { bg: "linear-gradient(135deg,#0d9488,#14b8a6)", shadow: "rgba(20,184,166,0.45)", emoji: "💊" },
};

export function POIIcon({ type }: { type: TouristPOIType }) {
  const cfg = ICON_MAP[type] ?? ICON_MAP.attraction;
  return (
    <div className="relative cursor-pointer group">
      <div
        className="absolute inset-0 rounded-full opacity-20 blur-sm scale-150"
        style={{ background: cfg.bg }}
      />
      <div
        className="relative flex items-center justify-center w-8 h-8 rounded-full border-2 border-white"
        style={{
          background: cfg.bg,
          boxShadow: `0 3px 12px ${cfg.shadow}, 0 1px 3px rgba(0,0,0,0.3)`,
          fontSize: 15,
          lineHeight: 1,
        }}
      >
        <span role="img" aria-label={type} style={{ userSelect: "none" }}>
          {cfg.emoji}
        </span>
      </div>
      <div
        className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-0 h-0"
        style={{
          borderLeft: "4px solid transparent",
          borderRight: "4px solid transparent",
          borderTop: `6px solid ${cfg.bg.includes("#d97706") ? "#d97706" : cfg.bg.match(/#[0-9a-f]{6}/gi)?.[1] ?? "#6b7280"}`,
          filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.3))",
        }}
      />
    </div>
  );
}

export const POI_LABELS: Record<TouristPOIType, string> = {
  gurudwara:    "Gurudwara",
  temple:       "Temple",
  mosque:       "Mosque",
  church:       "Church",
  attraction:   "Tourist Attraction",
  monument:     "Monument",
  museum:       "Museum",
  fort:         "Fort / Heritage",
  hotel:        "Hotel",
  tourist_info: "Tourist Info",
  fire_station: "Fire Station",
  pharmacy:     "Pharmacy",
};
