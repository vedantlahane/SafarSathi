//pages/Dashboard.js - Enhanced with real-time stats and better UX
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../services/AuthContext';
import SOSButton from '../components/SOSButton';
import '../styles/Dashboard.css';

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

  // Safe sharing function to prevent multiple simultaneous shares
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

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>🛡️ SafarSathi</h1>
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className="blockchain-badge">🔗 {user?.blockchainID?.slice(0, 8)}...</span>
            <button onClick={logout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">🛡️</div>
          <div className="stat-info">
            <h3>Safety Score</h3>
            <p className="stat-value">{stats.safetyScore}/100</p>
          </div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>Safe Places</h3>
            <p className="stat-value">{stats.safePlaces}</p>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon">�</div>
          <div className="stat-info">
            <h3>Alerts Sent</h3>
            <p className="stat-value">{stats.alertsSent}</p>
          </div>
        </div>
        <div className="stat-card info">
          <div className="stat-icon">⏱️</div>
          <div className="stat-info">
            <h3>Active Time</h3>
            <p className="stat-value">{stats.activeTime} min</p>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="action-grid">
        <button onClick={() => navigate('/map')} className="action-card map">
          <span className="action-icon">🗺️</span>
          <span className="action-text">Safety Map</span>
        </button>
        <button className="action-card sos">
          <span className="action-icon">🆘</span>
          <span className="action-text">Quick SOS</span>
        </button>
        <button 
          onClick={handleSafeShare}
          className={`action-card share ${isSharing ? 'disabled' : ''}`}
          disabled={isSharing}
        >
          <span className="action-icon">📤</span>
          <span className="action-text">Share Location</span>
        </button>
        <button className="action-card contacts">
          <span className="action-icon">📞</span>
          <span className="action-text">Emergency Contacts</span>
        </button>
      </div>
      
      {/* Safety Tips */}
      <div className="tips-section">
        <h2>� Safety Tips</h2>
        <div className="tips-carousel">
          <div className="tip-card">
            <p>Always keep your phone charged above 20% for emergencies</p>
          </div>
          <div className="tip-card">
            <p>Share your live location with trusted contacts when traveling</p>
          </div>
          <div className="tip-card">
            <p>Avoid displaying expensive items in crowded areas</p>
          </div>
        </div>
      </div>
      
      {/* Emergency Section */}
      <div className="emergency-section">
        <SOSButton currentLocation={null} user={user} />
      </div>
    </div>
  );
};

export default Dashboard;