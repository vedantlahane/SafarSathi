import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import apiService from './apiService';

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
   * Authenticates admin using the backend API and writes the session to storage.
   */
  const login = useCallback(async ({ email, passcode }) => {
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedPassword = passcode?.trim();

    if (!normalizedEmail || !normalizedPassword) {
      throw new Error('Missing credentials');
    }

    try {
      const response = await apiService.adminLogin(normalizedEmail, normalizedPassword);
      
      if (!response.success) {
        throw new Error(response.message || 'Login failed');
      }

      const adminProfile = {
        id: response.admin.id,
        name: response.admin.name,
        email: response.admin.email,
        role: 'authority',
        departmentCode: response.admin.departmentCode,
        city: response.admin.city,
        district: response.admin.district,
        state: response.admin.state,
        token: response.token,
        lastLogin: new Date().toISOString(),
        clearanceLevel: 'authenticated'
      };

      setAdmin(adminProfile);
      localStorage.setItem('safarsathi_admin', JSON.stringify(adminProfile));
      return adminProfile;
    } catch (error) {
      console.error('Admin login error:', error);
      throw new Error(error.message || 'Login failed');
    }
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
