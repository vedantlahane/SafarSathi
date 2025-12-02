import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../services/AuthContext';
import { motion, useReducedMotion } from 'framer-motion';
import apiService from '../services/apiService';

const LogoMark = ({ className = '', ...props }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      d="M16 3.5l10 3.75v6.5c0 7.07-4.45 13.41-10 14.75-5.55-1.34-10-7.68-10-14.75v-6.5L16 3.5z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path
      d="M16 10.5a4 4 0 014 4c0 2.9-1.64 5.82-4 7.75-2.36-1.93-4-4.85-4-7.75a4 4 0 014-4z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ShieldIcon = ({ className = '', ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      d="M12 3l7 3v5c0 4.418-3.134 8.51-7 9-3.866-.49-7-4.582-7-9V6l7-3z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M9.75 11.25l2.25 2.25 4.5-4.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);


const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const prefersReducedMotion = useReducedMotion();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
  // ----------------------------------------------------
  // REAL API CALL: Connect to Spring Boot /api/auth/login
  // ----------------------------------------------------
      
      // 1. Call the API service with the collected credentials
      const apiResponse = await apiService.loginTourist(formData.email, formData.password); 

      // 2. Extract key data from the backend response
      const { token, touristId, qr_content, user } = apiResponse;

      // 3. Prepare the user session data using backend user data
      const userData = {
        id: touristId, 
        token: token,
        qrContent: qr_content,
        isActive: true,
        // Include all user profile data from backend
        ...user
      };

      // 4. Update Auth Context and Redirect
      login(userData);
  toast.success('Login successful. Welcome back.');
      navigate('/dashboard');

    } catch (error) {
      console.error('Login error:', error);
      // Display the specific error message provided by the backend, if available
      toast.error(error.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-10 sm:px-6 lg:px-8">
      {/* Animated Background (JSX unchanged) */}
      {!prefersReducedMotion && (
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              'radial-gradient(ellipse at top left, rgba(13, 148, 136, 0.4) 0%, transparent 70%)',
              'radial-gradient(ellipse at bottom right, rgba(124, 58, 237, 0.4) 0%, transparent 70%)',
              'radial-gradient(ellipse at center, rgba(249, 115, 22, 0.3) 0%, transparent 70%)'
            ]
          }}
          transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
        />
      )}
      
      <motion.div
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-6 text-center shadow-2xl backdrop-blur-xl sm:p-8 lg:p-10"
      >
        {/* Top Border Accent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
        
        {/* Header (JSX unchanged) */}
        <motion.div
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: -20 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-8 space-y-4"
        >
          <div className="flex justify-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/10 text-teal-300">
              <LogoMark className="h-8 w-8" />
            </span>
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-teal-300 via-cyan-300 to-purple-300 bg-clip-text text-transparent">
              SafarSathi
            </h1>
            <p className="text-white/80 text-base sm:text-lg leading-relaxed">
              SafarSathi keeps visiting tourists safe while giving district command centres live situational awareness to act fast.
            </p>
            <p className="text-white/60 text-sm sm:text-base">
              Built in partnership with local authorities for on-ground escorts, control rooms, and verified travellers.
            </p>
          </div>
        </motion.div>

        <motion.form
          initial={prefersReducedMotion ? undefined : { opacity: 0 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          onSubmit={handleSubmit}
          className="text-left space-y-5 sm:space-y-6"
        >
          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0, x: -20 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <label className="block text-white/90 font-semibold mb-2 text-sm sm:text-base">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="Enter your email"
              className="w-full bg-white/10 border border-white/20 text-white px-4 py-3 sm:px-5 rounded-lg backdrop-blur-md placeholder-white/50 focus:bg-white/15 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-300"
            />
          </motion.div>

          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0, x: -20 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <label className="block text-white/90 font-semibold mb-2 text-sm sm:text-base">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="Enter your password"
              className="w-full bg-white/10 border border-white/20 text-white px-4 py-3 sm:px-5 rounded-lg backdrop-blur-md placeholder-white/50 focus:bg-white/15 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-300"
            />
          </motion.div>

          <motion.button
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold py-3 px-6 sm:py-3.5 rounded-lg shadow-lg hover:from-teal-600 hover:to-teal-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 mt-6 relative overflow-hidden group"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full"
              whileHover={{ translateX: "200%" }}
              transition={{ duration: 0.6 }}
            />
            {isLoading ? 'Logging in…' : 'Sign in'}
          </motion.button>
        </motion.form>

        <motion.div
          initial={prefersReducedMotion ? undefined : { opacity: 0 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="bg-white/5 border border-white/15 p-4 rounded-lg mt-6 text-sm sm:text-base text-white/80 flex items-start gap-3"
        >
          <ShieldIcon className="h-6 w-6 flex-shrink-0 text-teal-300" />
          <p>Authorised guides, police operators, and registered travellers sign in here to coordinate journeys, monitor field teams, and secure digital IDs. Need access? Reach out to your deployment administrator.</p>
        </motion.div>

        <motion.p
          initial={prefersReducedMotion ? undefined : { opacity: 0 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="mt-6 text-white/70 text-sm sm:text-base"
        >
          New to SafarSathi?{' '}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/register')}
            className="text-teal-400 hover:text-white transition-colors duration-300 underline font-semibold"
          >
            Register here
          </motion.button>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Login;