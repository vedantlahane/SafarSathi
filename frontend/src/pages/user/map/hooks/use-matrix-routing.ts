import { useState, useEffect, useRef } from "react";
import { haversineMeters } from "@/lib/geo";
import type { PoliceStation, Hospital } from "../types";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string;
const MATRIX_UPDATE_THRESHOLD_METERS = 500; // Only re-fetch matrix if user moves 500m

export function useMatrixRouting(
  userPosition: [number, number] | null,
  stations: PoliceStation[],
  hospitals: Hospital[]
) {
  const [nearestStation, setNearestStation] = useState<PoliceStation | null>(null);
  const [nearestHospital, setNearestHospital] = useState<Hospital | null>(null);
  
  const lastMatrixFetchPosRef = useRef<[number, number] | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (!userPosition) {
      setNearestStation(null);
      setNearestHospital(null);
      return;
    }

    // Check distance from last fetch to avoid spamming the API
    if (lastMatrixFetchPosRef.current) {
      const dist = haversineMeters(
        { lat: userPosition[0], lon: userPosition[1] },
        { lat: lastMatrixFetchPosRef.current[0], lon: lastMatrixFetchPosRef.current[1] }
      );
      if (dist < MATRIX_UPDATE_THRESHOLD_METERS && !isInitializing) {
        return; // User hasn't moved enough to warrant a new API call
      }
    }

    if (!stations.length && !hospitals.length) return;

    lastMatrixFetchPosRef.current = userPosition;
    setIsInitializing(false);

    const fetchMatrix = async () => {
      try {
        // 1. Pre-filter top N by straight-line distance
        const topStations = [...stations]
          .map(s => ({ ...s, d: haversineMeters({ lat: userPosition[0], lon: userPosition[1] }, { lat: s.position[0], lon: s.position[1] }) }))
          .sort((a, b) => a.d - b.d)
          .slice(0, 10); // max 10 to stay within free tier limits

        const topHospitals = [...hospitals]
          .map(h => ({ ...h, d: haversineMeters({ lat: userPosition[0], lon: userPosition[1] }, { lat: h.position[0], lon: h.position[1] }) }))
          .sort((a, b) => a.d - b.d)
          .slice(0, 10); // max 10

        // 2. Fetch Police Matrix (Walking)
        if (topStations.length > 0) {
          const coords = [`${userPosition[1]},${userPosition[0]}`];
          topStations.forEach(s => coords.push(`${s.position[1]},${s.position[0]}`));
          const dests = Array.from({ length: topStations.length }, (_, i) => i + 1).join(";");
          
          const url = `https://api.mapbox.com/directions-matrix/v1/mapbox/walking/${coords.join(";")}?sources=0&destinations=${dests}&annotations=distance,duration&access_token=${MAPBOX_TOKEN}`;
          const res = await fetch(url);
          const data = await res.json();
          
          if (data.code === "Ok" && data.durations?.[0]) {
            const durations = data.durations[0];
            const distances = data.distances[0];
            
            let minDuration = Infinity;
            let bestIndex = -1;
            
            durations.forEach((dur: number, idx: number) => {
              if (dur !== null && dur < minDuration) {
                minDuration = dur;
                bestIndex = idx;
              }
            });
            
            if (bestIndex !== -1) {
              const bestStation = topStations[bestIndex];
              const bestDist = distances[bestIndex];
              const min = Math.ceil(minDuration / 60);
              const etaStr = min > 60 ? `${Math.floor(min / 60)}h ${min % 60}m walk` : `${min} min walk`;
              
              setNearestStation({
                ...bestStation,
                distance: bestDist,
                eta: etaStr
              });
            } else {
               setNearestStation(topStations[0]); // fallback
            }
          } else {
            setNearestStation(topStations[0]); // fallback
          }
        }

        // 3. Fetch Hospital Matrix (Driving)
        if (topHospitals.length > 0) {
          const coords = [`${userPosition[1]},${userPosition[0]}`];
          topHospitals.forEach(h => coords.push(`${h.position[1]},${h.position[0]}`));
          const dests = Array.from({ length: topHospitals.length }, (_, i) => i + 1).join(";");
          
          const url = `https://api.mapbox.com/directions-matrix/v1/mapbox/driving/${coords.join(";")}?sources=0&destinations=${dests}&annotations=distance,duration&access_token=${MAPBOX_TOKEN}`;
          const res = await fetch(url);
          const data = await res.json();
          
          if (data.code === "Ok" && data.durations?.[0]) {
            const durations = data.durations[0];
            const distances = data.distances[0];
            
            let minDuration = Infinity;
            let bestIndex = -1;
            
            durations.forEach((dur: number, idx: number) => {
              if (dur !== null && dur < minDuration) {
                minDuration = dur;
                bestIndex = idx;
              }
            });
            
            if (bestIndex !== -1) {
              const bestHospital = topHospitals[bestIndex];
              const bestDist = distances[bestIndex];
              const min = Math.ceil(minDuration / 60);
              const etaStr = min > 60 ? `${Math.floor(min / 60)}h ${min % 60}m drive` : `${min} min drive`;
              
              setNearestHospital({
                ...bestHospital,
                distance: bestDist,
                eta: etaStr
              });
            } else {
               setNearestHospital(topHospitals[0]);
            }
          } else {
            setNearestHospital(topHospitals[0]);
          }
        }

      } catch (err) {
        console.error("Matrix API error", err);
      }
    };

    fetchMatrix();

  }, [userPosition, stations, hospitals, isInitializing]);

  return { nearestStation, nearestHospital };
}
