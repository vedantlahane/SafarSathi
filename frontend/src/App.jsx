/**
 * @file App.jsx
 * @description Configures the top-level routing, global providers, and toast notifications
 * for the SafarSathi frontend experience.
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'leaflet/dist/leaflet.css';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MapView from './pages/MapView';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMapView from './pages/admin/AdminMapView';
import AdminAlerts from './pages/admin/AdminAlerts';

// Services
import { AuthProvider, useAuth } from './services/AuthContext';
import { AdminAuthProvider, useAdminAuth } from './services/AdminAuthContext';
import { TouristDataProvider } from './services/TouristDataContext';

import DigitalID from './pages/DigitalID';
import SafetyCenter from './pages/SafetyCenter';

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
 * Root application component wiring together the authentication provider,
 * router configuration, and global toast container.
 *
 * @returns {JSX.Element}
 */
function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <TouristDataProvider>
          <Router>
            <div className="App">
              <Routes>
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
              <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
            </div>
          </Router>
        </TouristDataProvider>
      </AdminAuthProvider>
    </AuthProvider>
  );
}

export default App;
