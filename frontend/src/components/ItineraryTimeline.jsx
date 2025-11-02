import dayjs from 'dayjs';
import FeatureIcon from './icons/FeatureIcon';

const statusColors = {
  completed: 'bg-emerald-500',
  scheduled: 'bg-blue-500',
  delayed: 'bg-amber-500',
  cancelled: 'bg-rose-500'
};

const ItineraryTimeline = ({ itinerary = [] }) => {
  if (!Array.isArray(itinerary) || itinerary.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 px-4 py-3 text-center text-sm text-slate-300">
        No itinerary items found.
      </div>
    );
  }

  return (
    <div className="space-y-3 text-slate-100">
      <div className="flex items-center gap-3">
        <FeatureIcon name="timeline" size="xs" className="border-white/10 text-cyan-200" />
        <h3 className="text-base font-semibold text-white">Upcoming itinerary</h3>
      </div>
      <div className="space-y-5">
        {itinerary.map((item, index) => (
          <div key={item.id} className="relative pl-6">
            {index !== 0 && (
              <span className="absolute left-1.5 top-0 h-full w-px bg-white/15" aria-hidden />
            )}
            <span
              className={`absolute left-0 top-1.5 h-3 w-3 rounded-full border border-white/20 ${statusColors[item.status] || 'bg-slate-400'}`}
            />
            <div className="flex flex-col gap-2 rounded-2xl border-l-4 border-white/15 bg-transparent px-4 py-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs uppercase tracking-[0.14em] text-white/60">
                <span>{dayjs(item.day).format('DD MMM YYYY')} • {item.time}</span>
                <span className="text-white/70">{item.city}</span>
              </div>
              <h4 className="text-sm font-semibold text-white">{item.title}</h4>
              <p className="text-sm text-white/70 leading-relaxed">{item.notes}</p>
              <span className={`inline-flex w-max rounded-full px-3 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white ${statusColors[item.status] || 'bg-slate-400'}`}>
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItineraryTimeline;
