//pages/Dashboard.jsx - Enhanced typography, spacing, and readability for tourists
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../services/AuthContext';
import { useTouristData } from '../../services/TouristDataContext';
import SOSButton from '../../components/SOSButton';
import EmergencyContactsList from './components/EmergencyContactsList.jsx';
import TripTimeline from './components/TripTimeline.jsx';
import ConnectedDevices from './components/ConnectedDevices.jsx';
import FeatureIcon from '../../components/icons/FeatureIcon.jsx';

const STATUS_THEMES = {
  safe: {
    label: 'All Clear',
    indicator: 'from-emerald-400/95 to-teal-400/70',
    border: 'border-emerald-400/70',
    chip: 'bg-emerald-400/15 text-emerald-100',
    icon: 'dashboard',
  },
  warning: {
    label: 'Caution',
    indicator: 'from-amber-400/95 to-orange-400/70',
    border: 'border-amber-400/70',
    chip: 'bg-amber-400/15 text-amber-100',
    icon: 'alert',
  },
  danger: {
    label: 'SOS Active',
    indicator: 'from-rose-500/90 to-red-500/70',
    border: 'border-rose-500/70',
    chip: 'bg-rose-500/15 text-rose-100',
    icon: 'sos',
  },
};

const TIP_LIST = [
  'Keep Bluetooth on to let paired wearables sync automatically.',
  'Open the map before entering an unfamiliar area to cache guidance.',
  'Trigger a soft SOS test weekly so your contacts stay prepared.',
];

const QUICK_ACTIONS = (
  setShowContacts,
  setShowItinerary,
  handleShare,
  navigateToSafety,
) => [
  {
    id: 'share-status',
    label: 'Share',
    description: 'Send live update',
    onPress: handleShare,
    icon: 'share',
    accent: 'text-cyan-200',
  },
  {
    id: 'open-contacts',
    label: 'Contacts',
    description: 'Emergency list',
    onPress: () => setShowContacts(true),
    icon: 'contacts',
    accent: 'text-amber-200',
  },
  {
    id: 'view-itinerary',
    label: 'Itinerary',
    description: 'Next checkpoints',
    onPress: () => setShowItinerary(true),
    icon: 'timeline',
    accent: 'text-emerald-200',
  },
  {
    id: 'safety-center',
    label: 'Safety',
    description: 'AI advisories',
    onPress: navigateToSafety,
    icon: 'safety',
    accent: 'text-slate-200',
  },
];

const mapPreviewAnimation = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.35 },
};

const modalVariants = {
  backdrop: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
  sheet: {
    initial: { y: '100%' },
    animate: { y: 0 },
    exit: { y: '100%' },
    transition: { type: 'spring', stiffness: 300, damping: 32 },
  },
};

const useNetworkStatus = () => {
  const [offline, setOffline] = useState(() => (typeof navigator !== 'undefined' ? !navigator.onLine : false));

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handleOffline = () => setOffline(true);
    const handleOnline = () => setOffline(false);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return offline;
};

const StatusCard = ({ themeKey, locationLabel, lastActivityLabel, score, offline }) => {
  const theme = STATUS_THEMES[themeKey] ?? STATUS_THEMES.safe;
  return (
    <motion.article
      layout
      className={`relative flex flex-col gap-4 rounded-2xl border-l-4 bg-transparent px-4 py-3 text-white ${theme.border}`}
    >
      <span
        className={`pointer-events-none absolute inset-y-2 left-0 w-1 rounded-full bg-gradient-to-b ${theme.indicator}`}
        aria-hidden
      />
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <FeatureIcon name={theme.icon} size="sm" className="border-white/15 text-white/90" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/60">Status</p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              {theme.label}
              {offline ? ' · Offline' : ''}
            </h2>
          </div>
        </div>
        <div className={`rounded-xl px-3 py-2 text-right text-xs font-semibold ${theme.chip}`}>
          <span className="block text-[11px] tracking-[0.18em] text-white/70">Safety</span>
          <span className="text-lg font-bold text-white">{score}/100</span>
        </div>
      </div>
      <div className="flex flex-col gap-3 text-sm text-white/80 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-[0.18em] text-white/60">Location</span>
          <span className="font-semibold text-white">{locationLabel}</span>
        </div>
        <div className="flex items-center gap-2 sm:justify-end">
          <span className="text-[11px] uppercase tracking-[0.18em] text-white/60">Last update</span>
          <span className="font-semibold text-white">{lastActivityLabel}</span>
        </div>
      </div>
    </motion.article>
  );
};

