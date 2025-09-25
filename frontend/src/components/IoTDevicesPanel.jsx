import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const deviceIcons = {
  'smart-band': '⛑️',
  'gps-tag': '📡',
  'satellite-phone': '📞'
};

const signalTone = {
  excellent: 'text-emerald-600',
  good: 'text-teal-600',
  weak: 'text-amber-600',
  lost: 'text-rose-600'
};

const IoTDevicesPanel = ({ devices = [] }) => {
  if (!Array.isArray(devices) || devices.length === 0) {
    return (
      <div className="bg-white/90 border border-slate-200 rounded-2xl p-4 text-center text-slate-500">
        No IoT wearables paired yet.
      </div>
    );
  }

  return (
    <div className="bg-white/90 border border-slate-200 rounded-3xl p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">🛰️ IoT Devices</h3>
      <div className="space-y-4">
        {devices.map(device => (
          <div key={device.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-slate-200 rounded-2xl p-4 bg-white/70">
            <div className="flex items-center space-x-3">
              <span className="text-3xl" aria-hidden>{deviceIcons[device.type] || '🔌'}</span>
              <div>
                <p className="font-semibold text-slate-800 capitalize">{device.type.replace('-', ' ')}</p>
                <p className="text-xs text-slate-500">Last signal {dayjs(device.lastSignal).fromNow()}</p>
              </div>
            </div>
            <div className="space-y-1 text-sm text-slate-600">
              <p>Battery: <span className="font-semibold">{device.battery}%</span></p>
              {device.heartRate && <p>Heart rate: <span className="font-semibold">{device.heartRate} bpm</span></p>}
              {device.temperature && <p>Temperature: <span className="font-semibold">{device.temperature}°C</span></p>}
            </div>
            <div className="text-sm">
              <p className={`font-semibold ${signalTone[device.signalStrength] || 'text-slate-600'} capitalize`}>
                Signal: {device.signalStrength}
              </p>
              <p className="text-xs text-slate-500">Device ID: {device.id}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IoTDevicesPanel;
