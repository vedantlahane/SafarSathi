//pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../services/AuthContext';
import { motion } from 'framer-motion';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
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
      // Simulate API call - replace with actual backend
      setTimeout(() => {
        // Mock user data for demo
        const userData = {
          name: 'Demo User',
          email: formData.email,
          phone: '+91-9876543210',
          blockchainID: 'BC' + Math.random().toString(36).substr(2, 12).toUpperCase(),
          registeredAt: new Date().toISOString(),
          isActive: true
        };

        login(userData);
        toast.success('Login successful!');
        navigate('/dashboard');
        setIsLoading(false);
      }, 1000);

    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5 relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            'radial-gradient(ellipse at top left, rgba(13, 148, 136, 0.4) 0%, transparent 70%)',
            'radial-gradient(ellipse at bottom right, rgba(124, 58, 237, 0.4) 0%, transparent 70%)',
            'radial-gradient(ellipse at center, rgba(249, 115, 22, 0.3) 0%, transparent 70%)'
          ]
        }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
      />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/10 backdrop-blur-xl border border-white/20 p-10 rounded-2xl shadow-2xl w-full max-w-md text-center relative overflow-hidden"
      >
        {/* Top Border Accent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-teal-400 to-purple-400 bg-clip-text text-transparent">
            🛡️ SafarSathi
          </h1>
          <p className="text-white/80 text-lg font-medium">
            Your Digital Travel Safety Companion
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          onSubmit={handleSubmit}
          className="text-left space-y-6"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <label className="block text-white/90 font-semibold mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="Enter your email"
              className="w-full bg-white/10 border border-white/20 text-white p-3 rounded-lg backdrop-blur-md placeholder-white/50 focus:bg-white/15 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-300"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <label className="block text-white/90 font-semibold mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="Enter your password"
              className="w-full bg-white/10 border border-white/20 text-white p-3 rounded-lg backdrop-blur-md placeholder-white/50 focus:bg-white/15 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-300"
            />
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:from-teal-600 hover:to-teal-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 mt-6 relative overflow-hidden group"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full"
              whileHover={{ translateX: "200%" }}
              transition={{ duration: 0.6 }}
            />
            {isLoading ? '⏳ Logging in...' : '🔐 Login'}
          </motion.button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mt-6"
        >
          <p className="text-blue-700 font-semibold text-sm">🚀 Hackathon Demo Mode</p>
          <p className="text-blue-600 text-sm">Use any email and password to login</p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="mt-6 text-white/70"
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
          className="bg-slate-50 p-5 rounded-lg mt-8 text-left"
        >
          <h3 className="text-slate-800 font-bold mb-4 text-center">🌟 Key Features</h3>
          <ul className="space-y-2">
            {[
              '🆔 Blockchain Digital ID',
              '🗺️ Real-time Safety Mapping',
              '🚨 Emergency SOS Button',
              '📍 Geo-fencing Alerts',
              '🤖 AI Behavior Monitoring'
            ].map((feature, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 + index * 0.1, duration: 0.6 }}
                className="text-slate-600 text-sm py-1 border-b border-slate-200 last:border-b-0"
              >
                {feature}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;