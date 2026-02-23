// src/pages/user/map/components/station-markers.tsx
import { memo } from "react";
import { Marker, Popup } from "react-leaflet";
import { Shield, Phone, Clock, Route, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { hapticFeedback } from "@/lib/store";
import { PoliceIcon } from "./map-icons";
import { formatDistance } from "../types";
import type { PoliceStation } from "../types";

interface StationMarkersProps {
  stations: PoliceStation[];
}

function openExternal(lat: number, lng: number, name: string) {
  hapticFeedback("light");
  window.open(
    `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(name)}`,
    "_blank"
  );
}

function StationMarkersInner({ stations }: StationMarkersProps) {
  return (
    <>
      {stations.map((s) => (
        <Marker key={`police-${s.id}`} position={s.position} icon={PoliceIcon}>
          <Popup>
            <div className="p-2 min-w-[200px]">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <h3 className="font-bold text-sm">{s.name}</h3>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Phone className="h-3 w-3" />
                {s.contact}
              </div>
              {s.eta && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Clock className="h-3 w-3" />
                  {s.eta}
                </div>
              )}
              {s.distance !== undefined && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <MapPin className="h-3 w-3" />
                  {formatDistance(s.distance)}
                </div>
              )}
              <div className="flex items-center gap-1 mb-3">
                <Badge
                  variant={s.available ? "default" : "secondary"}
                  className="text-[10px] h-5"
                >
                  {s.available ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex gap-2">
                <a href={`tel:${s.contact}`} className="flex-1">
                  <Button
                    size="sm"
                    className="w-full h-8 text-xs gap-1"
                    aria-label={`Call ${s.name}`}
                  >
                    <Phone className="h-3 w-3" />
                    Call
                  </Button>
                </a>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                  onClick={() =>
                    openExternal(s.position[0], s.position[1], s.name)
                  }
                  aria-label={`Navigate to ${s.name}`}
                >
                  <Route className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

export const StationMarkers = memo(StationMarkersInner);