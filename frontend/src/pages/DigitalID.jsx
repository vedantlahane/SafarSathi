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
      <div className="flex min-h-[100svh] items-center justify-center bg-slate-950 text-slate-100">
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
      className="min-h-[100svh] bg-slate-950 px-4 py-6 text-slate-100 sm:px-6"
    >
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-lg backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t('common.appName')}</p>
              <h1 className="text-3xl font-semibold text-white sm:text-4xl">{t('digitalId.title')}</h1>
              <p className="mt-2 text-sm text-slate-300">Logged in as {user?.email}</p>
            </div>
            <div className="max-w-xs rounded-2xl border border-teal-400/40 bg-teal-600/20 px-4 py-3 text-sm text-teal-100">
              <p className="font-semibold">Tamper-proof identity</p>
              <p className="mt-1 text-xs text-teal-200/80">Verified on blockchain ledger • {digitalId.blockchainID}</p>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <DigitalIDCard profile={profile} digitalId={digitalId} />
            <ItineraryTimeline itinerary={itinerary} />
          </div>
          <div className="space-y-6">
            <EmergencyContacts contacts={contacts} />
            <IoTDevicesPanel devices={iotDevices} />
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <BlockchainLogList logs={blockchainLogs} />
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">🛡️ Data Privacy</h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-2"><span aria-hidden>•</span><span>End-to-end encrypted storage of KYC records.</span></li>
              <li className="flex items-start gap-2"><span aria-hidden>•</span><span>Blockchain hash ensures tamper-proof incident trail.</span></li>
              <li className="flex items-start gap-2"><span aria-hidden>•</span><span>Visitor can revoke access anytime from Safety Center.</span></li>
            </ul>
          </div>
        </section>
      </div>
    </motion.div>
  );
};

export default DigitalID;
