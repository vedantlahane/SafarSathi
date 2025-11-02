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
      className="space-y-6 text-slate-100"
    >
      <header className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 shadow-md backdrop-blur">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{t('common.appName')}</p>
            <h1 className="text-2xl font-semibold text-white">{t('safetyCenter.title')}</h1>
            <p className="mt-1 text-sm text-slate-300">Live monitoring enabled for {profile?.name}</p>
          </div>
          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-3 text-xs text-emerald-100">
            <p className="font-semibold">24/7 Response Desk</p>
            <p className="mt-1 text-emerald-200/80">Alerts auto-escalate if idle {'>'} 15 min in red zones.</p>
          </div>
        </div>
      </header>

      <section className="space-y-6">
        <AnomalyFeed anomalies={anomalies} onResolve={handleResolve} />
        <GeoFenceAlertList zones={zones} />
        <TrackingPreferences preferences={profile?.preferences} onUpdate={handleUpdatePreferences} />
        <VoiceAssistance />
      </section>
    </motion.div>
  );
};

export default SafetyCenter;
