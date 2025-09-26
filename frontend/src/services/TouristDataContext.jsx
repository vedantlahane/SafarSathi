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

const RISK_ZONE_CACHE_KEY = 'safarsathi:risk-zone-cache';

const cacheRiskZones = (zones) => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(RISK_ZONE_CACHE_KEY, JSON.stringify(zones));
  } catch (error) {
    console.warn('Unable to cache risk zones', error);
  }
};

const generateZoneId = () => {
  try {
    if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
      return window.crypto.randomUUID();
    }
    if (typeof globalThis !== 'undefined' && globalThis.crypto?.randomUUID) {
      return globalThis.crypto.randomUUID();
    }
  } catch (error) {
    console.warn('Failed to generate UUID, falling back to Math.random', error);
  }
  return `zone-${Math.random().toString(36).slice(2, 10)}`;
};

const normaliseBackendZones = (zones = []) =>
  zones
    .filter(Boolean)
    .map(zone => ({
      id: zone.id ?? zone.name ?? generateZoneId(),
      name: zone.name ?? 'Risk Zone',
      level: zone.riskLevel ? zone.riskLevel.toLowerCase() : 'warning',
      radius: Number(zone.radiusMeters ?? zone.radius ?? 0),
      center: {
        lat: Number(zone.centerLat ?? zone.center?.lat ?? 0),
        lng: Number(zone.centerLng ?? zone.center?.lng ?? 0)
      },
      reason: zone.description || zone.reason || 'Heightened risk area',
      source: 'backend',
      updatedAt: zone.updatedAt || zone.createdAt || new Date().toISOString()
    }))
    .filter(zone => !Number.isNaN(zone.center.lat) && !Number.isNaN(zone.center.lng) && zone.radius > 0);

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

  const loadRiskZones = useCallback(async () => {
    try {
      const backendZones = await apiService.getActiveRiskZones();
      const mapped = normaliseBackendZones(Array.isArray(backendZones) ? backendZones : []);

      if (mapped.length) {
        cacheRiskZones(mapped);
        return mapped;
      }

      // Fallback to cache if backend returned empty
      if (typeof window !== 'undefined' && window.localStorage) {
        const cached = window.localStorage.getItem(RISK_ZONE_CACHE_KEY);
        if (cached) {
          return JSON.parse(cached);
        }
      }

      const fallbackZones = await fetchGeoFenceZones();
      cacheRiskZones(fallbackZones);
      return fallbackZones;
    } catch (error) {
      console.warn('Risk zone fetch failed, attempting offline cache.', error);
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const cached = window.localStorage.getItem(RISK_ZONE_CACHE_KEY);
          if (cached) {
            return JSON.parse(cached);
          }
        }
      } catch (cacheError) {
        console.warn('Failed to parse cached risk zones', cacheError);
      }

      const fallbackZones = await fetchGeoFenceZones();
      cacheRiskZones(fallbackZones);
      return fallbackZones;
    }
  }, []);

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

      const [itineraryData, contactData, anomalyData, iotData, logData, zoneData] = await Promise.all([
        fetchItinerary(),
        fetchEmergencyContacts(),
        fetchAnomalies(),
        fetchIoTDevices(),
        fetchBlockchainLogs(),
        loadRiskZones()
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
  }, [loadRiskZones, user]);

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
