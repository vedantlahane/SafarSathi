// services/ocrService.js - Simplified mock OCR utility for SafarSathi
import Tesseract from 'tesseract.js';

const sanitizeText = (rawText) => {
  if (!rawText) return '';
  return rawText
    .replace(/[\u2010-\u2015]/g, '-')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u0964\u0965]/g, '.')
    .replace(/\s+/g, ' ')
    .trim();
};

const normalizePhone = (value) => {
  const digits = value.replace(/[^\d]/g, '');
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  return null;
};

const normalizeGender = (value) => {
  const gender = value.trim().toLowerCase();
  if (['male', 'm'].includes(gender)) return 'Male';
  if (['female', 'f'].includes(gender)) return 'Female';
  return null;
};

const normalizeDate = (value) => {
  const match = value.match(/(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/);
  if (!match) return null;
  const [, d, m, y] = match;
  const year = y.length === 2 ? `20${y}` : y;
  const day = d.padStart(2, '0');
  const month = m.padStart(2, '0');
  if (Number(year) < 1900 || Number(year) > new Date().getFullYear()) return null;
  return `${year}-${month}-${day}`;
};

const detectDocumentType = (text) => {
  if (/\bpassport\b/i.test(text) || /[A-Z]\d{7}/.test(text)) {
    return 'passport';
  }
  if (/\b(?:aadhaar|uidai|uid)\b/i.test(text) || /\d{4}\s*\d{4}\s*\d{4}/.test(text)) {
    return 'aadhaar';
  }
  return 'other';
};

const extractFields = (text) => {
  const fields = {};

  const simplePatterns = [
    { key: 'name', regex: /(?:name|card holder|नाम)[:\s]*([A-Z][A-Za-z\s]{2,40})/i },
    { key: 'dateOfBirth', regex: /(?:dob|date of birth|जन्म)[:\s]*([\d\/\-.]{6,10})/i, transform: normalizeDate },
    { key: 'gender', regex: /(?:gender|sex|लिंग)[:\s]*(male|female|m|f)/i, transform: normalizeGender },
    { key: 'nationality', regex: /(?:nationality|citizenship)[:\s]*([A-Za-z\s]{3,30})/i },
    { key: 'address', regex: /(?:address|residence|पता)[:\s]*([A-Za-z0-9,\-\/\s]{10,200})/i },
    { key: 'phone', regex: /(?:phone|mobile|contact)[:\s]*(\+?\d[\d\s-]{9,14})/i, transform: normalizePhone }
  ];

  simplePatterns.forEach(({ key, regex, transform }) => {
    const match = text.match(regex);
    if (!match || !match[1]) return;
    const value = match[1].trim();
    const transformed = transform ? transform(value) : value;
    if (transformed) {
      fields[key] = transformed;
    }
  });

  const aadhaarMatch = text.match(/(\d{4}\s*\d{4}\s*\d{4})/);
  if (aadhaarMatch) {
    const digits = aadhaarMatch[1].replace(/\s+/g, '');
    if (digits.length === 12) fields.idNumber = digits;
  }

  const passportMatch = text.match(/(?:passport no\.?|passport)[:\s]*([A-Z]\d{7})/i);
  if (passportMatch) {
    fields.idNumber = passportMatch[1];
  }

  return fields;
};

export class OCRService {
  static async preprocessImage(file) {
    return new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        const scale = 1.5;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => resolve(blob || file), 'image/png', 0.95);
      };

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          img.src = event.target.result;
        }
      };
      reader.readAsDataURL(file);
    });
  }

  static async extractTextFromImage(file, onProgress) {
    try {
      const processedImage = await this.preprocessImage(file);
      const result = await Tesseract.recognize(processedImage, 'eng', {
        logger: (message) => {
          if (message.status === 'recognizing text' && onProgress) {
            onProgress(message.progress ?? 0);
          }
        },
        tessedit_pageseg_mode: Tesseract.PSM.AUTO
      });

      return sanitizeText(result.data.text);
    } catch (error) {
      console.error('OCR extraction error', error);
      return '';
    }
  }

  static async processDocument(file, onProgress) {
    try {
      const text = await this.extractTextFromImage(file, onProgress);
      const documentType = detectDocumentType(text);
      const fields = extractFields(text);
      return { ...fields, documentType };
    } catch (error) {
      console.error('Document processing error', error);
      return { documentType: 'unknown' };
    }
  }
}

export default OCRService;