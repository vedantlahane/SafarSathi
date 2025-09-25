//services/AuthContext.jsx - Enhanced with better error handling and persistence
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const AuthContext = createContext();

/**
 * Convenience hook for consuming the authentication context with guard rails.
 * @returns {{ user: object|null, login: Function, logout: Function, updateUser: Function, loading: boolean }}
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

/**
 * Provides user session state and persistence helpers to the React tree.
 * @param {{ children: React.ReactNode }} props
 * @returns {JSX.Element}
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const savedUser = localStorage.getItem('safarsathi_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse stored user session', e);
        localStorage.removeItem('safarsathi_user');
      }
    }
    setLoading(false);
  }, []);
  
  /**
   * Persists the authenticated user locally and annotates the session with metadata.
   * @param {object} userData - Raw user payload from the caller.
   */
  const login = useCallback((userData) => {
    const enhancedUser = {
      ...userData,
      loginTime: new Date().toISOString(),
      sessionId: crypto.randomUUID?.() || Math.random().toString(36)
    };
    setUser(enhancedUser);
    localStorage.setItem('safarsathi_user', JSON.stringify(enhancedUser));
  }, []);

  /**
   * Clears the current session and removes associated caches.
   */
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('safarsathi_user');
    // Clear any cached data
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
  }, []);

  /**
   * Merges partial user updates into the stored session.
   * @param {object} userData - Fields to merge with the existing user record.
   */
  const updateUser = useCallback((userData) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem('safarsathi_user', JSON.stringify(updatedUser));
  }, [user]);
  
  const value = useMemo(() => ({
    user, login, logout, updateUser, loading
  }), [user, login, logout, updateUser, loading]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};