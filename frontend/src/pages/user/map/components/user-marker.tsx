// src/pages/user/map/components/user-marker.tsx
import { memo, useMemo } from "react";
import { Marker, Popup, Circle } from "react-leaflet";
import { Navigation } from "lucide-react";
import { createUserIcon } from "./map-icons";

interface UserMarkerProps {
  position: [number, number];
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
}

function UserMarkerInner({
  position,
  accuracy,
  heading,
  speed,
}: UserMarkerProps) {
  const icon = useMemo(() => createUserIcon(heading), [heading]);

  return (
    <>
      {accuracy !== null && accuracy > 15 && (
        <Circle
          center={position}
          radius={accuracy}
          pathOptions={{
            color: "#3b82f6",
            fillColor: "#3b82f6",
            fillOpacity: 0.06,
            weight: 1,
            dashArray: "4 4",
          }}
        />
      )}
      <Marker position={position} icon={icon}>
        <Popup>
          <div className="p-3 text-center min-w-[160px]">
            <div className="flex items-center gap-2 justify-center mb-2">
              <Navigation className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-sm">Your Location</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {position[0].toFixed(5)}, {position[1].toFixed(5)}
            </p>
            {accuracy !== null && (
              <p className="text-[10px] text-muted-foreground mt-1">
                ±{Math.round(accuracy)}m accuracy
              </p>
            )}
            {speed !== null && speed > 0 && (
              <p className="text-[10px] text-muted-foreground">
                {(speed * 3.6).toFixed(1)} km/h
              </p>
            )}
          </div>
        </Popup>
      </Marker>
    </>
  );
}

export const UserMarker = memo(UserMarkerInner);