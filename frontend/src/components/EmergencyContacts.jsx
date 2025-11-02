import FeatureIcon from './icons/FeatureIcon';

const contactIconTone = {
  police: { name: 'police', accent: 'text-rose-200' },
  tourism: { name: 'tourism', accent: 'text-cyan-200' },
  family: { name: 'family', accent: 'text-emerald-200' },
  medical: { name: 'medical', accent: 'text-amber-200' },
};

const priorityTone = {
  critical: {
    accent: 'border-rose-400/70 text-rose-100',
    chip: 'bg-rose-500/20 text-rose-100',
  },
  high: {
    accent: 'border-amber-400/70 text-amber-100',
    chip: 'bg-amber-500/20 text-amber-100',
  },
  medium: {
    accent: 'border-sky-400/70 text-sky-100',
    chip: 'bg-sky-500/20 text-sky-100',
  },
  low: {
    accent: 'border-slate-400/60 text-slate-100',
    chip: 'bg-slate-500/15 text-slate-100',
  }
};

const EmergencyContacts = ({ contacts = [] }) => {
  if (!Array.isArray(contacts) || contacts.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 px-4 py-3 text-center text-sm text-slate-300">
        No emergency contacts configured yet.
      </div>
    );
  }

  const handleCall = (phone) => {
    window.open(`tel:${phone.replace(/\s+/g, '')}`);
  };

  return (
    <div className="space-y-3 text-slate-100">
      <div className="flex items-center gap-3">
        <FeatureIcon name="contacts" size="xs" className="border-white/10 text-amber-200" />
        <h3 className="text-base font-semibold text-white">Emergency contacts</h3>
      </div>
      <div className="space-y-3">
        {contacts.map((contact) => {
          const variant = priorityTone[contact.priority] || priorityTone.low;
          const iconVariant = contactIconTone[contact.type] || { name: 'contacts', accent: 'text-slate-200' };
          return (
            <div
              key={contact.id}
              className={`flex items-start justify-between gap-3 rounded-2xl border-l-4 px-3 py-2 ${variant.accent}`}
            >
              <div className="flex items-start gap-3">
                <FeatureIcon
                  name={iconVariant.name}
                  size="xs"
                  className={`border-white/10 ${iconVariant.accent}`}
                />
                <div className="space-y-1">
                  <p className="font-semibold text-sm leading-tight text-white">{contact.name}</p>
                  <p className="text-xs text-white/70">{contact.description}</p>
                  <p className="font-mono text-xs text-white/80">{contact.phone}</p>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] ${variant.chip}`}>
                    {contact.priority}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCall(contact.phone)}
                className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/10"
              >
                Call
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EmergencyContacts;
