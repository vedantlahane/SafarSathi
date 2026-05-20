// src/pages/user/map/components/route-lines.tsx
import { memo, useMemo, useEffect, useRef } from "react";
import { Source, Layer, useMap } from "react-map-gl/mapbox";
import type { SafeRoute } from "../types";

interface RouteLinesProps {
  routes: SafeRoute[];
  visible: boolean;
}

function RouteLinesInner({ routes, visible }: RouteLinesProps) {
  const { current: map } = useMap();
  const reqRef = useRef<number>(0);
  const stepRef = useRef<number>(0);

  // Animation loop
  useEffect(() => {
    if (!visible || !map) return;

    const animateDashArray = () => {
      const mapInstance = map.getMap();
      if (!mapInstance || !mapInstance.getLayer("route-layer-animated")) return;
      
      const step = stepRef.current;
      stepRef.current = (step + 1) % 100;
      
      // Moving dash array for a "flowing" effect
      // Format: [dash length, gap length]
      // We offset the array by using a prefix gap
      const dashLength = 2;
      const gapLength = 4;
      const offset = (step / 5) % (dashLength + gapLength);
      
      // Since mapbox doesn't support a direct dash offset, we simulate it by altering the first segment
      let dasharray;
      if (offset < dashLength) {
        dasharray = [dashLength - offset, gapLength, offset, 0];
      } else {
        dasharray = [0, offset - dashLength, dashLength, gapLength - (offset - dashLength)];
      }

      if (mapInstance && mapInstance.getLayer("route-layer-animated")) {
        mapInstance.setPaintProperty("route-layer-animated", "line-dasharray", dasharray);
      }
      reqRef.current = requestAnimationFrame(animateDashArray);
    };

    reqRef.current = requestAnimationFrame(animateDashArray);
    return () => cancelAnimationFrame(reqRef.current);
  }, [visible, map]);

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
            isSafest
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
      {/* Glow for safest routes */}
      <Source id="route-source-glow" type="geojson" data={geojsonData}>
        <Layer
          id="route-layer-glow"
          type="line"
          filter={["==", "isSafest", true]}
          paint={{
            "line-color": ["get", "color"],
            "line-width": 12,
            "line-blur": 10,
            "line-opacity": 0.4,
          }}
          layout={{
            "line-cap": "round",
            "line-join": "round",
          }}
        />
      </Source>

      {/* Solid background for safest routes */}
      <Source id="route-source-solid" type="geojson" data={geojsonData}>
        <Layer
          id="route-layer-solid"
          type="line"
          filter={["==", "isDashed", false]}
          paint={{
            "line-color": ["get", "color"],
            "line-width": ["get", "weight"],
            "line-opacity": 0.5,
          }}
          layout={{
            "line-cap": "round",
            "line-join": "round",
          }}
        />
      </Source>
      
      {/* Animated Dash Layer for all routes */}
      <Source id="route-source-animated" type="geojson" data={geojsonData}>
        <Layer
          id="route-layer-animated"
          type="line"
          paint={{
            "line-color": ["get", "color"],
            "line-width": ["get", "weight"],
            "line-opacity": ["get", "opacity"],
            "line-dasharray": [2, 4],
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