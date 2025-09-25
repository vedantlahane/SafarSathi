import React from 'react';
import { motion } from 'framer-motion';
import { formatTime } from '../../mock/adminData';

const statusBadge = {
  safe: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/40',
  warning: 'bg-amber-500/10 text-amber-300 border border-amber-500/40',
  sos: 'bg-red-500/10 text-red-300 border border-red-500/40'
};

const TouristTable = ({ tourists = [], onFocusTourist }) => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl">
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Tourist Watchlist</h2>
        <span className="text-sm text-slate-300">{tourists.length} tracked</span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="text-xs uppercase text-slate-400">
            <tr>
              <th className="px-6 py-3">Tourist</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Last Ping</th>
              <th className="px-6 py-3">Battery</th>
              <th className="px-6 py-3">Last Known Area</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm text-slate-200 divide-y divide-white/5">
            {tourists.map(tourist => (
              <tr key={tourist.id}>
                <td className="px-6 py-3">
                  <div className="flex flex-col">
                    <span className="font-semibold">{tourist.name}</span>
                    <span className="text-xs text-slate-400">#{tourist.id}</span>
                  </div>
                </td>
                <td className="px-6 py-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge[tourist.status] || statusBadge.safe}`}>
                    {tourist.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-3">{formatTime(tourist.lastPing)}</td>
                <td className="px-6 py-3">{tourist.battery}%</td>
                <td className="px-6 py-3">{tourist.lastKnownArea}</td>
                <td className="px-6 py-3 text-right">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onFocusTourist?.(tourist)}
                    className="px-3 py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 rounded-lg"
                  >
                    Focus on Map
                  </motion.button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TouristTable;
