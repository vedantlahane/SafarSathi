import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminStatCard from '../../components/admin/AdminStatCard';
import AlertsPanel from '../../components/admin/AlertsPanel';
import TouristTable from '../../components/admin/TouristTable';
import ActivityTimeline from '../../components/admin/ActivityTimeline';
import apiService from '../../services/apiService';
import { formatDateTime } from '../../utils/time';

const AdminDashboard = () => {
  const [state, setState] = useState({
    stats: null,
    alerts: [],
    tourists: [],
    responseUnits: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const [focusedTouristId, setFocusedTouristId] = useState(null);

  const refreshDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getAdminDashboardState();
      setState(data);
      setSelectedUnitId(prev => prev ?? data.responseUnits?.[0]?.id ?? null);
    } catch (dashboardError) {
      console.error('Failed to load admin dashboard', dashboardError);
      setError(dashboardError.message || 'Unable to load dashboard state.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshDashboard();
    const interval = setInterval(refreshDashboard, 15000);
    return () => clearInterval(interval);
  }, [refreshDashboard]);

  const stats = state.stats || { criticalAlerts: 0, activeAlerts: 0, monitoredTourists: 0, totalTourists: 0 };

  const selectedUnit = useMemo(
    () => state.responseUnits.find(unit => unit.id === selectedUnitId) || state.responseUnits[0] || null,
    [selectedUnitId, state.responseUnits]
  );

  const focusedTourist = useMemo(
    () => state.tourists.find(tourist => tourist.id === focusedTouristId) || null,
    [focusedTouristId, state.tourists]
  );

  const activeCriticalAlerts = useMemo(
    () => state.alerts.filter(alert => alert.priority?.toLowerCase() === 'critical' && (!alert.status || alert.status.toUpperCase() !== 'RESOLVED')).length,
    [state.alerts]
  );

  const safeTourists = useMemo(
    () => state.tourists.filter(tourist => (tourist.status || '').toLowerCase() === 'safe').length,
    [state.tourists]
  );

  const lastSyncLabel = useMemo(() => {
    const timestamps = [
      ...state.alerts.map(alert => alert.timestamp),
      ...state.tourists.map(tourist => tourist.lastPing)
    ]
      .map(value => (value ? new Date(value).getTime() : NaN))
      .filter(time => !Number.isNaN(time))
      .sort((a, b) => b - a);

    if (timestamps.length === 0) {
      return formatDateTime(new Date().toISOString());
    }

    return formatDateTime(new Date(timestamps[0]).toISOString());
  }, [state.alerts, state.tourists]);

  const statCards = useMemo(() => ([
    {
      icon: '🚨',
      label: 'Critical SOS',
      value: stats.criticalAlerts,
      tone: 'critical',
      trend: activeCriticalAlerts ? `${activeCriticalAlerts} unresolved` : 'No active SOS'
    },
    {
      icon: '⚠️',
      label: 'Monitored Tourists',
      value: stats.monitoredTourists,
      tone: 'warning',
      trend: stats.monitoredTourists ? 'Control room monitoring' : 'All tourists stable'
    },
    {
      icon: '🛰️',
      label: 'Active Alerts',
      value: stats.activeAlerts,
      tone: 'info',
      trend: `Last sync ${lastSyncLabel}`
    },
    {
      icon: '🧭',
      label: 'Total Tourists',
      value: stats.totalTourists,
      trend: `${safeTourists} in safe zones`
    }
  ]), [stats, activeCriticalAlerts, lastSyncLabel, safeTourists]);

  const handleAlertSelect = useCallback((alert) => {
    if (alert?.touristId) {
      setFocusedTouristId(alert.touristId);
    }
  }, []);

  const handleUnitSelect = useCallback((unit) => {
    setSelectedUnitId(unit?.id || null);
  }, []);

  if (loading && state.alerts.length === 0 && state.tourists.length === 0) {
    return (
      <AdminLayout title="Command Dashboard" subtitle="Monitor SOS events, track tourists, and coordinate response units in real time.">
        <div className="flex items-center justify-center py-24">
          <div className="bg-white/10 border border-white/10 rounded-2xl px-6 py-4 text-white/80">Synchronising live data…</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Command Dashboard" subtitle="Monitor SOS events, track tourists, and coordinate response units in real time.">
      {error && (
        <div className="mb-6 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={refreshDashboard} className="rounded-lg border border-red-300/40 px-3 py-1 text-xs font-semibold uppercase tracking-wide">Retry</button>
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {statCards.map(card => (
          <AdminStatCard key={card.label} {...card} />
        ))}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <div className="xl:col-span-2">
          <AlertsPanel alerts={state.alerts} onSelectAlert={handleAlertSelect} />
        </div>
        <motion.div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Response Units</h2>
            <button onClick={refreshDashboard} className="text-xs text-teal-200 hover:text-teal-100">Refresh</button>
          </div>
          <div className="space-y-4">
            {state.responseUnits.length === 0 && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                No response units registered yet.
              </div>
            )}
            {state.responseUnits.map(unit => (
              <motion.button
                key={unit.id}
                onClick={() => handleUnitSelect(unit)}
                className={`w-full text-left p-4 rounded-xl border transition-colors ${selectedUnit?.id === unit.id ? 'border-teal-400 bg-teal-500/10 text-teal-100' : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'}`}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{unit.name}</p>
                  <span className="text-xs uppercase tracking-wider">{unit.status}</span>
                </div>
                <p className="text-sm text-slate-300 mt-2">{unit.type} • {unit.city}</p>
                <p className="text-xs text-slate-400 mt-1">ETA: {unit.etaMinutes ?? '—'} min • Contact: {unit.contactNumber || '—'}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>
        {focusedTourist && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <h2 className="text-lg font-semibold text-white mb-3">Focused Tourist</h2>
            <div className="space-y-2 text-sm text-slate-200">
              <p className="text-base font-semibold text-white">{focusedTourist.name}</p>
              <p>Status: <span className="font-semibold uppercase">{focusedTourist.status}</span></p>
              <p>Last ping: {formatDateTime(focusedTourist.lastPing)}</p>
              <p>Last known area: {focusedTourist.lastKnownArea}</p>
              <p>Safety score: {Math.round((focusedTourist.safetyScore ?? 0) * 10) / 10}</p>
            </div>
          </motion.div>
        )}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <TouristTable
            tourists={state.tourists}
            onFocusTourist={(tourist) => setFocusedTouristId(tourist.id)}
          />
        </div>
        <ActivityTimeline alerts={state.alerts} tourists={state.tourists} />
      </section>
    </AdminLayout>
  );
};

export default AdminDashboard;
