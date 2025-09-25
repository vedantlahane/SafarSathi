import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const AdminAuthContext = createContext();

/**
 * Provides mock authentication for authorities dashboard flows.
 * Persists the session locally so refresh keeps the admin logged in.
 */
export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedAdmin = localStorage.getItem('safarsathi_admin');
    if (savedAdmin) {
      try {
        setAdmin(JSON.parse(savedAdmin));
      } catch (e) {
        console.error('Failed to parse stored admin session', e);
        localStorage.removeItem('safarsathi_admin');
      }
    }
    setLoading(false);
  }, []);

  /**
   * Accepts any credentials that match the demo codes and writes the session to storage.
   */
  const login = useCallback(({ email, passcode }) => {
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedPasscode = passcode?.trim();

    if (!normalizedEmail || !normalizedPasscode) {
      throw new Error('Missing credentials');
    }

    const isAllowed = normalizedPasscode === 'SECURE-911' || normalizedPasscode === 'DEMO-ADMIN';
    if (!isAllowed) {
      throw new Error('Invalid passcode');
    }

    const adminProfile = {
      name: 'Control Room Operator',
      email: normalizedEmail,
      role: 'authority',
      lastLogin: new Date().toISOString(),
      clearanceLevel: normalizedPasscode === 'SECURE-911' ? 'critical' : 'demo'
    };

    setAdmin(adminProfile);
    localStorage.setItem('safarsathi_admin', JSON.stringify(adminProfile));
    return adminProfile;
  }, []);

  /**
   * Clears the stored admin session.
   */
  const logout = useCallback(() => {
    setAdmin(null);
    localStorage.removeItem('safarsathi_admin');
  }, []);

  const value = useMemo(() => ({ admin, login, logout, loading }), [admin, login, logout, loading]);

  return (
    <AdminAuthContext.Provider value={value}>
      {!loading && children}
    </AdminAuthContext.Provider>
  );
};

/**
 * Convenience hook for consuming the admin auth context.
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
