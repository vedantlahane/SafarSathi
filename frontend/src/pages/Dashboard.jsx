//pages/Dashboard.jsx - Enhanced with real-time stats and better UX
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../services/AuthContext';
import SOSButton from '../components/SOSButton';
import { motion } from 'framer-motion';
import { useTouristData } from '../services/TouristDataContext';

/**
 * Presents the traveller dashboard with real-time safety metrics,
 * location awareness, and quick access to emergency actions.
 */
const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    touristProfile,
    travellerStats,
    safetyTrend,
    itinerary,
    emergencyContacts,
    anomalyFeed,
    acknowledgedAnomalies,
    wearableStatus,
    travellerTips,
    geoFences
  } = useTouristData();
  const [currentLocation, setCurrentLocation] = useState(null);
  const [safetyStatus, setSafetyStatus] = useState('safe');
  const [isSharing, setIsSharing] = useState(false);

  const currentSafetyScore = useMemo(() => {
    if (!safetyTrend.length) return 80;
    return safetyTrend[safetyTrend.length - 1];
  }, [safetyTrend]);

  const activeAnomalies = useMemo(
    () => anomalyFeed.filter(anomaly => !acknowledgedAnomalies.has(anomaly.id)),
    [anomalyFeed, acknowledgedAnomalies]
  );

  const highRiskZones = useMemo(
    () => geoFences.filter(zone => zone.baseRisk === 'high'),
    [geoFences]
  );

  const itineraryPreview = useMemo(() => itinerary.slice(0, 3), [itinerary]);
  const primaryContact = useMemo(() => emergencyContacts[0] ?? null, [emergencyContacts]);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  /**
   * Retrieves the device location (subject to permissions) and evaluates the surrounding zone.
   */
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          checkSafetyZone(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error('Location error:', error);
          toast.error('Unable to get your location');
        }
      );
    }
  };

  /**
   * Determines if the user is currently inside one of the mocked unsafe regions
   * and raises contextual toasts when the status changes.
   *
   * @param {number} lat - Current latitude.
   * @param {number} lng - Current longitude.
   */
  const checkSafetyZone = (lat, lng) => {
    const hour = new Date().getHours();
    const isNight = hour >= 20 || hour <= 6;

    let triggeredZone = null;

    geoFences.forEach(zone => {
      const [zoneLat, zoneLng] = zone.position;
      const distance = calculateDistance(lat, lng, zoneLat, zoneLng);
      const riskRadius = zone.radius;
      const isHighRisk = zone.baseRisk === 'high' || (zone.baseRisk === 'medium' && isNight);

      if (!triggeredZone && isHighRisk && distance < riskRadius) {
        triggeredZone = zone;
      }
    });

    if (triggeredZone && safetyStatus === 'safe') {
      setSafetyStatus('warning');
      toast.warning(`⚠️ High risk zone detected: ${triggeredZone.name}`);
    } else if (!triggeredZone && safetyStatus === 'warning') {
      setSafetyStatus('safe');
      toast.success('✅ You are now in a safe zone');
    }
  };

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

  // Safe sharing function to prevent multiple simultaneous shares
  /**
   * Shares or copies the current safety status using the Web Share API with fallbacks.
   */
  const handleSafeShare = async () => {
    if (isSharing) {
      toast.info('Share already in progress...');
      return;
    }

    setIsSharing(true);
    
    try {
      if ('share' in navigator) {
        await navigator.share({
          title: 'SafarSathi - Safety Check-in',
          text: `I'm checking in safely via SafarSathi. Current safety score: ${currentSafetyScore}/100. 🛡️`,
          url: window.location.origin
        });
        toast.success('📤 Safety status shared successfully!');
      } else {
        // Fallback for browsers that don't support native sharing
  const statusText = `SafarSathi Safety Check-in: I'm safe! Current safety score: ${currentSafetyScore}/100 🛡️ - ${window.location.origin}`;
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(statusText);
          toast.success('📋 Safety status copied to clipboard!');
        } else {
          toast.info('📍 Status: ' + statusText);
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
        toast.error('Failed to share status');
      }
    } finally {
      setIsSharing(false);
    }
  };

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
      {/* Header */}
      <motion.header variants={itemVariants} className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 mb-8 shadow-lg border border-white/20">
        <div className="flex items-center justify-between">
          <motion.h1
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent"
          >
            🛡️ SafarSathi
          </motion.h1>
          <div className="flex items-center space-x-4">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
              className="text-slate-700 font-semibold"
            >
              {user?.name}
            </motion.span>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium"
            >
              🔗 {user?.blockchainID?.slice(0, 8)}...
            </motion.span>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: "spring" }}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                safetyStatus === 'warning' ? 'bg-amber-500/20 text-amber-700 border border-amber-400/60' : 'bg-green-500/20 text-green-700 border border-green-400/60'
              }`}
            >
              {touristProfile?.status?.toUpperCase() || 'SAFE'} ZONE
            </motion.span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Logout
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Quick Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { icon: "🛡️", title: "Safety Score", value: `${currentSafetyScore}/100`, color: "from-blue-500 to-blue-600" },
          { icon: "✅", title: "Safe Places", value: travellerStats?.safePlaces ?? 0, color: "from-green-500 to-green-600" },
          { icon: "⚠️", title: "Alerts Sent", value: travellerStats?.alertsSent ?? 0, color: "from-yellow-500 to-orange-500" },
          { icon: "🛰️", title: "High-Risk Zones", value: highRiskZones.length, color: "from-purple-500 to-purple-600" }
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-white/80 backdrop-blur-lg rounded-xl p-6 shadow-lg border border-white/20"
          >
            <div className="flex items-center space-x-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1, type: "spring" }}
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
      
      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {[
          { icon: "🗺️", text: "Safety Map", onClick: () => navigate('/map'), color: "from-teal-500 to-blue-500" },
          { icon: "🚨", text: "Alerts Center", onClick: () => navigate('/alerts'), color: "from-red-500 to-pink-500" },
          { icon: "🆔", text: "Digital ID", onClick: () => navigate('/id-vault'), color: "from-cyan-500 to-blue-500" },
          { icon: "📤", text: "Share Location", onClick: handleSafeShare, disabled: isSharing, color: "from-purple-500 to-indigo-500" },
          {
            icon: "📞",
            text: primaryContact ? `Call ${primaryContact.name}` : 'Add Contact',
            onClick: () => {
              if (primaryContact) {
                window.open(`tel:${primaryContact.phone}`);
              } else {
                navigate('/id-vault');
              }
            },
            disabled: !primaryContact,
            color: "from-orange-500 to-red-500"
          }
        ].map((action, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 + index * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={action.onClick}
            disabled={action.disabled}
            className={`bg-gradient-to-r ${action.color} text-white p-6 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center space-y-3 transition-all duration-200`}
          >
            <span className="text-3xl">{action.icon}</span>
            <span className="font-semibold">{action.text}</span>
          </motion.button>
        ))}
      </motion.div>
      
      {/* Safety Tips */}
      <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 mb-8 shadow-lg border border-white/20">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="text-2xl font-bold text-slate-800 mb-6"
        >
          💡 Safety Tips
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {travellerTips.map((tip, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-100"
            >
              <p className="text-slate-700 text-sm">{tip}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
      
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-800">🤖 AI Anomaly Watch</h2>
            <span className="text-sm text-slate-500">{activeAnomalies.length} open</span>
          </div>
          <div className="space-y-4">
            {activeAnomalies.length ? (
              activeAnomalies.slice(0, 3).map(anomaly => (
                <div
                  key={anomaly.id}
                  className="border border-amber-200 rounded-xl px-4 py-3 bg-amber-50"
                >
                  <p className="text-sm font-semibold text-amber-900">{anomaly.description}</p>
                  <p className="text-xs text-amber-700 mt-1 uppercase tracking-wide">Severity: {anomaly.severity}</p>
                  <p className="text-xs text-amber-700 mt-1">Detected {new Date(anomaly.detectedAt).toLocaleString('en-IN')}</p>
                  <button
                    onClick={() => navigate('/alerts')}
                    className="mt-2 text-xs font-semibold text-amber-900 underline"
                  >
                    View details
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-600">No unresolved anomalies. You're in the clear!</p>
            )}
          </div>
        </motion.div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-slate-800">🧭 Today's Itinerary</h2>
              <button
                onClick={() => navigate('/id-vault')}
                className="text-xs text-teal-600 font-semibold underline"
              >
                Manage itinerary
              </button>
            </div>
            <div className="space-y-3">
              {itineraryPreview.length ? (
                itineraryPreview.map(stop => (
                  <div key={stop.id} className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                    <p className="text-sm font-semibold text-slate-700">{stop.location}</p>
                    <p className="text-xs text-slate-500">ETA: {new Date(stop.eta).toLocaleString('en-IN')}</p>
                    <span className="inline-block mt-1 text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600 uppercase tracking-wide">{stop.status}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-600">Upload your itinerary in the Digital ID vault to unlock smart routing.</p>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-slate-800">⌚ Wearable Status</h2>
              <span className={`text-xs font-semibold uppercase ${wearableStatus?.connected ? 'text-green-600' : 'text-red-500'}`}>
                {wearableStatus?.connected ? 'Connected' : 'Offline'}
              </span>
            </div>
            {wearableStatus ? (
              <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                <div className="bg-white rounded-xl p-4 border border-slate-100">
                  <p className="text-xs uppercase text-slate-400">Device ID</p>
                  <p className="text-base font-semibold text-slate-800">{wearableStatus.deviceId}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-100">
                  <p className="text-xs uppercase text-slate-400">Battery</p>
                  <p className="text-2xl font-bold text-slate-800">{wearableStatus.battery}%</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-100">
                  <p className="text-xs uppercase text-slate-400">Heart rate</p>
                  <p className="text-2xl font-bold text-slate-800">{wearableStatus.heartRate} bpm</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-100">
                  <p className="text-xs uppercase text-slate-400">Last sync</p>
                  <p className="text-xs text-slate-700">{new Date(wearableStatus.lastSync).toLocaleString('en-IN')}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-600">Link a SafarSathi smart band to receive health and motion telemetry here.</p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-slate-800">📞 Emergency Contacts</h2>
              <button
                onClick={() => navigate('/id-vault')}
                className="text-xs text-teal-600 font-semibold underline"
              >
                Manage contacts
              </button>
            </div>
            <div className="space-y-3">
              {emergencyContacts.slice(0, 3).map(contact => (
                <div key={contact.id} className="bg-white rounded-xl px-4 py-3 border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{contact.name}</p>
                    <p className="text-xs text-slate-500">{contact.relation}</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.open(`tel:${contact.phone}`)}
                    className="text-xs font-semibold text-teal-600 underline"
                  >
                    Call
                  </motion.button>
                </div>
              ))}
              {!emergencyContacts.length && <p className="text-sm text-slate-600">Add trusted contacts in the Digital ID vault to enable rapid notifications.</p>}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Emergency Section */}
      <motion.div
        variants={itemVariants}
        className="flex justify-center"
      >
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20">
          <SOSButton currentLocation={currentLocation} user={user} />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;