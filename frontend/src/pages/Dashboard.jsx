
//pages/Dashboard.jsx - Enhanced with real-time stats and better UX
import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
      toast.warning(`⚠️ ${activeZone.name}: ${activeZone.reason}`);
    } else if (!activeZone && safetyStatus === 'warning') {
      setSafetyStatus('safe');
      toast.success('✅ You are now in a safe zone');
    }
  }, [zoneList, safetyStatus]);

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
        toast.success('📤 Safety status shared successfully!');
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`Safety score ${stats.safetyScore}/100 • ${locationText}`);
        toast.success('📋 Safety status copied to clipboard!');
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
      anchor.scrollIntoView({ behavior: 'smooth' });
    }
    toast.info('Hold the SOS button for 3 seconds to dispatch an alert.');
  }, []);

  const statCards = useMemo(() => ([
    { icon: '🛡️', title: t('dashboard.safetyScore'), value: `${stats.safetyScore}/100`, color: 'from-blue-500 to-blue-600' },
    { icon: '✅', title: t('dashboard.safePlaces'), value: stats.safePlaces, color: 'from-green-500 to-green-600' },
    { icon: '⚠️', title: t('dashboard.alertsSent'), value: stats.alertsSent, color: 'from-yellow-500 to-orange-500' },
    { icon: '⏱️', title: t('dashboard.activeTime'), value: `${stats.activeTime} min`, color: 'from-purple-500 to-purple-600' }
  ]), [stats, t]);

  const quickActions = useMemo(() => ([
    { icon: '🗺️', text: 'Safety Map', onClick: () => navigate('/map'), color: 'from-teal-500 to-blue-500' },
    { icon: '🛡️', text: 'Safety Center', onClick: () => navigate('/safety'), color: 'from-indigo-500 to-purple-500' },
    { icon: '🆔', text: 'Digital ID', onClick: () => navigate('/id'), color: 'from-slate-500 to-slate-600' },
    { icon: '📤', text: t('common.shareLocation'), onClick: handleSafeShare, disabled: isSharing, color: 'from-emerald-500 to-teal-500' },
    { icon: '📞', text: t('common.emergencyContacts'), onClick: () => setShowContacts(true), color: 'from-orange-500 to-red-500' },
    { icon: '🆘', text: 'Quick SOS', onClick: handleQuickSOS, color: 'from-red-500 to-rose-500' }
  ]), [navigate, handleSafeShare, handleQuickSOS, isSharing, t]);

  const timeSinceActivity = getTimeSinceActivity();

  if (dataLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="bg-white px-6 py-4 rounded-2xl shadow-lg border border-slate-200">
          Loading your safety dashboard...
        </div>
      </div>
    );
  }

  // Helper for safety status color and text
  const statusColor = safetyStatus === 'warning' ? 'bg-orange-500' : 
                      safetyStatus === 'danger' ? 'bg-red-500' : 'bg-green-500';
  const statusText = safetyStatus === 'warning' ? 'Warning Zone' : 
                      safetyStatus === 'danger' ? 'SOS Active' : 'All Clear';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 p-6"
    >
      <motion.header variants={itemVariants} className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 mb-8 shadow-lg border border-white/20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <motion.h1
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent"
            >
              🛡️ {t('common.appName')}
            </motion.h1>
            <p className="text-slate-600 mt-2">{t('dashboard.greeting', { name: profile?.name || user?.name || 'Traveller' })}</p>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSwitcher compact />
            <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-sm font-semibold">
              🔗 {profile?.blockchainID ? `${profile.blockchainID.slice(0, 10)}...` : 'ID Pending'}
            </span>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              {t('common.logout')}
            </motion.button>
          </div>
        </div>
      </motion.header>
      
      {/* Current Status and Location Card (JSX unchanged) */}
      <motion.div variants={itemVariants} className={`flex items-center justify-between ${statusColor} text-white p-6 rounded-2xl shadow-xl mb-8 transition-colors duration-500`}>
          <div>
              <p className="text-sm font-medium opacity-80 mb-1">Your Current Safety Status</p>
              <h2 className="text-3xl font-bold">{statusText}</h2>
              <p className="text-sm mt-3">
                  {currentLocation 
                      ? `Lat: ${currentLocation.lat.toFixed(4)}, Lng: ${currentLocation.lng.toFixed(4)}`
                      : 'Acquiring GPS Signal...'
                  }
              </p>
              <p className="text-xs opacity-70 mt-1">
                Last activity: {getTimeSinceActivity()} min ago
              </p>
          </div>
          <div className="text-5xl">
              {safetyStatus === 'safe' ? '💚' : safetyStatus === 'warning' ? '🧡' : '🛑'}
          </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-white/85 backdrop-blur-lg rounded-xl p-6 shadow-lg border border-white/20"
          >
            <div className="flex items-center space-x-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1, type: 'spring' }}
                className={`text-3xl bg-gradient-to-r ${stat.color} p-3 rounded-xl text-white shadow-lg`}
              >
                {stat.icon}
              </motion.div>
              <div>
                <h3 className="text-slate-600 font-medium">{stat.title}</h3>
                <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {quickActions.map((action, index) => (

          <motion.button
            key={action.text}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 + index * 0.05 }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={action.onClick}
            disabled={action.disabled}
            className={`bg-gradient-to-r ${action.color} text-white p-4 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center space-y-2 transition-all duration-200`}
          >
            <span className="text-2xl">{action.icon}</span>
            <span className="text-sm font-semibold text-center leading-tight">{action.text}</span>
          </motion.button>
        ))}
      </motion.div>
      <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white/85 border border-slate-200 rounded-3xl p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">🗓️ Upcoming itinerary</h2>
            <p className="text-sm text-slate-500 mb-4">Next stop: {itinerary?.[1]?.title || 'All clear'} • {itinerary?.[1]?.city}</p>
            <button
              onClick={() => setShowItinerary(true)}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-slate-900 text-white hover:bg-black"

            >
              View full itinerary
            </button>
          </div>
          <div className="bg-white/85 border border-slate-200 rounded-3xl p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">💡 Safety tips</h2>
            <ul className="space-y-3 text-sm text-slate-600">
              <li>• Enable IoT wearable tracking before entering red zones.</li>
              <li>• Tap Safety Center to acknowledge AI anomalies.</li>
              <li>• Keep emergency contacts pinned via the quick action.</li>
            </ul>
          </div>
        </div>
        <IoTDevicesPanel devices={iotDevices} />
      </motion.div>
      <motion.div variants={itemVariants} className="flex justify-center" id="sos-anchor">
        <div className="bg-white/85 backdrop-blur-lg rounded-3xl p-6 shadow-lg border border-white/20">
          <SOSButton currentLocation={currentLocation} user={profile} />

        </div>
      </motion.div>

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