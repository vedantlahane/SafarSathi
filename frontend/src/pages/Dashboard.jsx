//pages/Dashboard.jsx - Enhanced typography, spacing, and readability for tourists
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../services/AuthContext';
import SOSButton from '../components/SOSButton';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTouristData } from '../services/TouristDataContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import EmergencyContacts from '../components/EmergencyContacts';
import ItineraryTimeline from '../components/ItineraryTimeline';
import IoTDevicesPanel from '../components/IoTDevicesPanel';

const ICONS = Object.freeze({
  appMark: 'https://cdn-icons-png.flaticon.com/512/7116/7116261.png',
  blockchain: 'https://cdn-icons-png.flaticon.com/512/6715/6715231.png',
  statusSafe: 'https://cdn-icons-png.flaticon.com/512/8832/8832411.png',
  statusWarning: 'https://cdn-icons-png.flaticon.com/512/595/595067.png',
  statusDanger: 'https://cdn-icons-png.flaticon.com/512/564/564619.png',
  statSafetyScore: 'https://cdn-icons-png.flaticon.com/512/942/942748.png',
  statSafePlaces: 'https://cdn-icons-png.flaticon.com/512/992/992700.png',
  statAlertsSent: 'https://cdn-icons-png.flaticon.com/512/758/758732.png',
  statActiveTime: 'https://cdn-icons-png.flaticon.com/512/2088/2088617.png',
  actionMap: 'https://cdn-icons-png.flaticon.com/512/535/535137.png',
  actionSafety: 'https://cdn-icons-png.flaticon.com/512/6218/6218886.png',
  actionID: 'https://cdn-icons-png.flaticon.com/512/942/942722.png',
  actionShare: 'https://cdn-icons-png.flaticon.com/512/84/84380.png',
  actionContacts: 'https://cdn-icons-png.flaticon.com/512/552/552721.png',
  actionSOS: 'https://cdn-icons-png.flaticon.com/512/3134/3134898.png',
  itinerary: 'https://cdn-icons-png.flaticon.com/512/2830/2830308.png',
  tips: 'https://cdn-icons-png.flaticon.com/512/1827/1827370.png'
});

