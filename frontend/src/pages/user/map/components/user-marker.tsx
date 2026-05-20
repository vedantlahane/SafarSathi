// src/pages/user/map/components/user-marker.tsx
import { memo, useState } from "react";
import { Marker, Popup } from "react-map-gl/mapbox";
import { Navigation } from "lucide-react";
import { UserIcon } from "./map-icons";

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
  const [showPopup, setShowPopup] = useState(false);

  return (
    <>
      <Marker
        latitude={position[0]}
        longitude={position[1]}
        anchor="center"
        onClick={(e: any) => {
          e.originalEvent.stopPropagation();
          setShowPopup(!showPopup);
        }}
      >
        <UserIcon heading={heading} />
      </Marker>

      {showPopup && (
        <Popup
          latitude={position[0]}
          longitude={position[1]}
          closeButton={true}
          closeOnClick={false}
          onClose={() => setShowPopup(false)}
          anchor="top"
          offset={18}
        >
          <div className="p-3 text-center min-w-[160px]">
            <div className="flex items-center gap-2 justify-center mb-2 mt-2">
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
      )}
    </>
  );
}

export const UserMarker = memo(UserMarkerInner);