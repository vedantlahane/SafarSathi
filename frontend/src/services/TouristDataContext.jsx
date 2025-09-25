import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import {
  fetchTouristProfile,
  fetchItinerary,
  fetchEmergencyContacts,
  fetchAnomalies,
  fetchGeoFenceZones,
  fetchIoTDevices,
  fetchBlockchainLogs,
  updatePreferences,
  generateDigitalIdPayload,
  generateEFIRDraft,
  acknowledgeAnomaly
} from './mockApi';

const TouristDataContext = createContext();

export const TouristDataProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [itinerary, setItinerary] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [zones, setZones] = useState([]);
  const [iotDevices, setIotDevices] = useState([]);
  const [blockchainLogs, setBlockchainLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const initialise = useCallback(async () => {
    try {
      setLoading(true);
      const [profileData, itineraryData, contactData, anomalyData, zoneData, iotData, logData] = await Promise.all([
        fetchTouristProfile(),
        fetchItinerary(),
        fetchEmergencyContacts(),
        fetchAnomalies(),
        fetchGeoFenceZones(),
        fetchIoTDevices(),
        fetchBlockchainLogs()
      ]);

      setProfile(profileData);
      setItinerary(itineraryData);
      setContacts(contactData);
      setAnomalies(anomalyData);
      setZones(zoneData);
      setIotDevices(iotData);
      setBlockchainLogs(logData);
    } catch (err) {
      console.error('Failed to initialise tourist data', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initialise();
  }, [initialise]);

  const refreshAnomalies = useCallback(async () => {
    const updated = await fetchAnomalies();
    setAnomalies(updated);
    return updated;
  }, []);

  const updatePreference = useCallback(async (partialPrefs) => {
    const updatedPrefs = await updatePreferences(partialPrefs);
    setProfile(prev => (prev ? { ...prev, preferences: updatedPrefs } : prev));
    return updatedPrefs;
  }, []);

  const markAnomalyResolved = useCallback(async (id) => {
    const updated = await acknowledgeAnomaly(id);
    if (updated) {
      setAnomalies(prev => prev.map(anom => (anom.id === id ? updated : anom)));
    }
    return updated;
  }, []);

  const getDigitalIdPayload = useCallback(async () => {
    return generateDigitalIdPayload();
  }, []);

  const createEFIR = useCallback(async ({ touristId, reason, location }) => {
    return generateEFIRDraft({ touristId, reason, location });
  }, []);

  const value = useMemo(() => ({
    profile,
    itinerary,
    contacts,
    anomalies,
    zones,
    iotDevices,
    blockchainLogs,
    loading,
    error,
    refreshAnomalies,
    updatePreference,
    getDigitalIdPayload,
    createEFIR,
    markAnomalyResolved
  }), [
    profile,
    itinerary,
    contacts,
    anomalies,
    zones,
    iotDevices,
    blockchainLogs,
    loading,
    error,
    refreshAnomalies,
    updatePreference,
    getDigitalIdPayload,
    createEFIR,
    markAnomalyResolved
  ]);

  return (
    <TouristDataContext.Provider value={value}>
      {children}
    </TouristDataContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTouristData = () => {
  const context = useContext(TouristDataContext);
  if (!context) {
    throw new Error('useTouristData must be used within a TouristDataProvider');
  }
  return context;
};
