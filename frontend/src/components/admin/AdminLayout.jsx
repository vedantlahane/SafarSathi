import React from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAdminAuth } from '../../services/AdminAuthContext';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/map', label: 'Live Map' },
  { to: '/admin/alerts', label: 'Alerts' },
  { to: '/admin/risk-zones', label: 'Risk Zones' }
];

const linkBaseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors duration-300';

const AdminLayout = ({ children, title, subtitle }) => {
  const navigate = useNavigate();
  const { admin, logout } = useAdminAuth();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="backdrop-blur-lg bg-white/10 border-b border-white/10 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="uppercase text-xs tracking-widest text-teal-300/80">SafarSathi Command Center</p>
            <h1 className="text-2xl font-semibold text-white flex items-center gap-2">
              <span>🛰️ {title}</span>
            </h1>
            {subtitle && <p className="text-slate-300 text-sm mt-1">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-teal-300">{admin?.name || 'Operator'}</p>
              <p className="text-xs text-slate-300">{admin?.email}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleLogout}
              className="bg-red-500/90 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Logout
            </motion.button>
          </div>
        </div>

        <nav className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-3 flex gap-3">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `${linkBaseClasses} ${isActive ? 'bg-teal-500 text-slate-950' : 'text-slate-200 hover:bg-white/10'}`}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </header>

      <motion.main
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-7xl mx-auto px-6 py-8"
      >
        {children}
      </motion.main>
    </div>
  );
};

export default AdminLayout;
