import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const deviceIcons = {
  'smart-band': '⛑️',
  'gps-tag': '📡',
  'satellite-phone': '📞'
};

const signalTone = {
  excellent: 'text-emerald-300',
  good: 'text-teal-300',
  weak: 'text-amber-300',
  lost: 'text-rose-300'
};

const IoTDevicesPanel = ({ devices = [] }) => {
  if (!Array.isArray(devices) || devices.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3 text-center text-slate-300">
        No IoT wearables paired yet.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3 shadow-sm">
      <h3 className="mb-2.5 text-lg font-semibold text-white">🛰️ IoT Devices</h3>
      <div className="space-y-2.5">
        {devices.map(device => (
          <div key={device.id} className="grid grid-cols-1 gap-2.5 rounded-2xl border border-white/10 bg-slate-950/50 p-2.5 md:grid-cols-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl" aria-hidden>{deviceIcons[device.type] || '🔌'}</span>
              <div>
                <p className="font-semibold text-slate-100 capitalize">{device.type.replace('-', ' ')}</p>
                <p className="text-xs text-slate-400">Last signal {dayjs(device.lastSignal).fromNow()}</p>
              </div>
            </div>
            <div className="space-y-1 text-sm text-slate-300">
              <p>Battery: <span className="font-semibold text-slate-100">{device.battery}%</span></p>
              {device.heartRate && <p>Heart rate: <span className="font-semibold text-slate-100">{device.heartRate} bpm</span></p>}
              {device.temperature && <p>Temperature: <span className="font-semibold text-slate-100">{device.temperature}°C</span></p>}
            </div>
            <div className="text-sm text-slate-300">
              <p className={`font-semibold ${signalTone[device.signalStrength] || 'text-slate-200'} capitalize`}>
                Signal: {device.signalStrength}
              </p>
              <p className="text-xs text-slate-400">Device ID: {device.id}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IoTDevicesPanel;
