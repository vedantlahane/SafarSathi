import { memo, useMemo } from "react";
import { Source, Layer } from "react-map-gl/mapbox";
import { getZoneColor, getZoneOpacity, type RiskZone } from "../types";
import { createCirclePolygon } from "@/lib/geo";

interface ZoneOverlayProps {
  zones: RiskZone[];
  onZoneClick: (zone: RiskZone) => void;
}

function ZoneOverlayInner({ zones }: ZoneOverlayProps) {
  const geojsonData = useMemo(() => {
    const features: GeoJSON.Feature[] = [];

    zones.forEach((zone) => {
      const c = getZoneColor(zone.riskLevel);
      const opacity = getZoneOpacity(zone.riskLevel);
      const level = zone.riskLevel?.toLowerCase();
      const isCritical = level === "critical";
      const isHighOrCritical = isCritical || level === "high";

      let coordinates: [number, number][][];

      if (zone.shapeType === "polygon" && zone.polygonCoordinates?.length) {
        coordinates = [zone.polygonCoordinates.map(([lat, lng]) => [lng, lat])];
      } else {
        coordinates = [createCirclePolygon({ lat: zone.centerLat, lon: zone.centerLng }, zone.radiusMeters)];
      }

      // Main Zone Feature
      features.push({
        type: "Feature",
        properties: {
          id: zone.id,
          fillColor: c.fill,
          fillOpacity: opacity,
          strokeColor: c.stroke,
          strokeWidth: isCritical ? 3 : isHighOrCritical ? 2.5 : 2,
          isCritical,
          isHighOrCritical,
          type: "main",
        },
        geometry: {
          type: "Polygon",
          coordinates,
        },
      });

      // Inner Danger Core Feature (Critical Only)
      if (isCritical) {
        let coreCoordinates: [number, number][][];
        if (zone.shapeType === "polygon" && zone.polygonCoordinates?.length) {
          coreCoordinates = [
            zone.polygonCoordinates.map(([lat, lng]) => {
              const dLat = lat - zone.centerLat;
              const dLng = lng - zone.centerLng;
              return [zone.centerLng + dLng * 0.4, zone.centerLat + dLat * 0.4];
            }),
          ];
        } else {
          coreCoordinates = [createCirclePolygon({ lat: zone.centerLat, lon: zone.centerLng }, zone.radiusMeters * 0.4)];
        }

        features.push({
          type: "Feature",
          properties: {
            fillColor: "#7c3aed",
            fillOpacity: 0.3,
            strokeColor: "#581c87",
            strokeWidth: 1.5,
            type: "core",
          },
          geometry: {
            type: "Polygon",
            coordinates: coreCoordinates,
          },
        });
      }
    });

    return {
      type: "FeatureCollection" as const,
      features,
    };
  }, [zones]);

  return (
    <Source id="zones-source" type="geojson" data={geojsonData}>
      <Layer
        id="zones-fill"
        type="fill"
        paint={{
          "fill-color": ["get", "fillColor"],
          "fill-opacity": ["get", "fillOpacity"],
        }}
      />
      <Layer
        id="zones-outline"
        type="line"
        paint={{
          "line-color": ["get", "strokeColor"],
          "line-width": ["get", "strokeWidth"],
        }}
      />
      {/* We can add dashed styles for core layers using filters if needed */}
    </Source>
  );
}

export const ZoneOverlay = memo(ZoneOverlayInner);