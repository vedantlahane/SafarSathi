import React, { useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '../services/AuthContext';
import { useTouristData } from '../services/TouristDataContext';
import { formatTime } from '../mock/appData';

const SectionCard = ({ title, children, accent = 'from-teal-500/10 via-slate-900 to-purple-500/10' }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className={`bg-gradient-to-br ${accent} border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-lg`}
  >
    <h2 className="text-lg font-semibold text-white mb-4">{title}</h2>
    {children}
  </motion.div>
);

const TouristIDVault = () => {
  const { user, updateUser } = useAuth();
  const {
    touristProfile,
    itinerary,
    emergencyContacts,
    wearableStatus,
    safetyTrend,
    travellerStats
  } = useTouristData();

  const [trackingOptIn, setTrackingOptIn] = useState(() => Boolean(user?.trackingOptIn));

  const handleShareId = useCallback(async () => {
    const sharePayload = `SafarSathi Digital ID\nName: ${touristProfile?.name}\nBlockchain ID: ${user?.blockchainID}\nLast Known Area: ${touristProfile?.lastKnownArea}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'SafarSathi Digital ID',
          text: sharePayload
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(sharePayload);
        toast.success('Digital ID copied to clipboard');
        return;
      }
      toast.success('Digital ID shared');
    } catch (error) {
      toast.error('Unable to share Digital ID');
    }
  }, [touristProfile, user]);

  const handleTrackingToggle = useCallback(() => {
    const next = !trackingOptIn;
    setTrackingOptIn(next);
    updateUser?.({ trackingOptIn: next });
    toast.info(next ? 'Real-time tracking enabled for authorities' : 'Real-time tracking paused');
  }, [trackingOptIn, updateUser]);

  const averageSafety = useMemo(() => {
    if (!safetyTrend.length) return 0;
    return Math.round(safetyTrend.reduce((acc, val) => acc + val, 0) / safetyTrend.length);
  }, [safetyTrend]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-5xl mx-auto mb-8"
      >
        <p className="text-sm uppercase tracking-widest text-teal-300/80">Digital Identity Command</p>
        <h1 className="text-3xl font-bold mt-2 flex items-center gap-3">
          <span>🆔 Tourist ID Vault</span>
        </h1>
        <p className="text-slate-300 mt-2">
          Secure overview of your blockchain ID, trip itinerary, emergency contacts, and safety consent preferences.
        </p>
      </motion.header>

      <div className="max-w-5xl mx-auto grid gap-6 lg:grid-cols-2">
        <SectionCard title="Blockchain Identity">
          <div className="space-y-3 text-sm text-slate-200">
            <p className="text-lg font-semibold text-white">{touristProfile?.name}</p>
            <p>Blockchain ID: <span className="font-mono bg-white/10 px-2 py-1 rounded-lg text-teal-200">{user?.blockchainID}</span></p>
            <p>Registered: {formatTime(touristProfile?.lastPing)}</p>
            <p>Trip Status: <span className="uppercase font-semibold text-amber-300">{touristProfile?.status}</span></p>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleShareId}
                className="bg-teal-500 hover:bg-teal-600 text-white font-semibold px-4 py-2 rounded-lg"
              >
                Share Digital ID
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleTrackingToggle}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2 rounded-lg border border-white/10"
              >
                {trackingOptIn ? 'Disable Tracking' : 'Enable Tracking'}
              </motion.button>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Safety Snapshot" accent="from-blue-500/10 via-slate-900 to-purple-500/10">
          <div className="grid grid-cols-2 gap-4 text-sm text-slate-200">
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-xs uppercase text-teal-300">Average Safety</p>
              <p className="text-2xl font-bold">{averageSafety}/100</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-xs uppercase text-amber-300">Active Warnings</p>
              <p className="text-2xl font-bold">{travellerStats.activeWarnings}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-xs uppercase text-blue-300">Safe Spots</p>
              <p className="text-2xl font-bold">{travellerStats.safePlaces}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-xs uppercase text-green-300">Avg Battery</p>
              <p className="text-2xl font-bold">{travellerStats.avgBattery}%</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Trip Itinerary">
          <ul className="space-y-3 text-sm text-slate-200">
            {itinerary.map(leg => (
              <li key={leg.id} className="bg-white/5 rounded-xl px-4 py-3 border border-white/10">
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-white">{leg.location}</p>
                  <span className="text-xs uppercase tracking-wide text-teal-200">{leg.status}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">ETA: {new Date(leg.eta).toLocaleString('en-IN')}</p>
              </li>
            ))}
            {!itinerary.length && <p className="text-slate-400">No itinerary uploaded for this trip.</p>}
          </ul>
        </SectionCard>

        <SectionCard title="Emergency Contacts" accent="from-red-500/10 via-slate-900 to-orange-500/10">
          <ul className="space-y-3 text-sm text-slate-200">
            {emergencyContacts.map(contact => (
              <li key={contact.id} className="bg-white/5 rounded-xl px-4 py-3 border border-white/10">
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold text-white">{contact.name}</p>
                    <p className="text-xs text-slate-400">{contact.relation}</p>
                  </div>
                  <span className={`text-xs font-semibold ${contact.reachable ? 'text-teal-300' : 'text-amber-300'}`}>
                    {contact.reachable ? 'Reachable' : 'Pending'}
                  </span>
                </div>
                <button
                  onClick={() => window.open(`tel:${contact.phone}`)}
                  className="mt-2 text-teal-300 hover:text-teal-200 text-xs underline"
                >
                  Call {contact.phone}
                </button>
              </li>
            ))}
            {!emergencyContacts.length && <p className="text-slate-400">Add trusted contacts to enable automated responses.</p>}
          </ul>
        </SectionCard>

        <SectionCard title="Wearable Status" accent="from-emerald-500/10 via-slate-900 to-cyan-500/10">
          {wearableStatus ? (
            <div className="grid grid-cols-2 gap-4 text-sm text-slate-200">
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs uppercase text-emerald-300">Device</p>
                <p className="text-base font-semibold">{wearableStatus.deviceId}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs uppercase text-emerald-300">Battery</p>
                <p className="text-2xl font-bold">{wearableStatus.battery}%</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs uppercase text-emerald-300">Heart Rate</p>
                <p className="text-2xl font-bold">{wearableStatus.heartRate} bpm</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs uppercase text-emerald-300">Last Sync</p>
                <p className="text-xs">{new Date(wearableStatus.lastSync).toLocaleString('en-IN')}</p>
              </div>
            </div>
          ) : (
            <p className="text-slate-400">No wearable linked to this account.</p>
          )}
        </SectionCard>
      </div>
    </div>
  );
};

export default TouristIDVault;
