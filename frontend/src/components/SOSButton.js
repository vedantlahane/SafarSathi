import React, { useState, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import { getBatteryLevel, getNetworkInfo } from '../utils/helpers';
import '../styles/SOSButton.css';

const SOSButton = ({ currentLocation, user }) => {
  const [isActivated, setIsActivated] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimer = useRef(null);
  const countdownTimer = useRef(null);

  // Enhanced SOS with offline support and better UX
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
  
  const handleMouseUp = useCallback(() => {
    if (holdTimer.current) {
      clearInterval(holdTimer.current);
      setHoldProgress(0);
    }
  }, []);
  
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

  const cancelSOS = useCallback(() => {
    clearInterval(countdownTimer.current);
    setCountdown(0);
    toast.info('SOS cancelled');
  }, []);

  return (
    <div className="sos-container">
      {countdown > 0 && (
        <div className="countdown-overlay">
          <div className="countdown-content">
            <h2>⚠️ SOS Activating</h2>
            <div className="countdown-number">{countdown}</div>
            <button onClick={cancelSOS} className="cancel-btn">
              Cancel
            </button>
          </div>
        </div>
      )}

      <button
        className={`sos-button ${isActivated ? 'activated' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        disabled={isActivated || countdown > 0}
        aria-label="Emergency SOS Button"
      >
        <svg className="sos-progress" width="210" height="210">
          <circle
            cx="105"
            cy="105"
            r="98"
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="4"
          />
          <circle
            cx="105"
            cy="105"
            r="98"
            fill="none"
            stroke="white"
            strokeWidth="4"
            strokeDasharray={`${2 * Math.PI * 98}`}
            strokeDashoffset={`${2 * Math.PI * 98 * (1 - holdProgress / 100)}`}
            style={{ transition: 'stroke-dashoffset 0.1s linear' }}
          />
        </svg>
        <div className="sos-content">
          {isActivated ? (
            <>
              <div className="sos-icon pulse">🚨</div>
              <div className="sos-text">
                <strong>SOS ACTIVE</strong>
                <span>Help is coming</span>
              </div>
            </>
          ) : (
            <>
              <div className="sos-icon">🆘</div>
              <div className="sos-text">
                <strong>EMERGENCY</strong>
                <span>Hold for 3 sec</span>
              </div>
            </>
          )}
        </div>
      </button>

      {isActivated && (
        <div className="sos-info">
          <p>✅ Alert sent • 📍 Location shared • 📞 Services notified</p>
        </div>
      )}
    </div>
  );
};

export default SOSButton;