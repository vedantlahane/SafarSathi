import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useTouristData } from '../services/TouristDataContext';
import AnomalyFeed from '../components/AnomalyFeed';
import GeoFenceAlertList from '../components/GeoFenceAlertList';
import TrackingPreferences from '../components/TrackingPreferences';
import VoiceAssistance from '../components/VoiceAssistance';

const SafetyCenter = () => {
  const { t } = useTranslation();
  const { anomalies, zones, profile, updatePreference, markAnomalyResolved, refreshAnomalies } = useTouristData();

  const handleUpdatePreferences = async (partial) => {
    await updatePreference(partial);
    toast.success('Preferences updated');
  };

  const handleResolve = async (id) => {
    await markAnomalyResolved(id);
    toast.success('Anomaly marked resolved');
    refreshAnomalies();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-[100svh] bg-slate-950 px-4 py-6 text-slate-100 sm:px-6"
    >
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-lg backdrop-blur">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t('common.appName')}</p>
              <h1 className="text-3xl font-semibold text-white sm:text-4xl">{t('safetyCenter.title')}</h1>
              <p className="mt-2 text-sm text-slate-300">Live monitoring enabled for {profile?.name}</p>
            </div>
            <div className="max-w-xs rounded-2xl border border-emerald-400/40 bg-emerald-600/20 px-4 py-3 text-sm text-emerald-100">
              <p className="font-semibold">24/7 Response Desk</p>
              <p className="mt-1 text-xs text-emerald-200/80">Alerts auto-escalate if idle {'>'} 15 min in red zones.</p>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <AnomalyFeed anomalies={anomalies} onResolve={handleResolve} />
            <GeoFenceAlertList zones={zones} />
          </div>
          <div className="space-y-6">
            <TrackingPreferences preferences={profile?.preferences} onUpdate={handleUpdatePreferences} />
            <VoiceAssistance />
          </div>
        </section>
      </div>
    </motion.div>
  );
};

export default SafetyCenter;
