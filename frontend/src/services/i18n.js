import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      common: {
        appName: 'SafarSathi',
        logout: 'Logout',
        sos: 'Emergency SOS',
        shareLocation: 'Share Location',
        quickActions: 'Quick Actions',
        emergencyContacts: 'Emergency Contacts'
      },
      dashboard: {
        greeting: 'Welcome back, {{name}}',
        safetyScore: 'Safety Score',
        safePlaces: 'Safe Places',
        alertsSent: 'Alerts Sent',
        activeTime: 'Active Time',
        tipsTitle: 'Safety Tips'
      },
      digitalId: {
        title: 'Digital Tourist ID',
        download: 'Download ID Card',
        share: 'Share Secure Link',
        itinerary: 'Upcoming Itinerary',
        blockchainLog: 'Blockchain Trail'
      },
      safetyCenter: {
        title: 'Safety Center',
        anomalyFeed: 'AI Anomaly Feed',
        geofence: 'Geo-fence Alerts',
        tracking: 'Tracking Preferences'
      }
    }
  },
  hi: {
    translation: {
      common: {
        appName: 'सफर साथी',
        logout: 'लॉग आउट',
        sos: 'आपातकाल SOS',
        shareLocation: 'स्थान साझा करें',
        quickActions: 'त्वरित क्रियाएँ',
        emergencyContacts: 'आपातकालीन संपर्क'
      },
      dashboard: {
        greeting: 'वापसी पर स्वागत है, {{name}}',
        safetyScore: 'सुरक्षा स्कोर',
        safePlaces: 'सुरक्षित स्थान',
        alertsSent: 'भेजे गए अलर्ट',
        activeTime: 'सक्रिय समय',
        tipsTitle: 'सुरक्षा सुझाव'
      },
      digitalId: {
        title: 'डिजिटल पर्यटक आईडी',
        download: 'आईडी कार्ड डाउनलोड करें',
        share: 'सुरक्षित लिंक साझा करें',
        itinerary: 'आगामी यात्रा योजना',
        blockchainLog: 'ब्लॉकचेन रिकॉर्ड'
      },
      safetyCenter: {
        title: 'सुरक्षा केंद्र',
        anomalyFeed: 'एआई विसंगति फ़ीड',
        geofence: 'जियो-फेंस अलर्ट',
        tracking: 'ट्रैकिंग प्राथमिकताएँ'
      }
    }
  },
  as: {
    translation: {
      common: {
        appName: 'সফৰসাথী',
        logout: 'লগ আউট',
        sos: 'জৰুৰী সহায়',
        shareLocation: 'অবস্থান ভাগ কৰক',
        quickActions: 'দ্ৰুত কাৰ্য',
        emergencyContacts: 'জৰুৰী যোগাযোগ'
      },
      dashboard: {
        greeting: 'পুনৰ স্বাগতম, {{name}}',
        safetyScore: 'সুৰক্ষা স্কোৰ',
        safePlaces: 'নিরাপদ স্থান',
        alertsSent: 'পঠিওৱা সতৰ্কবাৰ্তা',
        activeTime: 'সক্রিয় সময়',
        tipsTitle: 'সুৰক্ষা টিপছ'
      },
      digitalId: {
        title: 'ডিজিটেল পৰ্যটক আইডি',
        download: 'আইডি কাৰ্ড ডাউনলোড কৰক',
        share: 'সুৰক্ষিত লিংক শ্বেয়াৰ কৰক',
        itinerary: 'আসন্ন ভ্ৰমণ পৰিকল্পনা',
        blockchainLog: 'ব্লকচেইন ৰেকৰ্ড'
      },
      safetyCenter: {
        title: 'সুৰক্ষা কেন্দ্ৰ',
        anomalyFeed: 'এআই অনিয়ম ফীড',
        geofence: 'জিঅফেন্স সতৰ্কবাৰ্তা',
        tracking: 'ট্ৰেকিং পছন্দ'
      }
    }
  },
  bn: {
    translation: {
      common: {
        appName: 'সফরসাথী',
        logout: 'লগ আউট',
        sos: 'জরুরি SOS',
        shareLocation: 'অবস্থান শেয়ার করুন',
        quickActions: 'দ্রুত পদক্ষেপ',
        emergencyContacts: 'জরুরি যোগাযোগ'
      },
      dashboard: {
        greeting: 'ফিরে আসায় স্বাগতম, {{name}}',
        safetyScore: 'নিরাপত্তা স্কোর',
        safePlaces: 'নিরাপদ স্থান',
        alertsSent: 'পাঠানো সতর্কতা',
        activeTime: 'সক্রিয় সময়',
        tipsTitle: 'নিরাপত্তা পরামর্শ'
      },
      digitalId: {
        title: 'ডিজিটাল পর্যটক আইডি',
        download: 'আইডি কার্ড ডাউনলোড করুন',
        share: 'নিরাপদ লিংক শেয়ার করুন',
        itinerary: 'আসন্ন ভ্রমণ পরিকল্পনা',
        blockchainLog: 'ব্লকচেইন রেকর্ড'
      },
      safetyCenter: {
        title: 'নিরাপত্তা কেন্দ্র',
        anomalyFeed: 'এআই অস্বাভাবিকতা ফিড',
        geofence: 'জিও-ফেন্স সতর্কতা',
        tracking: 'ট্র্যাকিং পছন্দ'
      }
    }
  },
  ta: {
    translation: {
      common: {
        appName: 'சஃபர்சாதி',
        logout: 'வெளியேறு',
        sos: 'அவசர உதவி',
        shareLocation: 'இருப்பிடத்தை பகிர்',
        quickActions: 'விரைவு செயல்கள்',
        emergencyContacts: 'அவசர தொடர்புகள்'
      },
      dashboard: {
        greeting: 'மீண்டும் வருக, {{name}}',
        safetyScore: 'பாதுகாப்பு மதிப்பெண்',
        safePlaces: 'பாதுகாப்பான இடங்கள்',
        alertsSent: 'அனுப்பிய எச்சரிக்கைகள்',
        activeTime: 'செயலில் இருந்த நேரம்',
        tipsTitle: 'பாதுகாப்பு குறிப்புகள்'
      },
      digitalId: {
        title: 'டிஜிட்டல் சுற்றுலா அடையாளம்',
        download: 'அடையாள அட்டையை பதிவிறக்கு',
        share: 'பாதுகாப்பான இணைப்பை பகிர்',
        itinerary: 'வரவிருக்கும் பயண திட்டம்',
        blockchainLog: 'பிளாக்செயின் பதிவுகள்'
      },
      safetyCenter: {
        title: 'பாதுகாப்பு மையம்',
        anomalyFeed: 'ஏ.ஐ. அசாதாரண செயல்பாடுகள்',
        geofence: 'ஜியோ-வேலி எச்சரிக்கைகள்',
        tracking: 'பின்தொடர்பு விருப்பங்கள்'
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
