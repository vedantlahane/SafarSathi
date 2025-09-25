import React from 'react';

const levelTone = {
  critical: 'bg-rose-50 border-rose-200 text-rose-700',
  warning: 'bg-amber-50 border-amber-200 text-amber-700',
  info: 'bg-sky-50 border-sky-200 text-sky-700'
};

const GeoFenceAlertList = ({ zones = [] }) => {
  if (!Array.isArray(zones) || zones.length === 0) {
    return (
      <div className="bg-white/90 border border-slate-200 rounded-2xl p-4 text-center text-slate-500">
        No active geo-fence alerts.
      </div>
    );
  }

  return (
    <div className="bg-white/90 border border-slate-200 rounded-3xl p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">🛑 Geo-fence Alerts</h3>
      <div className="space-y-4">
        {zones.map(zone => (
          <div key={zone.id} className={`rounded-2xl border px-4 py-3 ${levelTone[zone.level] || levelTone.info}`}>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-base">{zone.name}</p>
              <span className="text-xs uppercase tracking-wider">{zone.level}</span>
            </div>
            <p className="text-sm mt-2">{zone.reason}</p>
            <p className="text-xs text-slate-500 mt-2">Radius: {zone.radius}m</p>
            <p className="text-xs text-slate-500">Coordinates: {zone.center.lat.toFixed(3)}, {zone.center.lng.toFixed(3)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GeoFenceAlertList;
