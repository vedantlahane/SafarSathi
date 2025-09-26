 //pages/Dashboard.jsx - Enhanced with real-time stats and better UX
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../services/AuthContext';
import SOSButton from '../components/SOSButton';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTouristData } from '../services/TouristDataContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import EmergencyContacts from '../components/EmergencyContacts';
import ItineraryTimeline from '../components/ItineraryTimeline';
import IoTDevicesPanel from '../components/IoTDevicesPanel';

const ICONS = Object.freeze({
  appMark: 'https://cdn-icons-png.flaticon.com/512/7116/7116261.png',
  blockchain: 'https://cdn-icons-png.flaticon.com/512/6715/6715231.png',
  statusSafe: 'https://cdn-icons-png.flaticon.com/512/8832/8832411.png',
  statusWarning: 'https://cdn-icons-png.flaticon.com/512/595/595067.png',
  statusDanger: 'https://cdn-icons-png.flaticon.com/512/564/564619.png',
  statSafetyScore: 'https://cdn-icons-png.flaticon.com/512/942/942748.png',
  statSafePlaces: 'https://cdn-icons-png.flaticon.com/512/992/992700.png',
  statAlertsSent: 'https://cdn-icons-png.flaticon.com/512/758/758732.png',
  statActiveTime: 'https://cdn-icons-png.flaticon.com/512/2088/2088617.png',
  actionMap: 'https://cdn-icons-png.flaticon.com/512/535/535137.png',
  actionSafety: 'https://cdn-icons-png.flaticon.com/512/6218/6218886.png',
  actionID: 'https://cdn-icons-png.flaticon.com/512/942/942722.png',
  actionShare: 'https://cdn-icons-png.flaticon.com/512/84/84380.png',
  actionContacts: 'https://cdn-icons-png.flaticon.com/512/552/552721.png',
  actionSOS: 'https://cdn-icons-png.flaticon.com/512/3134/3134898.png',
  itinerary: 'https://cdn-icons-png.flaticon.com/512/2830/2830308.png',
  tips: 'https://cdn-icons-png.flaticon.com/512/1827/1827370.png'
});

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  const {
    profile,
    itinerary,
    contacts,
    anomalies,
    zones,
    iotDevices,
    loading: dataLoading
  } = useTouristData();

  // Merge user's emergency contact from backend with mock contacts
  const allContacts = useMemo(() => {
    const userEmergencyContact = user?.emergencyContact;
    if (userEmergencyContact && userEmergencyContact.trim()) {
      const userContact = {
        id: 'user-emergency',
        name: 'Personal Emergency Contact',
        description: 'Your registered emergency contact',
        phone: userEmergencyContact,
        type: 'family',
        priority: 'critical'
      };
      // Add user contact at the beginning of the list
      return [userContact, ...(contacts || [])];
    }
    return contacts || [];
  }, [user?.emergencyContact, contacts]);

  const [currentLocation, setCurrentLocation] = useState(null);
  const [safetyStatus, setSafetyStatus] = useState('safe');
  const [lastActivity, setLastActivity] = useState(new Date());
  const [isSharing, setIsSharing] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [showItinerary, setShowItinerary] = useState(false);
  const [isOffline, setIsOffline] = useState(() => {
    if (typeof navigator === 'undefined') return false;
    return !navigator.onLine;
  });
  const locationWatchIdRef = useRef(null);
  const networkAnnouncedRef = useRef(false);

  const zoneList = useMemo(() => zones || [], [zones]);

  const stats = useMemo(() => {
    const completedStops = itinerary?.filter(leg => leg.status === 'completed').length || 0;
    const activeAlerts = anomalies?.filter(anomaly => !anomaly.resolved).length || 0;
    const startReference = user?.loginTime || (profile && profile.tripStart);
    const activeMinutes = startReference
      ? Math.max(1, Math.floor((Date.now() - new Date(startReference)) / 60000))
      : 0;
    const computedSafety = Math.max(
      35,
      Math.min(100, 95 - activeAlerts * 8 - zoneList.length * 2)
    );

    return {
      safePlaces: completedStops,
      alertsSent: activeAlerts,
      activeTime: activeMinutes,
      safetyScore: computedSafety
    };
  }, [itinerary, anomalies, zoneList, user?.loginTime, profile]);

  /**
   * Haversine distance between two coordinate pairs in meters.
   *
   * @param {number} lat1
   * @param {number} lng1
   * @param {number} lat2
   * @param {number} lng2
   * @returns {number} Distance in meters.
   */
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lng2-lng1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  const checkSafetyZone = useCallback((lat, lng) => {
    if (!zoneList.length) return;

    const activeZone = zoneList.find(zone => {
      const distance = calculateDistance(lat, lng, zone.center.lat, zone.center.lng);
      return distance < zone.radius;
    });

    if (activeZone && safetyStatus === 'safe') {
      setSafetyStatus('warning');
      const offlineSuffix = isOffline ? ' (Offline mode — alerts queued for sync)' : '';
      toast.warning(`${activeZone.name}: ${activeZone.reason}${offlineSuffix}`);
    } else if (!activeZone && safetyStatus === 'warning') {
      setSafetyStatus('safe');
      toast.success(t('dashboard.safeZoneMessage', 'You are now in a safe zone'));
    }
  }, [zoneList, safetyStatus, isOffline, t]);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setCurrentLocation(coords);
        setLastActivity(new Date());
        checkSafetyZone(coords.lat, coords.lng);
      },
      (error) => {
        console.error('Location error:', error);
        toast.error('Unable to get your location');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );
  }, [checkSafetyZone]);

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return undefined;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setCurrentLocation(coords);
        setLastActivity(new Date());
        checkSafetyZone(coords.lat, coords.lng);
      },
      (error) => {
        console.error('Location watch error:', error);
        if (error.code === error.PERMISSION_DENIED) {
          toast.error('Location permission denied. Geo-fence alerts are limited.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 10000
      }
    );

    locationWatchIdRef.current = watchId;

    return () => {
      if (typeof navigator !== 'undefined' && navigator.geolocation && locationWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(locationWatchIdRef.current);
        locationWatchIdRef.current = null;
      }
    };
  }, [checkSafetyZone]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  useEffect(() => {
    if (!networkAnnouncedRef.current) {
      networkAnnouncedRef.current = true;
      return;
    }

    if (isOffline) {
      toast.warning('Offline mode: alerts will be stored locally until you reconnect.');
    } else {
      toast.success('Connection restored. Syncing with control room.');
    }
  }, [isOffline]);

  useEffect(() => {
    if (currentLocation) {
      checkSafetyZone(currentLocation.lat, currentLocation.lng);
    }
  }, [currentLocation, checkSafetyZone]);

  const getTimeSinceActivity = useCallback(() => {

    const diff = new Date() - lastActivity;
    return Math.floor(diff / 60000);
  }, [lastActivity]);

  const handleSafeShare = useCallback(async () => {

    if (isSharing) {
      toast.info('Share already in progress...');
      return;
    }

    setIsSharing(true);

    try {
      const locationText = currentLocation
        ? `Current coordinates: ${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`
        : 'Location unavailable';

      if ('share' in navigator) {
        await navigator.share({
          title: 'SafarSathi - Safety Check-in',
          text: `Safety score ${stats.safetyScore}/100. ${locationText}`,
          url: window.location.origin
        });
        toast.success('Safety status shared successfully!');
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`Safety score ${stats.safetyScore}/100 • ${locationText}`);
        toast.success('Safety status copied to clipboard!');
      } else {
        toast.info(`Status: ${stats.safetyScore}/100 • ${locationText}`);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        toast.info('Share cancelled');
      } else if (error.name === 'InvalidStateError') {
        toast.warning('Please wait for previous share to complete');
      } else {
        console.error('Share error:', error);
        toast.error('Failed to share status');
      }
    } finally {
      setIsSharing(false);
    }
  }, [isSharing, currentLocation, stats.safetyScore]);

  const handleQuickSOS = useCallback(() => {
    const anchor = document.getElementById('sos-anchor');
    if (anchor) {
      anchor.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    toast.info('Hold the SOS button for 3 seconds to dispatch an alert.');
  }, []);

  const statCards = useMemo(
    () => [
      {
        iconSrc: ICONS.statSafetyScore,
        iconAlt: 'Safety score icon',
        title: t('dashboard.safetyScore'),
        value: `${stats.safetyScore}/100`,
        color: 'from-blue-500 to-blue-600'
      },
      {
        iconSrc: ICONS.statSafePlaces,
        iconAlt: 'Safe places icon',
        title: t('dashboard.safePlaces'),
        value: stats.safePlaces,
        color: 'from-green-500 to-green-600'
      },
      {
        iconSrc: ICONS.statAlertsSent,
        iconAlt: 'Alerts icon',
        title: t('dashboard.alertsSent'),
        value: stats.alertsSent,
        color: 'from-yellow-500 to-orange-500'
      },
      {
        iconSrc: ICONS.statActiveTime,
        iconAlt: 'Active time icon',
        title: t('dashboard.activeTime'),
        value: `${stats.activeTime} min`,
        color: 'from-purple-500 to-purple-600'
      }
    ],
    [stats, t]
  );

  const quickActions = useMemo(
    () => [
      { iconSrc: ICONS.actionSafety, iconAlt: 'Safety center icon', text: 'Safety Center', onClick: () => navigate('/safety'), color: 'from-indigo-500 to-purple-500' },
      { iconSrc: ICONS.actionSOS, iconAlt: 'Quick SOS icon', text: 'Quick SOS', onClick: handleQuickSOS, color: 'from-red-500 to-rose-500' },
      { iconSrc: ICONS.actionContacts, iconAlt: 'Emergency contacts icon', text: t('common.emergencyContacts'), onClick: () => setShowContacts(true), color: 'from-orange-500 to-red-500' },
      { iconSrc: ICONS.actionShare, iconAlt: 'Share status icon', text: t('common.shareLocation'), onClick: handleSafeShare, disabled: isSharing, color: 'from-emerald-500 to-teal-500' },
      { iconSrc: ICONS.actionID, iconAlt: 'Digital ID icon', text: 'Digital ID', onClick: () => navigate('/id'), color: 'from-slate-500 to-slate-600' }
    ],
    [navigate, handleSafeShare, handleQuickSOS, isSharing, t]
  );

  const timeSinceActivity = getTimeSinceActivity();

  // Helper for safety status color and text
  const statusColor =
    safetyStatus === 'warning'
      ? 'bg-orange-500'
      : safetyStatus === 'danger'
      ? 'bg-red-500'
      : 'bg-green-500';
  const statusText =
    safetyStatus === 'warning'
      ? isOffline
        ? 'Warning • Offline'
        : 'Warning Zone'
      : safetyStatus === 'danger'
      ? 'SOS Active'
      : isOffline
      ? 'All Clear • Offline'
      : 'All Clear';

  const statusIcon = useMemo(() => {
    if (safetyStatus === 'warning') return ICONS.statusWarning;
    if (safetyStatus === 'danger') return ICONS.statusDanger;
    return ICONS.statusSafe;
  }, [safetyStatus]);

  if (dataLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="bg-white px-6 py-4 rounded-2xl shadow-lg border border-slate-200">
          Loading your safety dashboard...
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 p-4 sm:p-6 pb-40 lg:pb-16"
    >
      <motion.header variants={itemVariants} className="bg-white/85 backdrop-blur-lg rounded-3xl p-6 mb-6 sm:mb-8 shadow-lg border border-white/30">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <motion.img
              src={ICONS.appMark}
              alt="SafarSathi icon"
              loading="lazy"
              className="w-12 h-12 md:w-14 md:h-14 drop-shadow-lg"
              initial={{ rotate: -10, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
            />
            <div>
              <motion.h1
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent"
              >
                {t('common.appName')}
              </motion.h1>
              <p className="text-slate-600 mt-2 text-sm sm:text-base">
                {t('dashboard.greeting', { name: profile?.name || user?.name || 'Traveller' })}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 sm:space-x-4">
            {isOffline && (
              <span className="flex items-center gap-2 bg-orange-500 text-white px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-sm">
                <span className="block w-2 h-2 bg-white rounded-full animate-pulse" />
                Offline Mode
              </span>
            )}
            <LanguageSwitcher compact />
            <span className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-sm">
              <img src={ICONS.blockchain} alt="Blockchain ID icon" loading="lazy" className="w-4 h-4" />
              {profile?.blockchainID ? `${profile.blockchainID.slice(0, 10)}...` : 'ID Pending'}
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors duration-200"
            >
              {t('common.logout')}
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Main Dashboard Layout - Left Half: Mini Map, Right Half: Safety Snapshot */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Left Half - Mini Map Preview */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/85 backdrop-blur-lg rounded-3xl p-4 shadow-lg border border-white/20"
        >
          <div className="relative">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
              🗺️ Live Safety Map
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="ml-2 w-2 h-2 bg-green-500 rounded-full"
              />
            </h2>
            
            {/* Mini Map Container */}
            <div className="relative h-96 bg-slate-100 rounded-2xl overflow-hidden border-2 border-slate-200">
              {/* Simulated Map Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-green-50 to-blue-100">
                {/* Grid pattern for map feel */}
                <div className="absolute inset-0 opacity-20" 
                     style={{ 
                       backgroundImage: 'linear-gradient(rgba(0,0,0,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.1) 1px, transparent 1px)',
                       backgroundSize: '20px 20px'
                     }}>
                </div>
                
                {/* Current Location - Blinking Marker */}
                <motion.div
                  initial={{ scale: 1, opacity: 0.7 }}
                  animate={{ 
                    scale: 1.3,
                    opacity: 1
                  }}
                  transition={{ repeat: Infinity, repeatType: 'mirror', duration: 1.5 }}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                >
                  <div className="relative">
                    <div className="w-6 h-6 bg-blue-500 rounded-full border-[3px] border-white shadow-lg flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-semibold whitespace-nowrap">
                      You are here
                    </div>
                  </div>
                </motion.div>
                
                {/* Unsafe Zone 1 */}
                <div className="absolute top-1/4 right-1/4 w-16 h-16 bg-red-500/30 rounded-full border-2 border-red-500/50">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-600 text-xl">
                    ⚠️
                  </div>
                </div>
                
                {/* Unsafe Zone 2 */}
                <div className="absolute bottom-1/3 left-1/4 w-20 h-20 bg-orange-500/30 rounded-full border-2 border-orange-500/50">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-orange-600 text-xl">
                    🚧
                  </div>
                </div>
                
                {/* Safe Zones */}
                <div className="absolute top-1/6 left-1/6 w-4 h-4 bg-green-500 rounded-full border-2 border-white">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-green-600">🏛️</div>
                </div>
                <div className="absolute bottom-1/4 right-1/6 w-4 h-4 bg-green-500 rounded-full border-2 border-white">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-green-600">🚔</div>
                </div>
              </div>
              
              {/* Map Controls Overlay */}
              <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md p-2">
                <div className="text-xs text-slate-600 font-medium">Live Updates</div>
              </div>
              
              {/* Location Info Overlay */}
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md">
                <div className="text-xs text-slate-600">
                  {currentLocation 
                    ? `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`
                    : 'Getting location...'
                  }
                </div>
              </div>
            </div>
            
            {/* Open Full Map Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/map')}
              className="absolute bottom-6 right-6 bg-gradient-to-r from-teal-500 to-blue-500 text-white px-4 py-2 rounded-lg font-semibold shadow-lg flex items-center space-x-2 hover:shadow-xl transition-all duration-200"
            >
              <span>🗺️</span>
              <span>Open Full Safety Map</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Right Half - Safety Snapshot */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          {/* Current Status Card */}
          <div className={`${statusColor} text-white p-6 rounded-2xl shadow-xl transition-colors duration-500`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-80 mb-1">Your Current Safety Status</p>
                <h2 className="text-3xl font-bold">All Clear</h2>
                <p className="text-sm mt-3">
                  Lat: 28.6561, Lng: 77.2408
                </p>
                <p className="text-xs opacity-70 mt-1">
                  Last activity: 0 min ago
                </p>
              </div>
              <div className="text-5xl">
                💚
              </div>
            </div>
          </div>

          {/* SOS Button and Stats Layout */}
          <div className="bg-white/85 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20" id="sos-anchor">
            <div className="flex items-center gap-6">
              {/* Left Side - SOS Button */}
              <div className="flex-shrink-0">
                <SOSButton currentLocation={currentLocation} user={profile} />
              </div>
              
              {/* Right Side - Vertical Stats */}
              <div className="flex-1 space-y-4">
                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-center justify-between bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-lg shadow-md"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-xl">🛡️</div>
                    <div>
                      <div className="text-sm opacity-80">Safety Score</div>
                      <div className="text-xl font-bold">{stats.safetyScore}/100</div>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-center justify-between bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-3 rounded-lg shadow-md"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-xl">⚠️</div>
                    <div>
                      <div className="text-sm opacity-80">Alerts Sent</div>
                      <div className="text-xl font-bold">{stats.alertsSent}</div>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-center justify-between bg-gradient-to-r from-purple-500 to-purple-600 text-white p-3 rounded-lg shadow-md"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-xl">⏱️</div>
                    <div>
                      <div className="text-sm opacity-80">Active Time</div>
                      <div className="text-xl font-bold">{stats.activeTime}m</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <motion.section
        variants={itemVariants}
        className="hidden lg:grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-10"
      >
        {quickActions.map((action, index) => (
          <motion.button
            key={action.text}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + index * 0.05 }}
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.97 }}
            onClick={action.onClick}
            disabled={action.disabled}
            className={`bg-gradient-to-r ${action.color} text-white p-4 rounded-xl shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex flex-col items-center space-y-3 transition-all duration-200`}
          >
            <img src={action.iconSrc} alt={action.iconAlt} loading="lazy" className="w-10 h-10 drop-shadow" />
            <span className="text-sm font-semibold text-center leading-tight">{action.text}</span>
          </motion.button>
        ))}
      </motion.section>

      <motion.section variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white/85 border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <img src={ICONS.itinerary} alt="Itinerary icon" loading="lazy" className="w-6 h-6" />
              <h2 className="text-lg font-semibold text-slate-800">Upcoming itinerary</h2>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Next stop: {itinerary?.[1]?.title || 'All clear'} • {itinerary?.[1]?.city || 'TBD'}
            </p>
            <button
              onClick={() => setShowItinerary(true)}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-slate-900 text-white hover:bg-black transition-colors duration-200"
            >
              View full itinerary
            </button>
          </div>
          <div className="bg-white/85 border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <img src={ICONS.tips} alt="Tips icon" loading="lazy" className="w-6 h-6" />
              <h2 className="text-lg font-semibold text-slate-800">Safety tips</h2>
            </div>
            <ul className="space-y-3 text-sm text-slate-600">
              <li>• Enable IoT wearable tracking before entering red zones.</li>
              <li>• Tap Safety Center to acknowledge AI anomalies.</li>
              <li>• Keep emergency contacts pinned via the quick action.</li>
            </ul>
          </div>
        </div>
        <IoTDevicesPanel devices={iotDevices} />
      </motion.section>



      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="lg:hidden fixed bottom-28 right-4 z-50"
        id="sos-anchor"
      >
        <div className="bg-white/95 backdrop-blur-xl border border-white/80 rounded-full p-2.5 shadow-2xl">
          <div className="max-w-[11.5rem]">
            <SOSButton currentLocation={currentLocation} user={profile} />
          </div>
        </div>
      </motion.div>

      <motion.nav
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="lg:hidden fixed bottom-4 left-4 right-4 z-40"
      >
        <div className="bg-white/95 backdrop-blur-lg border border-white/80 shadow-xl rounded-2xl px-4 py-3 flex gap-3 overflow-x-auto">
          {quickActions.map((action, index) => (
            <motion.button
              key={`mobile-${action.text}`}
              whileTap={{ scale: 0.96 }}
              onClick={action.onClick}
              disabled={action.disabled}
              className={`flex-shrink-0 min-w-[120px] bg-gradient-to-r ${action.color} text-white px-3 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold disabled:opacity-60`}
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              <img src={action.iconSrc} alt={action.iconAlt} loading="lazy" className="w-7 h-7" />
              <span className="text-left leading-tight">{action.text}</span>
            </motion.button>
          ))}
        </div>
      </motion.nav>

      <AnimatePresence>
        {showContacts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-xl w-full"
            >
              <EmergencyContacts contacts={allContacts} />
              <button
                onClick={() => setShowContacts(false)}
                className="mt-4 w-full bg-slate-900 text-white py-2 rounded-lg"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showItinerary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-3xl w-full"
            >
              <ItineraryTimeline itinerary={itinerary} />
              <button
                onClick={() => setShowItinerary(false)}
                className="mt-4 w-full bg-slate-900 text-white py-2 rounded-lg"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Dashboard;