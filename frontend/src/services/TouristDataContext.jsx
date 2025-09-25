import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import {
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
import apiService from './apiService';
import { useAuth } from './AuthContext';

const TouristDataContext = createContext();

export const TouristDataProvider = ({ children }) => {
  const { user } = useAuth();
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
      
      // Fetch real profile data from backend if user is authenticated
      let profileData = null;
      if (user && user.id && user.token) {
        try {
          profileData = await apiService.getTouristProfile(user.id, user.token);
        } catch (profileError) {
          console.warn('Failed to fetch profile from backend, using user data from auth:', profileError);
          // Fallback to user data from auth context
          profileData = {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            passportNumber: user.passportNumber,
            dateOfBirth: user.dateOfBirth,
            address: user.address,
            gender: user.gender,
            nationality: user.nationality,
            emergencyContact: user.emergencyContact,
            currentLat: user.currentLat,
            currentLng: user.currentLng,
            lastSeen: user.lastSeen,
            blockchainID: user.qrContent ? user.qrContent.split('hash=')[1]?.substring(0, 12) : 'ID-PENDING',
            tripStart: user.loginTime || new Date().toISOString(),
            preferences: {
              shareLiveLocation: true,
              allowGeoFenceAlerts: true,
              allowIoTTracking: false,
              preferredLanguage: 'en'
            }
          };
        }
      }

      const [itineraryData, contactData, anomalyData, zoneData, iotData, logData] = await Promise.all([
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
  }, [user]);

  useEffect(() => {
    if (user) {
      initialise();
    }
  }, [initialise, user]);

  const refreshAnomalies = useCallback(async () => {
    const updated = await fetchAnomalies();
    setAnomalies(updated);
    return updated;
  }, []);

  const updatePreference = useCallback(async (partialPrefs) => {
    // TODO: Update preferences in backend when API is available
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
    if (profile) {
      // Use real profile data instead of mock data
      return {
        ...profile,
        issuedAt: profile.tripStart || new Date().toISOString(),
        expiresAt: profile.tripEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        safetyScore: 87, // This could be calculated based on real data
        lastKnownLocation: profile.currentLat && profile.currentLng ? {
          lat: profile.currentLat,
          lng: profile.currentLng,
          label: 'Current Location'
        } : {
          lat: 26.2006,
          lng: 92.9376,
          label: 'Location Not Available'
        }
      };
    }
    // Fallback to mock data if no profile available
    return generateDigitalIdPayload();
  }, [profile]);

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
