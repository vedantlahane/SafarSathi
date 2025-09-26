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
    <div className="min-h-[100svh] bg-slate-950 text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/85 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-teal-300/80">SafarSathi Command Center</p>
            <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold text-white sm:text-3xl">
              <span>🛰️ {title}</span>
            </h1>
            {subtitle && <p className="mt-1 text-sm text-slate-300">{subtitle}</p>}
          </div>

          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <div className="text-right">
              <p className="text-sm font-semibold text-teal-300">{admin?.name || 'Operator'}</p>
              <p className="text-xs text-slate-300 max-w-[12rem] truncate">{admin?.email}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleLogout}
              className="rounded-full bg-red-500/90 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-500"
            >
              Logout
            </motion.button>
          </div>
        </div>

        <nav className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `${linkBaseClasses} flex-shrink-0 ${isActive ? 'bg-teal-500 text-slate-950 shadow-lg' : 'text-slate-200 hover:bg-white/10'}`}
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
        className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8"
      >
        {children}
      </motion.main>
    </div>
  );
};

export default AdminLayout;
