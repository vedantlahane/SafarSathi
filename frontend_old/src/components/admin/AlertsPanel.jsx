import React from 'react';
import { motion } from 'framer-motion';
import { formatTime } from '../../utils/time';

const priorityColor = {
  critical: 'border-red-500/60 bg-red-500/10 text-red-200',
  high: 'border-amber-500/60 bg-amber-500/10 text-amber-200',
  info: 'border-sky-500/60 bg-sky-500/10 text-sky-200'
};

const AlertsPanel = ({ alerts = [], onSelectAlert }) => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-white/10 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <h2 className="text-lg font-semibold text-white">Incoming Alerts</h2>
        <span className="text-sm text-slate-300">{alerts.length} live events</span>
      </div>

      <div className="divide-y divide-white/10">
        {alerts.map(alert => {
          const priorityKey = alert.priority?.toLowerCase?.() || 'info';
          const badgeClass = priorityColor[priorityKey] || priorityColor.info;
          const description = alert.description || alert.message || alert.alertType || 'Alert triggered';
          const touristName = alert.touristName || 'Unknown tourist';
          const assignedUnitLabel = alert.assignedUnit ? `🚓 Assigned: ${alert.assignedUnit}` : '🕒 Awaiting assignment';

          return (
            <motion.button
              key={alert.id}
              whileHover={{ backgroundColor: 'rgba(148, 163, 184, 0.08)' }}
              onClick={() => onSelectAlert?.(alert)}
              className="w-full text-left px-5 py-4 flex flex-col gap-3 transition-colors sm:px-6"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-semibold text-white flex flex-col gap-2 sm:flex-row sm:items-center">
                  <span className={`w-fit px-2 py-1 rounded-full text-xs border ${badgeClass}`}>{(alert.priority || 'info').toUpperCase()}</span>
                  <span className="leading-snug text-slate-100">{description}</span>
                </p>
                <p className="text-xs text-slate-400 sm:text-right">{formatTime(alert.timestamp)}</p>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-slate-300">
                <span>👤 {touristName}</span>
                <span>🆔 {alert.id}</span>
                <span>{assignedUnitLabel}</span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default AlertsPanel;
