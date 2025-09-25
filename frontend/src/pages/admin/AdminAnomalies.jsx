import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdminData } from '../../services/AdminDataContext';
import { getEmergencyContacts, getItineraryForTourist } from '../../mock/appData';
import { toast } from 'react-toastify';

const severityColor = {
  critical: 'border-red-500/60 bg-red-500/10 text-red-200',
  high: 'border-amber-500/60 bg-amber-500/10 text-amber-200',
  medium: 'border-blue-500/60 bg-blue-500/10 text-blue-200'
};

const AdminAnomalies = () => {
  const {
    anomalyFeed,
    tourists,
    alerts,
    responseUnits,
    assignUnitToAlert,
    createDraftFromAlert,
    eFirQueue,
    upsertEFir
  } = useAdminData();
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);

  const touristLookup = useMemo(() => (
    tourists.reduce((acc, t) => ({ ...acc, [t.id]: t }), {})
  ), [tourists]);

  const unresolvedAnomalies = useMemo(() => anomalyFeed, [anomalyFeed]);

  const handleAcknowledge = (anomaly) => {
    toast.success(`Anomaly ${anomaly.id} acknowledged. Monitoring active.`);
  };

  const handleAssignUnit = (alertId, unitId) => {
    assignUnitToAlert(alertId, unitId);
    toast.info(`Unit ${unitId} assigned to alert ${alertId}`);
  };

  const handleDraftEFir = (alertId) => {
    const draft = createDraftFromAlert(alertId);
    if (draft) {
      toast.success(`E-FIR draft ${draft.id} created`);
    } else {
      toast.error('Unable to create E-FIR draft for this alert');
    }
  };

  const handleUpdateEFirNotes = (draft, notes) => {
    const updated = { ...draft, notes };
    upsertEFir(updated);
    toast.success('E-FIR notes updated.');
  };

  return (
    <AdminLayout title="AI Anomaly Watch" subtitle="Investigate AI flagged behaviours and escalate cases with rapid tooling.">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          {unresolvedAnomalies.map(anomaly => {
            const tourist = touristLookup[anomaly.touristId];
            const linkedAlert = alerts.find(alert => alert.touristId === anomaly.touristId);
            return (
              <motion.div
                key={anomaly.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-white">⚠️ {anomaly.description}</p>
                    <p className="text-sm text-slate-300">Detected {new Date(anomaly.detectedAt).toLocaleString('en-IN')}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full border ${severityColor[anomaly.severity]}`}>
                    {anomaly.severity.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-200">
                  <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                    <p className="uppercase tracking-widest text-slate-400">Tourist</p>
                    <p className="text-sm font-semibold text-white">{tourist?.name}</p>
                    <p className="text-slate-400">{tourist?.lastKnownArea}</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                    <p className="uppercase tracking-widest text-slate-400">Linked Alert</p>
                    <p className="text-sm font-semibold text-white">{linkedAlert?.id ?? 'N/A'}</p>
                    <p className="text-slate-400">Status: {linkedAlert?.status ?? 'unassigned'}</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                    <p className="uppercase tracking-widest text-slate-400">Response Units</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {responseUnits.map(unit => (
                        <button
                          key={unit.id}
                          onClick={() => linkedAlert && handleAssignUnit(linkedAlert.id, unit.id)}
                          className="text-xs px-2 py-1 rounded-lg bg-white/10 border border-white/15 hover:bg-white/20"
                        >
                          {unit.id}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleAcknowledge(anomaly)}
                    className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/15"
                  >
                    Acknowledge
                  </motion.button>
                  {linkedAlert && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleDraftEFir(linkedAlert.id)}
                      className="px-4 py-2 rounded-lg bg-red-500/80 hover:bg-red-500 text-white font-semibold"
                    >
                      Generate E-FIR Draft
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setSelectedAnomaly({ anomaly, tourist })}
                    className="px-4 py-2 rounded-lg bg-teal-500/80 hover:bg-teal-500 text-white font-semibold"
                  >
                    View dossier
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
          {!unresolvedAnomalies.length && (
            <p className="text-sm text-slate-300">No anomalies require attention. Monitoring active.</p>
          )}
        </div>

        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <p className="text-lg font-semibold text-white mb-4">📄 Active E-FIR Drafts</p>
            <div className="space-y-3 text-xs text-slate-200">
              {eFirQueue.length ? eFirQueue.map(draft => (
                <div key={draft.id} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 space-y-2">
                  <div className="flex justify-between">
                    <p className="font-semibold text-white">{draft.id}</p>
                    <span className="uppercase text-amber-300">{draft.status}</span>
                  </div>
                  <p>Tourist: {draft.touristId}</p>
                  <p>Alert: {draft.alertId}</p>
                  <textarea
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                    rows={3}
                    defaultValue={draft.notes || ''}
                    placeholder="Add officer notes..."
                    onBlur={(event) => handleUpdateEFirNotes(draft, event.target.value)}
                  />
                </div>
              )) : <p>No E-FIR drafts yet. Generate one from an anomaly alert.</p>}
            </div>
          </motion.div>

          {selectedAnomaly && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6"
            >
              <div className="flex justify-between items-start">
                <p className="text-lg font-semibold text-white">🧾 Tourist Dossier</p>
                <button onClick={() => setSelectedAnomaly(null)} className="text-xs text-slate-300">Close</button>
              </div>
              <p className="text-sm text-slate-300 mt-2">{selectedAnomaly.tourist.name}</p>
              <p className="text-xs text-slate-400">Last known location: {selectedAnomaly.tourist.lastKnownArea}</p>
              <p className="text-xs text-slate-400 mt-2">Itinerary:</p>
              <ul className="space-y-1 text-xs text-slate-300 mt-1">
                {getItineraryForTourist(selectedAnomaly.tourist.id).map(stop => (
                  <li key={stop.id}>• {stop.location} ({stop.status})</li>
                ))}
              </ul>
              <p className="text-xs text-slate-400 mt-3">Emergency Contacts:</p>
              <ul className="space-y-1 text-xs text-slate-300 mt-1">
                {getEmergencyContacts(selectedAnomaly.tourist.id).map(contact => (
                  <li key={contact.id}>• {contact.name} ({contact.relation}) - {contact.phone}</li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnomalies;
