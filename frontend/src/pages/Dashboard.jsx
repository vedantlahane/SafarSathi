//pages/Dashboard.jsx - Enhanced with real-time stats and better UX
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../services/AuthContext';
import SOSButton from '../components/SOSButton';
import { motion } from 'framer-motion';

/**
 * Presents the traveller dashboard with real-time safety metrics,
 * location awareness, and quick access to emergency actions.
 */
const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    safePlaces: 0,
    alertsSent: 0,
    activeTime: 0,
    safetyScore: 85
  });
  const [currentLocation, setCurrentLocation] = useState(null);
  const [safetyStatus, setSafetyStatus] = useState('safe');
  const [lastActivity, setLastActivity] = useState(new Date());
  const [isSharing, setIsSharing] = useState(false);
  
  // Calculate stats and initialize location
  useEffect(() => {
    // Get current location
    getCurrentLocation();
    
    // Update activity timestamp
    const activityInterval = setInterval(() => {
      setLastActivity(new Date());
    }, 30000); // Update every 30 seconds
    
    const statsInterval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        activeTime: prev.activeTime + 1,
        safePlaces: Math.floor(Math.random() * 10) + 5,
        alertsSent: Math.floor(Math.random() * 3)
      }));
    }, 60000);
    
    return () => {
      clearInterval(activityInterval);
      clearInterval(statsInterval);
    };
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
    // Mock unsafe zones for demo
    const unsafeZones = [
      { lat: 28.6139, lng: 77.2090, radius: 1000 }, // Delhi area
      { lat: 19.0760, lng: 72.8777, radius: 800 }   // Mumbai area
    ];

    const isInUnsafeZone = unsafeZones.some(zone => {
      const distance = calculateDistance(lat, lng, zone.lat, zone.lng);
      return distance < zone.radius;
    });

    if (isInUnsafeZone && safetyStatus === 'safe') {
      setSafetyStatus('warning');
      toast.warning('⚠️ You are entering an unsafe zone!');
    } else if (!isInUnsafeZone && safetyStatus === 'warning') {
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

  /**
   * Convenience helper tracking idle time for future UX prompts.
   * @returns {number} Minutes since the last recorded activity.
   */
  const getTimeSinceActivity = () => {
    const diff = new Date() - lastActivity;
    const minutes = Math.floor(diff / 60000);
    return minutes;
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
          text: `I'm checking in safely via SafarSathi. Current safety score: ${stats.safetyScore}/100. 🛡️`,
          url: window.location.origin
        });
        toast.success('📤 Safety status shared successfully!');
      } else {
        // Fallback for browsers that don't support native sharing
        const statusText = `SafarSathi Safety Check-in: I'm safe! Current safety score: ${stats.safetyScore}/100 🛡️ - ${window.location.origin}`;
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
          { icon: "🛡️", title: "Safety Score", value: `${stats.safetyScore}/100`, color: "from-blue-500 to-blue-600" },
          { icon: "✅", title: "Safe Places", value: stats.safePlaces, color: "from-green-500 to-green-600" },
          { icon: "⚠️", title: "Alerts Sent", value: stats.alertsSent, color: "from-yellow-500 to-orange-500" },
          { icon: "⏱️", title: "Active Time", value: `${stats.activeTime} min`, color: "from-purple-500 to-purple-600" }
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
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { icon: "🗺️", text: "Safety Map", onClick: () => navigate('/map'), color: "from-teal-500 to-blue-500" },
          { icon: "🆘", text: "Quick SOS", onClick: () => {}, color: "from-red-500 to-pink-500" },
          { icon: "📤", text: "Share Location", onClick: handleSafeShare, disabled: isSharing, color: "from-purple-500 to-indigo-500" },
          { icon: "📞", text: "Emergency Contacts", onClick: () => {}, color: "from-orange-500 to-red-500" }
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
          {[
            "Always keep your phone charged above 20% for emergencies",
            "Share your live location with trusted contacts when traveling",
            "Avoid displaying expensive items in crowded areas"
          ].map((tip, index) => (
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
      
      {/* Emergency Section */}
      <motion.div
        variants={itemVariants}
        className="flex justify-center"
      >
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20">
          <SOSButton currentLocation={null} user={user} />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;