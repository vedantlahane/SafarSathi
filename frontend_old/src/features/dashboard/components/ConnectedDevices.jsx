import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import FeatureIcon from '../../../components/icons/FeatureIcon.jsx';

dayjs.extend(relativeTime);

const deviceIcons = {
  'smart-band': { name: 'wearable', accent: 'text-emerald-200' },
  'gps-tag': { name: 'gps', accent: 'text-cyan-200' },
  'satellite-phone': { name: 'satellite', accent: 'text-amber-200' },
};

const signalTone = {
  excellent: 'text-emerald-300',
  good: 'text-teal-300',
  weak: 'text-amber-300',
  lost: 'text-rose-300',
};

const ConnectedDevices = ({ devices = [] }) => {
  if (!Array.isArray(devices) || devices.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 px-4 py-3 text-center text-sm text-slate-300">
        No IoT wearables paired yet.
      </div>
    );
  }

  return (
    <div className="space-y-3 text-slate-100">
      <div className="flex items-center gap-3">
        <FeatureIcon name="devices" size="xs" className="border-white/10 text-slate-100" />
        <h3 className="text-base font-semibold text-white">IoT devices</h3>
      </div>
      <div className="space-y-3">
        {devices.map((device) => {
          const icon = deviceIcons[device.type] ?? { name: 'devices', accent: 'text-slate-200' };
          return (
            <div
              key={device.id}
              className="grid gap-3 rounded-2xl border-l-4 border-white/15 px-4 py-3 md:grid-cols-[minmax(0,1.4fr),minmax(0,1fr),minmax(0,1fr)]"
            >
              <div className="flex items-start gap-3">
                <FeatureIcon name={icon.name} size="xs" className={`border-white/10 ${icon.accent}`} />
                <div className="space-y-1">
                  <p className="text-sm font-semibold capitalize text-white">{device.type.replace('-', ' ')}</p>
                  <p className="text-xs text-white/60">Last signal {dayjs(device.lastSignal).fromNow()}</p>
                </div>
              </div>
              <div className="space-y-1 text-sm text-white/75">
                <p>
                  Battery <span className="font-semibold text-white">{device.battery}%</span>
                </p>
                {device.heartRate ? (
                  <p>
                    Heart rate <span className="font-semibold text-white">{device.heartRate} bpm</span>
                  </p>
                ) : null}
                {device.temperature ? (
                  <p>
                    Temperature <span className="font-semibold text-white">{device.temperature}°C</span>
                  </p>
                ) : null}
              </div>
              <div className="text-sm text-white/75">
                <p className={`font-semibold capitalize ${signalTone[device.signalStrength] || 'text-slate-200'}`}>
                  Signal {device.signalStrength}
                </p>
                <p className="text-xs text-white/50">Device ID {device.id}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConnectedDevices;
