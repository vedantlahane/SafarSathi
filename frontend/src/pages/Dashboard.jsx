//pages/Dashboard.jsx - Optimized layout with proper spacing and prominent SOS
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

  const quickActions = useMemo(
    () => [
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
    [navigate, handleSafeShare, isSharing, setShowContacts]
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
        id: 'actions',
        title: t('dashboard.tour.actionsTitle', 'Quick actions'),
        description: t('dashboard.tour.actionsDescription', 'Use these cards to share your status, raise SOS, or reach contacts instantly.'),
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
        id: 'sos',
        title: t('dashboard.tour.sosTitle', 'Emergency SOS Button'),
        description: t('dashboard.tour.sosDescription', 'The main SOS button is always visible. Hold for 3 seconds to send emergency alert to control rooms and your contacts.'),
        ref: sosRef,
        ctaLabel: t('dashboard.tour.sosAction', 'Practice SOS'),
        ctaAction: handleQuickSOS
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
        <div className="bg-white px-4 py-3 rounded-xl shadow-lg border border-slate-200">
          Loading your safety dashboard...
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
      className="relative min-h-[100svh] bg-slate-950 text-slate-100 px-3 pb-6 pt-4 sm:px-6 lg:px-8"
    >
      {/* COMPACT HEADER */}
      <motion.header variants={itemVariants} className="mb-6 mx-auto max-w-7xl">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <motion.img
                src={ICONS.appMark}
                alt="SafarSathi icon"
                loading="lazy"
                className="h-10 w-10 sm:h-12 sm:w-12 drop-shadow-xl"
                initial={{ rotate: -10, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
              />
              <div>
                <motion.h1
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="text-xl font-semibold text-white sm:text-2xl"
                >
                  {t('common.appName')}
                </motion.h1>
                <p className="text-xs text-slate-300 sm:text-sm">
                  {t('dashboard.greeting', { name: profile?.name || user?.name || 'Traveller' })}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {isOffline && (
                <span className="flex items-center gap-1 rounded-full border border-orange-400/40 bg-orange-500/20 px-2 py-1 text-xs font-medium text-orange-100">
                  <span className="block h-1.5 w-1.5 rounded-full bg-orange-200 animate-pulse" />
                  Offline
                </span>
              )}
              <LanguageSwitcher compact />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleStartTour}
                className="rounded-full border border-teal-400/60 px-3 py-1.5 text-sm font-medium text-teal-100 transition-colors bg-teal-500/20 hover:bg-teal-500/30"
              >
                {hasSeenTour ? 'Help' : 'Tour'}
              </motion.button>
              <span className="flex items-center gap-1 rounded-full border border-white/20 bg-slate-900/70 px-2 py-1 text-xs font-medium text-slate-100">
                <img src={ICONS.blockchain} alt="ID" loading="lazy" className="h-3 w-3 opacity-90" />
                {profile?.blockchainID ? `${profile.blockchainID.slice(0, 6)}…` : 'ID Pending'}
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                className="rounded-full bg-red-500/90 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-500"
              >
                {t('common.logout')}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* WELCOME TOUR */}
      <AnimatePresence>
        {!hasSeenTour && !isTourOpen && (
          <motion.section
            key="tour-intro"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="mb-6 mx-auto max-w-7xl"
            aria-live="polite"
          >
            <div className="rounded-2xl border border-teal-500/30 bg-teal-500/10 p-4 shadow-lg backdrop-blur">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-teal-100">Welcome to your safety dashboard</h2>
                  <p className="mt-1 text-sm text-teal-50/80 max-w-2xl">
                    Take a 60-second tour to understand SOS, maps, and emergency features.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleStartTour}
                    className="inline-flex items-center gap-1 rounded-full bg-teal-400/80 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-teal-300"
                  >
                    🚀 Start tour
                  </button>
                  <button
                    type="button"
                    onClick={handleSkipTour}
                    className="inline-flex items-center gap-1 rounded-full border border-teal-200/40 bg-slate-900/70 px-4 py-2 text-sm font-semibold text-teal-100 transition hover:bg-slate-900/60"
                  >
                    Skip
                  </button>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT - Better layout with proper constraints */}
      <div className="mx-auto max-w-7xl">
        
        {/* TOP SECTION: Status Cards */}
        <motion.div variants={itemVariants} className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
          
          {/* MAIN STATUS - Takes 2 columns on large screens */}
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            ref={statusRef}
            className={`lg:col-span-2 ${statusColor} rounded-2xl border border-white/10 p-5 text-white shadow-xl transition-colors duration-500 ${
              activeTourId === 'status' ? highlightClass : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-white/80">Live Status</p>
                <h2 className="mt-1 text-2xl font-bold sm:text-3xl">{statusText}</h2>
                <div className="mt-3 space-y-1">
                  <p className="text-sm text-white/90">📍 {locationLabel}</p>
                  <p className="text-xs text-white/80">Last activity {lastActivityLabel}</p>
                </div>
              </div>
              <div className="text-right">
                <img
                  src={statusIcon}
                  alt="Status icon"
                  className="h-16 w-16 rounded-full bg-white/20 p-3 shadow-lg mb-2"
                />
                <div className="text-sm text-white/80">
                  Score: <span className="font-bold text-white text-lg">{stats.safetyScore}/100</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* QUICK STATS - Compact vertical layout */}
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3"
          >
            {[
              { icon: '🏛️', label: 'Safe places', value: stats.safePlaces, color: 'from-green-500 to-emerald-600' },
              { icon: '⚠️', label: 'Alerts sent', value: stats.alertsSent, color: 'from-amber-500 to-orange-500' },
              { icon: '⏱️', label: 'Active time', value: `${stats.activeTime}m`, color: 'from-purple-500 to-indigo-500' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className={`rounded-xl bg-gradient-to-r p-4 text-white shadow-lg ${stat.color}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl" aria-hidden>{stat.icon}</span>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-white/80">{stat.label}</p>
                      <p className="text-xl font-bold">{stat.value}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* MIDDLE SECTION: Map and SOS */}
        <motion.div variants={itemVariants} className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
          
          {/* MAP PREVIEW - Takes 3 columns */}
          <motion.div
            ref={mapRef}
            className={`lg:col-span-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 shadow-lg backdrop-blur ${
              activeTourId === 'map' ? highlightClass : ''
            }`}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center text-lg font-semibold text-white">
                🗺️ Live Safety Map
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="ml-2 w-3 h-3 bg-green-500 rounded-full"
                />
              </h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/map')}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-teal-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white transition-all"
              >
                <span>🗺️</span> Open Map
              </motion.button>
            </div>
            
            {/* MAP CONTAINER - Better proportioned */}
            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-slate-950/70 aspect-[16/9]">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                {/* Grid pattern */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(226,232,240,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(226,232,240,0.12) 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                  }}
                />
                
                {/* Current Location */}
                <motion.div
                  initial={{ scale: 1, opacity: 0.7 }}
                  animate={{ 
                    scale: 1.2,
                    opacity: 1
                  }}
                  transition={{ repeat: Infinity, repeatType: 'mirror', duration: 1.5 }}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                >
                  <div className="relative">
                    <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 transform rounded bg-blue-500 px-2 py-1 text-xs font-semibold text-white">
                      You
                    </div>
                  </div>
                </motion.div>
                
                {/* Unsafe Zones */}
                <div className="absolute top-1/4 right-1/4 h-16 w-16 rounded-full border-2 border-red-500/60 bg-red-500/20 flex items-center justify-center">
                  <div className="text-2xl text-red-200">⚠️</div>
                </div>
                
                <div className="absolute bottom-1/3 left-1/4 h-20 w-20 rounded-full border-2 border-orange-400/60 bg-orange-400/20 flex items-center justify-center">
                  <div className="text-2xl text-orange-100">🚧</div>
                </div>
                
                {/* Safe Zones */}
                <div className="absolute top-1/6 left-1/6 h-4 w-4 rounded-full border border-white/70 bg-green-500 flex items-center justify-center">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 transform text-sm text-green-200">🏛️</div>
                </div>
                <div className="absolute bottom-1/4 right-1/6 h-4 w-4 rounded-full border border-white/70 bg-green-500 flex items-center justify-center">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 transform text-sm text-green-200">🚔</div>
                </div>
              </div>
              
              {/* Location Info Overlay */}
              <div className="absolute bottom-3 left-3 rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-slate-200">
                {currentLocation
                  ? `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`
                  : 'Getting location…'
                }
              </div>
            </div>
          </motion.div>

          {/* MAIN SOS BUTTON - Takes 1 column, prominent */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            ref={sosRef}
            className={`rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-600/20 to-rose-600/20 p-6 shadow-xl backdrop-blur ${
              activeTourId === 'sos' ? highlightClass : ''
            }`}
            id="main-sos-button"
          >
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-white mb-2">Emergency SOS</h3>
              <p className="text-sm text-slate-300">Hold for 3 seconds</p>
            </div>
            
            <div className="flex justify-center">
              <SOSButton currentLocation={currentLocation} user={profile} />
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-xs text-slate-400">
                Alerts control room & emergency contacts
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* QUICK ACTIONS - More compact */}
        <motion.section variants={itemVariants} className="mb-6">
          <div
            ref={quickActionsRef}
            className={`rounded-2xl border border-white/10 bg-slate-900/60 p-5 shadow-lg backdrop-blur ${
              activeTourId === 'actions' ? highlightClass : ''
            }`}
          >
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
                <p className="text-sm text-slate-300/80">Essential tools for tourist safety</p>
              </div>
            </div>
            
            {/* OPTIMIZED ACTION GRID */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {quickActions.map((action, index) => (
                <motion.button
                  key={action.id}
                  type="button"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25 + index * 0.05 }}
                  whileHover={{ scale: 1.03, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={`flex flex-col items-center gap-3 rounded-xl bg-gradient-to-br p-4 text-white shadow-md transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${action.color}`}
                  aria-label={`${action.text} — ${action.description}`}
                >
                  <img src={action.iconSrc} alt={action.iconAlt} loading="lazy" className="h-10 w-10 drop-shadow" />
                  <div className="text-center">
                    <p className="text-sm font-semibold leading-tight">{action.text}</p>
                    <p className="text-xs text-white/80 leading-snug">{action.description}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.section>

        {/* BOTTOM SECTION - Compact layout */}
        <motion.section variants={itemVariants} className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
          
          {/* LEFT: Itinerary & Tips - Takes 3 columns */}
          <div className="lg:col-span-3 space-y-4">
            <div
              ref={itineraryRef}
              className={`rounded-2xl border border-white/10 bg-slate-900/60 p-5 ${
                activeTourId === 'itinerary' ? highlightClass : ''
              }`}
            >
              <div className="mb-3 flex items-center gap-3">
                <img src={ICONS.itinerary} alt="Itinerary" loading="lazy" className="h-6 w-6" />
                <h2 className="text-lg font-semibold text-white">Upcoming</h2>
              </div>
              <p className="mb-4 text-sm text-slate-300">
                Next: <span className="font-medium">{itinerary?.[1]?.title || 'All clear'}</span> • {itinerary?.[1]?.city || 'TBD'}
              </p>
              <button
                onClick={() => setShowItinerary(true)}
                className="inline-flex items-center gap-2 rounded-full border border-teal-400/40 bg-teal-500/20 px-4 py-2 text-sm font-medium text-teal-200 transition-colors hover:bg-teal-500/30"
              >
                View itinerary ↗
              </button>
            </div>
            
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
              <div className="mb-4 flex items-center gap-3">
                <img src={ICONS.tips} alt="Tips" loading="lazy" className="h-6 w-6" />
                <h2 className="text-lg font-semibold text-white">Safety Tips</h2>
              </div>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="text-slate-500 mt-1">•</span>
                  <span>Enable IoT tracking in red zones</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-slate-500 mt-1">•</span>
                  <span>Check Safety Center for AI alerts</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-slate-500 mt-1">•</span>
                  <span>Keep emergency contacts accessible</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* RIGHT: IoT Devices - Takes 2 columns */}
          <div
            ref={devicesRef}
            className={`lg:col-span-2 ${activeTourId === 'devices' ? highlightClass : ''}`}
          >
            <IoTDevicesPanel devices={iotDevices} />
          </div>
        </motion.section>
      </div>

      {/* MODALS */}
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
                className="mt-4 w-full bg-slate-900 text-white py-3 rounded-lg text-sm font-medium hover:bg-slate-800 transition"
              >
                Close
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
                className="mt-4 w-full bg-slate-900 text-white py-3 rounded-lg text-sm font-medium hover:bg-slate-800 transition"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOUR MODAL */}
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
              className="w-full max-w-lg rounded-2xl border border-white/15 bg-slate-900/95 p-6 text-white shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-teal-300">
                    Step {tourStepIndex + 1} of {totalTourSteps}
                  </p>
                  <h3 className="mt-1 text-xl font-semibold">
                    {tourSteps[tourStepIndex]?.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleFinishTour}
                  className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-white/20"
                >
                  Finish
                </button>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-200">
                {tourSteps[tourStepIndex]?.description}
              </p>
              {tourSteps[tourStepIndex]?.ctaLabel && tourSteps[tourStepIndex]?.ctaAction && (
                <button
                  type="button"
                  onClick={() => {
                    tourSteps[tourStepIndex]?.ctaAction();
                  }}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-teal-400/90 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-teal-300"
                >
                  {tourSteps[tourStepIndex]?.ctaLabel}
                  <span aria-hidden>↗</span>
                </button>
              )}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleSkipTour}
                  className="text-sm font-medium text-slate-200 underline-offset-4 transition hover:underline"
                >
                  Skip tour
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrevTourStep}
                    disabled={tourStepIndex === 0}
                    className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={tourStepIndex + 1 >= totalTourSteps ? handleFinishTour : handleNextTourStep}
                    className="rounded-full bg-teal-400/80 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-teal-300"
                  >
                    {tourStepIndex + 1 >= totalTourSteps ? 'Done' : 'Next'}
                  </button>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-1">
                {tourSteps.map((step, index) => (
                  <button
                    type="button"
                    key={step.id}
                    onClick={() => setTourStepIndex(index)}
                    className={`h-2 w-8 rounded-full transition-all duration-200 ${
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
