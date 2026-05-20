import { useState, useEffect } from 'react';
import type { PoliceDepartment as PoliceUnit } from '../types';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string;

export function useIsochrones(policeUnits: PoliceUnit[] | undefined, enabled: boolean) {
  const [isochroneGeoJSON, setIsochroneGeoJSON] = useState<any | null>(null);

  useEffect(() => {
    if (!enabled || !policeUnits || policeUnits.length === 0) {
      setIsochroneGeoJSON(null);
      return;
    }

    const fetchIsochrones = async () => {
      try {
        const activeUnits = policeUnits.filter(p => p.isActive && p.location);
        if (activeUnits.length === 0) return;
        
        // Fetch isochrones in parallel for active stations (limit to top 15 to avoid overwhelming the API if there are many)
        const fetchPromises = activeUnits.slice(0, 15).map(async (unit) => {
          const res = await fetch(
            `https://api.mapbox.com/isochrone/v1/mapbox/driving/${unit.location.lng},${unit.location.lat}?contours_minutes=10&polygons=true&access_token=${MAPBOX_TOKEN}`
          );
          if (!res.ok) throw new Error("Failed to fetch isochrone");
          const data = await res.json();
          // Tag each feature with the unit ID for coloring/identification
          data.features.forEach((f: any) => {
            f.properties = { ...f.properties, unitId: unit.id, unitName: unit.name };
          });
          return data.features;
        });

        const allFeaturesGroups = await Promise.all(fetchPromises);
        const allFeatures = allFeaturesGroups.flat();
        
        setIsochroneGeoJSON({
          type: "FeatureCollection",
          features: allFeatures
        });
      } catch (err) {
        console.error("Error fetching Isochrones:", err);
      }
    };

    fetchIsochrones();
  }, [policeUnits, enabled]);

  return isochroneGeoJSON;
}