const StatsRail = ({ stats }) => {
  const scrollRef = useRef(null);

  const scrollBy = (direction) => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.85;
    scrollRef.current.scrollBy({ left: direction === 'next' ? amount : -amount, behavior: 'smooth' });
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => scrollBy('prev')}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-slate-200 transition hover:border-white/30 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        aria-label="Scroll stats backward"
      >
        <span aria-hidden>{'<'}</span>
      </button>
      <div
        ref={scrollRef}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 pl-1"
        role="list"
      >
        {stats.map((item, index) => (
          <motion.div key={item.id} layout className="min-w-[142px] flex-shrink-0 snap-start" role="listitem" tabIndex={0}>
            <div className="flex flex-col gap-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
              <p className="text-lg font-semibold text-slate-50">{item.value}</p>
              <p className="text-[11px] text-slate-400/80">{item.caption}</p>
            </div>
            {index < stats.length - 1 && (
              <span className="mt-3 block h-px w-16 bg-slate-600/40 md:hidden" aria-hidden />
            )}
          </motion.div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => scrollBy('next')}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-slate-200 transition hover:border-white/30 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        aria-label="Scroll stats forward"
      >
        <span aria-hidden>{'>'}</span>
      </button>
    </div>
  );
};

const QuickActionGrid = ({ actions }) => (
  <div className="grid grid-cols-2 gap-3 max-[379px]:grid-cols-1">
    {actions.map((action) => (
      <button
        key={action.id}
        type="button"
        onClick={action.onPress}
        className="group flex min-h-[48px] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 text-left text-sm text-slate-100 transition hover:border-white/40 hover:bg-white/[0.08]"
      >
        <FeatureIcon
          name={action.icon}
          size="sm"
          className={`border-white/10 ${action.accent ?? 'text-slate-100'}`}
        />
        <div className="flex-1">
          <p className="text-sm font-semibold leading-tight text-white">{action.label}</p>
          <p className="text-xs text-slate-300">{action.description}</p>
        </div>
      </button>
    ))}
  </div>
);

const EssentialActionRow = ({ actions }) => (
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
    {actions.map((action) => (
      <button
        key={action.id}
        type="button"
        onClick={action.onPress}
        className="flex min-h-[48px] flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] px-3 py-4 text-center text-xs font-semibold text-slate-100 transition hover:border-white/40 hover:bg-white/[0.08]"
      >
        <FeatureIcon
          name={action.icon}
          size="xs"
          className={`border-white/10 ${action.accent ?? 'text-slate-100'}`}
        />
        <span className="leading-tight">{action.label}</span>
      </button>
    ))}
  </div>
);

