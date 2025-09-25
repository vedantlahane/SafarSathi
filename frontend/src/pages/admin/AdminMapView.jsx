import React, { useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, LayersControl, LayerGroup } from 'react-leaflet';
import L from 'leaflet';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/admin/AdminLayout';
import { mockTourists, mockAlerts } from '../../mock/adminData';

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
  const [selectedTourist, setSelectedTourist] = useState(null);

  const mapCenter = useMemo(() => ({
    lat: 28.6139,
    lng: 77.209
  }), []);

  return (
    <AdminLayout title="Live Mission Map" subtitle="View all tourists, SOS alerts, and zone heatmaps in real time.">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div className="lg:col-span-2 overflow-hidden rounded-3xl border border-white/10 shadow-xl">
          <MapContainer center={[mapCenter.lat, mapCenter.lng]} zoom={12} style={{ height: '70vh', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LayersControl position="topright">
              <Overlay checked name="Tourist Locations">
                <LayerGroup>
                  {mockTourists.map(tourist => (
                    <Marker
                      key={tourist.id}
                      position={[tourist.location.lat, tourist.location.lng]}
                      icon={tourist.status === 'sos' ? sosIcon : touristIcon}
                      eventHandlers={{
                        click: () => setSelectedTourist(tourist)
                      }}
                    >
                      <Popup>
                        <div className="space-y-1">
                          <p className="font-semibold">{tourist.name}</p>
                          <p className="text-sm">Status: {tourist.status.toUpperCase()}</p>
                          <p className="text-sm">Battery: {tourist.battery}%</p>
                          <p className="text-xs text-slate-500">Last seen {tourist.lastKnownArea}</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </LayerGroup>
              </Overlay>

              <Overlay checked name="SOS Radius">
                <LayerGroup>
                  {mockAlerts
                    .filter(alert => alert.priority === 'critical')
                    .map(alert => (
                      <Circle
                        key={alert.id}
                        center={[alert.location.lat, alert.location.lng]}
                        radius={500}
                        pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.15 }}
                      />
                    ))}
                </LayerGroup>
              </Overlay>
            </LayersControl>
          </MapContainer>
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
                <p>Status: <span className="font-semibold uppercase">{selectedTourist.status}</span></p>
                <p>Battery: {selectedTourist.battery}%</p>
                <p>Last ping area: {selectedTourist.lastKnownArea}</p>
                <p>Coordinates: {selectedTourist.location.lat.toFixed(4)}, {selectedTourist.location.lng.toFixed(4)}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-400">Select a marker to view details about the tourist and respond faster.</p>
            )}
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminMapView;
