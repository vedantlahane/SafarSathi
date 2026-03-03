// src/pages/user/map/components/zone-overlay.tsx
import { memo, useEffect, useRef } from "react";
import { Circle, Polygon as LeafletPolygon, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import { getZoneColor, getZoneOpacity, getCategoryIcon, getCategoryLabel, type RiskZone } from "../types";

interface ZoneOverlayProps {
  zones: RiskZone[];
  onZoneClick: (zone: RiskZone) => void;
  userPosition: [number, number] | null;
}

// Pulsing circle/polygon for critical/high risk zones
function PulsingRing({ zone }: { zone: RiskZone }) {
  const map = useMap();
  const ref = useRef<L.Circle | L.Polygon | null>(null);
  const level = zone.riskLevel?.toLowerCase();
  const shouldPulse = level === "critical" || level === "high";
  const isPolygon = zone.shapeType === "polygon" && zone.polygonCoordinates?.length;

  useEffect(() => {
    if (!shouldPulse) return;

    const c = getZoneColor(zone.riskLevel);
    const opts: L.PathOptions = {
      color: c.stroke,
      fillColor: "transparent",
      fillOpacity: 0,
      weight: 2,
      opacity: 0.6,
      dashArray: level === "critical" ? "8 6" : "12 8",
      className: level === "critical" ? "zone-pulse-critical" : "zone-pulse-high",
    };

    let layer: L.Circle | L.Polygon;
    if (isPolygon) {
      layer = L.polygon(
        zone.polygonCoordinates!.map(([lat, lng]) => [lat, lng] as L.LatLngTuple),
        opts
      );
    } else {
      layer = L.circle([zone.centerLat, zone.centerLng], {
        ...opts,
        radius: zone.radiusMeters,
      });
    }
    layer.addTo(map);
    ref.current = layer;

    return () => {
      map.removeLayer(layer);
    };
  }, [map, zone, shouldPulse, level, isPolygon]);

  return null;
}

// Proximity warning ring — shows a fading outer ring when user is approaching
function ProximityRing({
  zone,
  userPosition,
}: {
  zone: RiskZone;
  userPosition: [number, number] | null;
}) {
  if (!userPosition) return null;
  const isPolygon = zone.shapeType === "polygon" && zone.polygonCoordinates?.length;

  if (isPolygon) {
    // For polygons, check if user is near the polygon centroid as a rough proxy
    const dist = L.latLng(userPosition).distanceTo(
      L.latLng(zone.centerLat, zone.centerLng)
    );
    // Use a rough bounding radius: max distance from centroid to any vertex
    const maxVertexDist = Math.max(
      ...zone.polygonCoordinates!.map(([lat, lng]) =>
        L.latLng(zone.centerLat, zone.centerLng).distanceTo(L.latLng(lat, lng))
      )
    );
    const approachThreshold = maxVertexDist * 1.5;
    if (dist > approachThreshold || dist <= maxVertexDist * 0.5) return null;

    const proximityRatio = 1 - (dist - maxVertexDist) / (approachThreshold - maxVertexDist);
    const c = getZoneColor(zone.riskLevel);

    // Show a larger polygon outline
    const scaledCoords = zone.polygonCoordinates!.map(([lat, lng]) => {
      const dLat = lat - zone.centerLat;
      const dLng = lng - zone.centerLng;
      return [zone.centerLat + dLat * 1.5, zone.centerLng + dLng * 1.5] as [number, number];
    });

    return (
      <LeafletPolygon
        positions={scaledCoords}
        pathOptions={{
          color: c.stroke,
          fillColor: "transparent",
          fillOpacity: 0,
          weight: 1.5,
          opacity: 0.15 + Math.max(0, proximityRatio) * 0.35,
          dashArray: "4 8",
        }}
      />
    );
  }

  const dist = L.latLng(userPosition).distanceTo(
    L.latLng(zone.centerLat, zone.centerLng)
  );
  const approachThreshold = zone.radiusMeters * 1.5;
  if (dist > approachThreshold || dist <= zone.radiusMeters) return null;

  const proximityRatio = 1 - (dist - zone.radiusMeters) / (approachThreshold - zone.radiusMeters);
  const c = getZoneColor(zone.riskLevel);

  return (
    <Circle
      center={[zone.centerLat, zone.centerLng]}
      radius={approachThreshold}
      pathOptions={{
        color: c.stroke,
        fillColor: "transparent",
        fillOpacity: 0,
        weight: 1.5,
        opacity: 0.15 + proximityRatio * 0.35,
        dashArray: "4 8",
      }}
    />
  );
}

function ZoneOverlayInner({ zones, onZoneClick, userPosition }: ZoneOverlayProps) {
  return (
    <>
      {/* CSS for pulsing animation (injected once) */}
      <style>{`
        .zone-pulse-critical {
          animation: zonePulseCritical 1.5s ease-in-out infinite;
        }
        .zone-pulse-high {
          animation: zonePulseHigh 2s ease-in-out infinite;
        }
        @keyframes zonePulseCritical {
          0%, 100% { opacity: 0.7; stroke-width: 3; }
          50% { opacity: 0.2; stroke-width: 1; }
        }
        @keyframes zonePulseHigh {
          0%, 100% { opacity: 0.5; stroke-width: 2.5; }
          50% { opacity: 0.15; stroke-width: 1; }
        }
      `}</style>

      {zones.map((zone) => {
        const c = getZoneColor(zone.riskLevel);
        const opacity = getZoneOpacity(zone.riskLevel);
        const level = zone.riskLevel?.toLowerCase();
        const isCritical = level === "critical";
        const isHighOrCritical = isCritical || level === "high";
        const icon = getCategoryIcon(zone.category);
        const categoryLabel = getCategoryLabel(zone.category);
        const isPolygon = zone.shapeType === "polygon" && zone.polygonCoordinates?.length;

        const tooltipContent = (
          <Tooltip direction="center" permanent={false} className="zone-tooltip">
            <div className="text-center">
              <span className="text-sm mr-1">{icon}</span>
              <span className="text-xs font-semibold">
                {zone.name}
              </span>
              <br />
              <span className="text-[10px] text-muted-foreground">
                {zone.riskLevel ?? "Medium"} Risk · {categoryLabel}
              </span>
            </div>
          </Tooltip>
        );

        return (
          <span key={`zone-group-${zone.id}`}>
            {isPolygon ? (
              <>
                {/* Main zone polygon */}
                <LeafletPolygon
                  positions={zone.polygonCoordinates!.map(([lat, lng]) => [lat, lng] as [number, number])}
                  pathOptions={{
                    color: c.stroke,
                    fillColor: c.fill,
                    fillOpacity: opacity,
                    weight: isCritical ? 3 : isHighOrCritical ? 2.5 : 2,
                    dashArray: isCritical ? "6 4" : undefined,
                  }}
                  eventHandlers={{ click: () => onZoneClick(zone) }}
                >
                  {tooltipContent}
                </LeafletPolygon>

                {/* Inner danger core for critical polygon zones */}
                {isCritical && (
                  <LeafletPolygon
                    positions={zone.polygonCoordinates!.map(([lat, lng]) => {
                      const dLat = lat - zone.centerLat;
                      const dLng = lng - zone.centerLng;
                      return [zone.centerLat + dLat * 0.4, zone.centerLng + dLng * 0.4] as [number, number];
                    })}
                    pathOptions={{
                      color: "#581c87",
                      fillColor: "#7c3aed",
                      fillOpacity: 0.3,
                      weight: 1.5,
                      dashArray: "3 3",
                    }}
                  />
                )}
              </>
            ) : (
              <>
                {/* Main zone circle */}
                <Circle
                  center={[zone.centerLat, zone.centerLng]}
                  radius={zone.radiusMeters}
                  pathOptions={{
                    color: c.stroke,
                    fillColor: c.fill,
                    fillOpacity: opacity,
                    weight: isCritical ? 3 : isHighOrCritical ? 2.5 : 2,
                    dashArray: isCritical ? "6 4" : undefined,
                  }}
                  eventHandlers={{ click: () => onZoneClick(zone) }}
                >
                  {tooltipContent}
                </Circle>

                {/* Inner danger core for critical zones */}
                {isCritical && (
                  <Circle
                    center={[zone.centerLat, zone.centerLng]}
                    radius={zone.radiusMeters * 0.4}
                    pathOptions={{
                      color: "#581c87",
                      fillColor: "#7c3aed",
                      fillOpacity: 0.3,
                      weight: 1.5,
                      dashArray: "3 3",
                    }}
                  />
                )}
              </>
            )}

            {/* Pulsing outer ring for critical/high zones */}
            <PulsingRing zone={zone} />

            {/* Proximity approach ring */}
            <ProximityRing zone={zone} userPosition={userPosition} />
          </span>
        );
      })}
    </>
  );
}

export const ZoneOverlay = memo(ZoneOverlayInner);