/**
 * @file App.jsx
 * @description Configures the top-level routing, global providers, and toast notifications
 * for the SafarSathi frontend experience.
 */

import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'leaflet/dist/leaflet.css';

// Services
import { AuthProvider, useAuth } from './services/AuthContext';
import { AdminAuthProvider, useAdminAuth } from './services/AdminAuthContext';
import { TouristDataProvider } from './services/TouristDataContext';

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

/**
 * Root application component wiring together the authentication provider,
 * router configuration, and global toast container.
 *
 * @returns {JSX.Element}
 */
function App() {
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
            <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
              <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-slate-900 focus:px-4 focus:py-2 focus:text-white">
                Skip to main content
              </a>
              <Suspense fallback={LoadingScreen}>
                <main id="main-content" className="flex-1">
                  <Routes>
                    <Route path="/" element={<LandingRoute />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/map"
                      element={
                        <ProtectedRoute>
                          <MapView />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/id"
                      element={
                        <ProtectedRoute>
                          <DigitalID />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/safety"
                      element={
                        <ProtectedRoute>
                          <SafetyCenter />
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
                </main>
              </Suspense>
              <footer className="border-t border-white/10 bg-slate-950/80 px-4 py-3 text-center text-xs text-slate-400 backdrop-blur">
                <p>&copy; {new Date().getFullYear()} SafarSathi • Crafted for connected journeys</p>
              </footer>
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
                toastClassName={() => 'rounded-xl bg-slate-900/90 text-slate-100 shadow-lg shadow-slate-900/40'}
                bodyClassName={() => 'text-sm font-medium'}
              />
            </div>
          </Router>
        </TouristDataProvider>
      </AdminAuthProvider>
    </AuthProvider>
  );
}

export default App;
