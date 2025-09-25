import React from 'react';
import { motion } from 'framer-motion';
import { formatTime } from '../../mock/appData';

const priorityColor = {
  critical: 'border-red-500/60 bg-red-500/10 text-red-200',
  high: 'border-amber-500/60 bg-amber-500/10 text-amber-200',
  info: 'border-sky-500/60 bg-sky-500/10 text-sky-200'
};

const AlertsPanel = ({ alerts = [], onSelectAlert }) => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Incoming Alerts</h2>
        <span className="text-sm text-slate-300">{alerts.length} live events</span>
      </div>

      <div className="divide-y divide-white/10">
        {alerts.map(alert => (
          <motion.button
            key={alert.id}
            whileHover={{ backgroundColor: 'rgba(148, 163, 184, 0.08)' }}
            onClick={() => onSelectAlert?.(alert)}
            className="w-full text-left px-6 py-4 flex flex-col gap-2 transition-colors"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs border ${priorityColor[alert.priority]}`}>{alert.priority.toUpperCase()}</span>
                <span>{alert.description}</span>
              </p>
              <p className="text-xs text-slate-400">{formatTime(alert.timestamp)}</p>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-slate-300">
              <span>👤 {alert.touristName}</span>
              <span>🆔 {alert.id}</span>
              <span>{alert.assignedUnit ? `🚓 Assigned: ${alert.assignedUnit}` : '🕒 Unassigned'}</span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default AlertsPanel;
