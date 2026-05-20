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
      map.flyTo({ 
        center: [position[1], position[0]], 
        zoom: zoom ?? map.getZoom(),
        pitch: 65,
        bearing: 45,
        duration: 3500,
        curve: 1.5,
        essential: true
      });
    }
  }, [position, zoom, map]);

  return null;
}