const MapPreview = ({ locationLabel }) => (
  <motion.article
    {...mapPreviewAnimation}
    className="relative overflow-hidden rounded-2xl border-l-4 border-cyan-400/60 px-4 py-3 text-white"
  >
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <FeatureIcon name="map" size="sm" className="border-white/10 text-cyan-200" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">Live map</p>
          <h3 className="text-lg font-semibold text-white">Nearby geo-fence zones</h3>
        </div>
      </div>
      <span className="inline-flex items-center rounded-full border border-cyan-300/60 px-3 py-0.5 text-[11px] font-semibold text-cyan-100">
        {locationLabel === 'Locating…' ? 'Syncing' : 'Live'}
      </span>
    </div>
    <div className="relative mt-3 aspect-[4/3] overflow-hidden rounded-2xl bg-slate-950/40">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(rgba(148,163,184,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.22) 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        animate={{ scale: [1, 1.1, 1], opacity: [0.85, 1, 0.85] }}
        transition={{ repeat: Infinity, duration: 2.4 }}
      >
        <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/80">
          <div className="h-2 w-2 rounded-full bg-white" />
        </div>
      </motion.div>
      <div className="absolute bottom-3 left-3 rounded-full bg-slate-950/70 px-3 py-0.5 text-[11px] font-semibold text-slate-100">
        {locationLabel}
      </div>
    </div>
  </motion.article>
);

const SafetyTips = () => (
  <section className="space-y-3">
    <div className="flex items-center gap-3">
      <FeatureIcon name="safety" size="xs" className="border-white/10 text-emerald-200" />
      <h3 className="text-base font-semibold text-white">Safety reminders</h3>
    </div>
    <ul className="space-y-2 text-sm text-slate-300">
      {TIP_LIST.map((tip) => (
        <li key={tip} className="flex gap-2">
          <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-cyan-300" aria-hidden />
          <span className="leading-relaxed">{tip}</span>
        </li>
      ))}
    </ul>
  </section>
);

const useTimeLabel = (lastActivity) =>
  useMemo(() => {
    if (!lastActivity) return 'Syncing…';
    const diffMinutes = Math.max(0, Math.round((Date.now() - lastActivity.getTime()) / 60000));
    if (diffMinutes < 1) return 'moments ago';
    if (diffMinutes === 1) return '1 minute ago';
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    const hours = Math.floor(diffMinutes / 60);
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  }, [lastActivity]);

const Dashboard = () => {
  const { user } = useAuth();
  const {
    profile,
    itinerary,
    contacts,
    anomalies,
    zones,
    iotDevices,
    loading,
  } = useTouristData();

  const offline = useNetworkStatus();
  const navigate = useNavigate();
  const [currentLocation, setCurrentLocation] = useState(null);
  const [status, setStatus] = useState('safe');
  const [lastActivity, setLastActivity] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [showItinerary, setShowItinerary] = useState(false);
  const locationWatchIdRef = useRef(null);

  const allContacts = useMemo(() => {
    if (!user?.emergencyContact || !user.emergencyContact.trim()) return contacts || [];
    const formatted = {
      id: 'user-emergency-contact',
      name: 'Primary emergency contact',
      description: 'Added during onboarding',
      phone: user.emergencyContact,
      type: 'family',
      priority: 'critical',
    };
    return [formatted, ...(contacts || [])];
  }, [user?.emergencyContact, contacts]);

  const stats = useMemo(() => {
    const completedStops = itinerary?.filter((leg) => leg.status === 'completed').length ?? 0;
    const activeAlerts = anomalies?.filter((record) => !record.resolved).length ?? 0;
    const activeMinutes = profile?.tripStart
      ? Math.max(1, Math.round((Date.now() - new Date(profile.tripStart).getTime()) / 60000))
      : 0;
    const score = Math.max(25, Math.min(100, 92 - activeAlerts * 8 - (zones?.length ?? 0) * 2));

    return {
      safePlaces: completedStops,
      alerts: activeAlerts,
      activeMinutes,
      score,
    };
  }, [itinerary, anomalies, zones, profile?.tripStart]);

  const statsRailData = useMemo(
    () => [
      { id: 'safe-places', label: 'Safe stops', value: stats.safePlaces, caption: 'Visited & cleared' },
      { id: 'alerts', label: 'Active alerts', value: stats.alerts, caption: 'Awaiting review' },
      { id: 'active-minutes', label: 'Active minutes', value: `${stats.activeMinutes} m`, caption: 'Since trip start' },
    ],
    [stats],
  );

  const locationLabel = useMemo(() => {
    if (!currentLocation) return 'Locating…';
    return `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`;
  }, [currentLocation]);

  const lastActivityLabel = useTimeLabel(lastActivity);

  const checkZones = useCallback(
    (lat, lng) => {
      if (!Array.isArray(zones) || zones.length === 0) return;
      const withinZone = zones.some((zone) => {
        const R = 6371e3;
        const toRad = (deg) => (deg * Math.PI) / 180;
        const dLat = toRad(zone.center.lat - lat);
        const dLng = toRad(zone.center.lng - lng);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(toRad(lat)) * Math.cos(toRad(zone.center.lat)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance <= zone.radius;
      });

      if (withinZone && status !== 'warning') {
        setStatus('warning');
        toast.warning('Heads-up: approaching a caution zone. Stay alert.');
      } else if (!withinZone && status !== 'safe') {
        setStatus('safe');
        toast.success('You are back in a safe corridor.');
      }
    },
    [zones, status],
  );

  const handleLocationError = useCallback((error) => {
    if (!error) return;
    if (error.code === error.PERMISSION_DENIED) {
      toast.error('Location access denied. Re-enable permissions for geo-fence alerts.');
      setStatus('warning');
    } else if (error.code === error.POSITION_UNAVAILABLE) {
      toast.error('Location unavailable. Check GPS or network signal.');
    } else if (error.code === error.TIMEOUT) {
      toast.error('Location request timed out. We will retry soon.');
    } else {
      toast.error('Unable to determine your location.');
    }
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator?.geolocation) {
      toast.error('Geolocation is not supported on this device.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
        setCurrentLocation(coords);
        setLastActivity(new Date());
        checkZones(coords.lat, coords.lng);
      },
      handleLocationError,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    );
  }, [checkZones, handleLocationError]);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  useEffect(() => {
    if (!navigator?.geolocation) return undefined;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
        setCurrentLocation(coords);
        setLastActivity(new Date());
        checkZones(coords.lat, coords.lng);
      },
      (error) => {
        handleLocationError(error);
        if (locationWatchIdRef.current !== null) {
          navigator.geolocation.clearWatch(locationWatchIdRef.current);
          locationWatchIdRef.current = null;
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 },
    );

    locationWatchIdRef.current = watchId;

    return () => {
      if (locationWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(locationWatchIdRef.current);
        locationWatchIdRef.current = null;
      }
    };
  }, [checkZones, handleLocationError]);

  useEffect(() => {
    if (offline) {
      toast.info('Offline mode: alerts will sync when you reconnect.');
    }
  }, [offline]);

  const handleShare = useCallback(async () => {
    if (isSharing) {
      toast.info('Share already in progress.');
      return;
    }

    setIsSharing(true);
    try {
      const payload = `Safety score ${stats.score}/100 • Location ${locationLabel}`;
      if (navigator.share) {
        await navigator.share({ title: 'SafarSathi status', text: payload });
        toast.success('Safety status shared successfully.');
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(payload);
        toast.success('Safety status copied to clipboard.');
      } else {
        toast.info(payload);
      }
    } catch (error) {
      if (error?.name !== 'AbortError') {
        toast.error('Unable to share status right now.');
      }
    } finally {
      setIsSharing(false);
    }
  }, [isSharing, stats.score, locationLabel]);

  const quickActions = useMemo(
    () => QUICK_ACTIONS(setShowContacts, setShowItinerary, handleShare, () => navigate('/safety')),
    [handleShare, navigate, setShowContacts, setShowItinerary],
  );

  const handleFocusSOS = useCallback(() => {
    if (typeof document === 'undefined') return;
    const anchor = document.getElementById('sos-anchor');
    anchor?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const essentialActions = useMemo(
    () => [
      {
        id: 'primary-sos',
        label: 'SOS',
        icon: 'sos',
        accent: 'text-rose-200',
        onPress: handleFocusSOS,
      },
      {
        id: 'primary-map',
        label: 'Live map',
        icon: 'map',
        accent: 'text-emerald-200',
        onPress: () => navigate('/map'),
      },
      {
        id: 'primary-share',
        label: 'Share',
        icon: 'share',
        accent: 'text-cyan-200',
        onPress: handleShare,
      },
      {
        id: 'primary-contacts',
        label: 'Contacts',
        icon: 'contacts',
        accent: 'text-amber-200',
        onPress: () => setShowContacts(true),
      },
    ],
    [handleFocusSOS, navigate, handleShare, setShowContacts],
  );

  if (loading || !profile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-200">
        <div className="rounded-xl border border-white/10 bg-slate-900/70 px-5 py-4 backdrop-blur">
          Loading your dashboard…
        </div>
      </div>
    );
  }

  return (
    <motion.div
      layout
      className="flex flex-col gap-4 pb-24 text-slate-100"
      transition={{ staggerChildren: 0.08, duration: 0.25 }}
    >
      <StatusCard
        themeKey={status}
        locationLabel={locationLabel}
        lastActivityLabel={lastActivityLabel}
        score={stats.score}
        offline={offline}
      />

      <EssentialActionRow actions={essentialActions} />

      <StatsRail stats={statsRailData} />

      <motion.section
        id="sos-anchor"
        layout
        className="flex flex-col gap-4 rounded-2xl border-l-4 border-rose-500/60 bg-transparent px-4 py-3"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <FeatureIcon name="sos" size="xs" className="border-white/10 text-rose-200" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">Emergency</p>
              <h3 className="mt-1 text-lg font-semibold text-white">SOS control</h3>
              <p className="mt-1 text-sm text-slate-300/90">Hold for 3 seconds to dispatch an alert.</p>
            </div>
          </div>
          <span className="inline-flex items-center rounded-full border border-rose-300/60 px-3 py-0.5 text-[11px] font-semibold text-rose-100">
            Ready
          </span>
        </div>
        <div className="flex justify-center">
          <SOSButton currentLocation={currentLocation} user={profile} />
        </div>
      </motion.section>

      <QuickActionGrid actions={quickActions} />

      <MapPreview locationLabel={locationLabel} />

      <motion.section layout className="space-y-3">
        <article className="flex flex-col gap-2 rounded-2xl border-l-4 border-cyan-400/60 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <FeatureIcon name="timeline" size="xs" className="border-white/10 text-cyan-200" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">Next stop</p>
                <h3 className="mt-1 text-lg font-semibold text-white">{itinerary?.[1]?.title ?? 'Rest window'}</h3>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowItinerary(true)}
              className="rounded-full border border-cyan-300/60 px-3 py-0.5 text-xs font-semibold text-cyan-100"
            >
              View timeline
            </button>
          </div>
          <p className="text-sm text-slate-300">
            {itinerary?.[1]?.city ?? 'No upcoming checkpoint'} · ETA {itinerary?.[1]?.eta ?? 'TBD'}
          </p>
        </article>
    <ConnectedDevices devices={iotDevices} />
        <SafetyTips />
      </motion.section>

      <AnimatePresence>
        {showContacts && (
          <motion.div
            key="contacts-modal"
            initial={modalVariants.backdrop.initial}
            animate={modalVariants.backdrop.animate}
            exit={modalVariants.backdrop.exit}
            className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 backdrop-blur"
            onClick={() => setShowContacts(false)}
          >
            <motion.div
              {...modalVariants.sheet}
              className="w-full max-w-md rounded-t-3xl border border-white/10 bg-slate-900/95 px-5 pb-[calc(env(safe-area-inset-bottom)_+_20px)] pt-6"
              onClick={(event) => event.stopPropagation()}
            >
              <header className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-white">Emergency contacts</h2>
                <button
                  type="button"
                  onClick={() => setShowContacts(false)}
                  className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-slate-200"
                >
                  Close
                </button>
              </header>
              <EmergencyContactsList contacts={allContacts} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showItinerary && (
          <motion.div
            key="itinerary-modal"
            initial={modalVariants.backdrop.initial}
            animate={modalVariants.backdrop.animate}
            exit={modalVariants.backdrop.exit}
            className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 backdrop-blur"
            onClick={() => setShowItinerary(false)}
          >
            <motion.div
              {...modalVariants.sheet}
              className="w-full max-w-md rounded-t-3xl border border-white/10 bg-slate-900/95 px-5 pb-[calc(env(safe-area-inset-bottom)_+_20px)] pt-6"
              onClick={(event) => event.stopPropagation()}
            >
              <header className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-white">Travel timeline</h2>
                <button
                  type="button"
                  onClick={() => setShowItinerary(false)}
                  className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-slate-200"
                >
                  Close
                </button>
              </header>
              <TripTimeline itinerary={itinerary} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Dashboard;
