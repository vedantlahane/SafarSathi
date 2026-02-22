// src/pages/user/map/components/zone-overlay.tsx
import { memo } from "react";
import { Circle, Tooltip } from "react-leaflet";
import { getZoneColor, type RiskZone } from "../types";

interface ZoneOverlayProps {
  zones: RiskZone[];
  onZoneClick: (zone: RiskZone) => void;
}

function ZoneOverlayInner({ zones, onZoneClick }: ZoneOverlayProps) {
  return (
    <>
      {zones.map((zone) => {
        const c = getZoneColor(zone.riskLevel);
        return (
          <Circle
            key={`zone-${zone.id}`}
            center={[zone.centerLat, zone.centerLng]}
            radius={zone.radiusMeters}
            pathOptions={{
              color: c.stroke,
              fillColor: c.fill,
              fillOpacity: 0.12,
              weight: 2,
            }}
            eventHandlers={{ click: () => onZoneClick(zone) }}
          >
            <Tooltip direction="center" permanent={false}>
              <span className="text-xs font-medium">
                {zone.name} · {zone.riskLevel ?? "Medium"} Risk
              </span>
            </Tooltip>
          </Circle>
        );
      })}
    </>
  );
}

export const ZoneOverlay = memo(ZoneOverlayInner);