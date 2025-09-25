import { useCallback, useRef, useState } from 'react';
import QRCode from 'react-qr-code';
import { toPng } from 'html-to-image';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

const DigitalIDCard = ({ profile, digitalId }) => {
  const cardRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2
      });
      const link = document.createElement('a');
      link.download = `${profile.name.replace(/\s+/g, '-')}-safarsathi-id.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Digital ID card downloaded');
    } catch (error) {
      console.error('Failed to download digital ID', error);
      toast.error('Unable to download ID card');
    } finally {
      setIsDownloading(false);
    }
  }, [profile?.name]);

  const handleShare = useCallback(async () => {
    const payload = {
      title: 'SafarSathi Digital ID',
      text: `Digital ID for ${profile.name}. Valid till ${dayjs(digitalId.expiresAt).format('DD MMM YYYY')}.`
    };

    try {
      if (navigator.share) {
        await navigator.share(payload);
        toast.success('Digital ID shared securely');
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
        toast.info('Share data copied to clipboard');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        toast.error('Unable to share ID');
      }
    }
  }, [profile?.name, digitalId?.expiresAt]);

  return (
    <div className="bg-white/90 backdrop-blur rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-teal-500 to-blue-500 text-white flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest opacity-80">SafarSathi Digital ID</p>
          <h2 className="text-xl font-semibold">{profile.name}</h2>
        </div>
        <div className="text-right text-xs opacity-80">
          <p>Valid till</p>
          <p className="font-semibold">{dayjs(digitalId.expiresAt).format('DD MMM YYYY')}</p>
        </div>
      </div>

      <div ref={cardRef} className="px-6 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center space-x-3">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-20 h-20 rounded-2xl border-2 border-teal-500 object-cover"
            />
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500">Blockchain ID</p>
              <p className="text-lg font-mono text-slate-800">{profile.blockchainID}</p>
              <p className="text-sm text-slate-500">Passport: {profile.passportNumber}</p>
              <p className="text-sm text-slate-500">Aadhaar: {profile.aadhaar}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-slate-400 uppercase">Nationality</p>
              <p className="font-semibold text-slate-700">{profile.nationality}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase">Trip Window</p>
              <p className="font-semibold text-slate-700">
                {dayjs(profile.tripStart).format('DD MMM')} - {dayjs(profile.tripEnd).format('DD MMM')}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase">Safety score</p>
              <p className="font-semibold text-teal-600">{digitalId.safetyScore}/100</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase">Emergency opt-in</p>
              <p className="font-semibold text-slate-700">{profile.emergencyOptIn ? 'Enabled' : 'Disabled'}</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase mb-1">Last known location</p>
            <p className="text-sm text-slate-600">{digitalId.lastKnownLocation.label}</p>
            <p className="text-xs text-slate-400 mt-1">
              ({digitalId.lastKnownLocation.lat.toFixed(3)}, {digitalId.lastKnownLocation.lng.toFixed(3)})
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-inner">
            <QRCode
              value={JSON.stringify({
                blockchainID: profile.blockchainID,
                name: profile.name,
                expiresAt: digitalId.expiresAt
              })}
              size={128}
            />
            <p className="text-xs text-center text-slate-500 mt-2">Scan to verify identity</p>
          </div>

          <div className="text-xs text-slate-400 text-center">
            <p>Issued by Assam Tourism</p>
            <p>Auth hash: 0x8A42...F1A3</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-slate-50 flex flex-wrap gap-3 justify-end">
        <button
          onClick={handleShare}
          className="px-3 py-2 text-sm font-medium rounded-lg bg-white border border-slate-200 hover:bg-slate-100 transition"
        >
          🔗 Share Secure Link
        </button>
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="px-3 py-2 text-sm font-medium rounded-lg bg-teal-500 text-white hover:bg-teal-600 transition disabled:opacity-50"
        >
          {isDownloading ? 'Preparing...' : '⬇️ Download ID Card'}
        </button>
      </div>
    </div>
  );
};

export default DigitalIDCard;
