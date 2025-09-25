import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';
import {
  tourists,
  alerts,
  watchZones,
  travellerTips,
  getTravellerStats,
  getItineraryForTourist,
  getEmergencyContacts,
  getSafetyTrend,
  getAnomaliesForTourist,
  getWearableStatus
} from '../mock/appData';
import { useAuth } from './AuthContext';

const TouristDataContext = createContext(undefined);
const STORAGE_KEY = 'safarsathi_active_tourist';

const readStoredTouristId = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY);
};

const deriveDefaultTouristId = (user) => {
  if (user?.touristId) return user.touristId;
  const stored = readStoredTouristId();
  if (stored && tourists.some(t => t.id === stored)) {
    return stored;
  }
  return tourists[0]?.id ?? null;
};

export const TouristDataProvider = ({ children }) => {
  const { user } = useAuth();
  const [activeTouristId, setActiveTouristId] = useState(() => deriveDefaultTouristId(user));
  const [acknowledgedAnomalies, setAcknowledgedAnomalies] = useState(() => new Set());
  const [sharedAlerts, setSharedAlerts] = useState(() => new Set());

  useEffect(() => {
    const resolvedId = deriveDefaultTouristId(user);
    setActiveTouristId(resolvedId);
    if (resolvedId && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, resolvedId);
    }
  }, [user]);

  const touristProfile = useMemo(() => tourists.find(t => t.id === activeTouristId) ?? null, [activeTouristId]);
  const travellerStats = useMemo(() => getTravellerStats(), []);
  const itinerary = useMemo(() => getItineraryForTourist(activeTouristId), [activeTouristId]);
  const emergencyContactList = useMemo(() => getEmergencyContacts(activeTouristId), [activeTouristId]);
  const safetyTrend = useMemo(() => getSafetyTrend(activeTouristId), [activeTouristId]);
  const anomalyFeed = useMemo(() => getAnomaliesForTourist(activeTouristId), [activeTouristId]);
  const wearableStatus = useMemo(() => getWearableStatus(activeTouristId), [activeTouristId]);
  const geoFenceList = watchZones;
  const recentAlerts = alerts.filter(alert => alert.touristId === activeTouristId || alert.priority === 'critical');

  const changeActiveTourist = useCallback((touristId) => {
    if (!tourists.some(t => t.id === touristId)) return;
    setActiveTouristId(touristId);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, touristId);
    }
  }, []);

  const acknowledgeAnomaly = useCallback((anomalyId) => {
    setAcknowledgedAnomalies(prev => new Set(prev).add(anomalyId));
  }, []);

  const markAlertShared = useCallback((alertId) => {
    setSharedAlerts(prev => new Set(prev).add(alertId));
  }, []);

  const value = useMemo(() => ({
    activeTouristId,
    touristProfile,
    travellerStats,
    itinerary,
    emergencyContacts: emergencyContactList,
    safetyTrend,
    anomalyFeed,
    acknowledgedAnomalies,
    wearableStatus,
    geoFences: geoFenceList,
    travellerTips,
    recentAlerts,
    sharedAlerts,
    changeActiveTourist,
    acknowledgeAnomaly,
    markAlertShared
  }), [
    activeTouristId,
    touristProfile,
    travellerStats,
    itinerary,
    emergencyContactList,
    safetyTrend,
    anomalyFeed,
    acknowledgedAnomalies,
    wearableStatus,
    geoFenceList,
    sharedAlerts,
    recentAlerts,
    changeActiveTourist,
    acknowledgeAnomaly,
    markAlertShared
  ]);

  return (
    <TouristDataContext.Provider value={value}>
      {children}
    </TouristDataContext.Provider>
  );
};

export const useTouristData = () => {
  const context = useContext(TouristDataContext);
  if (!context) {
    throw new Error('useTouristData must be used within a TouristDataProvider');
  }
  return context;
};
