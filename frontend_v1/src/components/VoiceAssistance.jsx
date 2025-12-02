import { useState } from 'react';

const presets = [
  {
    id: 'distress',
    label: 'Play Distress Message',
    text: 'This is SafarSathi emergency broadcast. A tourist nearby needs immediate assistance. Please respond.'
  },
  {
    id: 'local-help',
    label: 'Local Language Assistance',
    text: 'দয়া কৰি সহায় কৰক। মই বিপদত আছোঁ। পুলিচলৈ জনাব।'
  },
  {
    id: 'family',
    label: 'Notify Family',
    text: 'SafarSathi alert. I need help. Please contact local authorities using the app link.'
  }
];

const VoiceAssistance = () => {
  const [customMessage, setCustomMessage] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = (message) => {
    if (!window.speechSynthesis) {
      alert('Speech synthesis not supported on this browser.');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = 'en-IN';
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handlePreset = (text) => {
    speak(text);
  };

  const handleCustomSpeak = () => {
    if (!customMessage.trim()) return;
    speak(customMessage.trim());
    setCustomMessage('');
  };

  return (
    <div className="bg-white/90 border border-slate-200 rounded-3xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800">🗣️ Voice Assistance</h3>
        {isSpeaking && <span className="text-xs text-emerald-600">Broadcasting...</span>}
      </div>
      <div className="space-y-3">
        {presets.map(preset => (
          <button
            key={preset.id}
            onClick={() => handlePreset(preset.text)}
            className="w-full text-left px-4 py-3 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50 transition"
          >
            {preset.label}
          </button>
        ))}
      </div>
      <div className="mt-5">
        <textarea
          rows={3}
          value={customMessage}
          onChange={(event) => setCustomMessage(event.target.value)}
          placeholder="Compose custom voice alert..."
          className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
        <div className="mt-2 flex justify-end">
          <button
            onClick={handleCustomSpeak}
            className="px-3 py-2 text-sm font-semibold rounded-lg bg-teal-500 text-white hover:bg-teal-600"
          >
            Play Custom Message
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistance;
