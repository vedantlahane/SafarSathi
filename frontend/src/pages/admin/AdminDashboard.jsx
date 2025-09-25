import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminStatCard from '../../components/admin/AdminStatCard';
import AlertsPanel from '../../components/admin/AlertsPanel';
import TouristTable from '../../components/admin/TouristTable';
import ActivityTimeline from '../../components/admin/ActivityTimeline';
import { getAuthorityStats, alerts, tourists, responseUnits } from '../../mock/appData';

const AdminDashboard = () => {
  const stats = useMemo(() => getAuthorityStats(), []);
  const [selectedUnit, setSelectedUnit] = useState(responseUnits[0]);
  const [focusTourist, setFocusTourist] = useState(null);

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
          <AlertsPanel alerts={alerts} onSelectAlert={(alert) => setFocusTourist(alert.touristId)} />
        </div>
        <motion.div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Response Units</h2>
          <div className="space-y-4">
            {responseUnits.map(unit => (
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
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <TouristTable
            tourists={tourists}
            onFocusTourist={(tourist) => setFocusTourist(tourist.id)}
          />
        </div>
        <ActivityTimeline alerts={alerts} tourists={tourists} />
      </section>
    </AdminLayout>
  );
};

export default AdminDashboard;
