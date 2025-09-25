import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdminData } from '../../services/AdminDataContext';
import { getItineraryForTourist, getEmergencyContacts } from '../../mock/appData';
import { toast } from 'react-toastify';

const InfoPill = ({ label, value }) => (
  <div className="flex flex-col bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200">
    <span className="text-xs uppercase tracking-widest text-teal-300/80">{label}</span>
    <span className="mt-1 font-semibold text-white break-words">{value}</span>
  </div>
);

const AdminDigitalIds = () => {
  const { tourists } = useAdminData();

  const enrichedTourists = useMemo(() => (
    tourists.map(tourist => ({
      ...tourist,
      itinerary: getItineraryForTourist(tourist.id),
      contacts: getEmergencyContacts(tourist.id)
    }))
  ), [tourists]);

  const handleVerify = (tourist) => {
    toast.success(`Digital ID for ${tourist.name} validated against blockchain ledger.`);
  };

  const handleShare = (tourist) => {
    const payload = `SafarSathi ID Verification\nName: ${tourist.name}\nBlockchain ID: ${tourist.blockchainID || tourist.id}\nLast Known: ${tourist.lastKnownArea}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(payload).then(() => toast.info('Verification memo copied.'));
    } else {
      toast.info(payload);
    }
  };

  return (
    <AdminLayout title="Digital ID Registry" subtitle="Audit tourist blockchain identities, itineraries, and emergency contacts.">
      <div className="space-y-6">
        {enrichedTourists.map(tourist => (
          <motion.div
            key={tourist.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-lg font-semibold text-white flex items-center gap-3">
                  <span>🆔 {tourist.name}</span>
                  <span className={`text-xs px-3 py-1 rounded-full border ${tourist.status === 'sos' ? 'border-red-500/60 text-red-200 bg-red-500/10' : 'border-teal-500/60 text-teal-200 bg-teal-500/10'}`}>
                    {tourist.status.toUpperCase()}
                  </span>
                </p>
                <p className="text-sm text-slate-300">Last seen {tourist.lastKnownArea}</p>
              </div>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleVerify(tourist)}
                  className="px-4 py-2 rounded-lg bg-teal-500/80 hover:bg-teal-500 text-white font-semibold"
                >
                  Verify ID
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleShare(tourist)}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/15"
                >
                  Share Proof
                </motion.button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <InfoPill label="Blockchain ID" value={tourist.blockchainID || `${tourist.id}-MOCK`} />
              <InfoPill label="Battery" value={`${tourist.battery}%`} />
              <InfoPill label="Last Ping" value={new Date(tourist.lastPing).toLocaleString('en-IN')} />
              <InfoPill label="Emergency Reach" value={`${tourist.contacts.length} contact(s)`} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-sm font-semibold text-white mb-3">📍 Planned Itinerary</p>
                <ul className="space-y-2 text-xs text-slate-300">
                  {tourist.itinerary.length ? tourist.itinerary.map(stop => (
                    <li key={stop.id} className="flex justify-between bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                      <span className="font-medium text-slate-100">{stop.location}</span>
                      <span className="text-slate-400">{stop.status}</span>
                    </li>
                  )) : <li>No itinerary data uploaded.</li>}
                </ul>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-sm font-semibold text-white mb-3">📞 Emergency Contacts</p>
                <ul className="space-y-2 text-xs text-slate-300">
                  {tourist.contacts.length ? tourist.contacts.map(contact => (
                    <li key={contact.id} className="flex justify-between bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                      <div>
                        <p className="font-medium text-slate-100">{contact.name}</p>
                        <p className="text-slate-400">{contact.relation}</p>
                      </div>
                      <a href={`tel:${contact.phone}`} className="text-teal-300 hover:text-teal-200 font-semibold">Call</a>
                    </li>
                  )) : <li>No contacts provided.</li>}
                </ul>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminDigitalIds;
