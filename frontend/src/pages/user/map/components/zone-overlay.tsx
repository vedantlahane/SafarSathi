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
      let height = 0;
      if (isCritical) height = 150;
      else if (level === "high") height = 100;
      else if (level === "medium") height = 50;
      else height = 20;

      features.push({
        type: "Feature",
        properties: {
          id: zone.id,
          fillColor: c.fill,
          fillOpacity: opacity,
          strokeColor: c.stroke,
          strokeWidth: isCritical ? 3 : isHighOrCritical ? 2.5 : 2,
          height: height,
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
              return [lng + dLng * 0.4, lat + dLat * 0.4];
            }),
          ];
        } else {
          coreCoordinates = [createCirclePolygon({ lat: zone.centerLat, lon: zone.centerLng }, zone.radiusMeters * 0.4)];
        }

        features.push({
          type: "Feature",
          properties: {
            fillColor: "#7c3aed",
            fillOpacity: 0.5,
            strokeColor: "#581c87",
            strokeWidth: 1.5,
            height: height + 50, // Core is slightly taller
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
        type="fill-extrusion"
        paint={{
          "fill-extrusion-color": ["get", "fillColor"],
          "fill-extrusion-opacity": 0.6,
          "fill-extrusion-height": ["get", "height"],
          "fill-extrusion-base": 0,
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