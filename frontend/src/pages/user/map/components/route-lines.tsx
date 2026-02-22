// src/pages/user/map/components/route-lines.tsx
import { memo } from "react";
import { Polyline, Tooltip } from "react-leaflet";
import type { SafeRoute } from "../types";
import { formatDistance } from "../types";

interface RouteLinesProps {
  routes: SafeRoute[];
  visible: boolean;
}

function RouteLinesInner({ routes, visible }: RouteLinesProps) {
  if (!visible || routes.length === 0) return null;

  return (
    <>
      {routes.map((route) => {
        const isSafest = route.isSafest;
        const isFastest = route.isFastest && !route.isSafest;

        let color = "#94a3b8";
        let weight = 3;
        let opacity = 0.4;
        let dashArray: string | undefined = "8 8";
        let label = "";

        if (isSafest) {
          color = "#10b981";
          weight = 5;
          opacity = 0.8;
          dashArray = undefined;
          label = `Safest · ${route.safetyScore}/100 · ${formatDistance(route.distanceMeters)}`;
        } else if (isFastest) {
          color = "#3b82f6";
          weight = 4;
          opacity = 0.6;
          dashArray = "10 10";
          label = `Fastest · ${formatDistance(route.distanceMeters)}`;
        } else {
          label = `Alt · Score ${route.safetyScore} · ${formatDistance(route.distanceMeters)}`;
        }

        return (
          <Polyline
            key={route.id}
            positions={route.coordinates}
            pathOptions={{
              color,
              weight,
              opacity,
              dashArray,
              lineCap: "round",
              lineJoin: "round",
            }}
          >
            <Tooltip sticky direction="top" offset={[0, -10]}>
              <span className="text-xs font-medium">{label}</span>
            </Tooltip>
          </Polyline>
        );
      })}
    </>
  );
}

export const RouteLines = memo(RouteLinesInner);