import { Source, Layer } from "react-map-gl/mapbox";
import { useQuery } from "@tanstack/react-query";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string;

interface IsochroneOverlayProps {
  userPosition: [number, number] | null;
  userInZone: boolean;
}

export function IsochroneOverlay({ userPosition, userInZone }: IsochroneOverlayProps) {
  const { data: isoData } = useQuery({
    queryKey: ["isochrone", userPosition?.[1], userPosition?.[0]],
    queryFn: async () => {
      const url = `https://api.mapbox.com/isochrone/v1/mapbox/walking/${userPosition![1]},${userPosition![0]}?contours_minutes=5,10&polygons=true&access_token=${MAPBOX_TOKEN}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data && data.features) return data;
      return null;
    },
    enabled: !!userInZone && !!userPosition,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 15 * 60 * 1000,
  });

  if (!isoData) return null;

  return (
    <Source type="geojson" data={isoData}>
      <Layer
        id="isochrone-fill"
        type="fill"
        paint={{
          "fill-color": [
            "match",
            ["get", "contour"],
            5, "#10b981", // Emerald green for 5 mins
            10, "#3b82f6", // Blue for 10 mins
            "#10b981"
          ],
          "fill-opacity": 0.15
        }}
      />
      <Layer
        id="isochrone-line"
        type="line"
        paint={{
          "line-color": [
            "match",
            ["get", "contour"],
            5, "#10b981",
            10, "#3b82f6",
            "#10b981"
          ],
          "line-width": 2,
          "line-dasharray": [2, 2]
        }}
      />
    </Source>
  );
}
