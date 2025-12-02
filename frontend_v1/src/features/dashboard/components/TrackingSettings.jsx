import { useState } from 'react';

const ToggleRow = ({ label, description, checked, onChange }) => (
  <div className="flex flex-col gap-3 border-b border-slate-200 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
    <div className="space-y-1">
      <p className="font-semibold text-slate-800">{label}</p>
      <p className="text-sm text-slate-500 sm:max-w-sm">{description}</p>
    </div>
    <div className="flex w-full justify-stretch sm:w-auto sm:justify-end">
      <label className="inline-flex w-full items-center justify-between rounded-xl border border-slate-200/40 bg-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition cursor-pointer sm:w-auto sm:justify-end sm:border-transparent sm:bg-transparent sm:px-0 sm:py-0 sm:text-current">
        <span className="sr-only">Toggle {label}</span>
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="sr-only"
        />
        <span className={`flex h-6 w-11 items-center rounded-full p-1 transition ${checked ? 'bg-teal-500' : 'bg-slate-300'}`}>
          <span className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
        </span>
      </label>
    </div>
  </div>
);

const TrackingSettings = ({ preferences, onUpdate }) => {
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

export default TrackingSettings;
