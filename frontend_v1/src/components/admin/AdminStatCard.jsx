import React from 'react';
import { motion } from 'framer-motion';

const gradientMap = {
  critical: 'from-rose-500 via-red-500 to-orange-500',
  warning: 'from-yellow-400 via-amber-400 to-orange-400',
  info: 'from-sky-500 via-blue-500 to-indigo-500'
};

const AdminStatCard = ({ icon, label, value, trend, tone = 'info' }) => {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-lg flex flex-col gap-3"
    >
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${gradientMap[tone] || gradientMap.info} flex items-center justify-center text-2xl`}>{icon}</div>
      <div>
        <p className="text-slate-300 text-sm uppercase tracking-wider">{label}</p>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
      </div>
      {trend && (
        <p className="text-xs text-slate-400">{trend}</p>
      )}
    </motion.div>
  );
};

export default AdminStatCard;
