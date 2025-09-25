
const contactIcons = {
  police: '🚓',
  tourism: '🏛️',
  family: '👨‍👩‍👧',
  medical: '🏥'
};

const priorityTone = {
  critical: 'bg-rose-50 border-rose-200 text-rose-700',
  high: 'bg-amber-50 border-amber-200 text-amber-700',
  medium: 'bg-sky-50 border-sky-200 text-sky-700',
  low: 'bg-slate-50 border-slate-200 text-slate-600'
};

const EmergencyContacts = ({ contacts = [] }) => {
  if (!Array.isArray(contacts) || contacts.length === 0) {
    return (
      <div className="bg-white/90 border border-slate-200 rounded-2xl p-4 text-center text-slate-500">
        No emergency contacts configured yet.
      </div>
    );
  }

  const handleCall = (phone) => {
    window.open(`tel:${phone.replace(/\s+/g, '')}`);
  };

  return (
    <div className="bg-white/90 border border-slate-200 rounded-3xl p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">📞 Emergency Contacts</h3>
      <div className="space-y-4">
        {contacts.map(contact => (
          <div
            key={contact.id}
            className={`flex items-start justify-between rounded-2xl border px-4 py-3 transition hover:shadow ${priorityTone[contact.priority]}`}
          >
            <div className="flex items-start space-x-3">
              <div className="text-2xl mt-1" aria-hidden>{contactIcons[contact.type] || '📱'}</div>
              <div>
                <p className="font-semibold text-base">{contact.name}</p>
                <p className="text-sm opacity-80">{contact.description}</p>
                <p className="text-sm font-mono mt-1">{contact.phone}</p>
              </div>
            </div>
            <button
              onClick={() => handleCall(contact.phone)}
              className="px-3 py-2 text-sm font-semibold rounded-lg bg-slate-900 text-white hover:bg-black"
            >
              Call Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmergencyContacts;
