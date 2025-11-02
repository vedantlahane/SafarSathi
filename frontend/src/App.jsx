/**
 * @file App.jsx
 * @description Configures the top-level routing, global providers, and toast notifications
 * for the SafarSathi frontend experience.
 */

import { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'leaflet/dist/leaflet.css';

// Services
import { AuthProvider, useAuth } from './services/AuthContext';
import { AdminAuthProvider, useAdminAuth } from './services/AdminAuthContext';
import { TouristDataProvider } from './services/TouristDataContext';
import MobileShell from './components/layout/MobileShell';
import LanguageSwitcher from './components/LanguageSwitcher';
import FeatureIcon from './components/icons/FeatureIcon';

// Pages (lazy loaded to optimise mobile bundle size)
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MapView = lazy(() => import('./pages/MapView'));
const DigitalID = lazy(() => import('./pages/DigitalID'));
const SafetyCenter = lazy(() => import('./pages/SafetyCenter'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminMapView = lazy(() => import('./pages/admin/AdminMapView'));
const AdminAlerts = lazy(() => import('./pages/admin/AdminAlerts'));
const AdminRiskZones = lazy(() => import('./pages/admin/AdminRiskZones'));

// Protected Route Component
/**
 * Guards private routes by checking the authentication state.
 * Redirects guests to the login page when no user is present.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Component tree to render when authenticated.
 */
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

/**
 * Guards admin routes by ensuring an authority session is active.
 * Redirects to the command login when not authenticated.
 */
const AdminProtectedRoute = ({ children }) => {
  const { admin } = useAdminAuth();
  return admin ? children : <Navigate to="/admin/login" />;
};

/**
 * Redirects the root route to the appropriate dashboard/login depending on session state.
 */
const LandingRoute = () => {
  const { user } = useAuth();
  const { admin } = useAdminAuth();

  if (admin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
};

/**
 * Handles /admin base route by checking whether an admin session exists.
 */
const AdminLandingRoute = () => {
  const { admin } = useAdminAuth();
  return admin ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/admin/login" replace />;
};

const DashboardScreen = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const actions = [
    {
      key: 'safety-center',
      label: 'Open Safety Center',
      description: 'Review alerts and update SOS settings',
      icon: <FeatureIcon name="safety" bare className="h-5 w-5 text-cyan-100" />,
      onSelect: () => navigate('/safety'),
    },
    {
      key: 'view-id',
      label: 'Show Digital ID',
      description: 'Access your travel identity card',
      icon: <FeatureIcon name="id" bare className="h-5 w-5 text-cyan-100" />,
      onSelect: () => navigate('/id'),
    },
    {
      key: 'logout',
      label: 'Sign out',
      description: 'Log out from SafarSathi',
      icon: <FeatureIcon name="alert" bare className="h-5 w-5 text-rose-200" />,
      onSelect: logout,
    },
  ];

  const inlineActions = [
    {
      key: 'language-toggle',
      node: <LanguageSwitcher compact />,
    },
  ];

  return (
    <MobileShell
      title="Dashboard"
      subtitle="Live safety snapshot"
      actions={actions}
      inlineActions={inlineActions}
      tone="ocean"
    >
      <Dashboard />
    </MobileShell>
  );
};

const MapScreen = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const actions = [
    {
      key: 'view-dashboard',
      label: 'View Dashboard',
      description: 'Return to your safety overview',
      icon: <FeatureIcon name="dashboard" bare className="h-5 w-5 text-emerald-100" />,
      onSelect: () => navigate('/dashboard'),
    },
    {
      key: 'open-safety',
      label: 'Safety Center',
      description: 'Configure alerts and SOS preferences',
      icon: <FeatureIcon name="safety" bare className="h-5 w-5 text-emerald-100" />,
      onSelect: () => navigate('/safety'),
    },
    {
      key: 'logout',
      label: 'Sign out',
      description: 'Log out from SafarSathi',
      icon: <FeatureIcon name="alert" bare className="h-5 w-5 text-rose-200" />,
      onSelect: logout,
    },
  ];

  return (
    <MobileShell title="Map" subtitle="Safe zones near you" actions={actions} tone="forest">
      <MapView />
    </MobileShell>
  );
};

const DigitalIDScreen = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const actions = [
    {
      key: 'view-dashboard',
      label: 'View Dashboard',
      description: 'Back to safety insights',
      icon: <FeatureIcon name="dashboard" bare className="h-5 w-5 text-violet-100" />,
      onSelect: () => navigate('/dashboard'),
    },
    {
      key: 'open-map',
      label: 'Open Map',
      description: 'Inspect nearby safe zones',
      icon: <FeatureIcon name="map" bare className="h-5 w-5 text-violet-100" />,
      onSelect: () => navigate('/map'),
    },
    {
      key: 'logout',
      label: 'Sign out',
      description: 'Log out from SafarSathi',
      icon: <FeatureIcon name="alert" bare className="h-5 w-5 text-rose-200" />,
      onSelect: logout,
    },
  ];

  return (
    <MobileShell title="Digital ID" subtitle="Verified travel identity" actions={actions} tone="violet">
      <DigitalID />
    </MobileShell>
  );
};

const SafetyCenterScreen = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const actions = [
    {
      key: 'view-dashboard',
      label: 'View Dashboard',
      description: 'Return to safety overview',
      icon: <FeatureIcon name="dashboard" bare className="h-5 w-5 text-amber-100" />,
      onSelect: () => navigate('/dashboard'),
    },
    {
      key: 'open-map',
      label: 'Open Map',
      description: 'Check geo-fence regions',
      icon: <FeatureIcon name="map" bare className="h-5 w-5 text-amber-100" />,
      onSelect: () => navigate('/map'),
    },
    {
      key: 'logout',
      label: 'Sign out',
      description: 'Log out from SafarSathi',
      icon: <FeatureIcon name="alert" bare className="h-5 w-5 text-rose-200" />,
      onSelect: logout,
    },
  ];

  return (
    <MobileShell title="Safety Center" subtitle="Emergency and preferences" actions={actions} tone="amber">
      <SafetyCenter />
    </MobileShell>
  );
};

