import React from 'react';
import { motion } from 'framer-motion';
import { formatTime } from '../../mock/appData';

const ActivityTimeline = ({ alerts = [], tourists = [] }) => {
  const events = [
    ...alerts.map(alert => ({
      id: alert.id,
      type: alert.priority === 'critical' ? 'SOS Alert' : 'Watch Alert',
      description: alert.description,
      timestamp: alert.timestamp,
      icon: alert.priority === 'critical' ? '🚨' : '⚠️'
    })),
    ...tourists.map(tourist => ({
      id: `${tourist.id}-ping`,
      type: 'Ping Update',
      description: `${tourist.name} checked in at ${tourist.lastKnownArea}`,
      timestamp: tourist.lastPing,
      icon: '📍'
    }))
  ]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 6);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-full">
      <h2 className="text-lg font-semibold text-white mb-4">Live Activity Feed</h2>
      <div className="space-y-4">
        {events.map(event => (
          <div key={event.id} className="flex gap-4 items-start">
            <div className="text-2xl" aria-hidden>{event.icon}</div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">{event.type}</p>
              <p className="text-sm text-slate-300 mt-1">{event.description}</p>
              <p className="text-xs text-slate-400 mt-1">{formatTime(event.timestamp)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityTimeline;
