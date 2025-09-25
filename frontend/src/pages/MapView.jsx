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

const policeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
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

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const handleChange = (event) => {
      if (event.matches) {
        setIsControlPanelOpen(false);
        setActivePanel('safety');
      }
    };

    if (mediaQuery.matches) {
      setIsControlPanelOpen(false);
      setActivePanel('safety');
    }

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Enhanced unsafe zones with time-based risk
  const unsafeZones = useMemo(() => {
    const hour = new Date().getHours();
    const isNight = hour >= 20 || hour <= 6;
    const mappedContextZones = (contextZones || []).map(zone => ({
      id: zone.id,
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
        id: 1,
        position: [28.6129, 77.2295],
        radius: 500,
        name: "Chandni Chowk Area",
        description: isNight ? "High risk after dark" : "Moderate pickpocketing risk",
        riskLevel: isNight ? "high" : "medium",
        incidents: 12
      },
      {
        id: 2,
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
          const newLocation = [position.coords.latitude, position.coords.longitude];
          setUserLocation(newLocation);
          setMapCenter(newLocation);
          calculateSafetyScore(position.coords.latitude, position.coords.longitude);
          checkProximityAlerts(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error('Location error:', error);
          toast.error('Unable to get your location');
        }
      );
    }
  }, [calculateSafetyScore, checkProximityAlerts]);

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
    toast.success('🔍 Real-time tracking started');
    
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000 // Cache location for 30 seconds to save battery
    };
    
    trackingRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = [position.coords.latitude, position.coords.longitude];
        setUserLocation(newLocation);
        calculateSafetyScore(position.coords.latitude, position.coords.longitude);
        checkProximityAlerts(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.error('Tracking error:', error);
        toast.error('Location tracking failed');
        setIsTracking(false);
      },
      options
    );
  }, [calculateSafetyScore, checkProximityAlerts]);
  
  /**
   * Stops the active geolocation watcher and informs the user.
   */
  const stopTracking = useCallback(() => {
    if (trackingRef.current) {
      navigator.geolocation.clearWatch(trackingRef.current);
      trackingRef.current = null;
    }
    setIsTracking(false);
    toast.info('📍 Tracking stopped');
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
    <div className="flex h-screen bg-slate-100">
      {/* Enhanced Map Controls - Sidebar */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-80 bg-white/90 backdrop-blur-lg shadow-xl p-6 overflow-y-auto border-r border-slate-200"
      >
        {/* Safety Score Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 mb-6 border border-blue-200"
        >
          <h3 className="text-lg font-bold text-slate-800 mb-4">🛡️ Safety Score</h3>
          <div className="flex items-center justify-center mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
              className={`relative w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold text-white ${
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
              <span className="text-sm absolute -bottom-1 right-0">/100</span>
            </motion.div>
          </div>
          <p className={`text-center font-semibold ${
            safetyScore > 70 ? 'text-green-700' : 
            safetyScore > 40 ? 'text-orange-700' : 'text-red-700'
          }`}>
            {safetyScore > 70 ? '✅ Safe Area' : 
             safetyScore > 40 ? '⚠️ Stay Alert' : '🚨 High Risk'}
          </p>
        </motion.div>
        
        {/* Control Group */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white/80 rounded-2xl p-6 mb-6 border border-slate-200"
        >
          <h3 className="text-lg font-bold text-slate-800 mb-4">📍 Location Services</h3>
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
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
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
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:from-red-600 hover:to-red-700 transition-all duration-200"
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
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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
          className="bg-white/80 rounded-2xl p-6 border border-slate-200"
        >
          <h4 className="text-lg font-bold text-slate-800 mb-4">📊 Area Statistics</h4>
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
                className="flex justify-between items-center py-2 px-3 bg-slate-50 rounded-lg"
              >
                <span className="text-slate-600 font-medium">{stat.label}:</span>
                <span className="text-slate-800 font-bold">{stat.value}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="h-full w-full"
        >
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            className="rounded-lg"
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
          transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
          className="absolute bottom-6 right-6 z-[1000]"
        >
          <SOSButton currentLocation={{ lat: userLocation[0], lng: userLocation[1] }} user={user} />
        </motion.div>
        
        {/* Safety Status */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="absolute top-6 right-6 z-[1000]"
        >
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-full shadow-lg backdrop-blur-lg border ${
            isTracking 
              ? 'bg-green-500/90 text-white border-green-400' 
              : 'bg-slate-500/90 text-white border-slate-400'
          }`}>
            <motion.span
              animate={{ scale: isTracking ? [1, 1.2, 1] : 1 }}
              transition={{ duration: 2, repeat: isTracking ? Infinity : 0 }}
              className={`w-2 h-2 rounded-full ${isTracking ? 'bg-white' : 'bg-gray-300'}`}
            />
            <span className="text-sm font-medium">
              {isTracking ? '🔍 Real-time Tracking Active' : '📍 Location Tracking Inactive'}
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MapView;