import gtranslate from 'gtranslate';

class GTranslateService {
  constructor() {
    this.cache = new Map();
  }

  // Generate cache key
  getCacheKey(text, targetLang, sourceLang = 'en') {
    return `${sourceLang}-${targetLang}-${text}`;
  }

  // Translate text using gtranslate
  async translateText(text, targetLang, sourceLang = 'en') {
    // Don't translate if target language is same as source
    if (targetLang === sourceLang) {
      return text;
    }

    // Don't translate empty or very short text
    if (!text || text.trim().length < 2) {
      return text;
    }

    const cacheKey = this.getCacheKey(text, targetLang, sourceLang);
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const result = await gtranslate(text, {
        from: sourceLang,
        to: targetLang
      });

      const translatedText = result.text || result.translated || text;
      
      // Cache the result
      this.cache.set(cacheKey, translatedText);
      return translatedText;
    } catch (error) {
      console.error('GTranslate error:', error);
      return text; // Return original text on error
    }
  }

  // Batch translation for multiple texts
  async translateBatch(textArray, targetLang, sourceLang = 'en') {
    const promises = textArray.map(text => 
      this.translateText(text, targetLang, sourceLang)
    );
    return Promise.all(promises);
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Get supported languages
  getSupportedLanguages() {
    return ['en', 'hi', 'as', 'bn', 'ta'];
  }
}

// Export singleton instance
export default new GTranslateService();