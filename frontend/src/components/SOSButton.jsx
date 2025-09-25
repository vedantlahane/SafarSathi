import React, { useState, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import { getBatteryLevel, getNetworkInfo } from '../utils/helpers';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Hold-to-activate emergency button that persists SOS requests with offline support
 * and provides rich feedback during activation.
 *
 * @param {{ currentLocation?: {lat: number, lng: number}, user?: object }} props
 */
const SOSButton = ({ currentLocation, user }) => {
  const [isActivated, setIsActivated] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimer = useRef(null);
  const countdownTimer = useRef(null);

  // Enhanced SOS with offline support and better UX
  /**
   * Dispatches the SOS event, vibrates the device, and queues it when offline.
   */
  const activateSOS = useCallback(async () => {
    setIsActivated(true);
    
    // Trigger device vibration if available
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 500]);
    }
    
    const batteryLevel = await getBatteryLevel();
    const networkInfo = getNetworkInfo();
    
    const sosData = {
      userId: user?.blockchainID,
      userName: user?.name,
      location: currentLocation || { lat: 0, lng: 0 },
      timestamp: new Date().toISOString(),
      type: 'emergency',
      status: 'active',
      deviceInfo: {
        battery: batteryLevel,
        network: networkInfo.effectiveType,
        platform: navigator.platform
      }
    };
    
    // Store SOS locally first (offline support)
    const existingSOS = JSON.parse(localStorage.getItem('pending_sos') || '[]');
    existingSOS.push(sosData);
    localStorage.setItem('pending_sos', JSON.stringify(existingSOS));

    try {
      if (navigator.onLine) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        toast.success('🚨 SOS Alert sent to authorities!');
        toast.info('📍 Location shared with emergency services');
        
        // Simulate police response
        setTimeout(() => {
          toast.info('👮 Police Unit 42: ETA 5 minutes');
          if ('vibrate' in navigator) {
            navigator.vibrate([100, 50, 100]);
          }
        }, 3000);
      } else {
        toast.warning('📡 Offline: SOS saved, will send when connected');
      }
    } catch (error) {
      toast.error('Network error: SOS saved locally');
    }
    
    // Auto-deactivate after 60 seconds
    setTimeout(() => {
      setIsActivated(false);
      toast.success('✅ SOS Alert resolved');
    }, 60000);
  }, [currentLocation, user]);

  // Enhanced hold-to-activate with visual feedback
  /**
   * Kicks off the press-and-hold progress animation.
   */
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
  }, [isActivated]);
  
  /**
   * Resets the press-and-hold progress when the user releases early.
   */
  const handleMouseUp = useCallback(() => {
    if (holdTimer.current) {
      clearInterval(holdTimer.current);
      setHoldProgress(0);
    }
  }, []);
  
  /**
   * Displays a visual countdown before the SOS payload is dispatched.
   */
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

  /**
   * Aborts the pending SOS while the countdown overlay is active.
   */
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
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl p-8 text-center shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-red-600 mb-4">⚠️ SOS Activating</h2>
              <motion.div
                key={countdown}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-6xl font-bold text-red-600 mb-6"
              >
                {countdown}
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={cancelSOS}
                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Cancel
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main SOS Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: isActivated ? 1 : 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`relative w-52 h-52 rounded-full border-4 flex flex-col items-center justify-center text-white font-bold shadow-2xl transition-all duration-300 ${
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
          <circle
            cx="105"
            cy="105"
            r="98"
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="4"
          />
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
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="flex flex-col items-center"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-4xl mb-2"
                >
                  🚨
                </motion.div>
                <div className="text-center">
                  <div className="text-lg font-bold">SOS ACTIVE</div>
                  <div className="text-sm opacity-90">Help is coming</div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="inactive"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="flex flex-col items-center"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="text-4xl mb-2"
                >
                  🆘
                </motion.div>
                <div className="text-center">
                  <div className="text-lg font-bold">EMERGENCY</div>
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium whitespace-nowrap"
          >
            <p>✅ Alert sent • 📍 Location shared • 📞 Services notified</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SOSButton;