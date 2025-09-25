import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminStatCard from '../../components/admin/AdminStatCard';
import AlertsPanel from '../../components/admin/AlertsPanel';
import TouristTable from '../../components/admin/TouristTable';
import ActivityTimeline from '../../components/admin/ActivityTimeline';
import { getMockStats, mockAlerts, mockTourists, mockUnits } from '../../mock/adminData';

const AdminDashboard = () => {
  const stats = useMemo(() => getMockStats(), []);
  const [selectedUnit, setSelectedUnit] = useState(mockUnits[0]);
  const [focusedTouristId, setFocusedTouristId] = useState(null);
  const focusedTourist = useMemo(
    () => mockTourists.find(tourist => tourist.id === focusedTouristId) || null,
    [focusedTouristId]
  );

  return (
    <AdminLayout title="Command Dashboard" subtitle="Monitor SOS events, track tourists, and coordinate response units in real time.">
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <AdminStatCard icon="🚨" label="Critical SOS" value={stats.sosCount} tone="critical" trend="1 new alert in last 10 min" />
        <AdminStatCard icon="⚠️" label="Monitored Tourists" value={stats.monitoredTourists} tone="warning" trend="2 tourists entering watch zones" />
        <AdminStatCard icon="🛰️" label="Active Alerts" value={stats.activeAlerts} tone="info" trend="Auto-escalation enabled" />
        <AdminStatCard icon="🧭" label="Total Tourists" value={stats.totalTourists} />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <div className="xl:col-span-2">
          <AlertsPanel alerts={mockAlerts} onSelectAlert={(alert) => setFocusedTouristId(alert.touristId)} />
        </div>
        <motion.div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Response Units</h2>
          <div className="space-y-4">
            {mockUnits.map(unit => (
              <motion.button
                key={unit.id}
                onClick={() => setSelectedUnit(unit)}
                className={`w-full text-left p-4 rounded-xl border transition-colors ${selectedUnit.id === unit.id ? 'border-teal-400 bg-teal-500/10 text-teal-100' : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'}`}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{unit.id}</p>
                  <span className="text-xs uppercase tracking-wider">{unit.status}</span>
                </div>
                <p className="text-sm text-slate-300 mt-2">{unit.type}</p>
                <p className="text-xs text-slate-400 mt-1">ETA: {unit.etaMinutes} min • Last seen at {unit.lastKnownLocation}</p>
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
              <p>Last ping: {focusedTourist.lastPing}</p>
              <p>Last known area: {focusedTourist.lastKnownArea}</p>
              <p>Battery: {focusedTourist.battery}%</p>
            </div>
          </motion.div>
        )}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <TouristTable
            tourists={mockTourists}
            onFocusTourist={(tourist) => setFocusedTouristId(tourist.id)}
          />
        </div>
        <ActivityTimeline alerts={mockAlerts} tourists={mockTourists} />
      </section>
    </AdminLayout>
  );
};

export default AdminDashboard;
