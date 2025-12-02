import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Tooltip } from 'react-leaflet';
import L from 'leaflet';

let leafletIconsPatched = false;

const ensureLeafletDefaultIcon = () => {
  if (leafletIconsPatched) return;
  leafletIconsPatched = true;

  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
  });
};

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const levelStyles = {
  critical: {
    color: '#fb7185',
    fillColor: '#fb7185',
    fillOpacity: 0.2
  },
  warning: {
    color: '#f97316',
    fillColor: '#f97316',
    fillOpacity: 0.18
  },
  info: {
    color: '#38bdf8',
    fillColor: '#38bdf8',
    fillOpacity: 0.16
  }
};

const SafetyMiniMap = ({
  currentLocation,
  lastKnownLocation,
  zones = [],
  onViewFullMap,
  isOffline
}) => {
  ensureLeafletDefaultIcon();

  const isBrowser = typeof window !== 'undefined';

  const resolvedLocation = useMemo(() => {
    if (currentLocation?.lat && currentLocation?.lng) {
      return [currentLocation.lat, currentLocation.lng];
    }
    if (lastKnownLocation?.lat && lastKnownLocation?.lng) {
      return [lastKnownLocation.lat, lastKnownLocation.lng];
    }
    return null;
  }, [currentLocation, lastKnownLocation]);

  const mapCenter = useMemo(() => {
    if (resolvedLocation) return resolvedLocation;
    if (zones.length) {
      const primaryZone = zones[0];
      return [primaryZone.center.lat, primaryZone.center.lng];
    }
    return [26.2006, 92.9376]; // Assam default fallback
  }, [resolvedLocation, zones]);

  const circles = useMemo(
    () =>
      zones
        .filter(zone => zone?.center?.lat && zone?.center?.lng && zone?.radius)
        .map(zone => ({
          id: zone.id,
          center: [zone.center.lat, zone.center.lng],
          radius: zone.radius,
          name: zone.name,
          reason: zone.reason,
          level: zone.level ?? 'warning'
        })),
    [zones]
  );

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-lg backdrop-blur">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">🗺️ Live Safety Map</h2>
          <p className="text-xs text-slate-400">Track your position and nearby risk zones in real time.</p>
        </div>
        <button
          type="button"
          onClick={onViewFullMap}
          className="inline-flex items-center gap-2 rounded-full border border-teal-400/40 bg-teal-500/20 px-3 py-1.5 text-xs font-semibold text-teal-100 transition hover:bg-teal-500/30"
        >
          View full map
          <span aria-hidden>↗</span>
        </button>
      </div>

      <div className="relative h-72 w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70">
        {!isBrowser && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-300">
            Map preview available in browser only.
          </div>
        )}

        {isBrowser && mapCenter ? (
          <MapContainer
            center={mapCenter}
            zoom={13}
            scrollWheelZoom={false}
            className="h-full w-full"
            attributionControl={false}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {resolvedLocation && (
              <Marker position={resolvedLocation} icon={userIcon}>
                <Tooltip direction="top" offset={[0, -10]} permanent>
                  You are here
                </Tooltip>
              </Marker>
            )}

            {circles.map(circle => (
              <Circle
                key={circle.id}
                center={circle.center}
                radius={circle.radius}
                pathOptions={levelStyles[circle.level] || levelStyles.warning}
              >
                <Tooltip direction="top">
                  <div className="text-xs font-semibold text-slate-900">
                    {circle.name}
                    <p className="mt-1 font-normal text-slate-700">{circle.reason}</p>
                  </div>
                </Tooltip>
              </Circle>
            ))}
          </MapContainer>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center text-sm text-slate-300">
            <span className="text-lg" aria-hidden>
              {isOffline ? '📡' : '📍'}
            </span>
            <p>{isOffline ? 'Offline mode — showing cached safety info' : 'Fetching your location…'}</p>
          </div>
        )}

        {isOffline && (
          <div className="absolute right-4 top-4 rounded-full border border-amber-400/40 bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-100 shadow">
            Offline insights
          </div>
        )}
      </div>
    </div>
  );
};

export default SafetyMiniMap;
