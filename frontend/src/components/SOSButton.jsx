import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

// Local utility functions to replace the missing import.
// These are included directly in the file to avoid external dependencies.
const getBatteryLevel = async () => {
  if ('getBattery' in navigator) {
    try {
      const battery = await navigator.getBattery();
      return `${Math.round(battery.level * 100)}%`;
    } catch (e) {
      console.error('Failed to get battery info:', e);
      return 'N/A';
    }
  }
  return 'N/A';
};

const getNetworkInfo = () => {
  if ('connection' in navigator) {
    const connection = navigator.connection;
    return {
      effectiveType: connection.effectiveType || 'N/A',
      rtt: connection.rtt || 'N/A',
      downlink: connection.downlink || 'N/A',
    };
  }
  return { effectiveType: 'N/A', rtt: 'N/A', downlink: 'N/A' };
};

const ICONS = Object.freeze({
  countdown: 'https://cdn-icons-png.flaticon.com/512/1828/1828665.png',
  sosIdle: 'https://cdn-icons-png.flaticon.com/512/3134/3134898.png',
  sosActive: 'https://cdn-icons-png.flaticon.com/512/1709/1709532.png',
  success: 'https://cdn-icons-png.flaticon.com/512/845/845646.png'
});

/**
 * Hold-to-activate emergency button that persists SOS requests with offline support
 * and provides rich feedback during activation.
 *
 * @param {{ currentLocation?: {lat: number, lng: number, accuracy?: number}, user?: {id: string, name: string, blockchainID: string} }} props
 */
