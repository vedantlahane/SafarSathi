import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useAuth } from '../services/AuthContext';
import { useTouristData } from '../services/TouristDataContext';
import DigitalIDCard from '../components/DigitalIDCard';
import ItineraryTimeline from '../components/ItineraryTimeline';
import EmergencyContacts from '../components/EmergencyContacts';
import BlockchainLogList from '../components/BlockchainLogList';
import IoTDevicesPanel from '../components/IoTDevicesPanel';

const DigitalID = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { profile, itinerary, contacts, blockchainLogs, iotDevices, getDigitalIdPayload } = useTouristData();
  const [digitalId, setDigitalId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const payload = await getDigitalIdPayload();
        setDigitalId(payload);
      } catch (error) {
        console.error('Unable to fetch digital ID', error);
        toast.error('Failed to load digital ID');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [getDigitalIdPayload]);

  if (loading || !profile || !digitalId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-100">
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 px-6 py-4 shadow-lg backdrop-blur">
          Loading digital ID…
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 text-slate-100"
    >
      <header className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 shadow-md backdrop-blur">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{t('common.appName')}</p>
            <h1 className="text-2xl font-semibold text-white">{t('digitalId.title')}</h1>
            <p className="mt-1 text-sm text-slate-300">Logged in as {user?.email}</p>
          </div>
          <div className="rounded-2xl border border-teal-400/30 bg-teal-500/15 px-4 py-3 text-xs text-teal-100">
            <p className="font-semibold">Tamper-proof identity</p>
            <p className="mt-1 text-teal-200/80">Verified on blockchain ledger • {digitalId.blockchainID}</p>
          </div>
        </div>
      </header>

      <section className="space-y-6">
        <DigitalIDCard profile={profile} digitalId={digitalId} />
        <ItineraryTimeline itinerary={itinerary} />
        <EmergencyContacts contacts={contacts} />
        <IoTDevicesPanel devices={iotDevices} />
        <BlockchainLogList logs={blockchainLogs} />
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
          <h3 className="mb-3 text-base font-semibold text-white">🛡️ Data Privacy</h3>
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex items-start gap-2"><span aria-hidden>•</span><span>End-to-end encrypted storage of KYC records.</span></li>
            <li className="flex items-start gap-2"><span aria-hidden>•</span><span>Blockchain hash ensures tamper-proof incident trail.</span></li>
            <li className="flex items-start gap-2"><span aria-hidden>•</span><span>Visitor can revoke access anytime from Safety Center.</span></li>
          </ul>
        </div>
      </section>
    </motion.div>
  );
};

export default DigitalID;
