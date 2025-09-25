//services/AuthContext.jsx - Enhanced with better error handling and persistence
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const savedUser = localStorage.getItem('safarsathi_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('safarsathi_user');
      }
    }
    setLoading(false);
  }, []);
  
  const login = useCallback((userData) => {
    const enhancedUser = {
      ...userData,
      loginTime: new Date().toISOString(),
      sessionId: crypto.randomUUID?.() || Math.random().toString(36)
    };
    setUser(enhancedUser);
    localStorage.setItem('safarsathi_user', JSON.stringify(enhancedUser));
  }, []);

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