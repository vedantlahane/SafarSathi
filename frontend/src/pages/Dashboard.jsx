import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../services/AuthContext';
import { motion } from 'framer-motion';
import apiService from '../services/apiService';
import SOSConfirmationModal from '../components/SOSConfirmationModal'; // 🔑 NEW IMPORT
import { AnimatePresence } from 'framer-motion'; // 🔑 NEW IMPORT

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
  const locationIntervalRef = useRef(null);
  
  const [safetyStatus, setSafetyStatus] = useState('safe');
  const [lastActivity, setLastActivity] = useState(new Date());
  const [isSharing, setIsSharing] = useState(false);
  
  // 🔑 NEW STATE: For SOS Confirmation Modal
  const [isSosConfirming, setIsSosConfirming] = useState(false); 
  
  const userName = user?.name || user?.email?.split('@')[0] || 'Traveller';
  const touristId = user?.id;
  const token = user?.token;

// ----------------------------------------------------------------------
// 🔑 CORE LOGIC: LOCATION TRACKING AND SOS
// ----------------------------------------------------------------------

  /**
   * Starts continuous background location tracking and pings the backend.
   */
  const trackLiveLocation = useCallback(() => {
    // Check for necessary data
    if (!touristId || !token) return;
    if (locationIntervalRef.current) return; 

    const intervalTime = 15000; 

    const sendLocationPing = (position) => {
        const { latitude: lat, longitude: lng, accuracy } = position.coords;

        // 1. Update local state
        setCurrentLocation({ lat, lng });
        checkSafetyZone(lat, lng);
        setLastActivity(new Date());

        // 2. Send to Spring Boot Backend
        const locationData = { lat, lng, accuracy: Math.round(accuracy) };
        apiService.locationPing(token, touristId, locationData);
        // console.log(`Pinging location: ${lat}, ${lng}`); // Keep quiet for demo
    };

    if (navigator.geolocation) {
        locationIntervalRef.current = setInterval(() => {
            navigator.geolocation.getCurrentPosition(
                sendLocationPing,
                (error) => console.error('Geolocation Tracking Error:', error.message),
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        }, intervalTime);

        toast.info('📍 Live location sharing started.', { autoClose: 3000 });
    } else {
        toast.error('Geolocation is not supported by your browser.');
    }
  }, [touristId, token]); // Dependencies for useCallback

  /**
   * Retrieves the device location (used for initial load and if location is null).
   */
  const getCurrentLocation = useCallback(() => {
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
  }, []);

  /**
   * 🔑 SOS FLOW STEP 1: Triggers the confirmation modal.
   */
  const startSOSConfirmation = () => {
    if (!touristId || !token) {
        toast.error("Please log in again to use the SOS feature.");
        return;
    }
    if (!currentLocation) {
        toast.error('Cannot send SOS: Acquiring GPS signal. Please wait.');
        getCurrentLocation(); 
        return;
    }
    
    // Show the modal
    setIsSosConfirming(true);
    toast.warning('⚠️ SOS initiated. You have 5 seconds to cancel.', { autoClose: 5000 });
  };
  
  /**
   * 🔑 SOS FLOW STEP 2: Sends the alert after confirmation/timer expiry.
   */
  const confirmAndSendSOS = async () => {
    // This function is called by the modal after the timer hits zero or confirmation
    setIsSosConfirming(false); // Close the modal first
    
    const sosData = {
        lat: currentLocation.lat,
        lng: currentLocation.lng,
        accuracy: 10 // Mock accuracy
    };
    
    toast.info('🚀 Sending final alert to authorities...');
    
    try {
        const response = await apiService.panicSOS(token, touristId, sosData);

        if (response.status) {
            toast.success('🆘 SOS Alert CONFIRMED! Police and contacts notified.');
            setSafetyStatus('danger'); 
        }
    } catch (error) {
        toast.error(error.message || 'SOS failed due to server error or network.');
    }
  };

  /**
   * 🔑 SOS FLOW STEP 3: Cancels the alert sequence.
   */
  const cancelSOS = () => {
      setIsSosConfirming(false);
      setSafetyStatus('safe'); // Reset status visually
      toast.info('✅ SOS Alert cancelled.');
  };

  // ----------------------------------------------------------------------
  // 🔑 EFFECTS AND CLEANUP
  // ----------------------------------------------------------------------
  useEffect(() => {
    // 1. Start initial location and continuous tracking
    getCurrentLocation();
    trackLiveLocation();
    
    // 2. Mock stats interval
    const statsInterval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        activeTime: prev.activeTime + 1,
        safePlaces: Math.floor(Math.random() * 10) + 5,
        alertsSent: Math.floor(Math.random() * 3)
      }));
    }, 60000);
    
    // 3. Cleanup: Stop tracking and intervals
    return () => {
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
      }
      clearInterval(statsInterval);
      if (isSosConfirming) {
          setIsSosConfirming(false); // Clear modal if unmounting
      }
    };
  }, [getCurrentLocation, trackLiveLocation, isSosConfirming]); // Added isSosConfirming for cleanup

  // ... (checkSafetyZone, calculateDistance, getTimeSinceActivity, handleSafeShare remain unchanged)
  // These helper functions are omitted here for brevity but are assumed to be in your final code.
  const checkSafetyZone = (lat, lng) => {
    // ... (logic remains unchanged)
    const unsafeZones = [
      { lat: 28.6139, lng: 77.2090, radius: 1000 }, 
      { lat: 19.0760, lng: 72.8777, radius: 800 }  
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
  
  const getTimeSinceActivity = () => {
    const diff = new Date() - lastActivity;
    const minutes = Math.floor(diff / 60000);
    return minutes;
  };

  const handleSafeShare = async () => {
    // ... (logic remains unchanged)
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
      
      <AnimatePresence>
        {isSosConfirming && (
          <SOSConfirmationModal 
            onConfirm={confirmAndSendSOS} 
            onCancel={cancelSOS} 
            touristId={touristId}
          />
        )}
      </AnimatePresence>
      
      {/* Header (JSX unchanged except for using userName) */}
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
              Welcome, {userName} 
            </motion.span>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium"
            >
              🔗 ID: {user?.qrContent?.split('=')[1]?.slice(0, 12) || 'N/A'}...
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


      {/* Quick Stats (JSX unchanged) */}
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
      
      {/* Quick Actions (Updated SOS button to call startSOSConfirmation) */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { icon: "🗺️", text: "Safety Map", onClick: () => navigate('/map'), color: "from-teal-500 to-blue-500" },
          { icon: "🆘", text: "Quick SOS", onClick: startSOSConfirmation, color: "from-red-500 to-pink-500" }, // 🔑 UPDATED HANDLER
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
      
      {/* Safety Tips (JSX unchanged) */}
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
      
      {/* Emergency Section (Updated button to call startSOSConfirmation) */}
      <motion.div
        variants={itemVariants}
        className="flex justify-center"
      >
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20">
          <motion.button
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
            onClick={startSOSConfirmation} // 🔑 UPDATED HANDLER
            className="w-40 h-40 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-2xl flex flex-col items-center justify-center transition-all duration-300 transform"
          >
            <span className="text-5xl font-extrabold">🚨</span>
            <span className="text-xl font-bold mt-1">PANIC SOS</span>
            <span className="text-xs mt-1 opacity-80">Sends alert in 5 seconds</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;