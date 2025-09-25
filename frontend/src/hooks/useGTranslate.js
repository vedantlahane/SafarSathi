import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import gtranslateService from '../services/gtranslateService';

export const useGTranslate = () => {
  const { i18n } = useTranslation();
  const [isTranslating, setIsTranslating] = useState(false);

  const translateText = useCallback(async (text, targetLang = null) => {
    if (!text) return text;
    
    const currentLang = targetLang || i18n.language;
    
    // Don't translate if it's English
    if (currentLang === 'en') {
      return text;
    }

    setIsTranslating(true);
    try {
      const translatedText = await gtranslateService.translateText(text, currentLang);
      return translatedText;
    } catch (error) {
      console.error('Translation failed:', error);
      return text; // Fallback to original text
    } finally {
      setIsTranslating(false);
    }
  }, [i18n.language]);

  const translateBatch = useCallback(async (textArray, targetLang = null) => {
    if (!Array.isArray(textArray)) return textArray;
    
    const currentLang = targetLang || i18n.language;
    
    if (currentLang === 'en') {
      return textArray;
    }

    setIsTranslating(true);
    try {
      const translations = await gtranslateService.translateBatch(textArray, currentLang);
      return translations;
    } catch (error) {
      console.error('Batch translation failed:', error);
      return textArray;
    } finally {
      setIsTranslating(false);
    }
  }, [i18n.language]);

  const clearCache = useCallback(() => {
    gtranslateService.clearCache();
  }, []);

  return {
    translateText,
    translateBatch,
    isTranslating,
    clearCache,
    currentLanguage: i18n.language
  };
};