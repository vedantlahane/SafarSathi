import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const severityColors = {
  high: 'bg-rose-500',
  medium: 'bg-amber-500',
  low: 'bg-emerald-500'
};

const AnomalyFeed = ({ anomalies = [], onResolve }) => {
  if (!Array.isArray(anomalies) || anomalies.length === 0) {
    return (
      <div className="bg-white/90 border border-slate-200 rounded-2xl p-4 text-center text-slate-500">
        No anomalies detected in the last 24 hours.
      </div>
    );
  }

  return (
    <div className="bg-white/90 border border-slate-200 rounded-3xl p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">🤖 AI Anomaly Feed</h3>
      <div className="space-y-4">
        {anomalies.map(item => (
          <div key={item.id} className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-white ${severityColors[item.severity] || 'bg-slate-400'}`}>
                  {item.severity === 'high' ? '🚨' : item.severity === 'medium' ? '⚠️' : 'ℹ️'}
                </span>
                <div>
                  <p className="font-semibold capitalize text-slate-800">{item.type.replace('_', ' ')}</p>
                  <p className="text-sm text-slate-500">{dayjs(item.timestamp).fromNow()}</p>
                </div>
              </div>
              <span className={`text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full border ${item.resolved ? 'border-emerald-300 text-emerald-600' : 'border-rose-300 text-rose-600'}`}>
                {item.resolved ? 'Resolved' : 'Action needed'}
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-3">{item.details}</p>
            {item.resolutionNotes && (
              <p className="text-xs text-emerald-600 mt-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                ✔ {item.resolutionNotes}
              </p>
            )}
            {!item.resolved && (
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => onResolve?.(item.id)}
                  className="px-3 py-2 text-sm font-semibold rounded-lg bg-emerald-500 text-white hover:bg-emerald-600"
                >
                  Mark Resolved
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnomalyFeed;
