import React, { useState } from 'react';

const ToggleRow = ({ label, description, checked, onChange }) => (
  <div className="flex items-start justify-between py-3 border-b border-slate-200 last:border-b-0">
    <div>
      <p className="font-semibold text-slate-800">{label}</p>
      <p className="text-sm text-slate-500 max-w-xs">{description}</p>
    </div>
    <label className="inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="sr-only"
      />
      <span className={`w-11 h-6 flex items-center rounded-full p-1 transition ${checked ? 'bg-teal-500' : 'bg-slate-300'}`}>
        <span className={`bg-white w-5 h-5 rounded-full shadow transform transition ${checked ? 'translate-x-5' : ''}`} />
      </span>
    </label>
  </div>
);

const TrackingPreferences = ({ preferences, onUpdate }) => {
  const [pending, setPending] = useState(false);

  const handleChange = async (key, value) => {
    setPending(true);
    await onUpdate?.({ [key]: value });
    setPending(false);
  };

  return (
    <div className="bg-white/90 border border-slate-200 rounded-3xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800">📡 Tracking Preferences</h3>
        {pending && <span className="text-xs text-teal-600">Saving...</span>}
      </div>
      <div>
        <ToggleRow
          label="Live Location Sharing"
          description="Share high-precision location with trusted contacts and authorities during emergencies."
          checked={preferences?.shareLiveLocation}
          onChange={(value) => handleChange('shareLiveLocation', value)}
        />
        <ToggleRow
          label="Geo-fence Alerts"
          description="Receive proactive alerts when approaching sensitive or restricted zones."
          checked={preferences?.allowGeoFenceAlerts}
          onChange={(value) => handleChange('allowGeoFenceAlerts', value)}
        />
        <ToggleRow
          label="IoT Wearable Tracking"
          description="Enable continuous monitoring from paired IoT bands or tags in high-risk areas."
          checked={preferences?.allowIoTTracking}
          onChange={(value) => handleChange('allowIoTTracking', value)}
        />
      </div>
    </div>
  );
};

export default TrackingPreferences;
