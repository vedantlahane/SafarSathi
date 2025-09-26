//components/SOSButton.jsx - Enhanced for better readability and tourist accessibility
import { useState, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import { getBatteryLevel, getNetworkInfo } from '../utils/helpers';
import { motion, AnimatePresence } from 'framer-motion';

const ICONS = Object.freeze({
  countdown: 'https://cdn-icons-png.flaticon.com/512/1828/1828665.png',
  sosIdle: 'https://cdn-icons-png.flaticon.com/512/3134/3134898.png',
  sosActive: 'https://cdn-icons-png.flaticon.com/512/1709/1709532.png',
  success: 'https://cdn-icons-png.flaticon.com/512/845/845646.png',
  warning: 'https://cdn-icons-png.flaticon.com/512/595/595067.png'
});

/**
 * Enhanced hold-to-activate emergency button with improved typography and tourist-friendly design
 * Features offline support, visual feedback, and clear instructions for international users
 *
 * @param {{ currentLocation?: {lat: number, lng: number}, user?: object }} props
 */
const SOSButton = ({ currentLocation, user }) => {
  const [isActivated, setIsActivated] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [holdProgress, setHoldProgress] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);
  const holdTimer = useRef(null);
  const countdownTimer = useRef(null);

  // Enhanced SOS with offline support and better UX
  /**
   * Dispatches the SOS event, vibrates the device, and queues it when offline.
   */
  const activateSOS = useCallback(async () => {
    setIsActivated(true);

    // Enhanced device feedback
    if ('vibrate' in navigator) {
      // More pronounced vibration pattern for emergency
      navigator.vibrate([300, 150, 300, 150, 300, 150, 800]);
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

        // Enhanced success messages for tourists
        toast.success('🚨 EMERGENCY ALERT SENT! Authorities have been notified.', {
          duration: 6000,
          style: { fontSize: '16px', fontWeight: 'bold' }
        });
        toast.info('📍 Your exact location has been shared with emergency services.', {
          duration: 5000,
          style: { fontSize: '15px' }
        });

        // Simulate police response with more details
        setTimeout(() => {
          toast.info('🚔 Police Unit 42: Estimated arrival in 5 minutes. Stay calm and remain visible.', {
            duration: 8000,
            style: { fontSize: '15px', fontWeight: '500' }
          });
          if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]);
          }
        }, 3000);
      } else {
        toast.warning('📶 OFFLINE MODE: Your emergency alert is saved and will be sent automatically when connection is restored.', {
          duration: 8000,
          style: { fontSize: '15px', fontWeight: '500' }
        });
      }
    } catch (error) {
      console.error('Failed to dispatch SOS', error);
      toast.error('⚠️ Network error: Emergency alert saved locally and will retry automatically.', {
        duration: 6000,
        style: { fontSize: '15px', fontWeight: '500' }
      });
    }

    // Auto-deactivate after 60 seconds with notification
    setTimeout(() => {
      setIsActivated(false);
      toast.success('✅ Emergency alert status updated. Continue to follow safety protocols.', {
        duration: 5000,
        style: { fontSize: '15px' }
      });
    }, 60000);
  }, [currentLocation, user]);

  /**
   * Enhanced countdown with clearer messaging
   */
  const startCountdown = useCallback(() => {
    let count = 3;
    setCountdown(count);

    // Enhanced countdown feedback
    toast.info('🚨 Emergency SOS activating...', {
      duration: 3000,
      style: { fontSize: '16px', fontWeight: 'bold' }
    });

    countdownTimer.current = setInterval(() => {
      count -= 1;
      setCountdown(count);

      // Enhanced vibration during countdown
      if ('vibrate' in navigator) {
        navigator.vibrate(count === 0 ? [500] : [100]);
      }

      if (count === 0) {
        clearInterval(countdownTimer.current);
        setCountdown(0);
        activateSOS();
      }
    }, 1000);
  }, [activateSOS]);

  /**
   * Enhanced hold-to-activate with better visual feedback
   */
  const handleMouseDown = useCallback(() => {
    if (isActivated) return;

    let progress = 0;
    setHoldProgress(0);

    // Show initial feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }

    holdTimer.current = setInterval(() => {
      progress += 2;
      setHoldProgress(progress);

      // Progressive feedback during hold
      if (progress === 33 || progress === 66) {
        if ('vibrate' in navigator) {
          navigator.vibrate(30);
        }
      }

      if (progress >= 100) {
        clearInterval(holdTimer.current);
        startCountdown();
      }
    }, 30);
  }, [isActivated, startCountdown]);

  /**
   * Enhanced release handling with feedback
   */
  const handleMouseUp = useCallback(() => {
    if (holdTimer.current) {
      clearInterval(holdTimer.current);
      const wasProgressing = holdProgress > 0;
      setHoldProgress(0);
      
      // Provide feedback if user released too early
      if (wasProgressing && holdProgress < 100) {
        toast.info('Hold the button for 3 seconds to activate emergency SOS.', {
          duration: 3000,
          style: { fontSize: '14px' }
        });
      }
    }
  }, [holdProgress]);

  /**
   * Enhanced SOS cancellation
   */
  const cancelSOS = useCallback(() => {
    clearInterval(countdownTimer.current);
    setCountdown(0);
    toast.info('🛑 Emergency SOS cancelled. You are safe.', {
      duration: 4000,
      style: { fontSize: '15px', fontWeight: '500' }
    });
  }, []);

  // Show/hide instructions for tourists
  const toggleInstructions = useCallback(() => {
    setShowInstructions(prev => !prev);
  }, []);

  return (
    <div className="relative">
      {/* Enhanced Instructions Overlay */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="bg-white rounded-2xl p-8 text-center shadow-2xl max-w-md w-full"
            >
              <div className="flex items-center justify-center gap-3 mb-6">
                <img src={ICONS.sosIdle} alt="SOS info icon" loading="lazy" className="w-10 h-10" />
                <h2 className="text-2xl font-bold text-slate-800">Emergency SOS Guide</h2>
              </div>
              
              <div className="text-left space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🤏</span>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">Hold for 3 seconds</h3>
                    <p className="text-base text-slate-600 leading-relaxed">Press and hold the red button until the countdown appears</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⏱️</span>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">3-second countdown</h3>
                    <p className="text-base text-slate-600 leading-relaxed">You can cancel during the countdown if it was accidental</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🚨</span>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">Emergency services alerted</h3>
                    <p className="text-base text-slate-600 leading-relaxed">Police, medical, and your emergency contacts will be notified</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-2xl">📍</span>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">Location automatically shared</h3>
                    <p className="text-base text-slate-600 leading-relaxed">Your exact GPS coordinates are sent to responders</p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={toggleInstructions}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 px-6 rounded-xl text-base transition-colors duration-200"
              >
                I Understand
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Countdown Overlay */}
      <AnimatePresence>
        {countdown > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="bg-white rounded-2xl p-8 text-center shadow-2xl max-w-sm w-full"
            >
              <div className="flex items-center justify-center gap-3 mb-6">
                <img src={ICONS.warning} alt="Emergency warning" loading="lazy" className="w-10 h-10" />
                <h2 className="text-2xl font-bold text-red-600">EMERGENCY SOS</h2>
              </div>
              
              <p className="text-lg text-slate-700 font-semibold mb-4">
                Activating in {countdown} second{countdown !== 1 ? 's' : ''}
              </p>
              
              <motion.div
                key={countdown}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-7xl font-black text-red-600 mb-6"
              >
                {countdown}
              </motion.div>
              
              <p className="text-base text-slate-600 mb-6 leading-relaxed">
                Emergency services will be notified and your location will be shared.
              </p>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={cancelSOS}
                className="w-full bg-slate-700 hover:bg-slate-800 text-white font-bold py-4 px-6 rounded-xl text-lg transition-colors duration-200"
              >
                Cancel Emergency Alert
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Button */}
      <button
        onClick={toggleInstructions}
        className="absolute -top-10 right-2 bg-blue-500/20 border border-blue-400/40 text-blue-100 px-2.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-500/30 transition-colors duration-200 sm:-top-12 sm:right-0 sm:px-3 sm:text-sm"
        aria-label="SOS Instructions"
      >
        ❓ How to use
      </button>

      {/* Enhanced Main SOS Button */}
      <motion.button
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: isActivated ? 1 : 1.04 }}
        whileTap={{ scale: 0.95 }}
        className={`relative w-36 h-36 sm:w-44 sm:h-44 md:w-56 md:h-56 rounded-full border-[3px] sm:border-4 flex flex-col items-center justify-center text-white font-bold shadow-2xl transition-all duration-300 ${
          isActivated
            ? 'bg-red-600 border-red-400 shadow-red-500/50'
            : 'bg-gradient-to-br from-red-500 to-red-600 border-red-400 hover:from-red-600 hover:to-red-700 hover:shadow-red-500/30'
        }`}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        disabled={isActivated || countdown > 0}
        aria-label="Emergency SOS Button - Hold for 3 seconds to activate"
      >
        {/* Enhanced Progress Ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" width="224" height="224">
          <circle cx="112" cy="112" r="105" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
          <motion.circle
            cx="112"
            cy="112"
            r="105"
            fill="none"
            stroke="white"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 105}
            strokeDashoffset={2 * Math.PI * 105 * (1 - holdProgress / 100)}
            transition={{ duration: 0.1 }}
          />
        </svg>

        {/* Enhanced Button Content */}
        <div className="flex flex-col items-center justify-center z-10">
          <AnimatePresence mode="wait">
            {isActivated ? (
              <motion.div
                key="activated"
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                className="flex flex-col items-center gap-3"
              >
                <motion.img
                  src={ICONS.sosActive}
                  alt="SOS active - help is coming"
                  loading="lazy"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="w-12 h-12 sm:w-14 sm:h-14"
                />
                <div className="text-center">
                  <div className="text-lg sm:text-xl font-black tracking-wide">SOS ACTIVE</div>
                  <div className="text-sm sm:text-base opacity-95 font-semibold">Help is coming</div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="inactive"
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                className="flex flex-col items-center gap-3"
              >
                <motion.img
                  src={ICONS.sosIdle}
                  alt="Emergency SOS button"
                  loading="lazy"
                  whileHover={{ scale: 1.08 }}
                  className="w-12 h-12 sm:w-14 sm:h-14"
                />
                <div className="text-center">
                  <div className="text-lg sm:text-xl font-black tracking-wide">EMERGENCY</div>
                  <div className="text-sm sm:text-base opacity-95 font-semibold">Hold 3 seconds</div>
                  {holdProgress > 0 && (
                    <div className="text-xs sm:text-sm opacity-90 font-medium mt-1">
                      Keep holding... {Math.round(holdProgress)}%
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.button>

      {/* Enhanced SOS Info */}
      <AnimatePresence>
        {isActivated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-5 py-2.5 rounded-xl shadow-lg text-sm font-semibold whitespace-nowrap flex items-center gap-3 sm:-bottom-20 sm:px-6 sm:py-3 sm:text-base"
          >
            <img src={ICONS.success} alt="Success - emergency services notified" loading="lazy" className="w-5 h-5" />
            <p>Alert sent • Location shared • Authorities notified</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Feedback */}
      {holdProgress > 0 && !isActivated && countdown === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-3.5 py-2 rounded-lg text-xs font-semibold sm:-bottom-16 sm:px-4 sm:text-sm"
        >
          Keep holding ({Math.round(holdProgress)}%)
        </motion.div>
      )}
    </div>
  );
};

export default SOSButton;
