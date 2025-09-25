// utils/helpers.js - Utility functions for SafarSathi

/**
 * Returns a debounced function that delays invoking `func` until after `wait` milliseconds
 * have elapsed since the last call.
 *
 * @template {(...args: any[]) => void} T
 * @param {T} func - Function to debounce.
 * @param {number} wait - Delay in milliseconds.
 * @returns {(...args: Parameters<T>) => void}
 */
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

/**
 * Haversine distance between two latitude/longitude pairs in meters.
 *
 * @param {number} lat1
 * @param {number} lng1
 * @param {number} lat2
 * @param {number} lng2
 * @returns {number}
 */
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

/**
 * Generates a pseudo-unique blockchain-style identifier string.
 * @returns {string}
 */
export const generateSecureId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const hash = btoa(`${timestamp}-${random}`);
  return `BC${random}${hash.substring(0, 8)}`.toUpperCase();
};

/**
 * Attempts to read the device battery level using the Battery Status API.
 * @returns {Promise<number|null>} Percentage from 0-100 or null when unavailable.
 */
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

/**
 * Reads the connection information to infer effective network characteristics.
 * @returns {{ effectiveType: string, downlink?: number, rtt?: number }}
 */
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