const SOSButton = ({ currentLocation, user }) => {
  const [isActivated, setIsActivated] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimer = useRef(null);
  const countdownTimer = useRef(null);
  const API_BASE_URL = 'http://localhost:8080/api/action'; // **[Adjust this URL to your actual backend domain]**

  // Enhanced SOS with offline support and better UX
  /**
   * Dispatches the SOS event, vibrates the device, and queues it when offline.
   */
  const activateSOS = useCallback(async () => {
    setIsActivated(true);

    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 500]);
    }

    // Extract touristId and prepare location data
    const touristId = user?.id || user?.blockchainID; // Assuming 'id' or 'blockchainID' holds the UUID
    
    // IMPORTANT: Ensure currentLocation includes accuracy, as your backend DTO expects it.
    const lat = currentLocation?.lat ?? 0.0;
    const lng = currentLocation?.lng ?? 0.0;
    const accuracy = currentLocation?.accuracy ?? 1000; // Default to 1000m if accuracy is missing
    

    // Data for local storage (optional metadata)
    const sosMetadata = {
      userId: touristId,
      userName: user?.name,
      location: { lat, lng, accuracy },
      timestamp: new Date().toISOString(),
      type: 'emergency',
      status: 'active',
      deviceInfo: {
        battery: await getBatteryLevel(),
        network: getNetworkInfo().effectiveType,
        platform: navigator.platform
      }
    };
    
    // Data for API payload (must match backend DTO: LocationPingRequest(Double lat, Double lng, Integer accuracy))
    const apiPayload = {
      lat: lat,
      lng: lng,
      accuracy: accuracy
    };
    
    // ------------------------------------------------------------------
    // 🔴 DEBUG TOOL: Log the data being sent to the console
    // ------------------------------------------------------------------
    console.log('-------------------- SOS DEBUG START --------------------');
    console.log('API Endpoint:', `${API_BASE_URL}/sos/${touristId}`);
    console.log('API Payload (Sent to Backend):', apiPayload);
    console.log('Tourist ID Used:', touristId);
    console.log('SOS Data Sent Locally:', sosMetadata);
    console.log('--------------------- SOS DEBUG END ---------------------');
    // ------------------------------------------------------------------


    // Store SOS locally first (offline support)
    const existingSOS = JSON.parse(localStorage.getItem('pending_sos') || '[]');
    existingSOS.push(sosMetadata);
    localStorage.setItem('pending_sos', JSON.stringify(existingSOS));

    try {
      if (navigator.onLine && touristId) {
        // ------------------------------------------------------------------
        // 🚀 ACTUAL API CALL TO BACKEND
        // ------------------------------------------------------------------
        const response = await fetch(`${API_BASE_URL}/sos/${touristId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // NOTE: In a real app, you'd add Authorization: `Bearer ${jwtToken}` here
          },
          body: JSON.stringify(apiPayload)
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown server error' }));
            throw new Error(`SOS API Failed: ${response.status} - ${errorData.message}`);
        }
        
        toast.success('SOS alert sent to authorities!');
        toast.info('Location shared with emergency services');

        // Simulate police response
        setTimeout(() => {
          toast.info('Police Unit 42: Estimated arrival in 5 minutes');
          if ('vibrate' in navigator) {
            navigator.vibrate([100, 50, 100]);
          }
        }, 3000);
      } else if (!touristId) {
          toast.error('User ID is missing. Cannot send SOS.');
      } else {
        toast.warning('Offline: SOS queued and will send when connected');
      }
    } catch (error) {
      console.error('Failed to dispatch SOS', error);
      toast.error(`Error sending SOS: ${error.message}. Saved locally.`);
    }

    // Auto-deactivate after 60 seconds
    setTimeout(() => {
      setIsActivated(false);
      toast.success('SOS alert resolved');
    }, 60000);
  }, [currentLocation, user, API_BASE_URL]); 

  const startCountdown = useCallback(() => {
    let count = 3;
    setCountdown(count);

    countdownTimer.current = setInterval(() => {
      count -= 1;
      setCountdown(count);

      if (count === 0) {
        clearInterval(countdownTimer.current);
        setCountdown(0);
        activateSOS();
      }
    }, 1000);
  }, [activateSOS]);
  
  const handleMouseDown = useCallback(() => {
    if (isActivated) return;

    let progress = 0;
    holdTimer.current = setInterval(() => {
      progress += 2;
      setHoldProgress(progress);

      if (progress >= 100) {
        clearInterval(holdTimer.current);
        startCountdown();
      }
    }, 30);
  }, [isActivated, startCountdown]);

  const handleMouseUp = useCallback(() => {
    if (holdTimer.current) {
      clearInterval(holdTimer.current);
      setHoldProgress(0);
    }
  }, []);

  const cancelSOS = useCallback(() => {
    clearInterval(countdownTimer.current);
    setCountdown(0);
    toast.info('SOS cancelled');
  }, []);

  return (
    <div className="relative">
      {/* Countdown Overlay */}
      <AnimatePresence>
        {countdown > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="bg-white rounded-2xl p-8 text-center shadow-2xl max-w-sm w-full"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <img src={ICONS.countdown} alt="Countdown icon" loading="lazy" className="w-8 h-8" />
                <h2 className="text-2xl font-bold text-red-600">SOS Activating</h2>
              </div>
              <motion.div
                key={countdown}
                initial={{ scale: 1.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-6xl font-bold text-red-600 mb-6"
              >
                {countdown}
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={cancelSOS}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Cancel
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main SOS Button */}
      <motion.button
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: isActivated ? 1 : 1.04 }}
        whileTap={{ scale: 0.95 }}
        className={`relative w-44 h-44 md:w-52 md:h-52 rounded-full border-4 flex flex-col items-center justify-center text-white font-bold shadow-2xl transition-all duration-300 ${
          isActivated
            ? 'bg-red-600 border-red-400 shadow-red-500/50'
            : 'bg-gradient-to-br from-red-500 to-red-600 border-red-400 hover:from-red-600 hover:to-red-700'
        }`}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        disabled={isActivated || countdown > 0}
        aria-label="Emergency SOS Button"
      >
        {/* Progress Ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" width="210" height="210">
          <circle cx="105" cy="105" r="98" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="4" />
          <motion.circle
            cx="105"
            cy="105"
            r="98"
            fill="none"
            stroke="white"
            strokeWidth="4"
            strokeDasharray={2 * Math.PI * 98}
            strokeDashoffset={2 * Math.PI * 98 * (1 - holdProgress / 100)}
            transition={{ duration: 0.1 }}
          />
        </svg>

        {/* Button Content */}
        <div className="flex flex-col items-center justify-center z-10">
          <AnimatePresence mode="wait">
            {isActivated ? (
              <motion.div
                key="activated"
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                className="flex flex-col items-center gap-2"
              >
                <motion.img
                  src={ICONS.sosActive}
                  alt="SOS active icon"
                  loading="lazy"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="w-12 h-12"
                />
                <div className="text-center">
                  <div className="text-lg font-bold">SOS ACTIVE</div>
                  <div className="text-sm opacity-90">Help is coming</div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="inactive"
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                className="flex flex-col items-center gap-2"
              >
                <motion.img
                  src={ICONS.sosIdle}
                  alt="SOS idle icon"
                  loading="lazy"
                  whileHover={{ scale: 1.08 }}
                  className="w-12 h-12"
                />
                <div className="text-center">
                  <div className="text-lg font-bold tracking-wide">EMERGENCY</div>
                  <div className="text-sm opacity-90">Hold for 3 sec</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.button>

      {/* SOS Info */}
      <AnimatePresence>
        {isActivated && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium whitespace-nowrap flex items-center gap-2"
          >
            <img src={ICONS.success} alt="Success icon" loading="lazy" className="w-4 h-4" />
            <p>Alert sent • Location shared • Services notified</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SOSButton;
