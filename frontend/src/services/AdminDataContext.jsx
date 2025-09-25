import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import {
  tourists,
  alerts,
  responseUnits,
  watchZones,
  anomalyFeed,
  heatmapClusters,
  eFirQueue,
  getAuthorityStats,
  getHeatmapData,
  createEFirDraft
} from '../mock/appData';

const AdminDataContext = createContext(undefined);

export const AdminDataProvider = ({ children }) => {
  const [activeEFirs, setActiveEFirs] = useState(eFirQueue);
  const [assignedAlerts, setAssignedAlerts] = useState(() => new Map());

  const stats = useMemo(() => getAuthorityStats(), []);
  const heatmapData = useMemo(() => getHeatmapData(), []);

  const assignUnitToAlert = useCallback((alertId, unitId) => {
    setAssignedAlerts(prev => {
      const next = new Map(prev);
      next.set(alertId, unitId);
      return next;
    });
  }, []);

  const upsertEFir = useCallback((draft) => {
    setActiveEFirs(prev => {
      const filtered = prev.filter(record => record.id !== draft.id);
      return [...filtered, draft];
    });
  }, []);

  const createDraftFromAlert = useCallback((alertId) => {
    const draft = createEFirDraft(alertId);
    if (draft) {
      upsertEFir(draft);
    }
    return draft;
  }, [upsertEFir]);

  const value = useMemo(() => ({
    stats,
    tourists,
    alerts,
    responseUnits,
    watchZones,
    anomalyFeed,
    heatmapData,
    eFirQueue: activeEFirs,
    assignedAlerts,
    assignUnitToAlert,
    upsertEFir,
    createDraftFromAlert
  }), [stats, activeEFirs, assignedAlerts, heatmapData]);

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
};

export const useAdminData = () => {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error('useAdminData must be used within an AdminDataProvider');
  }
  return context;
};
