// src/pages/user/map/components/fly-to-location.tsx
import { useEffect } from "react";
import { useMap } from "react-map-gl/mapbox";

interface FlyToLocationProps {
  position: [number, number] | null;
  zoom?: number;
}

export function FlyToLocation({ position, zoom }: FlyToLocationProps) {
  const { current: map } = useMap();
  
  useEffect(() => {
    if (position && map) {
      // position is [lat, lng], mapbox expects [lng, lat]
      map.flyTo({ center: [position[1], position[0]], zoom: zoom ?? map.getZoom(), duration: 1000 });
    }
  }, [position, zoom, map]);

  return null;
}