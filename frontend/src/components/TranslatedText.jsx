import React, { useState, useEffect } from 'react';
import { useGTranslate } from '../hooks/useGTranslate';

// Component that automatically translates text content
export const TranslatedText = ({ 
  children, 
  fallback = null, 
  className = '',
  tag = 'span' 
}) => {
  const [translatedText, setTranslatedText] = useState(children);
  const { translateText, isTranslating, currentLanguage } = useGTranslate();

  useEffect(() => {
    const performTranslation = async () => {
      if (typeof children === 'string' && children.trim() && currentLanguage !== 'en') {
        const translated = await translateText(children);
        setTranslatedText(translated);
      } else {
        setTranslatedText(children);
      }
    };

    performTranslation();
  }, [children, currentLanguage, translateText]);

  const Tag = tag;

  if (isTranslating && fallback) {
    return <Tag className={className}>{fallback}</Tag>;
  }

  return <Tag className={className}>{translatedText}</Tag>;
};

export default TranslatedText;