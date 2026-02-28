// src/pages/user/map/components/hospital-markers.tsx
import { memo } from "react";
import { Marker, Popup } from "react-leaflet";
import { Cross, Phone, Clock, Route, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { hapticFeedback } from "@/lib/store";
import { HospitalIcon } from "./map-icons";
import { formatDistance } from "../types";
import type { Hospital } from "../types";

interface HospitalMarkersProps {
  hospitals: Hospital[];
}

function openExternal(lat: number, lng: number, name: string) {
  hapticFeedback("light");
  window.open(
    `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(name)}`,
    "_blank"
  );
}

function HospitalMarkersInner({ hospitals }: HospitalMarkersProps) {
  return (
    <>
      {hospitals.map((h) => (
        <Marker
          key={`hospital-${h.id}`}
          position={h.position}
          icon={HospitalIcon}
        >
          <Popup>
            <div className="p-2 min-w-[200px]">
              <div className="flex items-center gap-2 mb-2">
                <Cross className="h-4 w-4 text-rose-600" />
                <h3 className="font-bold text-sm">{h.name}</h3>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Phone className="h-3 w-3" />
                {h.contact}
              </div>
              {h.eta && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Clock className="h-3 w-3" />
                  {h.eta}
                </div>
              )}
              {h.distance !== undefined && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <MapPin className="h-3 w-3" />
                  {formatDistance(h.distance)}
                </div>
              )}
              <div className="flex items-center gap-1 mb-3">
                <Badge
                  variant="secondary"
                  className="text-[10px] h-5 capitalize"
                >
                  {h.type}
                </Badge>
                {h.emergency && (
                  <Badge
                    variant="destructive"
                    className="text-[10px] h-5"
                  >
                    Emergency
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                {h.contact ? (
                  <a href={`tel:${h.contact}`} className="flex-1">
                    <Button
                      size="sm"
                      className="w-full h-8 text-xs gap-1"
                      aria-label={`Call ${h.name}`}
                    >
                      <Phone className="h-3 w-3" />
                      Call
                    </Button>
                  </a>
                ) : null}
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                  onClick={() =>
                    openExternal(h.position[0], h.position[1], h.name)
                  }
                  aria-label={`Navigate to ${h.name}`}
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

export const HospitalMarkers = memo(HospitalMarkersInner);