const TOUR_STORAGE_KEY = 'safarsathi_dashboard_tour_seen';

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  const {
    profile,
    itinerary,
    contacts,
    anomalies,
    zones,
    iotDevices,
    loading: dataLoading
  } = useTouristData();

  // Merge user's emergency contact from backend with mock contacts
  const allContacts = useMemo(() => {
    const userEmergencyContact = user?.emergencyContact;
    if (userEmergencyContact && userEmergencyContact.trim()) {
      const userContact = {
        id: 'user-emergency',
        name: 'Personal Emergency Contact',
        description: 'Your registered emergency contact',
        phone: userEmergencyContact,
        type: 'family',
        priority: 'critical'
      };
      return [userContact, ...(contacts || [])];
    }
    return contacts || [];
  }, [user?.emergencyContact, contacts]);

  const [currentLocation, setCurrentLocation] = useState(null);
  const [safetyStatus, setSafetyStatus] = useState('safe');
  const [lastActivity, setLastActivity] = useState(new Date());
  const [isSharing, setIsSharing] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [showItinerary, setShowItinerary] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [activeSecondaryPanel, setActiveSecondaryPanel] = useState('map');
  const [isOffline, setIsOffline] = useState(() => {
    if (typeof navigator === 'undefined') return false;
    return !navigator.onLine;
  });
  const locationWatchIdRef = useRef(null);
  const networkAnnouncedRef = useRef(false);

  const [hasSeenTour, setHasSeenTour] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return Boolean(window.localStorage.getItem(TOUR_STORAGE_KEY));
    } catch (storageError) {
      console.warn('Unable to read dashboard tour preference:', storageError);
      return false;
    }
  });
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [tourStepIndex, setTourStepIndex] = useState(0);

  const mapRef = useRef(null);
  const statusRef = useRef(null);
  const quickActionsRef = useRef(null);
  const itineraryRef = useRef(null);
  const sosRef = useRef(null);
  const devicesRef = useRef(null);
  const secondaryPanelRef = useRef(null);

  const zoneList = useMemo(() => zones || [], [zones]);

  const stats = useMemo(() => {
    const completedStops = itinerary?.filter(leg => leg.status === 'completed').length || 0;
    const activeAlerts = anomalies?.filter(anomaly => !anomaly.resolved).length || 0;
    const startReference = user?.loginTime || (profile && profile.tripStart);
    const activeMinutes = startReference
      ? Math.max(1, Math.floor((Date.now() - new Date(startReference)) / 60000))
      : 0;
    const computedSafety = Math.max(
      35,
      Math.min(100, 95 - activeAlerts * 8 - zoneList.length * 2)
    );

    return {
      safePlaces: completedStops,
      alertsSent: activeAlerts,
      activeTime: activeMinutes,
      safetyScore: computedSafety
    };
  }, [itinerary, anomalies, zoneList, user?.loginTime, profile]);

  const nextItineraryStop = useMemo(() => {
    if (!Array.isArray(itinerary) || itinerary.length === 0) {
      return null;
    }
    return itinerary.find(leg => leg.status !== 'completed') || itinerary[0];
  }, [itinerary]);

  const upcomingItinerary = useMemo(() => {
    if (!Array.isArray(itinerary)) {
      return [];
    }
    return itinerary.filter(leg => leg.status !== 'completed').slice(0, 3);
  }, [itinerary]);

  const recentAnomalies = useMemo(() => {
    if (!Array.isArray(anomalies)) {
      return [];
    }
    return anomalies.slice(0, 3);
  }, [anomalies]);

  const activeZones = useMemo(() => {
    if (!Array.isArray(zoneList)) {
      return [];
    }
    return zoneList.slice(0, 3);
  }, [zoneList]);

  const quickStats = useMemo(
    () => [
      {
        id: 'score',
        icon: '🛡️',
        label: 'Safety Score',
        value: `${stats.safetyScore}/100`
      },
      {
        id: 'alerts',
        icon: '🚨',
        label: 'Alerts Today',
        value: stats.alertsSent
      },
      {
        id: 'uptime',
        icon: '⏱️',
        label: 'Active Minutes',
        value: stats.activeTime
      }
    ],
    [stats]
  );

  /**
   * Haversine distance between two coordinate pairs in meters.
   */
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371e3;
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

  const checkSafetyZone = useCallback((lat, lng) => {
    if (!zoneList.length) return;

    const activeZone = zoneList.find(zone => {
      const distance = calculateDistance(lat, lng, zone.center.lat, zone.center.lng);
      return distance < zone.radius;
    });

    if (activeZone && safetyStatus === 'safe') {
      setSafetyStatus('warning');
      const offlineSuffix = isOffline ? ' (Offline mode — alerts queued for sync)' : '';
      toast.warning(`${activeZone.name}: ${activeZone.reason}${offlineSuffix}`);
    } else if (!activeZone && safetyStatus === 'warning') {
      setSafetyStatus('safe');
      toast.success(t('dashboard.safeZoneMessage', 'You are now in a safe zone'));
    }
  }, [zoneList, safetyStatus, isOffline, t]);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setCurrentLocation(coords);
        setLastActivity(new Date());
        checkSafetyZone(coords.lat, coords.lng);
      },
      (error) => {
        console.error('Location error:', error);
        toast.error('Unable to get your location');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );
  }, [checkSafetyZone]);

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return undefined;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setCurrentLocation(coords);
        setLastActivity(new Date());
        checkSafetyZone(coords.lat, coords.lng);
      },
      (error) => {
        console.error('Location watch error:', error);
        if (error.code === error.PERMISSION_DENIED) {
          toast.error('Location permission denied. Geo-fence alerts are limited.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 10000
      }
    );

    locationWatchIdRef.current = watchId;

    return () => {
      if (typeof navigator !== 'undefined' && navigator.geolocation && locationWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(locationWatchIdRef.current);
        locationWatchIdRef.current = null;
      }
    };
  }, [checkSafetyZone]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  useEffect(() => {
    if (!networkAnnouncedRef.current) {
      networkAnnouncedRef.current = true;
      return;
    }

    if (isOffline) {
      toast.warning('Offline mode: alerts will be stored locally until you reconnect.');
    } else {
      toast.success('Connection restored. Syncing with control room.');
    }
  }, [isOffline]);

  useEffect(() => {
    if (currentLocation) {
      checkSafetyZone(currentLocation.lat, currentLocation.lng);
    }
  }, [currentLocation, checkSafetyZone]);

  const getTimeSinceActivity = useCallback(() => {
    const diff = new Date() - lastActivity;
    return Math.floor(diff / 60000);
  }, [lastActivity]);

  const formatRelativeTime = useCallback((input) => {
    const value = new Date(input).getTime();
    if (Number.isNaN(value)) {
      return 'Unknown time';
    }

    const diffMs = Date.now() - value;
    const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

    if (diffMinutes < 1) {
      return 'moments ago';
    }
    if (diffMinutes < 60) {
      return `${diffMinutes} min ago`;
    }

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `${diffHours} hr ago`;
    }

    const diffDays = Math.floor(diffHours / 24);
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
  }, []);

  const handleSafeShare = useCallback(async () => {
    if (isSharing) {
      toast.info('Share already in progress...');
      return;
    }

    setIsSharing(true);

    try {
      const locationText = currentLocation
        ? `Current coordinates: ${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`
        : 'Location unavailable';

      if ('share' in navigator) {
        await navigator.share({
          title: 'SafarSathi - Safety Check-in',
          text: `Safety score ${stats.safetyScore}/100. ${locationText}`,
          url: window.location.origin
        });
        toast.success('Safety status shared successfully!');
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`Safety score ${stats.safetyScore}/100 • ${locationText}`);
        toast.success('Safety status copied to clipboard!');
      } else {
        toast.info(`Status: ${stats.safetyScore}/100 • ${locationText}`);
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
  }, [isSharing, currentLocation, stats.safetyScore]);

  const handleQuickSOS = useCallback(() => {
    const anchor = document.getElementById('main-sos-button');
    if (anchor) {
      anchor.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    toast.info('Hold the SOS button for 3 seconds to dispatch an alert.');
  }, []);

  const secondaryPanels = useMemo(
    () => [
      { id: 'map', label: 'Map', icon: '📍' },
      { id: 'insights', label: 'Insights', icon: '📊' },
      { id: 'timeline', label: 'Plan', icon: '🧭' },
      { id: 'devices', label: 'Devices', icon: '📡' }
    ],
    []
  );

  const handleOpenPanel = useCallback((panelId) => {
    setActiveSecondaryPanel(panelId);
    if (secondaryPanelRef.current) {
      secondaryPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const quickActions = useMemo(
    () => [
      {
        id: 'map-view',
        iconSrc: ICONS.actionMap,
        iconAlt: 'Live map icon',
        text: 'Map',
        description: 'Live safety map',
        onClick: () => handleOpenPanel('map'),
        color: 'from-blue-500 to-indigo-500'
      },
      {
        id: 'safety-center',
        iconSrc: ICONS.actionSafety,
        iconAlt: 'Safety center icon',
        text: 'Safety',
        description: 'AI alerts & guidance',
        onClick: () => navigate('/safety'),
        color: 'from-indigo-500 to-purple-500'
      },
      {
        id: 'contacts',
        iconSrc: ICONS.actionContacts,
        iconAlt: 'Emergency contacts icon',
        text: 'Contacts',
        description: 'Emergency numbers',
        onClick: () => setShowContacts(true),
        color: 'from-orange-500 to-red-500'
      },
      {
        id: 'share',
        iconSrc: ICONS.actionShare,
        iconAlt: 'Share status icon',
        text: 'Share',
        description: 'Live location',
        onClick: handleSafeShare,
        disabled: isSharing,
        color: 'from-emerald-500 to-teal-500'
      },
      {
        id: 'digital-id',
        iconSrc: ICONS.actionID,
        iconAlt: 'Digital ID icon',
        text: 'ID',
        description: 'Travel identity',
        onClick: () => navigate('/id'),
        color: 'from-slate-500 to-slate-600'
      }
    ],
    [navigate, handleSafeShare, isSharing, setShowContacts, handleOpenPanel]
  );

  const tourSteps = useMemo(
    () => [
      {
        id: 'map',
        title: t('dashboard.tour.mapTitle', 'Live safety map'),
        description: t('dashboard.tour.mapDescription', 'Watch safe corridors, alerts, and your location update in real time.'),
        ref: mapRef,
        ctaLabel: t('dashboard.tour.mapAction', 'Open full map'),
        ctaAction: () => navigate('/map')
      },
      {
        id: 'status',
        title: t('dashboard.tour.statusTitle', 'Status at a glance'),
        description: t('dashboard.tour.statusDescription', 'Check your live status and activity trail to know if you are in a warning zone.'),
        ref: statusRef,
        ctaLabel: t('dashboard.tour.statusAction', 'Go to Safety Center'),
        ctaAction: () => navigate('/safety')
      },
      {
        id: 'sos',
        title: t('dashboard.tour.sosTitle', 'Emergency SOS Button'),
        description: t('dashboard.tour.sosDescription', 'The main SOS button is prominently placed. Hold for 3 seconds to send emergency alert to control rooms and your contacts.'),
        ref: sosRef,
        ctaLabel: t('dashboard.tour.sosAction', 'Practice SOS'),
        ctaAction: handleQuickSOS
      },
      {
        id: 'actions',
        title: t('dashboard.tour.actionsTitle', 'Quick actions'),
        description: t('dashboard.tour.actionsDescription', 'Essential safety tools positioned beside the map for quick access.'),
        ref: quickActionsRef
      },
      {
        id: 'itinerary',
        title: t('dashboard.tour.itineraryTitle', 'Itinerary & tips'),
        description: t('dashboard.tour.itineraryDescription', 'Stay on schedule and review AI safety tips for your next stop.'),
        ref: itineraryRef,
        ctaLabel: t('dashboard.tour.itineraryAction', 'View full itinerary'),
        ctaAction: () => setShowItinerary(true)
      },
      {
        id: 'devices',
        title: t('dashboard.tour.devicesTitle', 'IoT wearables'),
        description: t('dashboard.tour.devicesDescription', 'Link your trackers and see battery, status, and last ping here.'),
        ref: devicesRef
      }
    ],
    [devicesRef, handleQuickSOS, itineraryRef, mapRef, navigate, quickActionsRef, setShowItinerary, sosRef, t]
  );

  const markTourSeen = useCallback(() => {
    setHasSeenTour(true);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(TOUR_STORAGE_KEY, '1');
      } catch (storageError) {
        console.warn('Unable to persist dashboard tour preference:', storageError);
      }
    }
  }, []);

  const handleStartTour = useCallback(() => {
    setIsTourOpen(true);
    setTourStepIndex(0);
  }, []);

  const handleSkipTour = useCallback(() => {
    markTourSeen();
    setIsTourOpen(false);
    setTourStepIndex(0);
  }, [markTourSeen]);

  const handleFinishTour = useCallback(() => {
    markTourSeen();
    setIsTourOpen(false);
    setTourStepIndex(0);
  }, [markTourSeen]);

  const totalTourSteps = tourSteps.length;
  const activeTourId = isTourOpen ? tourSteps[tourStepIndex]?.id : null;
  const highlightClass = 'ring-2 ring-teal-300/80 ring-offset-2 ring-offset-slate-950 shadow-lg shadow-teal-400/20';
  const statsVisibilityClass = showStats ? 'grid' : 'hidden sm:grid';
  const tipsVisibilityClass = showTips ? 'block' : 'hidden sm:block';

  const handleNextTourStep = useCallback(() => {
    setTourStepIndex((prev) => {
      const next = prev + 1;
      return next >= totalTourSteps ? prev : next;
    });
  }, [totalTourSteps]);

  const handlePrevTourStep = useCallback(() => {
    setTourStepIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !isTourOpen) {
      return undefined;
    }

    const target = tourSteps[tourStepIndex]?.ref?.current;
    if (target && typeof target.scrollIntoView === 'function') {
      const scrollTimeout = window.setTimeout(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);

      return () => window.clearTimeout(scrollTimeout);
    }

    return undefined;
  }, [isTourOpen, tourStepIndex, tourSteps]);

  useEffect(() => {
    if (!isTourOpen) {
      return;
    }

    const currentId = tourSteps[tourStepIndex]?.id;
    if (currentId === 'map') {
      setActiveSecondaryPanel('map');
    } else if (currentId === 'itinerary') {
      setActiveSecondaryPanel('timeline');
    } else if (currentId === 'devices') {
      setActiveSecondaryPanel('devices');
    }
  }, [isTourOpen, tourStepIndex, tourSteps]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }

    if (isTourOpen) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }

    return undefined;
  }, [isTourOpen]);

  const timeSinceActivity = getTimeSinceActivity();
  const lastActivityLabel = useMemo(() => {
    if (timeSinceActivity === null || timeSinceActivity === undefined) {
      return 'Syncing…';
    }

    if (timeSinceActivity <= 1) {
      return 'moments ago';
    }

    if (timeSinceActivity < 60) {
      return `${timeSinceActivity} min ago`;
    }

    const hours = Math.floor(timeSinceActivity / 60);
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  }, [timeSinceActivity]);

  const locationLabel = useMemo(() => {
    if (!currentLocation) {
      return 'Locating device…';
    }

    return `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`;
  }, [currentLocation]);

  // Helper for safety status color and text
  const statusColor =
    safetyStatus === 'warning'
      ? 'bg-gradient-to-br from-amber-500/90 to-orange-500'
      : safetyStatus === 'danger'
      ? 'bg-gradient-to-br from-rose-600/90 to-red-600'
      : 'bg-gradient-to-br from-emerald-500/90 to-teal-500';
  const statusText =
    safetyStatus === 'warning'
      ? isOffline
        ? 'Warning • Offline'
        : 'Warning Zone'
      : safetyStatus === 'danger'
      ? 'SOS Active'
      : isOffline
      ? 'All Clear • Offline'
      : 'All Clear';

  const statusIcon = useMemo(() => {
    if (safetyStatus === 'warning') return ICONS.statusWarning;
    if (safetyStatus === 'danger') return ICONS.statusDanger;
    return ICONS.statusSafe;
  }, [safetyStatus]);

  if (dataLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="bg-white px-6 py-4 rounded-xl shadow-lg border border-slate-200">
          <div className="text-lg font-medium text-slate-700">Loading your safety dashboard...</div>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.06
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative min-h-[100svh] bg-slate-950 text-slate-100 px-3 pb-14 pt-5 sm:px-6 sm:pb-10 lg:px-8 font-inter"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif' }}
    >
      {/* ENHANCED HEADER - Better typography and spacing */}
      <motion.header variants={itemVariants} className="mb-8 mx-auto max-w-7xl">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6 lg:p-7 shadow-lg backdrop-blur">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
            <div className="flex items-center gap-4">
              <motion.img
                src={ICONS.appMark}
                alt="SafarSathi icon"
                loading="lazy"
                className="h-12 w-12 sm:h-14 sm:w-14 drop-shadow-xl"
                initial={{ rotate: -10, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
              />
              <div>
                <motion.h1
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="text-2xl font-bold text-white sm:text-3xl tracking-tight"
                >
                  SafarSathi
                </motion.h1>
                <p className="text-base text-slate-300 sm:text-lg font-medium">
                  Welcome, {profile?.name || user?.name || 'Traveller'}
                </p>
              </div>
            </div>

            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:gap-3 sm:justify-end">
              {isOffline && (
                <span className="flex items-center gap-2 rounded-full border border-orange-400/40 bg-orange-500/20 px-3 py-2 text-sm font-semibold text-orange-100">
                  <span className="block h-2 w-2 rounded-full bg-orange-200 animate-pulse" />
                  Offline
                </span>
              )}
              <LanguageSwitcher compact />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleStartTour}
                className="rounded-full border border-teal-400/60 px-4 py-2 text-sm font-semibold text-teal-100 transition-colors bg-teal-500/20 hover:bg-teal-500/30"
              >
                {hasSeenTour ? 'Help' : 'Take Tour'}
              </motion.button>
              <span className="flex items-center gap-2 rounded-full border border-white/20 bg-slate-900/70 px-3 py-2 text-sm font-medium text-slate-100">
                <img src={ICONS.blockchain} alt="ID" loading="lazy" className="h-4 w-4 opacity-90" />
                {profile?.blockchainID ? `${profile.blockchainID.slice(0, 6)}…` : 'ID Pending'}
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                className="rounded-full bg-red-500/90 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-500"
              >
                Logout
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* ENHANCED WELCOME TOUR */}
      <AnimatePresence>
        {!hasSeenTour && !isTourOpen && (
          <motion.section
            key="tour-intro"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="mb-8 mx-auto max-w-7xl"
            aria-live="polite"
          >
            <div className="rounded-2xl border border-teal-500/30 bg-teal-500/10 p-6 shadow-lg backdrop-blur">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-teal-100 mb-2">Welcome to your safety dashboard</h2>
                  <p className="text-base text-teal-50/90 max-w-2xl leading-relaxed">
                    Take a quick 60-second tour to understand emergency features, live maps, and safety tools designed for your protection.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleStartTour}
                    className="inline-flex items-center gap-2 rounded-full bg-teal-400/90 px-6 py-3 text-base font-bold text-slate-950 transition hover:bg-teal-300"
                  >
                    🚀 Start Tour
                  </button>
                  <button
                    type="button"
                    onClick={handleSkipTour}
                    className="inline-flex items-center gap-2 rounded-full border border-teal-200/40 bg-slate-900/70 px-6 py-3 text-base font-semibold text-teal-100 transition hover:bg-slate-900/60"
                  >
                    Skip for now
                  </button>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT */}
      <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8 lg:pb-24">
        <motion.section variants={itemVariants} className="mb-8 grid grid-cols-1 gap-5 lg:grid-cols-5 lg:gap-6">
          <div className="space-y-5 lg:col-span-3">
            <motion.div
              ref={statusRef}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className={`${statusColor} rounded-2xl border border-white/10 p-6 text-white shadow-xl transition-all duration-500 backdrop-blur sm:p-7 lg:p-8 ${
                activeTourId === 'status' ? highlightClass : ''
              }`}
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1 space-y-3 text-center lg:text-left">
                  <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.35em] text-white/80 lg:justify-start">
                    <span className="inline-flex h-1.5 w-1.5 rounded-full bg-white" />
                    Live Status
                  </div>
                  <h2 className="text-3xl font-black tracking-tight sm:text-4xl">{statusText}</h2>
                  <p className="text-base font-semibold text-white/90 sm:text-lg">📍 {locationLabel}</p>
                  <p className="text-sm font-medium text-white/70">Last activity {lastActivityLabel}</p>
                </div>
                <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-black/20 px-5 py-4 shadow-lg sm:px-6 sm:py-5">
                  <img
                    src={statusIcon}
                    alt="Status icon"
                    className="h-16 w-16 rounded-full bg-white/20 p-4 shadow-lg"
                  />
                  <div className="text-center">
                    <p className="text-sm font-semibold text-white/80">Safety Score</p>
                    <p className="text-3xl font-black">{stats.safetyScore}/100</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSafeShare}
                    disabled={isSharing}
                    className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Share status
                  </button>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-white/85 sm:grid-cols-4">
                <div className="rounded-xl bg-black/20 px-3 py-2 text-center">
                  <p className="font-semibold uppercase tracking-wide">Connectivity</p>
                  <p className="mt-1 text-sm font-bold">{isOffline ? 'Offline' : 'Online'}</p>
                </div>
                <div className="rounded-xl bg-black/20 px-3 py-2 text-center">
                  <p className="font-semibold uppercase tracking-wide">Contacts</p>
                  <p className="mt-1 text-sm font-bold">{allContacts.length}</p>
                </div>
                <div className="rounded-xl bg-black/20 px-3 py-2 text-center">
                  <p className="font-semibold uppercase tracking-wide">Alerts Today</p>
                  <p className="mt-1 text-sm font-bold">{stats.alertsSent}</p>
                </div>
                <div className="rounded-xl bg-black/20 px-3 py-2 text-center">
                  <p className="font-semibold uppercase tracking-wide">Trip Minutes</p>
                  <p className="mt-1 text-sm font-bold">{stats.activeTime}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              ref={quickActionsRef}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`rounded-2xl border border-white/10 bg-slate-900/60 p-5 shadow-lg backdrop-blur sm:p-6 ${
                activeTourId === 'actions' ? highlightClass : ''
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-white sm:text-xl">Quick actions</h2>
                  <p className="text-sm font-medium text-slate-300/90">Safety essentials within thumb reach</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowStats((prev) => !prev)}
                    aria-pressed={showStats}
                    className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20 sm:hidden"
                  >
                    {showStats ? 'Hide quick stats' : 'Quick stats'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleOpenPanel('timeline');
                      setShowTips((prev) => !prev);
                    }}
                    aria-pressed={showTips}
                    className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20 sm:hidden"
                  >
                    {showTips ? 'Hide tips' : 'Safety tips'}
                  </button>
                </div>
              </div>
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible lg:grid-cols-3">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={action.id}
                    type="button"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + index * 0.05 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={action.onClick}
                    disabled={action.disabled}
                    className={`group relative flex min-w-[11rem] flex-shrink-0 items-center gap-3 rounded-2xl bg-gradient-to-r p-4 text-left text-white shadow-md transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-0 sm:p-5 ${action.color}`}
                    aria-label={`${action.text} — ${action.description}`}
                  >
                    <img src={action.iconSrc} alt={action.iconAlt} loading="lazy" className="h-10 w-10 flex-shrink-0 drop-shadow" />
                    <div className="flex-1">
                      <p className="text-sm font-bold leading-tight sm:text-base">{action.text}</p>
                      <p className="text-xs font-medium text-white/90 sm:text-sm">{action.description}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className={`rounded-2xl border border-white/10 bg-slate-900/60 p-4 shadow-lg backdrop-blur sm:p-6 ${statsVisibilityClass} grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4`}
            >
              {quickStats.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white shadow-sm"
                >
                  <span className="text-2xl" aria-hidden>{item.icon}</span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">{item.label}</p>
                    <p className="text-xl font-bold text-white/90">{item.value}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            ref={sosRef}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className={`flex h-full flex-col justify-between rounded-2xl border border-red-500/40 bg-gradient-to-br from-rose-600/20 via-red-600/10 to-rose-800/30 p-6 shadow-xl backdrop-blur sm:p-7 lg:col-span-2 ${
              activeTourId === 'sos' ? highlightClass : ''
            }`}
            id="main-sos-button"
          >
            <div className="space-y-5">
              <div className="text-center">
                <h3 className="text-lg font-black text-white sm:text-xl">Emergency SOS</h3>
                <p className="text-sm font-semibold text-rose-100/90 sm:text-base">Hold for 3 seconds to dispatch</p>
                {isOffline && (
                  <p className="mt-2 text-xs font-medium text-amber-200">
                    Offline mode: alerts sync once reconnected
                  </p>
                )}
              </div>
              <div className="flex justify-center">
                <SOSButton currentLocation={currentLocation} user={profile} />
              </div>
              <div className="rounded-2xl border border-white/20 bg-black/20 px-4 py-3 text-left text-xs font-medium text-white/80 shadow-inner">
                <p className="text-sm font-semibold text-white">Emergency flow</p>
                <ul className="mt-2 space-y-1">
                  <li>• Control room alerted instantly with live coordinates</li>
                  <li>• Emergency contacts receive SMS + app notification</li>
                  <li>• Nearby patrol units get push updates</li>
                </ul>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setShowContacts(true)}
                className="flex-1 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                View emergency contacts
              </button>
              <button
                type="button"
                onClick={() => navigate('/safety')}
                className="flex-1 rounded-full bg-gradient-to-r from-rose-500 to-red-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:from-rose-400 hover:to-red-400"
              >
                Safety center
              </button>
            </div>
          </motion.div>
        </motion.section>

        <motion.section
          ref={secondaryPanelRef}
          variants={itemVariants}
          className="space-y-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 shadow-lg backdrop-blur sm:p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-white sm:text-xl">More safety tools</h2>
                <p className="text-sm text-slate-300/90">Switch panels to dive into detailed insights</p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/map')}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                <span aria-hidden>↗</span> Full map view
              </button>
            </div>
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
              {secondaryPanels.map((panel) => (
                <button
                  key={panel.id}
                  type="button"
                  onClick={() => setActiveSecondaryPanel(panel.id)}
                  aria-pressed={activeSecondaryPanel === panel.id}
                  className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition sm:text-base ${
                    activeSecondaryPanel === panel.id
                      ? 'border-teal-400/80 bg-teal-500/20 text-teal-100 shadow'
                      : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/15'
                  }`}
                >
                  <span aria-hidden>{panel.icon}</span>
                  {panel.label}
                </button>
              ))}
            </div>
            <div className="mt-6 space-y-6">
              {activeSecondaryPanel === 'map' && (
                <motion.div
                  key="panel-map"
                  ref={mapRef}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl border border-white/10 bg-slate-950/70 p-4 sm:p-6 ${
                    activeTourId === 'map' ? highlightClass : ''
                  }`}
                >
                  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="flex items-center text-lg font-semibold text-white sm:text-xl">
                      🗺️ Live safety map
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="ml-2 inline-flex h-2.5 w-2.5 rounded-full bg-green-400"
                      />
                    </h3>
                    <button
                      type="button"
                      onClick={() => navigate('/map')}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                    >
                      Open full map
                    </button>
                  </div>
                  <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 aspect-[4/3] sm:aspect-[16/9]">
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage: 'linear-gradient(rgba(226,232,240,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(226,232,240,0.12) 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                      }}
                    />
                    <motion.div
                      initial={{ scale: 1, opacity: 0.7 }}
                      animate={{ scale: 1.2, opacity: 1 }}
                      transition={{ repeat: Infinity, repeatType: 'mirror', duration: 1.5 }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    >
                      <div className="relative">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full border-4 border-white bg-blue-500 shadow-lg">
                          <div className="h-3 w-3 rounded-full bg-white" />
                        </div>
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white shadow">
                          Your location
                        </div>
                      </div>
                    </motion.div>
                    <div className="absolute top-6 left-6 h-6 w-6 rounded-full border border-emerald-300 bg-emerald-500/60" />
                    <div className="absolute bottom-10 right-12 h-8 w-8 rounded-full border border-red-400 bg-red-500/40" />
                    <div className="absolute bottom-4 left-4 rounded-lg border border-white/10 bg-slate-900/80 px-3 py-1 text-sm font-mono text-slate-200">
                      {currentLocation
                        ? `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`
                        : 'Getting location…'}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSecondaryPanel === 'insights' && (
                <motion.div
                  key="panel-insights"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-5"
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {quickStats.map((item) => (
                      <div
                        key={`insight-${item.id}`}
                        className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white shadow"
                      >
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{item.label}</p>
                        <p className="mt-1 text-2xl font-bold">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">Recent anomalies</h3>
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                          {recentAnomalies.length}
                        </span>
                      </div>
                      <div className="mt-4 space-y-3">
                        {recentAnomalies.length === 0 ? (
                          <p className="rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-300">
                            All clear. No anomalies detected today.
                          </p>
                        ) : (
                          recentAnomalies.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-200"
                            >
                              <div>
                                <p className="font-semibold capitalize text-white">{item.type.replace('_', ' ')}</p>
                                <p className="text-xs text-slate-400">{formatRelativeTime(item.timestamp)}</p>
                              </div>
                              <span
                                className={`inline-flex min-w-[88px] items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ${
                                  item.severity === 'high'
                                    ? 'bg-rose-500/20 text-rose-200'
                                    : item.severity === 'medium'
                                    ? 'bg-amber-500/20 text-amber-100'
                                    : 'bg-sky-500/20 text-sky-100'
                                }`}
                              >
                                {item.severity}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">Active geo-fence zones</h3>
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                          {activeZones.length}
                        </span>
                      </div>
                      <div className="mt-4 space-y-3">
                        {activeZones.length === 0 ? (
                          <p className="rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-300">
                            No restricted zones nearby.
                          </p>
                        ) : (
                          activeZones.map((zone) => (
                            <div
                              key={zone.id}
                              className="rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-200"
                            >
                              <p className="font-semibold text-white">{zone.name}</p>
                              <p className="text-xs text-slate-400">{zone.reason}</p>
                              <p className="mt-2 text-xs text-slate-400">
                                Radius {Math.round(zone.radius)}m • {zone.center.lat.toFixed(2)}, {zone.center.lng.toFixed(2)}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSecondaryPanel === 'timeline' && (
                <motion.div
                  key="panel-timeline"
                  ref={itineraryRef}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`space-y-5 ${activeTourId === 'itinerary' ? highlightClass : ''}`}
                >
                  <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 sm:p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <img src={ICONS.itinerary} alt="Itinerary" loading="lazy" className="h-10 w-10" />
                        <div>
                          <h3 className="text-lg font-semibold text-white sm:text-xl">Journey timeline</h3>
                          <p className="text-sm text-slate-300">
                            Next stop: {nextItineraryStop?.title || 'All clear'} • {nextItineraryStop?.city || 'TBD'}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowItinerary(true)}
                        className="inline-flex items-center gap-2 rounded-full border border-teal-400/40 bg-teal-500/20 px-4 py-2 text-sm font-semibold text-teal-100 transition hover:bg-teal-500/30"
                      >
                        View full itinerary ↗
                      </button>
                    </div>
                    <div className="mt-5 space-y-3">
                      {upcomingItinerary.length === 0 ? (
                        <p className="rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-300">
                          You are all caught up with your travel plan.
                        </p>
                      ) : (
                        upcomingItinerary.map((stop) => (
                          <div
                            key={stop.id}
                            className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-200"
                          >
                            <div>
                              <p className="font-semibold text-white">{stop.title}</p>
                              <p className="text-xs text-slate-400">{stop.city} • {stop.time}</p>
                            </div>
                            <span
                              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                                stop.status === 'completed'
                                  ? 'bg-emerald-500/20 text-emerald-200'
                                  : 'bg-sky-500/20 text-sky-100'
                              }`}
                            >
                              {stop.status}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  <div className={`rounded-2xl border border-white/10 bg-slate-900/60 p-5 sm:p-6 ${tipsVisibilityClass} sm:block`}>
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img src={ICONS.tips} alt="Safety tips" loading="lazy" className="h-8 w-8" />
                        <h3 className="text-lg font-semibold text-white">AI travel tips</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowTips((prev) => !prev)}
                        aria-pressed={showTips}
                        className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/20 sm:hidden"
                      >
                        {showTips ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <ul className="space-y-3 text-sm text-slate-200 sm:text-base">
                      <li className="flex items-start gap-3">
                        <span className="mt-1 text-base text-teal-300">•</span>
                        <span>Enable IoT tracking when entering high-risk zones.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="mt-1 text-base text-teal-300">•</span>
                        <span>Check the Safety Center for AI advisories each morning.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="mt-1 text-base text-teal-300">•</span>
                        <span>Keep emergency contacts pinned for single-tap escalation.</span>
                      </li>
                    </ul>
                  </div>
                </motion.div>
              )}

              {activeSecondaryPanel === 'devices' && (
                <motion.div
                  key="panel-devices"
                  ref={devicesRef}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`${activeTourId === 'devices' ? highlightClass : ''}`}
                >
                  <IoTDevicesPanel devices={iotDevices} />
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.section>
      </div>

      {/* MODALS - Enhanced typography */}
      <AnimatePresence>
        {showContacts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-2xl w-full"
            >
              <EmergencyContacts contacts={allContacts} />
              <button
                onClick={() => setShowContacts(false)}
                className="mt-6 w-full bg-slate-900 text-white py-4 rounded-lg text-base font-semibold hover:bg-slate-800 transition"
              >
                Close Contacts
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showItinerary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-4xl w-full"
            >
              <ItineraryTimeline itinerary={itinerary} />
              <button
                onClick={() => setShowItinerary(false)}
                className="mt-6 w-full bg-slate-900 text-white py-4 rounded-lg text-base font-semibold hover:bg-slate-800 transition"
              >
                Close Itinerary
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ENHANCED TOUR MODAL */}
      <AnimatePresence>
        {isTourOpen && (
          <motion.div
            key="dashboard-tour"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4 py-8"
            role="dialog"
            aria-modal="true"
            aria-label="Dashboard guided tour"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-lg rounded-2xl border border-white/15 bg-slate-900/95 p-8 text-white shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <p className="text-sm font-bold uppercase tracking-widest text-teal-300 mb-2">
                    STEP {tourStepIndex + 1} OF {totalTourSteps}
                  </p>
                  <h3 className="text-2xl font-bold leading-tight">
                    {tourSteps[tourStepIndex]?.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleFinishTour}
                  className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  Finish Tour
                </button>
              </div>
              <p className="text-base leading-relaxed text-slate-200 mb-6">
                {tourSteps[tourStepIndex]?.description}
              </p>
              {tourSteps[tourStepIndex]?.ctaLabel && tourSteps[tourStepIndex]?.ctaAction && (
                <button
                  type="button"
                  onClick={() => {
                    tourSteps[tourStepIndex]?.ctaAction();
                  }}
                  className="mb-6 inline-flex items-center gap-2 rounded-full bg-teal-400/90 px-6 py-3 text-base font-bold text-slate-950 transition hover:bg-teal-300"
                >
                  {tourSteps[tourStepIndex]?.ctaLabel}
                  <span aria-hidden>↗</span>
                </button>
              )}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handleSkipTour}
                  className="text-base font-semibold text-slate-200 underline-offset-4 transition hover:underline"
                >
                  Skip remaining steps
                </button>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handlePrevTourStep}
                    disabled={tourStepIndex === 0}
                    className="rounded-full border border-white/20 bg-white/5 px-5 py-2 text-base font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={tourStepIndex + 1 >= totalTourSteps ? handleFinishTour : handleNextTourStep}
                    className="rounded-full bg-teal-400/80 px-5 py-2 text-base font-bold text-slate-950 transition hover:bg-teal-300"
                  >
                    {tourStepIndex + 1 >= totalTourSteps ? 'Complete' : 'Continue'}
                  </button>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {tourSteps.map((step, index) => (
                  <button
                    type="button"
                    key={step.id}
                    onClick={() => setTourStepIndex(index)}
                    className={`h-3 w-10 rounded-full transition-all duration-200 ${
                      index === tourStepIndex ? 'bg-teal-400' : 'bg-white/20 hover:bg-white/30'
                    }`}
                    aria-label={`Jump to tour step ${index + 1}: ${step.title}`}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Dashboard;
