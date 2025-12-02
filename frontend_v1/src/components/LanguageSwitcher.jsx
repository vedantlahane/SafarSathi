import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'as', label: 'অসমীয়া' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'ta', label: 'தমিழ்' }
];

const LanguageSwitcher = ({ compact = false }) => {
  const { i18n } = useTranslation();

  const handleChange = (event) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <div className="flex items-center space-x-2 text-sm">
      {!compact && <span className="text-slate-500">🌐</span>}
      <select
        aria-label="Select language"
        value={i18n.language}
        onChange={handleChange}
        className="bg-white/70 border border-slate-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
      >
        {languages.map(lang => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSwitcher;