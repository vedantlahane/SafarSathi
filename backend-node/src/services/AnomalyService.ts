import type { Tourist } from "../models/Tourist.js";
import type { RiskZone } from "../models/RiskZone.js";
import { riskZones } from "./dataStore.js";
import { createAlert } from "./AlertService.js";
import { calculateDeviation, isPointWithinRadius } from "../utils/geoFence.js";

const INACTIVITY_THRESHOLD_MINUTES = 30;
const DEVIATION_THRESHOLD_KM = 5.0;

const touristActiveZones = new Map<string, Set<number>>();

export function processLocation(tourist: Tourist, accuracy?: number) {
  checkInactivity(tourist);
  checkRouteDeviation(tourist);
  checkGeoFence(tourist);
}

function checkInactivity(tourist: Tourist) {
  if (!tourist.lastSeen) {
    return;
  }
  const lastSeen = new Date(tourist.lastSeen).getTime();
  const minutesSinceLastSeen = (Date.now() - lastSeen) / 60000;
  if (minutesSinceLastSeen > INACTIVITY_THRESHOLD_MINUTES) {
    createAlert({
      touristId: tourist.id,
      alertType: "INACTIVITY",
      lat: tourist.currentLat,
      lng: tourist.currentLng,
      message: `Tourist has not sent a location update in ${Math.floor(minutesSinceLastSeen)} minutes.`
    });
  }
}

function checkRouteDeviation(tourist: Tourist) {
  const deviationKm = calculateDeviation(tourist.currentLat, tourist.currentLng);
  if (deviationKm > DEVIATION_THRESHOLD_KM) {
    createAlert({
      touristId: tourist.id,
      alertType: "DEVIATION",
      lat: tourist.currentLat,
      lng: tourist.currentLng,
      message: `Route deviation detected: ${deviationKm.toFixed(2)} km off planned route.`
    });
  }
}

function checkGeoFence(tourist: Tourist) {
  const { currentLat: lat, currentLng: lng } = tourist;
  if (typeof lat !== "number" || typeof lng !== "number") {
    return;
  }

  const activeZones = riskZones.filter((zone) => zone.active);
  if (activeZones.length === 0) {
    touristActiveZones.delete(tourist.id);
    return;
  }

  const zoneLookup = new Map(activeZones.map((zone) => [zone.id, zone]));

  const currentlyInside = new Set<number>(
    activeZones
      .filter((zone) => isPointWithinRadius(lat, lng, zone.centerLat, zone.centerLng, zone.radiusMeters))
      .map((zone) => zone.id)
  );

  const previous = touristActiveZones.get(tourist.id) ?? new Set<number>();
  const entered = new Set<number>([...currentlyInside].filter((id) => !previous.has(id)));

  if (currentlyInside.size > 0) {
    touristActiveZones.set(tourist.id, currentlyInside);
  } else {
    touristActiveZones.delete(tourist.id);
  }

  if (entered.size === 0) {
    return;
  }

  let safetyScore = tourist.safetyScore ?? 100;
  for (const zoneId of entered) {
    const zone = zoneLookup.get(zoneId);
    if (!zone) {
      continue;
    }
    safetyScore = Math.max(0, safetyScore - penaltyFor(zone));
    createAlert({
      touristId: tourist.id,
      alertType: "RISK_ZONE",
      lat,
      lng,
      message: `Tourist entered risk zone '${zone.name}' [${zone.riskLevel}]`
    });
  }
  tourist.safetyScore = Math.max(0, Math.min(100, safetyScore));
}

function penaltyFor(zone: RiskZone) {
  if (!zone.riskLevel) {
    return 8.0;
  }
  switch (zone.riskLevel) {
    case "LOW":
      return 5.0;
    case "MEDIUM":
      return 10.0;
    case "HIGH":
      return 18.0;
    default:
      return 8.0;
  }
}
