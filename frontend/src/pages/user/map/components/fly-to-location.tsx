// src/pages/user/map/components/fly-to-location.tsx
import { useEffect } from "react";
import { useMap } from "react-leaflet";

interface FlyToLocationProps {
  position: [number, number] | null;
  zoom?: number;
}

export function FlyToLocation({ position, zoom }: FlyToLocationProps) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, zoom ?? map.getZoom(), { duration: 1 });
    }
  }, [position, zoom, map]);
  return null;
}