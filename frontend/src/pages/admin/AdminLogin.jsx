import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAdminAuth } from '../../services/AdminAuthContext';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAdminAuth();
  const [credentials, setCredentials] = useState({ email: '', passcode: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      login(credentials);
      toast.success('Control room access granted');
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error(error.message || 'Unable to authenticate');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg bg-white/5 border border-white/10 rounded-3xl p-10 backdrop-blur-xl shadow-2xl"
      >
        <div className="text-center mb-8">
          <p className="text-sm uppercase tracking-widest text-teal-300">Authority Access Portal</p>
          <h1 className="text-3xl font-bold text-white mt-2">⚡ SafarSathi Command</h1>
          <p className="text-slate-300 mt-2 text-sm">Use the demo passcodes <span className="font-semibold text-teal-200">SECURE-911</span> or <span className="font-semibold text-teal-200">DEMO-ADMIN</span> to explore.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">Official Email</label>
            <input
              type="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              required
              placeholder="operator@safarsathi.in"
              className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">Secure Passcode</label>
            <input
              type="password"
              name="passcode"
              value={credentials.passcode}
              onChange={handleChange}
              required
              placeholder="Enter demo passcode"
              className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-500 tracking-[0.3em]"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-teal-500 via-sky-500 to-indigo-500 text-white font-semibold py-3 rounded-xl shadow-lg disabled:opacity-60"
          >
            {isLoading ? 'Verifying...' : 'Enter Command Center'}
          </motion.button>
        </form>

        <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-slate-300">
          <p>💡 Tip: This portal runs on mock data. Actions such as acknowledging alerts update the UI state locally so you can demonstrate workflows without a backend.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
