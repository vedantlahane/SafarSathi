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
      className="min-h-screen bg-gradient-to-br from-slate-100 to-emerald-50 p-6"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="bg-white/80 backdrop-blur border border-white/60 rounded-3xl p-6 shadow">
          <div className="flex flex-wrap justify-between gap-4 items-center">
            <div>
              <p className="text-sm text-slate-500">{t('common.appName')}</p>
              <h1 className="text-3xl font-bold text-slate-800">{t('safetyCenter.title')}</h1>
              <p className="text-sm text-slate-500 mt-2">Live monitoring enabled for {profile?.name}</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl px-4 py-3 text-sm max-w-xs">
              <p className="font-semibold">24/7 Response Desk</p>
              <p>Alerts are auto-escalated if idle {'>'} 15 min in red zones.</p>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
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
