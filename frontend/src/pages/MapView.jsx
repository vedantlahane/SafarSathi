//pages/MapView.jsx - Enhanced with AI safety scoring and real-time features
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { toast } from 'react-toastify';
import { useAuth } from '../services/AuthContext';
import { debounce, calculateDistance } from '../utils/helpers';
import SOSButton from '../components/SOSButton';
import { motion, AnimatePresence } from 'framer-motion';
import { useTouristData } from '../services/TouristDataContext';
import apiService from '../services/apiService';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const dangerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const policeIcon = L.divIcon({
  className: '',
  html: `
    <div style="
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: radial-gradient(circle at 30% 30%, #10b981, #059669 70%);
      border: 2px solid #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 6px 14px rgba(5, 150, 105, 0.35);
    ">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L3 7V10C3 16 7 20.5 12 22C17 20.5 21 16 21 10V7L12 2Z" fill="#fff"/>
        <path d="M12 4L6 7.5V10C6 14.5 9 18 12 19.5C15 18 18 14.5 18 10V7.5L12 4Z" fill="#059669"/>
        <path d="M10 12L11.5 13.5L15 10" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="12" cy="8.5" r="1.5" fill="#fff"/>
      </svg>
    </div>
  `,
  iconSize: [38, 38],
  iconAnchor: [19, 34],
  popupAnchor: [0, -30]
});

// Component to update map center
/**
 * Keeps the map viewport in sync with the provided center.
 *
 * @param {{ center: [number, number] }} props - Current location of the user.
 */
const MapUpdater = ({ center }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  
  return null;
};

/**
 * Interactive safety map rendering user position, AI-derived safety scoring,
 * and contextual overlays such as unsafe zones, police stations, and incidents.
 */
