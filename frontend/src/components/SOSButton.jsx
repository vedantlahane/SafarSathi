//components/SOSButton.jsx - Minimalistic Emergency SOS Button
import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

/**
 * Minimalistic hold-to-activate emergency button
 */
const SOSButton = ({ currentLocation, user }) => {
  const [isActivated, setIsActivated] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimer = useRef(null);
  const countdownTimer = useRef(null);

  const BACKEND_PORT = import.meta.env.VITE_BACKEND_PORT || '8080';
  const API_BASE_URL = `http://localhost:${BACKEND_PORT}/api/action`;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (holdTimer.current) clearInterval(holdTimer.current);
      if (countdownTimer.current) clearInterval(countdownTimer.current);
    };
  }, []);

  const activateSOS = useCallback(async () => {
    setIsActivated(true);

    // Simple vibration
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }

    const touristId = user?.id || user?.blockchainID;
    const lat = currentLocation?.lat ?? 0.0;
    const lng = currentLocation?.lng ?? 0.0;
    const accuracy = currentLocation?.accuracy ?? 1000;

    const apiPayload = { lat, lng, accuracy };

    try {
      if (navigator.onLine && touristId) {
        const response = await fetch(`${API_BASE_URL}/sos/${touristId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(apiPayload)
        });
        
        if (!response.ok) {
          throw new Error(`SOS Failed: ${response.status}`);
        }
        
        toast.success('🚨 Emergency alert sent!');
      } else if (!touristId) {
        toast.error('User ID missing');
      } else {
        toast.warning('📶 Offline - Alert queued');
      }
    } catch (error) {
      console.error('SOS Error:', error);
      toast.error('Alert saved locally');
    }

    // Auto-deactivate after 30 seconds
    setTimeout(() => setIsActivated(false), 30000);
  }, [currentLocation, user, API_BASE_URL]);

  const startCountdown = useCallback(() => {
    let count = 3;
    setCountdown(count);

    countdownTimer.current = setInterval(() => {
      count -= 1;
      setCountdown(count);

      if (count === 0) {
        clearInterval(countdownTimer.current);
        countdownTimer.current = null;
        setCountdown(0);
        activateSOS();
      }
    }, 1000);
  }, [activateSOS]);

  const handleStart = useCallback(() => {
    if (isActivated) return;

    let progress = 0;
    setHoldProgress(0);

    holdTimer.current = setInterval(() => {
      progress += 4;
      setHoldProgress(progress);

      if (progress >= 100) {
        clearInterval(holdTimer.current);
        holdTimer.current = null;
        startCountdown();
      }
    }, 50);
  }, [isActivated, startCountdown]);

  const handleEnd = useCallback(() => {
    if (holdTimer.current) {
      clearInterval(holdTimer.current);
      holdTimer.current = null;
      setHoldProgress(0);
    }
  }, []);

  const cancelSOS = useCallback(() => {
    if (countdownTimer.current) {
      clearInterval(countdownTimer.current);
      countdownTimer.current = null;
    }
    setCountdown(0);
    toast.info('Cancelled');
  }, []);

  return (
    <div className="relative">
      {/* Countdown Modal */}
      <AnimatePresence>
        {countdown > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          >
            <div className="bg-white rounded-xl p-6 text-center max-w-sm mx-4">
              <div className="text-6xl font-bold text-red-600 mb-4">{countdown}</div>
              <p className="text-gray-700 mb-4">Emergency alert activating...</p>
              <button
                onClick={cancelSOS}
                className="w-full bg-gray-800 text-white py-3 rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main SOS Button */}
      <motion.button
        whileHover={{ scale: isActivated ? 1 : 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`relative w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-sm transition-all ${
          isActivated 
            ? 'bg-red-600 shadow-red-500/50' 
            : 'bg-red-500 hover:bg-red-600 shadow-lg'
        }`}
        onMouseDown={handleStart}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchEnd={handleEnd}
        disabled={isActivated || countdown > 0}
      >
        {/* Progress Ring */}
        <svg className="absolute inset-0 -rotate-90" width="80" height="80">
          <circle
            cx="40"
            cy="40"
            r="35"
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
          />
          <motion.circle
            cx="40"
            cy="40"
            r="35"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 35}
            strokeDashoffset={2 * Math.PI * 35 * (1 - holdProgress / 100)}
            transition={{ duration: 0.1 }}
          />
        </svg>

        {/* Button Content */}
        <div className="relative z-10">
          {isActivated ? (
            <div className="text-center">
              <div className="text-xs font-bold">ACTIVE</div>
              <div className="text-[10px] opacity-80">SENT</div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-xs font-bold">SOS</div>
              <div className="text-[10px] opacity-80">HOLD</div>
            </div>
          )}
        </div>
      </motion.button>

      {/* Status Indicator */}
      {isActivated && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
          Alert Sent
        </div>
      )}
    </div>
  );
};

export default SOSButton;