/**
 * Root application component wiring together the authentication provider,
 * router configuration, and global toast container.
 *
 * @returns {JSX.Element}
 */
function App() {
  const [toastOffset, setToastOffset] = useState(24);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    let resizeObserver;
    let resizeObserverTarget = null;
    let mutationObserver;

    const detachResizeObserver = () => {
      if (resizeObserverTarget) {
        resizeObserver?.disconnect();
        resizeObserver = undefined;
        resizeObserverTarget = null;
      }
    };

    const attachResizeObserver = (target) => {
      if (!('ResizeObserver' in window) || !target || target === resizeObserverTarget) return;
      detachResizeObserver();
      resizeObserver = new ResizeObserver(() => computeOffset());
      resizeObserver.observe(target);
      resizeObserverTarget = target;
    };

    const computeOffset = () => {
      const topBar = document.querySelector('[data-shell-topbar]');
      const viewportOffset = window.visualViewport?.offsetTop ?? 0;
      const baseOffset = topBar ? topBar.getBoundingClientRect().bottom + 12 : 24 + viewportOffset;

      if (topBar) {
        attachResizeObserver(topBar);
      } else {
        detachResizeObserver();
      }

      setToastOffset((prev) => {
        const next = Math.round(baseOffset);
        return prev === next ? prev : next;
      });
    };

    const handleResize = () => {
      window.requestAnimationFrame(computeOffset);
    };

    computeOffset();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    if ('MutationObserver' in window) {
      mutationObserver = new MutationObserver(() => computeOffset());
      mutationObserver.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      detachResizeObserver();
      mutationObserver?.disconnect();
    };
  }, []);

  const LoadingScreen = (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200" aria-live="polite">
      <p className="text-base font-semibold tracking-wide">Loading SafarSathi…</p>
    </div>
  );

  return (
    <AuthProvider>
      <AdminAuthProvider>
        <TouristDataProvider>
          <Router>
            <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-slate-900 focus:px-4 focus:py-2 focus:text-white">
              Skip to main content
            </a>
            <Suspense fallback={LoadingScreen}>
              <Routes>
                <Route path="/" element={<LandingRoute />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardScreen />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/map"
                  element={
                    <ProtectedRoute>
                      <MapScreen />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/id"
                  element={
                    <ProtectedRoute>
                      <DigitalIDScreen />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/safety"
                  element={
                    <ProtectedRoute>
                      <SafetyCenterScreen />
                    </ProtectedRoute>
                  }
                />

                <Route path="/admin/login" element={<AdminLogin />} />
                <Route
                  path="/admin/dashboard"
                  element={
                    <AdminProtectedRoute>
                      <AdminDashboard />
                    </AdminProtectedRoute>
                  }
                />
                <Route
                  path="/admin/map"
                  element={
                    <AdminProtectedRoute>
                      <AdminMapView />
                    </AdminProtectedRoute>
                  }
                />
                <Route
                  path="/admin/alerts"
                  element={
                    <AdminProtectedRoute>
                      <AdminAlerts />
                    </AdminProtectedRoute>
                  }
                />
                <Route
                  path="/admin/risk-zones"
                  element={
                    <AdminProtectedRoute>
                      <AdminRiskZones />
                    </AdminProtectedRoute>
                  }
                />
                <Route path="/admin" element={<AdminLandingRoute />} />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
            <ToastContainer
              position="top-center"
              autoClose={2800}
              hideProgressBar
              newestOnTop
              closeOnClick
              draggable
              pauseOnHover
              limit={3}
              theme="dark"
              style={{ top: `${toastOffset}px` }}
              toastStyle={{ width: 'min(92vw, 360px)', margin: '0 auto' }}
              toastClassName={() =>
                'rounded-xl border border-white/10 bg-slate-900/90 text-slate-100 shadow-lg shadow-slate-900/40 backdrop-blur supports-[backdrop-filter]:bg-slate-900/75'
              }
              bodyClassName={() => 'text-sm font-medium leading-snug'}
            />
          </Router>
        </TouristDataProvider>
      </AdminAuthProvider>
    </AuthProvider>
  );
}

export default App;
