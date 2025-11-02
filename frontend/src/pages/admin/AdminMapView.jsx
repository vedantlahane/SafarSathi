import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, LayersControl, LayerGroup } from 'react-leaflet';
import L from 'leaflet';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/admin/AdminLayout';
import apiService from '../../services/apiService';

const { BaseLayer, Overlay } = LayersControl;

const touristIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const sosIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [30, 48],
  iconAnchor: [15, 48]
});

const AdminMapView = () => {
  const [tourists, setTourists] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedTouristId, setSelectedTouristId] = useState(null);
  const [riskZones, setRiskZones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [dashboardResponse, zonesResponse] = await Promise.allSettled([
          apiService.getAdminDashboardState(),
          apiService.getRiskZones()
        ]);

        if (!isMounted) return;

        if (dashboardResponse.status === 'fulfilled') {
          const data = dashboardResponse.value || {};
          setTourists(Array.isArray(data.tourists) ? data.tourists : []);
          setAlerts(Array.isArray(data.alerts) ? data.alerts : []);
          setError(null);
        } else {
          console.error('Failed to load dashboard state:', dashboardResponse.reason);
          setError(dashboardResponse.reason?.message || 'Unable to load dashboard data.');
        }

        if (zonesResponse.status === 'fulfilled') {
          const zones = Array.isArray(zonesResponse.value) ? zonesResponse.value : [];
          setRiskZones(zones.filter((zone) => zone?.active));
        } else {
          console.error('Failed to load risk zones:', zonesResponse.reason);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();
    const intervalId = setInterval(loadData, 15000); // Refresh every 15 seconds

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const activeAlertsByTourist = useMemo(() => {
    return alerts.reduce((set, alert) => {
      if (alert && alert.touristId && (alert.status == null || alert.status.toUpperCase() !== 'RESOLVED')) {
        set.add(alert.touristId);
      }
      return set;
    }, new Set());
  }, [alerts]);

  const touristsWithLocations = useMemo(() => (
    tourists.filter((tourist) =>
      typeof tourist?.currentLat === 'number' && typeof tourist?.currentLng === 'number'
    )
  ), [tourists]);

  const selectedTourist = useMemo(() => (
    touristsWithLocations.find((tourist) => tourist.id === selectedTouristId) || null
  ), [touristsWithLocations, selectedTouristId]);

  const mapCenter = useMemo(() => {
    if (touristsWithLocations.length > 0) {
      return {
        lat: touristsWithLocations[0].currentLat,
        lng: touristsWithLocations[0].currentLng
      };
    }
    return {
      lat: 28.6139,
      lng: 77.209
    };
  }, [touristsWithLocations]);

  const getStatusLabel = (tourist) => {
    if (!tourist?.lastSeen) {
      return 'UNKNOWN';
    }

    const lastSeenTime = new Date(tourist.lastSeen).getTime();
    if (Number.isNaN(lastSeenTime)) {
      return 'UNKNOWN';
    }

    const minutesSince = (Date.now() - lastSeenTime) / 60000;
    if (minutesSince <= 5) return 'ACTIVE';
    if (minutesSince <= 30) return 'STALE';
    return 'OFFLINE';
  };

  const formatLastSeen = (tourist) => {
    if (!tourist?.lastSeen) {
      return 'Last ping: N/A';
    }
    try {
      return `Last ping: ${new Date(tourist.lastSeen).toLocaleString()}`;
    } catch (e) {
      return 'Last ping: N/A';
    }
  };

  const getZoneStyling = (zone) => {
    switch (zone?.riskLevel) {
      case 'HIGH':
        return { color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.2 };
      case 'LOW':
        return { color: '#22c55e', fillColor: '#22c55e', fillOpacity: 0.15 };
      default:
        return { color: '#f97316', fillColor: '#f97316', fillOpacity: 0.18 };
    }
  };

  const formatSafetyScore = (tourist) => {
    if (typeof tourist?.safetyScore !== 'number') return '—';
    return `${Math.max(0, Math.min(100, Number(tourist.safetyScore))).toFixed(0)} / 100`;
  };

  return (
    <AdminLayout title="Live Mission Map" subtitle="View all tourists, SOS alerts, and zone heatmaps in real time.">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40 shadow-xl lg:col-span-2">
          <div className="aspect-[3/4] w-full lg:aspect-[4/3] lg:min-h-[420px]">
            <MapContainer
              center={[mapCenter.lat, mapCenter.lng]}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
              className="h-full w-full rounded-3xl"
            >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LayersControl position="topright">
              <Overlay checked name="Tourist Locations">
                <LayerGroup>
                  {touristsWithLocations.map(tourist => (
                    <Marker
                      key={tourist.id}
                      position={[tourist.currentLat, tourist.currentLng]}
                      icon={activeAlertsByTourist.has(tourist.id) ? sosIcon : touristIcon}
                      eventHandlers={{
                        click: () => setSelectedTouristId(tourist.id)
                      }}
                    >
                      <Popup>
                        <div className="space-y-1">
                          <p className="font-semibold">{tourist.name}</p>
                          <p className="text-sm">Status: {getStatusLabel(tourist)}</p>
                          <p className="text-sm">Safety Score: {formatSafetyScore(tourist)}</p>
                          <p className="text-xs text-slate-500">{formatLastSeen(tourist)}</p>
                          {tourist.nationality && (
                            <p className="text-xs text-slate-500">Nationality: {tourist.nationality}</p>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </LayerGroup>
              </Overlay>

              <Overlay checked name="SOS Radius">
                <LayerGroup>
                  {alerts
                    .filter(alert => alert && typeof alert.lat === 'number' && typeof alert.lng === 'number')
                    .map(alert => (
                      <Circle
                        key={alert.id}
                        center={[alert.lat, alert.lng]}
                        radius={500}
                        pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.15 }}
                      />
                    ))}
                </LayerGroup>
              </Overlay>

              <Overlay checked name="Risk Zones">
                <LayerGroup>
                  {riskZones.map(zone => {
                    const lat = Number(zone.centerLat);
                    const lng = Number(zone.centerLng);
                    const radius = Number(zone.radiusMeters);

                    if (Number.isNaN(lat) || Number.isNaN(lng) || Number.isNaN(radius)) {
                      return null;
                    }

                    return (
                      <Circle
                        key={zone.id}
                        center={[lat, lng]}
                        radius={radius}
                        pathOptions={getZoneStyling(zone)}
                      >
                        <Popup>
                          <div className="space-y-1">
                            <p className="font-semibold">{zone.name}</p>
                            <p className="text-xs text-slate-500">Risk: {zone.riskLevel}</p>
                            {zone.description && (
                              <p className="text-xs text-slate-500">{zone.description}</p>
                            )}
                          </div>
                        </Popup>
                      </Circle>
                    );
                  })}
                </LayerGroup>
              </Overlay>
            </LayersControl>
            </MapContainer>
          </div>
        </motion.div>

        <div className="space-y-6">
          <motion.div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Map Layers</h2>
            <p className="text-sm text-slate-300">Toggle overlays from the control (top right of map). The SOS radius layer visualizes active rescue perimeters.</p>
          </motion.div>

          <motion.div className="bg-white/5 border border-white/10 rounded-2xl p-6 min-h-[220px]">
            <h2 className="text-lg font-semibold text-white mb-4">Focus Feed</h2>
            {selectedTourist ? (
              <div className="space-y-2 text-sm text-slate-200">
                <p className="text-base font-semibold text-white">{selectedTourist.name}</p>
                <p>Status: <span className="font-semibold uppercase">{getStatusLabel(selectedTourist)}</span></p>
                <p>Safety Score: <span className="font-semibold text-teal-300">{formatSafetyScore(selectedTourist)}</span></p>
                <p>{formatLastSeen(selectedTourist)}</p>
                {selectedTourist.phone && <p>Contact: {selectedTourist.phone}</p>}
                {selectedTourist.emergencyContact && <p>Emergency: {selectedTourist.emergencyContact}</p>}
                <p>
                  Coordinates: {selectedTourist.currentLat.toFixed(4)}, {selectedTourist.currentLng.toFixed(4)}
                </p>
              </div>
            ) : (
              <div className="space-y-2 text-sm text-slate-400">
                {isLoading ? (
                  <p>Loading live positions…</p>
                ) : error ? (
                  <p>{error}</p>
                ) : (
                  <p>Select a marker to view details about the tourist and respond faster.</p>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminMapView;
