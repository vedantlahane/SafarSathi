import dayjs from 'dayjs';

const statusColors = {
  completed: 'bg-emerald-500',
  scheduled: 'bg-blue-500',
  delayed: 'bg-amber-500',
  cancelled: 'bg-rose-500'
};

const ItineraryTimeline = ({ itinerary = [] }) => {
  if (!Array.isArray(itinerary) || itinerary.length === 0) {
    return (
      <div className="bg-white/90 border border-slate-200 rounded-2xl p-6 text-center text-slate-500">
        No itinerary items found.
      </div>
    );
  }

  return (
    <div className="bg-white/90 border border-slate-200 rounded-3xl p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">🗓️ Upcoming Itinerary</h3>
      <div className="space-y-6">
        {itinerary.map((item, index) => (
          <div key={item.id} className="relative pl-6">
            {index !== 0 && (
              <span className="absolute left-2 top-0 h-full w-px bg-slate-200" aria-hidden />
            )}
            <span
              className={`absolute left-0 top-1.5 h-3 w-3 rounded-full border-2 border-white shadow ${statusColors[item.status] || 'bg-slate-400'}`}
            />
            <div className="bg-gradient-to-r from-white to-slate-50 border border-slate-200 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  {dayjs(item.day).format('DD MMM YYYY')} • {item.time}
                </p>
                <span className="text-xs uppercase tracking-wider text-slate-500">
                  {item.city}
                </span>
              </div>
              <h4 className="text-base font-semibold text-slate-800 mt-1">{item.title}</h4>
              <p className="text-sm text-slate-600 mt-2">{item.notes}</p>
              <span className={`inline-flex mt-3 px-3 py-1 rounded-full text-xs font-semibold text-white ${statusColors[item.status] || 'bg-slate-400'}`}>
                {item.status.toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItineraryTimeline;
