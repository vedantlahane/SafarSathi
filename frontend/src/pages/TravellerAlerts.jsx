import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useTouristData } from '../services/TouristDataContext';
import { formatTime } from '../mock/appData';

const AlertCard = ({ alert, onShare, shared }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="bg-white/5 border border-white/10 rounded-2xl p-5"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-300">Alert • {formatTime(alert.timestamp)}</p>
        <p className="text-lg font-semibold text-white">{alert.description}</p>
      </div>
      <span className="text-xs px-3 py-1 rounded-full border border-white/20 text-slate-200">
        {alert.priority.toUpperCase()}
      </span>
    </div>
    <div className="flex flex-wrap gap-4 text-xs text-slate-300 mt-3">
      <span>Assigned: {alert.assignedUnit ?? 'Awaiting dispatch'}</span>
      <span>Tourist: {alert.touristName}</span>
    </div>
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => onShare(alert)}
      disabled={shared}
      className={`mt-4 text-sm font-semibold px-4 py-2 rounded-lg ${shared ? 'bg-white/10 text-slate-400 cursor-not-allowed' : 'bg-teal-500 text-white hover:bg-teal-600'}`}
    >
      {shared ? 'Shared with contacts' : 'Share live update'}
    </motion.button>
  </motion.div>
);

const AnomalyCard = ({ anomaly, acknowledged, onAcknowledge }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={`border rounded-2xl p-5 ${acknowledged ? 'border-white/10 bg-white/5 text-slate-200' : 'border-amber-400/60 bg-amber-500/10 text-amber-100'}`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm uppercase tracking-wide">{anomaly.type.replace('-', ' ')}</p>
        <p className="text-lg font-semibold">{anomaly.description}</p>
      </div>
      <span className="text-xs px-3 py-1 rounded-full border border-white/20">
        {anomaly.severity.toUpperCase()}
      </span>
    </div>
    <p className="text-xs mt-3 opacity-80">Detected at {new Date(anomaly.detectedAt).toLocaleString('en-IN')}</p>
    {!acknowledged && (
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => onAcknowledge(anomaly.id)}
        className="mt-4 text-sm font-semibold px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 hover:bg-white/20"
      >
        Acknowledge alert
      </motion.button>
    )}
  </motion.div>
);

const TravellerAlerts = () => {
  const {
    recentAlerts,
    anomalyFeed,
    sharedAlerts,
    acknowledgedAnomalies,
    markAlertShared,
    acknowledgeAnomaly
  } = useTouristData();

  const handleShare = useCallback(async (alert) => {
    const payload = `SafarSathi Alert\n${alert.description}\nPriority: ${alert.priority}\nLocation: ${alert.location.lat.toFixed(4)}, ${alert.location.lng.toFixed(4)}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: 'SafarSathi Alert', text: payload });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(payload);
        toast.success('Alert copied to clipboard');
      }
      markAlertShared(alert.id);
      toast.success('Alert shared successfully');
    } catch (error) {
      toast.error('Unable to share alert');
    }
  }, [markAlertShared]);

  const handleAcknowledge = useCallback((anomalyId) => {
    acknowledgeAnomaly(anomalyId);
    toast.info('Anomaly acknowledged');
  }, [acknowledgeAnomaly]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-5xl mx-auto mb-8"
      >
        <p className="text-sm uppercase tracking-widest text-teal-300/80">Real-time safety feed</p>
        <h1 className="text-3xl font-bold mt-2 flex items-center gap-3">
          <span>🚨 Alerts & Anomalies</span>
        </h1>
        <p className="text-slate-300 mt-2">Monitor SOS alerts, geo-fence warnings, and AI anomaly detections for your current trip.</p>
      </motion.header>

      <div className="max-w-5xl mx-auto grid gap-6 lg:grid-cols-2">
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Live Alerts</h2>
          {recentAlerts.length ? (
            recentAlerts.map(alert => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onShare={handleShare}
                shared={sharedAlerts.has(alert.id)}
              />
            ))
          ) : (
            <p className="text-sm text-slate-400">No alerts raised in the last 12 hours.</p>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-white">AI Anomaly Watch</h2>
          {anomalyFeed.length ? (
            anomalyFeed.map(anomaly => (
              <AnomalyCard
                key={anomaly.id}
                anomaly={anomaly}
                acknowledged={acknowledgedAnomalies.has(anomaly.id)}
                onAcknowledge={handleAcknowledge}
              />
            ))
          ) : (
            <p className="text-sm text-slate-400">No anomalies detected on your itinerary right now.</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default TravellerAlerts;
