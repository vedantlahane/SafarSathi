//pages/MapView.js - Enhanced with AI safety scoring and real-time features
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { toast } from 'react-toastify';
import { useAuth } from '../services/AuthContext';
import { debounce, calculateDistance } from '../utils/helpers';
import SOSButton from '../components/SOSButton';
import '../styles/MapView.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const dangerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const policeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to update map center
const MapUpdater = ({ center }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  
  return null;
};

const MapView = () => {
  const { user } = useAuth();
  const [userLocation, setUserLocation] = useState([28.6139, 77.2090]);
  const [isTracking, setIsTracking] = useState(false);
  const [safetyScore, setSafetyScore] = useState(85);
  const [incidents, setIncidents] = useState([]);
  const [mapCenter, setMapCenter] = useState([28.6139, 77.2090]);
  const [isSharing, setIsSharing] = useState(false);
  const trackingRef = useRef(null);

  // Enhanced unsafe zones with time-based risk
  const unsafeZones = useMemo(() => {
    const hour = new Date().getHours();
    const isNight = hour >= 20 || hour <= 6;
    
    return [
      {
        id: 1,
        position: [28.6129, 77.2295],
        radius: 500,
        name: "Chandni Chowk Area",
        description: isNight ? "High risk after dark" : "Moderate pickpocketing risk",
        riskLevel: isNight ? "high" : "medium",
        incidents: 12
      },
      {
        id: 2,
        position: [28.5355, 77.3910],
        radius: 800,
        name: "Noida Sector 18",
        description: "Commercial area - stay alert",
        riskLevel: "medium",
        incidents: 7
      }
    ];
  }, []);

  // Police stations with real-time availability
  const policeStations = [
    {
      id: 1,
      position: [28.6289, 77.2065],
      name: "CP Police Station",
      contact: "100",
      available: true,
      responseTime: "3-5 min"
    },
    {
      id: 2,
      position: [28.6562, 77.2410],
      name: "Red Fort Police",
      contact: "100",
      available: true,
      responseTime: "5-7 min"
    }
  ];

  // AI-powered safety score calculation
  const calculateSafetyScore = useCallback((lat, lng) => {
    let score = 100;
    
    unsafeZones.forEach(zone => {
      const distance = calculateDistance(lat, lng, zone.position[0], zone.position[1]);
      if (distance < zone.radius * 2) {
        const proximity = 1 - (distance / (zone.radius * 2));
        const riskFactor = zone.riskLevel === 'high' ? 30 : 15;
        score -= proximity * riskFactor;
      }
    });
    
    // Time-based adjustment
    const hour = new Date().getHours();
    if (hour >= 22 || hour <= 5) score -= 10;
    
    // Proximity to police stations bonus
    policeStations.forEach(station => {
      const distance = calculateDistance(lat, lng, station.position[0], station.position[1]);
      if (distance < 1000) score += 5;
    });
    
    setSafetyScore(Math.max(0, Math.min(100, Math.round(score))));
  }, [unsafeZones]);

  // Sync map center with user location
  useEffect(() => {
    setMapCenter(userLocation);
  }, [userLocation]);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = [position.coords.latitude, position.coords.longitude];
          setUserLocation(newLocation);
          setMapCenter(newLocation);
          calculateSafetyScore(position.coords.latitude, position.coords.longitude);
          checkProximityAlerts(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error('Location error:', error);
          toast.error('Unable to get your location');
        }
      );
    }
  };

  // Enhanced location tracking with battery optimization
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }
    
    setIsTracking(true);
    toast.success('🔍 Real-time tracking started');
    
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000 // Cache location for 30 seconds to save battery
    };
    
    trackingRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = [position.coords.latitude, position.coords.longitude];
        setUserLocation(newLocation);
        calculateSafetyScore(position.coords.latitude, position.coords.longitude);
        checkProximityAlerts(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.error('Tracking error:', error);
        toast.error('Location tracking failed');
        setIsTracking(false);
      },
      options
    );
  }, [calculateSafetyScore]);
  
  const stopTracking = useCallback(() => {
    if (trackingRef.current) {
      navigator.geolocation.clearWatch(trackingRef.current);
      trackingRef.current = null;
    }
    setIsTracking(false);
    toast.info('📍 Tracking stopped');
  }, []);

  // Safe sharing function to prevent multiple simultaneous shares
  const handleSafeShare = useCallback(async () => {
    if (isSharing) {
      toast.info('Share already in progress...');
      return;
    }

    setIsSharing(true);
    
    try {
      if ('share' in navigator) {
        await navigator.share({
          title: 'My Current Location - SafarSathi',
          text: `I'm currently at coordinates ${userLocation[0].toFixed(4)}, ${userLocation[1].toFixed(4)}. Shared via SafarSathi safety app.`,
          url: `https://maps.google.com/?q=${userLocation[0]},${userLocation[1]}`
        });
        toast.success('📤 Location shared successfully!');
      } else {
        // Fallback for browsers that don't support native sharing
        const locationText = `My location: ${userLocation[0].toFixed(4)}, ${userLocation[1].toFixed(4)} - https://maps.google.com/?q=${userLocation[0]},${userLocation[1]}`;
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(locationText);
          toast.success('📋 Location copied to clipboard!');
        } else {
          toast.info('📍 Location: ' + locationText);
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
        toast.error('Failed to share location');
      }
    } finally {
      setIsSharing(false);
    }
  }, [userLocation, isSharing]);

  // Smart proximity alerts with throttling
  const checkProximityAlerts = useCallback(
    debounce((lat, lng) => {
      unsafeZones.forEach(zone => {
        const distance = calculateDistance(lat, lng, zone.position[0], zone.position[1]);
        
        if (distance < zone.radius && zone.riskLevel === 'high') {
          toast.warning(`⚠️ High risk area: ${zone.name}`, {
            toastId: `zone-${zone.id}` // Prevent duplicate toasts
          });
          
          // Log to blockchain
          const log = {
            userId: user?.blockchainID,
            event: 'high_risk_zone_entry',
            zone: zone.name,
            timestamp: new Date().toISOString()
          };
          console.log('Blockchain Log:', log);
        }
      });
    }, 2000),
    [unsafeZones, user]
  );

  // Map center updater component
  const MapUpdater = ({ center }) => {
    const map = useMap();
    useEffect(() => {
      if (center) {
        map.flyTo(center, map.getZoom(), {
          duration: 1.5,
          easeLinearity: 0.25
        });
      }
    }, [center, map]);
    return null;
  };
  
  // Initialize location and incidents on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = [position.coords.latitude, position.coords.longitude];
          setUserLocation(newLocation);
          calculateSafetyScore(position.coords.latitude, position.coords.longitude);
        },
        (error) => console.error('Location error:', error)
      );
    }
    
    // Generate recent incidents for demo
    const mockIncidents = [
      { id: 1, lat: 28.6149, lng: 77.2090, type: 'theft', time: '2 hours ago' },
      { id: 2, lat: 28.6200, lng: 77.2100, type: 'harassment', time: '5 hours ago' },
      { id: 3, lat: 28.5400, lng: 77.3900, type: 'scam', time: '1 day ago' }
    ];
    setIncidents(mockIncidents);
    
    // Cleanup on unmount
    return () => {
      if (trackingRef.current) {
        navigator.geolocation.clearWatch(trackingRef.current);
      }
    };
  }, [calculateSafetyScore]);

  return (
    <div className="map-view-container">
      {/* Enhanced Map Controls */}
      <div className="map-controls">
        <div className="safety-score-card">
          <h3>�️ Safety Score</h3>
          <div className={`score-display ${safetyScore > 70 ? 'safe' : safetyScore > 40 ? 'moderate' : 'danger'}`}>
            <span className="score-number">{safetyScore}</span>
            <span className="score-label">/100</span>
          </div>
          <p className="score-status">
            {safetyScore > 70 ? '✅ Safe Area' : 
             safetyScore > 40 ? '⚠️ Stay Alert' : '🚨 High Risk'}
          </p>
        </div>
        
        <div className="control-group">
          <h3>📍 Location Services</h3>
          <div className="control-buttons">
            {!isTracking ? (
              <button onClick={startTracking} className="control-btn primary">
                🔍 Start Tracking
              </button>
            ) : (
              <button onClick={stopTracking} className="control-btn danger">
                ⏹️ Stop Tracking
              </button>
            )}
            <button 
              onClick={handleSafeShare}
              disabled={isSharing}
              className="control-btn secondary"
            >
              {isSharing ? '⏳ Sharing...' : '📤 Share Location'}
            </button>
          </div>
        </div>
        
        <div className="stats-group">
          <h4>� Area Statistics</h4>
          <div className="stat-item">
            <span className="stat-label">Recent Incidents:</span>
            <span className="stat-value">{incidents.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Police Nearby:</span>
            <span className="stat-value">{policeStations.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Response Time:</span>
            <span className="stat-value">~5 min</span>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="map-container">
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <MapUpdater center={userLocation} />
          
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* User Location with pulse animation */}
          <Marker position={userLocation}>
            <Popup>
              <div className="popup-content">
                <strong>📍 Your Location</strong>
                <p>Safety Score: {safetyScore}/100</p>
                <p>Status: {isTracking ? '🔍 Tracking' : '📍 Static'}</p>
              </div>
            </Popup>
          </Marker>
          
          {/* Animated Unsafe Zones */}
          {unsafeZones.map(zone => (
            <React.Fragment key={zone.id}>
              <Circle
                center={zone.position}
                radius={zone.radius}
                pathOptions={{
                  color: zone.riskLevel === 'high' ? '#ff4444' : '#ffaa00',
                  fillColor: zone.riskLevel === 'high' ? '#ff4444' : '#ffaa00',
                  fillOpacity: 0.2,
                  weight: 2,
                  dashArray: zone.riskLevel === 'high' ? '10, 5' : null
                }}
              />
              <Marker position={zone.position}>
                <Popup>
                  <div className="popup-content danger">
                    <strong>⚠️ {zone.name}</strong>
                    <p>Risk: {zone.riskLevel.toUpperCase()}</p>
                    <p>{zone.description}</p>
                    <p>Incidents: {zone.incidents}</p>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          ))}

          {/* Police Stations with availability */}
          {policeStations.map(station => (
            <Marker key={station.id} position={station.position}>
              <Popup>
                <div className="popup-content police">
                  <strong>🚔 {station.name}</strong>
                  <p>Status: {station.available ? '✅ Available' : '🔴 Busy'}</p>
                  <p>Response: {station.responseTime}</p>
                  <button 
                    onClick={() => window.open(`tel:${station.contact}`)}
                    className="call-btn"
                  >
                    📞 Call Emergency
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
          
          {/* Recent Incidents */}
          {incidents.map(incident => (
            <Circle
              key={incident.id}
              center={[incident.lat, incident.lng]}
              radius={100}
              pathOptions={{
                color: '#ff6b6b',
                fillColor: '#ff6b6b',
                fillOpacity: 0.1,
                weight: 1
              }}
            />
          ))}
        </MapContainer>
      </div>
      
      {/* Floating SOS Button */}
      <div className="floating-sos">
        <SOSButton currentLocation={{ lat: userLocation[0], lng: userLocation[1] }} user={user} />
      </div>
      
      {/* Safety Status */}
      <div className="safety-status">
        <div className={`status-indicator ${isTracking ? 'active' : 'inactive'}`}>
          <span className="status-dot"></span>
          <span className="status-text">
            {isTracking ? '🔍 Real-time Tracking Active' : '📍 Location Tracking Inactive'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MapView;