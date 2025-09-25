import React from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const actionIcons = {
  DIGITAL_ID_VERIFIED: '✅',
  GEOFENCE_ALERT_ACK: '🚨',
  SOS_TRIGGERED: '🆘',
  ROUTE_DEVIATION: '🧭'
};

const BlockchainLogList = ({ logs = [] }) => {
  if (!Array.isArray(logs) || logs.length === 0) {
    return (
      <div className="bg-white/90 border border-slate-200 rounded-2xl p-4 text-center text-slate-500">
        No blockchain activity recorded yet.
      </div>
    );
  }

  return (
    <div className="bg-white/90 border border-slate-200 rounded-3xl p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">🧾 Blockchain Log</h3>
      <div className="space-y-4">
        {logs.map(log => (
          <div key={log.id} className="flex items-start space-x-3 border border-slate-200 rounded-2xl p-4 bg-white/70">
            <span className="text-2xl" aria-hidden>{actionIcons[log.action] || '🔐'}</span>
            <div>
              <p className="font-semibold text-slate-800">{log.action.replaceAll('_', ' ')}</p>
              <p className="text-sm text-slate-500">{log.actor}</p>
              <p className="text-xs text-slate-400 mt-1">{dayjs(log.timestamp).fromNow()} • {log.metadata}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlockchainLogList;
