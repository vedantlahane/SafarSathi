import axios from 'axios';

// Set the base URL for your Spring Boot backend
// IMPORTANT: Update this URL to match your backend's running port/address
const API_BASE_URL = 'http://localhost:8080/api'; 

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
};

export default apiService;