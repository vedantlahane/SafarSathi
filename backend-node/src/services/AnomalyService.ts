import { createAlert } from "./AlertService.js";
import { calculateDeviation, isPointWithinRadius } from "../utils/geoFence.js";
import { getActiveRiskZones, updateTourist, type IRiskZone } from "./mongoStore.js";
import type { ITourist } from "../schemas/index.js";

const INACTIVITY_THRESHOLD_MINUTES = 30;
const DEVIATION_THRESHOLD_KM = 5.0;

const touristActiveZones = new Map<string, Set<number>>();

export async function processLocation(tourist: ITourist, accuracy?: number) {
  await checkInactivity(tourist);
  await checkRouteDeviation(tourist);
  await checkGeoFence(tourist);
}

async function checkInactivity(tourist: ITourist) {
  if (!tourist.lastSeen) {
    return;
  }
  const lastSeen = new Date(tourist.lastSeen).getTime();
  const minutesSinceLastSeen = (Date.now() - lastSeen) / 60000;
  if (minutesSinceLastSeen > INACTIVITY_THRESHOLD_MINUTES) {
    await createAlert({
      touristId: tourist._id,
      alertType: "INACTIVITY",
      latitude: tourist.currentLat,
      longitude: tourist.currentLng,
      message: `Tourist has not sent a location update in ${Math.floor(minutesSinceLastSeen)} minutes.`
    });
  }
}

async function checkRouteDeviation(tourist: ITourist) {
  const deviationKm = calculateDeviation(tourist.currentLat, tourist.currentLng);
  if (deviationKm > DEVIATION_THRESHOLD_KM) {
    await createAlert({
      touristId: tourist._id,
      alertType: "DEVIATION",
      latitude: tourist.currentLat,
      longitude: tourist.currentLng,
      message: `Route deviation detected: ${deviationKm.toFixed(2)} km off planned route.`
    });
  }
}

async function checkGeoFence(tourist: ITourist) {
  const { currentLat: lat, currentLng: lng } = tourist;
  if (typeof lat !== "number" || typeof lng !== "number") {
    return;
  }

  const activeZones = await getActiveRiskZones();
  if (activeZones.length === 0) {
    touristActiveZones.delete(tourist._id);
    return;
  }

  const zoneLookup = new Map(activeZones.map((zone) => [zone.zoneId, zone]));

  const currentlyInside = new Set<number>(
    activeZones
      .filter((zone) => isPointWithinRadius(lat, lng, zone.centerLat, zone.centerLng, zone.radiusMeters))
      .map((zone) => zone.zoneId)
  );

  const previous = touristActiveZones.get(tourist._id) ?? new Set<number>();
  const entered = new Set<number>([...currentlyInside].filter((id) => !previous.has(id)));

  if (currentlyInside.size > 0) {
    touristActiveZones.set(tourist._id, currentlyInside);
  } else {
    touristActiveZones.delete(tourist._id);
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
    await createAlert({
      touristId: tourist._id,
      alertType: "RISK_ZONE",
      latitude: lat,
      longitude: lng,
      message: `Tourist entered risk zone '${zone.name}' [${zone.riskLevel}]`
    });
  }
  // Update the tourist's safety score in DB
  await updateTourist(tourist._id, { safetyScore: Math.max(0, Math.min(100, safetyScore)) });
}

function penaltyFor(zone: IRiskZone) {
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