const MapView = () => {
  const { user } = useAuth();
  const { zones: contextZones } = useTouristData();
  const [userLocation, setUserLocation] = useState([28.6139, 77.2090]);
  const [isTracking, setIsTracking] = useState(false);
  const [safetyScore, setSafetyScore] = useState(85);
  const [incidents, setIncidents] = useState([]);
  const [mapCenter, setMapCenter] = useState([28.6139, 77.2090]);
  const [isSharing, setIsSharing] = useState(false);
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(false);
  const [activePanel, setActivePanel] = useState('safety');
  const trackingRef = useRef(null);

  const queueLocationPing = useMemo(() => {
    if (!user?.token || !user?.id) {
      return () => {};
    }

    return debounce((lat, lng, accuracy) => {
      apiService
        .locationPing(user.token, user.id, { lat, lng, accuracy })
        .catch((error) => {
          console.error('Location ping failed', error);
        });
    }, 2000);
  }, [user?.token, user?.id]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const handleChange = (event) => {
      if (event.matches) {
        setIsControlPanelOpen(false);
        setActivePanel('safety');
      }
    };

    handleChange(mediaQuery);

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }

    return undefined;
  }, []);

  // Enhanced unsafe zones with time-based risk
  const unsafeZones = useMemo(() => {
    const hour = new Date().getHours();
    const isNight = hour >= 20 || hour <= 6;
    const mappedContextZones = (contextZones || []).map(zone => ({
      id: zone.id
        ? `backend-zone-${zone.id}`
        : `backend-zone-${zone.center?.lat ?? 'lat'}-${zone.center?.lng ?? 'lng'}`,
      position: [zone.center.lat, zone.center.lng],
      radius: zone.radius,
      name: zone.name,
      description: zone.reason,
      riskLevel: zone.level === 'critical' ? 'high' : zone.level === 'warning' ? 'medium' : 'low',
      incidents: zone.level === 'critical' ? 8 : 3
    }));

    return [
      ...mappedContextZones,
      {
        id: 'static-chandni-chowk',
        position: [28.6129, 77.2295],
        radius: 500,
        name: "Chandni Chowk Area",
        description: isNight ? "High risk after dark" : "Moderate pickpocketing risk",
        riskLevel: isNight ? "high" : "medium",
        incidents: 12
      },
      {
        id: 'static-noida-sector-18',
        position: [28.5355, 77.3910],
        radius: 800,
        name: "Noida Sector 18",
        description: "Commercial area - stay alert",
        riskLevel: "medium",
        incidents: 7
      }
    ];
  }, [contextZones]);

  // Police stations with real-time availability
  const policeStations = [
    {
      id: 1,
      position: [28.6289, 77.2065],
      name: "CP Police Station",
      contact: "100",
      available: true,
      responseTime: "3-5 min"
    },
    {
      id: 2,
      position: [28.6562, 77.2410],
      name: "Red Fort Police",
      contact: "100",
      available: true,
      responseTime: "5-7 min"
    }
  ];

  const controlTabs = useMemo(
    () => [
      {
        id: 'safety',
        label: 'Safety',
        description: `${safetyScore}/100`,
        status:
          safetyScore > 70 ? 'Stable' : safetyScore > 40 ? 'Caution' : 'Risk'
      },
      {
        id: 'services',
        label: isTracking ? 'Tracking On' : 'Tracking Off',
        description: isTracking ? 'Live updates active' : 'Tap to start',
        status: isTracking ? 'Active' : 'Idle'
      },
      {
        id: 'stats',
        label: 'Nearby Data',
        description: `${incidents.length} alerts • ${policeStations.length} police`,
        status: 'Insights'
      }
    ],
    [safetyScore, isTracking, incidents.length, policeStations.length]
  );

  // AI-powered safety score calculation
  /**
   * Estimates a contextual safety score by blending proximity to unsafe zones,
   * time-of-day penalties, and bonuses for nearby police stations.
   *
   * @param {number} lat - Latitude to evaluate.
   * @param {number} lng - Longitude to evaluate.
   */
  const calculateSafetyScore = useCallback((lat, lng) => {
    let score = 100;
    
    unsafeZones.forEach(zone => {
      const distance = calculateDistance(lat, lng, zone.position[0], zone.position[1]);
      if (distance < zone.radius * 2) {
        const proximity = 1 - (distance / (zone.radius * 2));
        const riskFactor = zone.riskLevel === 'high' ? 30 : 15;
        score -= proximity * riskFactor;
      }
    });
    
    // Time-based adjustment
    const hour = new Date().getHours();
    if (hour >= 22 || hour <= 5) score -= 10;
    
    // Proximity to police stations bonus
    policeStations.forEach(station => {
      const distance = calculateDistance(lat, lng, station.position[0], station.position[1]);
      if (distance < 1000) score += 5;
    });
    
    setSafetyScore(Math.max(0, Math.min(100, Math.round(score))));
  }, [unsafeZones]);

  // Sync map center with user location
  useEffect(() => {
    setMapCenter(userLocation);
  }, [userLocation]);

  // Smart proximity alerts with throttling
  /**
   * Emits throttled warnings when the user enters a high-risk zone and logs it to the console.
   */
  const checkProximityAlerts = useCallback(
    debounce((lat, lng) => {
      unsafeZones.forEach(zone => {
        const distance = calculateDistance(lat, lng, zone.position[0], zone.position[1]);
        
        if (distance < zone.radius && zone.riskLevel === 'high') {
          toast.warning(`⚠️ High risk area: ${zone.name}`, {
            toastId: `zone-${zone.id}` // Prevent duplicate toasts
          });
          
          // Log to blockchain
          const log = {
            userId: user?.blockchainID,
            event: 'high_risk_zone_entry',
            zone: zone.name,
            timestamp: new Date().toISOString()
          };
          console.log('Blockchain Log:', log);
        }
      });
    }, 2000),
    [unsafeZones, user]
  );

  /**
   * Fetches the latest device position and recalculates contextual safety data.
   */
  const getCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy: rawAccuracy } = position.coords;
          const newLocation = [latitude, longitude];
          const accuracy = Number.isFinite(rawAccuracy) ? Math.round(rawAccuracy) : null;
          setUserLocation(newLocation);
          setMapCenter(newLocation);
          calculateSafetyScore(latitude, longitude);
          checkProximityAlerts(latitude, longitude);
          queueLocationPing(latitude, longitude, accuracy);
        },
        (error) => {
          console.error('Location error:', error);
          toast.error('Unable to get your location');
        }
      );
    }
  }, [calculateSafetyScore, checkProximityAlerts, queueLocationPing]);

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  // Enhanced location tracking with battery optimization
  /**
   * Begins high-accuracy location tracking with sensible battery defaults and toast feedback.
   */
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }
    
    setIsTracking(true);
    
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000 // Cache location for 30 seconds to save battery
    };
    
    trackingRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy: rawAccuracy } = position.coords;
        const newLocation = [latitude, longitude];
        const accuracy = Number.isFinite(rawAccuracy) ? Math.round(rawAccuracy) : null;
        setUserLocation(newLocation);
        calculateSafetyScore(latitude, longitude);
        checkProximityAlerts(latitude, longitude);
        queueLocationPing(latitude, longitude, accuracy);
      },
      (error) => {
        console.error('Tracking error:', error);
        toast.error('Location tracking failed');
        setIsTracking(false);
      },
      options
    );
  }, [calculateSafetyScore, checkProximityAlerts, queueLocationPing]);
  
  /**
   * Stops the active geolocation watcher and informs the user.
   */
  const stopTracking = useCallback(() => {
    if (trackingRef.current) {
      navigator.geolocation.clearWatch(trackingRef.current);
      trackingRef.current = null;
    }
    setIsTracking(false);
  }, []);

  // Safe sharing function to prevent multiple simultaneous shares
  /**
   * Shares the current coordinates using Web Share API fallback strategies.
   */
  const handleSafeShare = useCallback(async () => {
    if (isSharing) {
      toast.info('Share already in progress...');
      return;
    }

    setIsSharing(true);
    
    try {
      if ('share' in navigator) {
        await navigator.share({
          title: 'My Current Location - SafarSathi',
          text: `I'm currently at coordinates ${userLocation[0].toFixed(4)}, ${userLocation[1].toFixed(4)}. Shared via SafarSathi safety app.`,
          url: `https://maps.google.com/?q=${userLocation[0]},${userLocation[1]}`
        });
        toast.success('📤 Location shared successfully!');
      } else {
        // Fallback for browsers that don't support native sharing
        const locationText = `My location: ${userLocation[0].toFixed(4)}, ${userLocation[1].toFixed(4)} - https://maps.google.com/?q=${userLocation[0]},${userLocation[1]}`;
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(locationText);
          toast.success('📋 Location copied to clipboard!');
        } else {
          toast.info('📍 Location: ' + locationText);
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        // User cancelled the share
        toast.info('Share cancelled');
      } else if (error.name === 'InvalidStateError') {
        toast.warning('Please wait for previous share to complete');
      } else {
        console.error('Share error:', error);
        toast.error('Failed to share location');
      }
    } finally {
      setIsSharing(false);
    }
  }, [userLocation, isSharing]);

  // Initialize location and incidents on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = [position.coords.latitude, position.coords.longitude];
          setUserLocation(newLocation);
          calculateSafetyScore(position.coords.latitude, position.coords.longitude);
        },
        (error) => console.error('Location error:', error)
      );
    }
    
    // Generate recent incidents for demo
    const mockIncidents = [
      { id: 1, lat: 28.6149, lng: 77.2090, type: 'theft', time: '2 hours ago' },
      { id: 2, lat: 28.6200, lng: 77.2100, type: 'harassment', time: '5 hours ago' },
      { id: 3, lat: 28.5400, lng: 77.3900, type: 'scam', time: '1 day ago' }
    ];
    setIncidents(mockIncidents);
    
    // Cleanup on unmount
    return () => {
      if (trackingRef.current) {
        navigator.geolocation.clearWatch(trackingRef.current);
      }
    };
  }, [calculateSafetyScore]);

  const renderPanelContent = () => {
    if (activePanel === 'services') {
      return (
        <div className="space-y-5">
          <div className="grid gap-3">
            {!isTracking ? (
              <button
                onClick={startTracking}
                className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
              >
                Enable real-time tracking
              </button>
            ) : (
              <button
                onClick={stopTracking}
                className="w-full rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:from-red-600 hover:to-red-700 transition-all duration-200"
              >
                Stop tracking
              </button>
            )}
            <button
              onClick={handleSafeShare}
              disabled={isSharing}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSharing ? 'Sharing status…' : 'Share my live location'}
            </button>
          </div>
          <div className="rounded-2xl bg-slate-100 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-800">Quick tips</p>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>Keep tracking on while travelling solo.</li>
              <li>Use share to notify trusted contacts.</li>
              <li>Tap SOS anytime if you feel unsafe.</li>
            </ul>
          </div>
        </div>
      );
    }

    if (activePanel === 'stats') {
      return (
        <div className="space-y-5 text-sm">
          <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-4">
            <p className="font-semibold text-slate-800 mb-3">High-risk zones nearby</p>
            <div className="space-y-3">
              {unsafeZones.slice(0, 3).map(zone => (
                <div key={zone.id} className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-700">{zone.name}</p>
                    <p className="text-xs text-slate-500">{zone.description}</p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                    zone.riskLevel === 'high'
                      ? 'bg-red-100 text-red-600'
                      : zone.riskLevel === 'medium'
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-emerald-100 text-emerald-600'
                  }`}>{zone.riskLevel}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-4">
            <p className="font-semibold text-slate-800 mb-3">Recent incidents</p>
            <div className="space-y-2">
              {incidents.slice(0, 4).map(incident => (
                <div key={incident.id} className="flex items-center justify-between">
                  <span className="text-slate-600 capitalize">{incident.type}</span>
                  <span className="text-xs text-slate-500">{incident.time}</span>
                </div>
              ))}
              {incidents.length === 0 && (
                <p className="text-xs text-slate-400">No recent reports nearby.</p>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-5">
        <div
          className={`rounded-3xl p-6 text-center text-white shadow-lg bg-gradient-to-br ${
            safetyScore > 70
              ? 'from-green-500 to-emerald-500'
              : safetyScore > 40
              ? 'from-yellow-500 to-orange-500'
              : 'from-red-500 to-rose-500'
          }`}
        >
          <p className="text-xs uppercase tracking-widest opacity-80">Live safety score</p>
          <p className="mt-4 text-5xl font-black">{safetyScore}</p>
          <p className="text-sm font-medium opacity-90">out of 100</p>
          <p className="mt-4 text-sm font-semibold">
            {safetyScore > 70 ? 'Area looks safe right now.' : safetyScore > 40 ? 'Stay alert and keep tracking on.' : 'High risk nearby. Plan your exit and prepare SOS.'}
          </p>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 p-4 text-sm text-slate-600 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-800">Tracking status</span>
            <span className={`text-xs font-semibold ${isTracking ? 'text-emerald-600' : 'text-slate-500'}`}>
              {isTracking ? 'Active' : 'Paused'}
            </span>
          </div>
          <p className="mt-2 text-xs">{isTracking ? 'We are updating your location every few seconds.' : 'Enable tracking to get proactive alerts and safety tips.'}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="relative flex min-h-[100svh] flex-col bg-slate-950 text-slate-100 lg:flex-row">
      {/* Enhanced Map Controls - Sidebar */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="hidden w-full max-w-xs flex-col gap-6 border border-white/10 bg-slate-900/70 p-6 shadow-xl backdrop-blur lg:flex"
      >
        {/* Safety Score Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="rounded-2xl border border-white/10 bg-slate-950/60 p-6 shadow"
        >
          <h3 className="mb-4 text-lg font-bold text-white">🛡️ Safety Score</h3>
          <div className="mb-4 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
              className={`relative flex h-24 w-24 items-center justify-center rounded-full text-2xl font-bold text-white ${
                safetyScore > 70
                  ? 'bg-gradient-to-r from-green-500 to-green-600'
                  : safetyScore > 40
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                  : 'bg-gradient-to-r from-red-500 to-red-600'
              }`}
            >
              <motion.span
                key={safetyScore}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {safetyScore}
              </motion.span>
              <span className="absolute -bottom-1 right-0 text-sm">/100</span>
            </motion.div>
          </div>
          <p
            className={`text-center text-sm font-semibold ${
              safetyScore > 70
                ? 'text-emerald-200'
                : safetyScore > 40
                ? 'text-amber-200'
                : 'text-rose-200'
            }`}
          >
            {safetyScore > 70 ? '✅ Safe Area' : safetyScore > 40 ? '⚠️ Stay Alert' : '🚨 High Risk'}
          </p>
        </motion.div>

        {/* Control Group */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="rounded-2xl border border-white/10 bg-slate-950/60 p-6"
        >
          <h3 className="mb-4 text-lg font-bold text-white">📍 Location Services</h3>
          <div className="space-y-3">
            <AnimatePresence mode="wait">
              {!isTracking ? (
                <motion.button
                  key="start"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startTracking}
                  className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-600 hover:to-blue-700"
                >
                  🔍 Start Tracking
                </motion.button>
              ) : (
                <motion.button
                  key="stop"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={stopTracking}
                  className="w-full rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-red-600 hover:to-red-700"
                >
                  ⏹️ Stop Tracking
                </motion.button>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSafeShare}
              disabled={isSharing}
              className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-purple-600 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSharing ? '⏳ Sharing...' : '📤 Share Location'}
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Group */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="rounded-2xl border border-white/10 bg-slate-950/60 p-6"
        >
          <h4 className="mb-4 text-lg font-bold text-white">📊 Area Statistics</h4>
          <div className="space-y-3">
            {[
              { label: 'Recent Incidents', value: incidents.length },
              { label: 'Police Nearby', value: policeStations.length },
              { label: 'Response Time', value: '~5 min' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2"
              >
                <span className="font-medium text-slate-300">{stat.label}:</span>
                <span className="font-semibold text-slate-100">{stat.value}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Map Container */}
  <div className="relative w-full flex-1 min-h-[70vh] lg:min-h-screen">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="h-full w-full"
        >
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ height: '100%', width: '100%', minHeight: '100vh' }}
            className="h-full w-full rounded-none border border-white/15 shadow-sm lg:rounded-xl"
          >
            <MapUpdater center={userLocation} />
            
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* User Location */}
            <Marker position={userLocation} icon={userIcon}>
              <Popup>
                <div className="p-2">
                  <strong className="text-blue-600">📍 Your Location</strong>
                  <p className="text-sm text-slate-600">Safety Score: {safetyScore}/100</p>
                  <p className="text-sm text-slate-600">Status: {isTracking ? '🔍 Tracking' : '📍 Static'}</p>
                </div>
              </Popup>
            </Marker>
            
            {/* Unsafe Zones */}
            {unsafeZones.map(zone => (
              <React.Fragment key={zone.id}>
                <Circle
                  center={zone.position}
                  radius={zone.radius}
                  pathOptions={{
                    color: zone.riskLevel === 'high' ? '#ff4444' : '#ffaa00',
                    fillColor: zone.riskLevel === 'high' ? '#ff4444' : '#ffaa00',
                    fillOpacity: 0.2,
                    weight: 2,
                    dashArray: zone.riskLevel === 'high' ? '10, 5' : null
                  }}
                />
                <Marker position={zone.position} icon={dangerIcon}>
                  <Popup>
                    <div className="p-2">
                      <strong className="text-red-600">⚠️ {zone.name}</strong>
                      <p className="text-sm text-slate-600">Risk: {zone.riskLevel.toUpperCase()}</p>
                      <p className="text-sm text-slate-600">{zone.description}</p>
                      <p className="text-sm text-slate-600">Incidents: {zone.incidents}</p>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            ))}

            {/* Police Stations */}
            {policeStations.map(station => (
              <Marker key={station.id} position={station.position} icon={policeIcon}>
                <Popup>
                  <div className="p-2">
                    <strong className="text-green-600">🚔 {station.name}</strong>
                    <p className="text-sm text-slate-600">Status: {station.available ? '✅ Available' : '🔴 Busy'}</p>
                    <p className="text-sm text-slate-600">Response: {station.responseTime}</p>
                    <button 
                      onClick={() => window.open(`tel:${station.contact}`)}
                      className="mt-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1 px-2 rounded transition-colors duration-200"
                    >
                      📞 Call Emergency
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
            
            {/* Recent Incidents */}
            {incidents.map(incident => (
              <Circle
                key={incident.id}
                center={[incident.lat, incident.lng]}
                radius={100}
                pathOptions={{
                  color: '#ff6b6b',
                  fillColor: '#ff6b6b',
                  fillOpacity: 0.1,
                  weight: 1
                }}
              />
            ))}
          </MapContainer>
        </motion.div>
        
        {/* Floating SOS Button */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
          className="absolute right-4 bottom-28 z-[1000] sm:right-6 sm:bottom-6"
        >
          <SOSButton currentLocation={{ lat: userLocation[0], lng: userLocation[1] }} user={user} />
        </motion.div>

        {/* Safety Status */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="absolute left-1/2 top-4 z-[1000] -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0"
        >
          <div
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium shadow-lg backdrop-blur ${
              isTracking
                ? 'border-teal-300/50 bg-teal-500/25 text-teal-100'
                : 'border-slate-300/40 bg-slate-800/80 text-slate-100'
            }`}
          >
            <motion.span
              animate={{ scale: isTracking ? [1, 1.2, 1] : 1 }}
              transition={{ duration: 2, repeat: isTracking ? Infinity : 0 }}
              className={`h-2 w-2 rounded-full ${isTracking ? 'bg-teal-100' : 'bg-slate-300'}`}
            />
            <span>{isTracking ? 'Tracking active' : 'Tracking paused'}</span>
          </div>
        </motion.div>
  </div>

      {/* Mobile Controls Trigger */}
      <motion.button
        type="button"
        onClick={() => setIsControlPanelOpen(true)}
        disabled={isControlPanelOpen}
        whileHover={isControlPanelOpen ? {} : { scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className="fixed bottom-4 left-1/2 z-[1100] flex -translate-x-1/2 items-center gap-3 rounded-full border border-teal-400/40 bg-teal-600/90 px-5 py-3 text-sm font-semibold text-white shadow-xl backdrop-blur lg:hidden disabled:cursor-default disabled:opacity-80"
      >
        Safety controls
        <span className="text-xs font-medium text-slate-300">
          {controlTabs.find(tab => tab.id === activePanel)?.description}
        </span>
      </motion.button>

      <AnimatePresence>
        {isControlPanelOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1200] lg:hidden"
          >
            <motion.div
              className="absolute inset-0 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsControlPanelOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 260, damping: 30 }}
              className="absolute inset-x-0 bottom-0 rounded-t-3xl border border-white/10 bg-slate-950 p-6 text-slate-100 shadow-2xl"
            >
              <div className="mx-auto h-1.5 w-14 rounded-full bg-slate-700" />
              <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                {controlTabs.map(tab => {
                  const isActive = tab.id === activePanel;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActivePanel(tab.id)}
                      className={`min-w-[120px] rounded-2xl border px-3 py-2 text-left text-xs transition-all duration-200 ${
                        isActive
                          ? 'border-teal-400/50 bg-teal-600/30 text-teal-100 shadow-md'
                          : 'border-white/10 bg-slate-900/70 text-slate-300'
                      }`}
                    >
                      <p className="font-semibold">{tab.label}</p>
                      <p className="mt-1 text-[11px] text-slate-400">{tab.description}</p>
                      <span className="mt-2 inline-block text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                        {tab.status}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-5 space-y-5 overflow-y-auto">
                {renderPanelContent()}
              </div>
              <button
                type="button"
                onClick={() => setIsControlPanelOpen(false)}
                className="mt-6 w-full rounded-xl border border-white/10 py-3 text-sm font-semibold text-slate-200"
              >
                Close panel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MapView;