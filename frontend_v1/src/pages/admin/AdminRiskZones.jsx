import { useCallback, useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Circle, CircleMarker, LayerGroup, useMapEvents } from 'react-leaflet';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/admin/AdminLayout';
import apiService from '../../services/apiService';

const DEFAULT_FORM = {
  name: '',
  description: '',
  centerLat: '',
  centerLng: '',
  radiusMeters: 500,
  riskLevel: 'MEDIUM',
  active: true,
};

const DEFAULT_CENTER = { lat: 26.1445, lng: 91.7362 };

const riskLevelMeta = {
  LOW: { label: 'Low', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  MEDIUM: { label: 'Medium', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  HIGH: { label: 'High', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
};

const riskLevelStyles = {
  LOW: { color: '#22c55e', fillColor: '#22c55e', fillOpacity: 0.12 },
  MEDIUM: { color: '#f97316', fillColor: '#f97316', fillOpacity: 0.16 },
  HIGH: { color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.22 },
};

const parseCoordinate = (value) => {
  if (value === '' || value === null || value === undefined) {
    return null;
  }
  const numeric = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const MapClickHandler = ({ onSelect }) => {
  useMapEvents({
    click: (event) => {
      if (onSelect) {
        onSelect(event);
      }
    },
  });
  return null;
};

const formatCoordinate = (value) => {
  if (typeof value !== 'number') return 'N/A';
  if (Number.isNaN(value)) return 'N/A';
  return value.toFixed(5);
};

const AdminRiskZones = () => {
  const [zones, setZones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formState, setFormState] = useState(DEFAULT_FORM);
  const [editingZoneId, setEditingZoneId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentLat = useMemo(() => parseCoordinate(formState.centerLat), [formState.centerLat]);
  const currentLng = useMemo(() => parseCoordinate(formState.centerLng), [formState.centerLng]);
  const currentRadius = useMemo(() => {
    const numeric = Number(formState.radiusMeters);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
  }, [formState.radiusMeters]);

  const mapCenter = useMemo(() => {
    if (currentLat !== null && currentLng !== null) {
      return { lat: currentLat, lng: currentLng };
    }

    const firstZoneWithCoords = zones.find((zone) => parseCoordinate(zone.centerLat) !== null && parseCoordinate(zone.centerLng) !== null);
    if (firstZoneWithCoords) {
      return {
        lat: parseCoordinate(firstZoneWithCoords.centerLat) ?? DEFAULT_CENTER.lat,
        lng: parseCoordinate(firstZoneWithCoords.centerLng) ?? DEFAULT_CENTER.lng,
      };
    }
    return DEFAULT_CENTER;
  }, [currentLat, currentLng, zones]);

  const loadZones = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getRiskZones();
      setZones(Array.isArray(response) ? response : []);
    } catch (error) {
      toast.error(error.message || 'Unable to load risk zones');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadZones();
  }, [loadZones]);

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormState((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleMapClick = useCallback(({ latlng }) => {
    if (!latlng) return;
    const { lat, lng } = latlng;
    setFormState((prev) => ({
      ...prev,
      centerLat: lat.toFixed(6),
      centerLng: lng.toFixed(6),
    }));
  }, []);

  const resetForm = useCallback(() => {
    setFormState(DEFAULT_FORM);
    setEditingZoneId(null);
  }, []);

  const handleEdit = (zone) => {
    setEditingZoneId(zone.id);
    setFormState({
      name: zone.name ?? '',
      description: zone.description ?? '',
      centerLat: zone.centerLat ?? '',
      centerLng: zone.centerLng ?? '',
      radiusMeters: zone.radiusMeters ?? 500,
      riskLevel: zone.riskLevel ?? 'MEDIUM',
      active: zone.active ?? true,
    });
  };

  const handleDelete = async (zoneId) => {
    if (!window.confirm('Delete this risk zone? This action cannot be undone.')) {
      return;
    }
    try {
      await apiService.deleteRiskZone(zoneId);
      toast.success('Risk zone removed');
      loadZones();
      if (editingZoneId === zoneId) {
        resetForm();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete risk zone');
    }
  };

  const handleToggle = async (zoneId, active) => {
    try {
      await apiService.updateRiskZoneStatus(zoneId, active);
      toast.success(active ? 'Risk zone activated' : 'Risk zone paused');
      loadZones();
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const preparedPayload = useMemo(() => ({
    name: formState.name?.trim(),
    description: formState.description?.trim() || undefined,
    centerLat: formState.centerLat === '' ? undefined : Number(formState.centerLat),
    centerLng: formState.centerLng === '' ? undefined : Number(formState.centerLng),
    radiusMeters: Number(formState.radiusMeters),
    riskLevel: formState.riskLevel,
    active: formState.active,
  }), [formState]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!preparedPayload.name || Number.isNaN(preparedPayload.centerLat) || Number.isNaN(preparedPayload.centerLng)) {
      toast.error('Please provide valid coordinates and a zone name');
      return;
    }

    if (preparedPayload.radiusMeters <= 0) {
      toast.error('Radius must be greater than zero');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingZoneId) {
        await apiService.updateRiskZone(editingZoneId, preparedPayload);
        toast.success('Risk zone updated');
      } else {
        await apiService.createRiskZone(preparedPayload);
        toast.success('Risk zone created');
      }
      resetForm();
      loadZones();
    } catch (error) {
      toast.error(error.message || 'Failed to save risk zone');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout
      title="Risk Zone Geofences"
      subtitle="Define restricted perimeters and push alerts when tourists enter them."
    >
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <motion.section
          className="xl:col-span-1 bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl backdrop-blur"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-xl font-semibold text-white mb-2">
            {editingZoneId ? 'Update Risk Zone' : 'Create Risk Zone'}
          </h2>
          <p className="text-sm text-slate-300 mb-6">
            Configure a circular geo-fence with radius in meters. Alerts are triggered when tourists enter active zones.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1" htmlFor="name">Zone Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formState.name}
                onChange={handleInputChange}
                className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                placeholder="Example: Kamakhya Restricted Belt"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1" htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formState.description}
                onChange={handleInputChange}
                className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                rows={3}
                placeholder="Why is this area risky or restricted?"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1" htmlFor="centerLat">Latitude</label>
                <input
                  id="centerLat"
                  name="centerLat"
                  type="number"
                  step="0.000001"
                  value={formState.centerLat}
                  onChange={handleInputChange}
                  className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1" htmlFor="centerLng">Longitude</label>
                <input
                  id="centerLng"
                  name="centerLng"
                  type="number"
                  step="0.000001"
                  value={formState.centerLng}
                  onChange={handleInputChange}
                  className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-200" htmlFor="map-picker">
                  Map picker
                </label>
                <p className="text-xs text-slate-400">
                  Click the map to drop the geo-fence center.
                </p>
              </div>
              <div id="map-picker" className="overflow-hidden rounded-2xl border border-white/10 h-64">
                <MapContainer
                  key={`${mapCenter.lat.toFixed(4)}-${mapCenter.lng.toFixed(4)}`}
                  center={[mapCenter.lat, mapCenter.lng]}
                  zoom={13}
                  scrollWheelZoom
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapClickHandler onSelect={handleMapClick} />
                  <LayerGroup>
                    {zones
                      .filter((zone) => zone?.id !== editingZoneId)
                      .map((zone) => {
                        const lat = parseCoordinate(zone.centerLat);
                        const lng = parseCoordinate(zone.centerLng);
                        const radius = Number(zone.radiusMeters);
                        if (lat === null || lng === null || !Number.isFinite(radius)) {
                          return null;
                        }
                        const style = riskLevelStyles[zone.riskLevel] ?? riskLevelStyles.MEDIUM;
                        return (
                          <Circle
                            key={zone.id}
                            center={[lat, lng]}
                            radius={radius}
                            pathOptions={style}
                          />
                        );
                      })}
                  </LayerGroup>
                  {currentLat !== null && currentLng !== null && (
                    <>
                      <CircleMarker
                        center={[currentLat, currentLng]}
                        radius={7}
                        pathOptions={{ color: '#14b8a6', fillColor: '#14b8a6', fillOpacity: 0.85 }}
                      />
                      {currentRadius && (
                        <Circle
                          center={[currentLat, currentLng]}
                          radius={currentRadius}
                          pathOptions={{ color: '#14b8a6', fillColor: '#14b8a6', fillOpacity: 0.1, dashArray: '6 6' }}
                        />
                      )}
                    </>
                  )}
                </MapContainer>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1" htmlFor="radiusMeters">Radius (meters)</label>
                <input
                  id="radiusMeters"
                  name="radiusMeters"
                  type="number"
                  min="50"
                  value={formState.radiusMeters}
                  onChange={handleInputChange}
                  className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1" htmlFor="riskLevel">Risk Level</label>
                <select
                  id="riskLevel"
                  name="riskLevel"
                  value={formState.riskLevel}
                  onChange={handleInputChange}
                  className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="active"
                name="active"
                type="checkbox"
                checked={formState.active}
                onChange={handleInputChange}
                className="w-4 h-4 rounded border-white/20 bg-slate-900/60"
              />
              <label htmlFor="active" className="text-sm text-slate-200">Zone active</label>
            </div>

            <div className="flex gap-3 pt-2">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
                className="bg-teal-500 text-slate-900 font-semibold px-4 py-2 rounded-lg shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? 'Saving…' : editingZoneId ? 'Update Zone' : 'Create Zone'}
              </motion.button>
              {editingZoneId && (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={resetForm}
                  className="bg-slate-800 text-slate-200 px-4 py-2 rounded-lg border border-white/10"
                >
                  Cancel
                </motion.button>
              )}
            </div>
          </form>
        </motion.section>

        <motion.section
          className="xl:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl backdrop-blur"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-semibold text-white">Configured Geo-Fences</h2>
              <p className="text-sm text-slate-300">Active zones will trigger alerts and lower safety scores on entry.</p>
            </div>
            <button
              type="button"
              onClick={loadZones}
              className="text-sm text-teal-300 hover:text-teal-200"
            >
              Refresh
            </button>
          </div>

          {isLoading ? (
            <p className="text-slate-300">Loading risk zones…</p>
          ) : zones.length === 0 ? (
            <p className="text-slate-400">No risk zones yet. Create one to begin tracking restricted areas.</p>
          ) : (
            <div className="space-y-4">
              {zones.map((zone) => {
                const meta = riskLevelMeta[zone.riskLevel] ?? riskLevelMeta.MEDIUM;
                return (
                  <div
                    key={zone.id}
                    className="border border-white/10 bg-slate-900/40 rounded-2xl px-4 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-white">{zone.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${meta.color}`}>
                          {meta.label}
                        </span>
                        {!zone.active && (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold border border-amber-400/40 bg-amber-500/10 text-amber-200">
                            Paused
                          </span>
                        )}
                      </div>
                      {zone.description && <p className="text-sm text-slate-300 max-w-2xl">{zone.description}</p>}
                      <p className="text-xs text-slate-400">
                        Center: {formatCoordinate(zone.centerLat)}, {formatCoordinate(zone.centerLng)} • Radius: {Math.round(zone.radiusMeters || 0)} m
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggle(zone.id, !zone.active)}
                        className="text-sm text-teal-300 hover:text-teal-100"
                      >
                        {zone.active ? 'Pause' : 'Activate'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEdit(zone)}
                        className="text-sm text-slate-200 hover:text-white"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(zone.id)}
                        className="text-sm text-rose-300 hover:text-rose-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.section>
      </div>
    </AdminLayout>
  );
};

export default AdminRiskZones;
