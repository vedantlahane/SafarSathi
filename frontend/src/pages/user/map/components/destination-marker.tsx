// src/pages/user/map/components/destination-marker.tsx
import { memo } from "react";
import { Marker, Popup } from "react-leaflet";
import { Target, Car, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hapticFeedback } from "@/lib/store";
import { DestinationIcon } from "./map-icons";
import type { Destination } from "../types";

interface DestinationMarkerProps {
  destination: Destination;
  onClear: () => void;
}

function DestinationMarkerInner({
  destination,
  onClear,
}: DestinationMarkerProps) {
  const openInMaps = () => {
    hapticFeedback("light");
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}&destination_place_id=${encodeURIComponent(destination.name)}`,
      "_blank"
    );
  };

  return (
    <Marker
      position={[destination.lat, destination.lng]}
      icon={DestinationIcon}
    >
      <Popup>
        <div className="p-3 min-w-[180px]">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-5 w-5 text-emerald-600" />
            <span className="font-semibold text-sm">Destination</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            {destination.name}
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 h-8 text-xs gap-1"
              onClick={openInMaps}
              aria-label="Open in Google Maps"
            >
              <Car className="h-3 w-3" />
              Navigate
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={onClear}
              aria-label="Clear destination"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

export const DestinationMarker = memo(DestinationMarkerInner);