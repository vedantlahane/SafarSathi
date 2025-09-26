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
   * Authenticates an admin / police department user.
   * @param {string} email - Admin email ID.
   * @param {string} password - Admin password / passcode.
   * @returns {Promise<object>} Login payload with token and admin info.
   */
  adminLogin: async (email, password) => {
    try {
      const response = await api.post('/admin/login', { email, password });
      return response.data;
    } catch (error) {
      console.error('Admin Login Error:', error.response || error);
      throw new Error(error.response?.data?.message || 'Failed to authenticate admin user.');
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
   * Retrieves the full list of tourists for the admin mission map.
   * @returns {Promise<object[]>} Array of tourists with last known coordinates.
   */
  getAdminTourists: async () => {
    try {
      const response = await api.get('/admin/tourists');
      return response.data;
    } catch (error) {
      console.error('Admin Tourist Fetch Error:', error.response || error);
      throw new Error(error.response?.data?.message || 'Failed to load live tourist roster.');
    }
  },

  /**
   * Retrieves the current set of active alerts for the admin dashboard.
   * @returns {Promise<object[]>} Array of alert objects.
   */
  getAdminAlerts: async () => {
    try {
      const response = await api.get('/admin/alerts');
      return response.data;
    } catch (error) {
      console.error('Admin Alerts Fetch Error:', error.response || error);
      throw new Error(error.response?.data?.message || 'Failed to load alerts feed.');
    }
  },

  /**
   * Retrieves active risk zones for tourist clients.
   * @returns {Promise<object[]>}
   */
  getActiveRiskZones: async () => {
    try {
      const response = await api.get('/risk-zones/active');
      return response.data;
    } catch (error) {
      console.error('Active Risk Zone Fetch Error:', error.response || error);
      throw new Error(error.response?.data?.message || 'Failed to load active risk zones.');
    }
  },

  /**
   * Retrieves all configured risk zones for administrative management.
   * @returns {Promise<object[]>}
   */
  getRiskZones: async () => {
    try {
      const response = await api.get('/admin/risk-zones');
      return response.data;
    } catch (error) {
      console.error('Risk Zone Fetch Error:', error.response || error);
      throw new Error(error.response?.data?.message || 'Failed to load risk zones.');
    }
  },

  /**
   * Creates a new risk zone geo-fence.
   * @param {object} payload - Risk zone attributes.
   * @returns {Promise<object>}
   */
  createRiskZone: async (payload) => {
    try {
      const response = await api.post('/admin/risk-zones', payload);
      return response.data;
    } catch (error) {
      console.error('Risk Zone Create Error:', error.response || error);
      throw new Error(error.response?.data?.message || 'Failed to create risk zone.');
    }
  },

  /**
   * Updates an existing risk zone definition.
   * @param {number} zoneId - Identifier of the risk zone.
   * @param {object} payload - Updated risk zone data.
   * @returns {Promise<object>}
   */
  updateRiskZone: async (zoneId, payload) => {
    try {
      const response = await api.put(`/admin/risk-zones/${zoneId}`, payload);
      return response.data;
    } catch (error) {
      console.error('Risk Zone Update Error:', error.response || error);
      throw new Error(error.response?.data?.message || 'Failed to update risk zone.');
    }
  },

  /**
   * Toggles a risk zone active status.
   * @param {number} zoneId - Identifier of the risk zone.
   * @param {boolean} active - Desired active flag.
   * @returns {Promise<object>}
   */
  updateRiskZoneStatus: async (zoneId, active) => {
    try {
      const response = await api.patch(`/admin/risk-zones/${zoneId}/status`, null, {
        params: { active }
      });
      return response.data;
    } catch (error) {
      console.error('Risk Zone Status Error:', error.response || error);
      throw new Error(error.response?.data?.message || 'Failed to update risk zone status.');
    }
  },

  /**
   * Removes a risk zone entry.
   * @param {number} zoneId - Identifier of the risk zone.
   * @returns {Promise<void>}
   */
  deleteRiskZone: async (zoneId) => {
    try {
      await api.delete(`/admin/risk-zones/${zoneId}`);
    } catch (error) {
      console.error('Risk Zone Delete Error:', error.response || error);
      throw new Error(error.response?.data?.message || 'Failed to delete risk zone.');
    }
  },

};

export default apiService;