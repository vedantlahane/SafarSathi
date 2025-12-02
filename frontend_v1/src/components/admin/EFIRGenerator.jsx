import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { useTouristData } from '../../services/TouristDataContext';

const EFIRGenerator = ({ defaultTourist }) => {
  const { createEFIR } = useTouristData();
  const [reason, setReason] = useState('Missing contact for over 60 minutes');
  const [location, setLocation] = useState(defaultTourist?.lastKnownArea || '');
  const [draft, setDraft] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGenerate = async (event) => {
    event.preventDefault();
    if (!defaultTourist) {
      toast.error('Select a tourist to generate an E-FIR');
      return;
    }

    setIsSubmitting(true);
    try {
      const generated = await createEFIR({
        touristId: defaultTourist.id,
        reason,
        location
      });
      setDraft(generated);
      toast.success('E-FIR draft prepared');
    } catch (error) {
      console.error('Failed to generate E-FIR', error);
      toast.error('Unable to create e-FIR draft');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 border border-teal-500/40 rounded-2xl p-6 text-white"
    >
      <h2 className="text-lg font-semibold mb-4">📝 Automated E-FIR</h2>
      <form onSubmit={handleGenerate} className="space-y-4">
        <div>
          <label className="text-sm text-slate-200 block mb-1">Tourist ID</label>
          <input
            type="text"
            value={defaultTourist?.id || ''}
            readOnly
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-slate-100"
          />
        </div>
        <div>
          <label className="text-sm text-slate-200 block mb-1">Reason</label>
          <textarea
            rows={3}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
        </div>
        <div>
          <label className="text-sm text-slate-200 block mb-1">Last known location</label>
          <input
            type="text"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-teal-500 via-sky-500 to-indigo-500 text-white font-semibold py-2 rounded-lg disabled:opacity-60"
        >
          {isSubmitting ? 'Generating...' : 'Generate E-FIR Draft'}
        </motion.button>
      </form>
      {draft && (
        <div className="mt-5 bg-white/10 border border-white/20 rounded-xl p-4 text-sm">
          <p className="font-semibold text-teal-200">Draft #{draft.firNumber}</p>
          <p className="text-slate-200 mt-2">Filed at: {new Date(draft.filedAt).toLocaleString()}</p>
          <p className="text-slate-200">Reason: {draft.reason}</p>
          <p className="text-slate-200">Location: {draft.location}</p>
          <p className="text-slate-400 mt-2">Download link will be emailed to district control room.</p>
        </div>
      )}
    </motion.div>
  );
};

export default EFIRGenerator;
