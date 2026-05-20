// src/pages/user/map/components/route-lines.tsx
import { memo, useMemo } from "react";
import { Source, Layer } from "react-map-gl/mapbox";
import type { SafeRoute } from "../types";

interface RouteLinesProps {
  routes: SafeRoute[];
  visible: boolean;
}

function RouteLinesInner({ routes, visible }: RouteLinesProps) {
  const geojsonData = useMemo(() => {
    if (!visible || routes.length === 0) return null;

    return {
      type: "FeatureCollection" as const,
      features: routes.map((route) => {
        const isSafest = route.isSafest;
        const isFastest = route.isFastest && !route.isSafest;

        let color = "#94a3b8";
        let weight = 3;
        let opacity = 0.4;
        let isDashed = true;

        if (isSafest) {
          color = "#10b981";
          weight = 5;
          opacity = 0.8;
          isDashed = false;
        } else if (isFastest) {
          color = "#3b82f6";
          weight = 4;
          opacity = 0.6;
          isDashed = true;
        }

        return {
          type: "Feature" as const,
          properties: {
            id: route.id,
            color,
            weight,
            opacity,
            isDashed,
          },
          geometry: {
            type: "LineString" as const,
            // react-leaflet used [lat, lng], mapbox needs [lng, lat]
            coordinates: route.coordinates.map(([lat, lng]) => [lng, lat]),
          },
        };
      }),
    };
  }, [routes, visible]);

  if (!geojsonData) return null;

  return (
    <>
      {/* Dashed Routes Layer */}
      <Source id="route-source-dashed" type="geojson" data={geojsonData}>
        <Layer
          id="route-layer-dashed"
          type="line"
          filter={["==", "isDashed", true]}
          paint={{
            "line-color": ["get", "color"],
            "line-width": ["get", "weight"],
            "line-opacity": ["get", "opacity"],
            "line-dasharray": [2, 2],
          }}
          layout={{
            "line-cap": "round",
            "line-join": "round",
          }}
        />
      </Source>
      
      {/* Solid Routes Layer */}
      <Source id="route-source-solid" type="geojson" data={geojsonData}>
        <Layer
          id="route-layer-solid"
          type="line"
          filter={["==", "isDashed", false]}
          paint={{
            "line-color": ["get", "color"],
            "line-width": ["get", "weight"],
            "line-opacity": ["get", "opacity"],
          }}
          layout={{
            "line-cap": "round",
            "line-join": "round",
          }}
        />
      </Source>
    </>
  );
}

export const RouteLines = memo(RouteLinesInner);