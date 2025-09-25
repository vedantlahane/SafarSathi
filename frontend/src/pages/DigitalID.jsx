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
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="bg-white px-6 py-4 rounded-2xl shadow-lg border border-slate-200">Loading digital ID...</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 p-6"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="bg-white/80 backdrop-blur border border-white/60 rounded-3xl p-6 shadow">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">{t('common.appName')}</p>
              <h1 className="text-3xl font-bold text-slate-800">{t('digitalId.title')}</h1>
              <p className="text-sm text-slate-500 mt-2">Logged in as {user?.email}</p>
            </div>
            <div className="bg-teal-50 border border-teal-200 text-teal-700 rounded-2xl px-4 py-3 text-sm max-w-xs">
              <p className="font-semibold">Tamper-proof identity</p>
              <p>Verified on blockchain ledger • {digitalId.blockchainID}</p>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <DigitalIDCard profile={profile} digitalId={digitalId} />
            <ItineraryTimeline itinerary={itinerary} />
          </div>
          <div className="space-y-6">
            <EmergencyContacts contacts={contacts} />
            <IoTDevicesPanel devices={iotDevices} />
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BlockchainLogList logs={blockchainLogs} />
          <div className="bg-white/90 border border-slate-200 rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">🛡️ Data Privacy</h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li>• End-to-end encrypted storage of KYC records.</li>
              <li>• Blockchain hash ensures tamper-proof incident trail.</li>
              <li>• Visitor can revoke access anytime from Safety Center.</li>
            </ul>
          </div>
        </section>
      </div>
    </motion.div>
  );
};

export default DigitalID;
