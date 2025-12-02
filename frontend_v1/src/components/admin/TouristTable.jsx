import React from 'react';
import { motion } from 'framer-motion';
import { formatTime } from '../../utils/time';

const statusBadge = {
  safe: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/40',
  warning: 'bg-amber-500/10 text-amber-300 border border-amber-500/40',
  sos: 'bg-red-500/10 text-red-300 border border-red-500/40',
  danger: 'bg-red-500/10 text-red-300 border border-red-500/40'
};

const TouristTable = ({ tourists = [], onFocusTourist }) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5">
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <h2 className="text-lg font-semibold text-white">Tourist Watchlist</h2>
        <span className="text-sm text-slate-300">{tourists.length} tracked</span>
      </div>

      <div className="hidden overflow-x-auto md:block">
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
          <tbody className="divide-y divide-white/5 text-sm text-slate-200">
            {tourists.map((tourist) => {
              const statusKey = tourist.status?.toLowerCase?.() || 'safe';
              const badgeClass = statusBadge[statusKey] || statusBadge.safe;
              const displayStatus = tourist.status ? tourist.status.toUpperCase() : 'SAFE';
              const lastPing = formatTime(tourist.lastPing);
              const battery = typeof tourist.battery === 'number' ? `${tourist.battery}%` : '—';
              const lastKnownArea = tourist.lastKnownArea || 'Coordinates unknown';

              return (
                <tr key={tourist.id}>
                  <td className="px-6 py-3">
                    <div className="flex flex-col">
                      <span className="font-semibold">{tourist.name}</span>
                      <span className="text-xs text-slate-400">#{tourist.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}>
                      {displayStatus}
                    </span>
                  </td>
                  <td className="px-6 py-3">{lastPing}</td>
                  <td className="px-6 py-3">{battery}</td>
                  <td className="px-6 py-3">{lastKnownArea}</td>
                  <td className="px-6 py-3 text-right">
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onFocusTourist?.(tourist)}
                      className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/20"
                    >
                      Focus on Map
                    </motion.button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 px-4 py-4 md:hidden">
        {tourists.map((tourist) => {
          const statusKey = tourist.status?.toLowerCase?.() || 'safe';
          const badgeClass = statusBadge[statusKey] || statusBadge.safe;
          const displayStatus = tourist.status ? tourist.status.toUpperCase() : 'SAFE';
          const lastPing = formatTime(tourist.lastPing);
          const battery = typeof tourist.battery === 'number' ? `${tourist.battery}%` : '—';

          return (
            <details
              key={tourist.id}
              className="rounded-2xl border border-white/10 bg-white/10 p-4 text-slate-200"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-semibold text-white">
                <span className="flex flex-col">
                  {tourist.name}
                  <span className="text-xs text-slate-400">#{tourist.id}</span>
                </span>
                <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${badgeClass}`}>{displayStatus}</span>
              </summary>
              <div className="mt-3 space-y-2 text-sm">
                <p>Last ping: <span className="font-medium text-white">{lastPing}</span></p>
                <p>Battery: <span className="font-medium text-white">{battery}</span></p>
                <p>Area: <span className="font-medium text-white">{tourist.lastKnownArea || 'Coordinates unknown'}</span></p>
              </div>
              <button
                type="button"
                onClick={() => onFocusTourist?.(tourist)}
                className="mt-4 w-full rounded-lg border border-teal-400/40 bg-teal-500/10 px-3 py-2 text-sm font-semibold text-teal-100 transition hover:bg-teal-500/20"
              >
                Focus on Map
              </button>
            </details>
          );
        })}
      </div>
    </div>
  );
};

export default TouristTable;
