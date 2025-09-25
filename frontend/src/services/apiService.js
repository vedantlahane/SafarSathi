import axios from 'axios';

// Set the base URL for your Spring Boot backend
// IMPORTANT: Update this URL to match your backend's running port/address
const viteEnv = typeof import.meta !== 'undefined' ? import.meta.env : undefined;
const legacyEnv = typeof process !== 'undefined' ? process.env : undefined;
const backendTarget =
  viteEnv?.VITE_BACKEND_TARGET ??
  legacyEnv?.REACT_APP_BACKEND_TARGET ??
  '';

const API_BASE_URL =
  backendTarget === 'friend'
    ? 'http://localhost:8080/api'
    : 'http://localhost:8081/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const apiService = {
  /**
    * Registers a new tourist via the Spring Boot backend.
    * @param {object} registrationData - The tourist data from the form.
    * @returns {Promise<object>} The response data, including touristId, qr_content, and token.
    */
  registerTourist: async (registrationData) => {
    try {
      // The endpoint is /api/auth/register
      const response = await api.post('/auth/register', registrationData);
      return response.data; 
    } catch (error) {
      console.error("API Registration Error:", error.response || error);
      throw new Error(error.response?.data?.message || 'Registration failed due to a network or server error.');
    }
  },

  // 🔑 FIX: ADD THE MISSING loginTourist FUNCTION HERE
  /**
    * Authenticates a tourist via the Spring Boot backend using email/password.
    * @param {string} email - The tourist's email.
    * @param {string} password - The tourist's password.
    * @returns {Promise<object>} The response data (token, ID, QR content).
    */
  loginTourist: async (email, password) => {
    try {
      // Calls POST http://localhost:8080/api/auth/login
      const response = await api.post('/auth/login', { email, password });
      return response.data; 
    } catch (error) {
      console.error("API Login Error:", error.response || error);
      // Ensure the error message here is useful
      throw new Error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  },

    /**
   * Pings the user's current location to the backend.
   * @param {string} token - JWT token from the user session.
   * @param {string} touristId - The ID of the currently logged-in user.
   * @param {object} locationData - { lat, lng, accuracy }
   */
  locationPing: async (token, touristId, locationData) => {
    // Note: If using JWT, token should be used in the Authorization header.
    // For MVP, we'll just send the required data.
    try {
      const response = await api.post(`/action/location/${touristId}`, locationData, {
          headers: {
              'Authorization': `Bearer ${token}`
          }
      });
      return response.data;
    } catch (error) {
      console.error("Location Ping Error:", error.response || error);
      // Fail silently for location pings, but log the error
    }
  },

  /**
   * Triggers the high-priority Panic (SOS) alert.
   * @param {string} token - JWT token from the user session.
   * @param {string} touristId - The ID of the currently logged-in user.
   * @param {object} locationData - { lat, lng, accuracy }
   * @returns {Promise<object>} Status response from the backend.
   */
  panicSOS: async (token, touristId, locationData) => {
    try {
      const response = await api.post(`/action/sos/${touristId}`, locationData, {
          headers: {
              'Authorization': `Bearer ${token}`
          }
      });
      return response.data;
    } catch (error) {
      console.error("SOS Error:", error.response || error);
      throw new Error(error.response?.data?.message || 'Failed to send SOS alert.');
    }
  },

  /**
   * Fetches the tourist's profile data from the backend.
   * @param {string} touristId - The ID of the tourist.
   * @param {string} token - JWT token from the user session.
   * @returns {Promise<object>} The tourist's profile data.
   */
  getTouristProfile: async (touristId, token) => {
    try {
      const response = await api.get(`/auth/profile/${touristId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Profile Fetch Error:", error.response || error);
      throw new Error(error.response?.data?.message || 'Failed to fetch profile data.');
    }
  },

  /**
   * Authenticates an admin/police department via the Spring Boot backend.
   * @param {string} email - The admin's email.
   * @param {string} password - The admin's password.
   * @returns {Promise<object>} The response data (token, admin details).
   */
  adminLogin: async (email, password) => {
    try {
      const response = await api.post('/admin/login', { email, password });
      return response.data;
    } catch (error) {
      console.error("Admin Login Error:", error.response || error);
      throw new Error(error.response?.data?.message || 'Admin login failed. Please check your credentials.');
    }
  },

};

export default apiService;