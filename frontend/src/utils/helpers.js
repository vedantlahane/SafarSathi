// utils/helpers.js - Utility functions for SafarSathi
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export const generateSecureId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const hash = btoa(`${timestamp}-${random}`);
  return `BC${random}${hash.substring(0, 8)}`.toUpperCase();
};

export const getBatteryLevel = async () => {
  if ('getBattery' in navigator) {
    try {
      const battery = await navigator.getBattery();
      return Math.round(battery.level * 100);
    } catch (error) {
      return null;
    }
  }
  return null;
};

export const getNetworkInfo = () => {
  if ('connection' in navigator) {
    return {
      effectiveType: navigator.connection.effectiveType,
      downlink: navigator.connection.downlink,
      rtt: navigator.connection.rtt
    };
  }
  return { effectiveType: 'unknown' };
};