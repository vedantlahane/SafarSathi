//services/ocrService.js
import Tesseract from 'tesseract.js';

export class OCRService {
    static async preprocessImage(file) {
        return new Promise((resolve) => {
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            img.onload = () => {
                // Set canvas size with better resolution
                const scale = 2; // Upscale for better OCR
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;

                // Enable image smoothing for better scaling
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';

                // Draw image on canvas with scaling
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                // Apply image preprocessing for better OCR
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                // Enhanced preprocessing for better text recognition
                for (let i = 0; i < data.length; i += 4) {
                    // Convert to grayscale
                    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;

                    // Apply stronger contrast enhancement for Aadhaar cards
                    const contrast = ((gray - 128) * 1.5) + 128;

                    // Apply threshold to make text more distinct
                    let finalValue = Math.max(0, Math.min(255, contrast));

                    // Binary threshold for cleaner text (adjust based on image)
                    if (finalValue > 180) {
                        finalValue = 255; // Pure white
                    } else if (finalValue < 80) {
                        finalValue = 0;   // Pure black
                    }

                    data[i] = finalValue;     // red
                    data[i + 1] = finalValue; // green
                    data[i + 2] = finalValue; // blue
                }

                ctx.putImageData(imageData, 0, 0);

                // Convert canvas to blob with high quality
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, 'image/png', 0.95);
            };

            // Load image from file
            const reader = new FileReader();
            reader.onload = (e) => {
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    static async extractTextFromImage(file, onProgress) {
        try {
            // Preprocess image for better OCR
            const processedImage = await this.preprocessImage(file);

            // Try multiple OCR configurations for better results
            let text = '';
            let bestResult = null;

            // Configuration 1: Standard English OCR
            try {
                const result1 = await Tesseract.recognize(processedImage, 'eng', {
                    logger: (m) => {
                        if (m.status === 'recognizing text' && onProgress) {
                            const progress = Math.round(m.progress * 50); // First half
                            onProgress(progress);
                        }
                    },
                    tessedit_pageseg_mode: Tesseract.PSM.AUTO,
                    preserve_interword_spaces: '1',
                    tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY
                });

                bestResult = result1;
                text = result1.data.text;
                console.log('Standard OCR completed with confidence:', result1.data.confidence);
            } catch (e) {
                console.warn('Standard OCR failed, trying alternative...');
            }

            // Configuration 2: More permissive character set for Aadhaar cards (as fallback)
            if (!bestResult) {
                try {
                    const result2 = await Tesseract.recognize(processedImage, 'eng', {
                        logger: (m) => {
                            if (m.status === 'recognizing text' && onProgress) {
                                const progress = 50 + Math.round(m.progress * 50); // Second half
                                onProgress(progress);
                            }
                        },
                        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789/<>-.,:()/ ',
                        tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
                        preserve_interword_spaces: '1',
                        tessedit_ocr_engine_mode: Tesseract.OEM.DEFAULT
                    });

                    if (!bestResult) {
                        bestResult = result2;
                        text = result2.data.text;
                        console.log('Alternative OCR completed with confidence:', result2.data.confidence);
                    }
                } catch (e) {
                    console.warn('Alternative OCR also failed');
                }
            }

            if (!text && bestResult) {
                text = bestResult.data.text || '';
            }

            // Ensure we always have some text, even if it's empty
            text = text || '';

            console.log('OCR Confidence:', bestResult?.data.confidence || 'Unknown');
            console.log('OCR completed, processing text...');

            // Clean up common OCR artifacts and special characters
            text = text
                .replace(/く/g, '<')  // Replace Japanese character with proper <
                .replace(/＜/g, '<')  // Replace full-width < with normal <
                .replace(/[^\x00-\x7F]/g, match => {
                    // Replace non-ASCII characters that might be OCR errors
                    const replacements = {
                        'く': '<',
                        '＜': '<',
                        '》': '>',
                        '：': ':',
                        '／': '/',
                        '－': '-',
                        '・': '.',
                        '，': ',',
                        '　': ' ',
                        'ऽ': '',
                        'ा': 'a',
                        'ी': 'i',
                        'े': 'e'
                    };
                    return replacements[match] || '';
                })
                .replace(/\s+/g, ' ')  // Normalize whitespace
                .trim();

            console.log('Cleaned OCR text:', text);
            console.log('Text preview (first 200 chars):', text.substring(0, 200));

            return text;
        } catch (error) {
            console.error('OCR processing error:', error);
            // Return empty string instead of throwing error to allow manual form filling
            console.warn('Returning empty text to allow manual form filling');
            return '';
        }
    }

    static extractAadhaarInfo(text) {
        const cleanText = text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
        const extracted = {};

        console.log('Processing Aadhaar text:', cleanText);

        // Aadhaar number pattern - 12 digits
        const aadhaarMatch = cleanText.match(/(\d{4}\s*\d{4}\s*\d{4})/);
        if (aadhaarMatch) {
            const aadhaar = aadhaarMatch[0].replace(/\s/g, '');
            if (aadhaar.length === 12) {
                extracted.idNumber = aadhaar;
                console.log('Extracted Aadhaar number:', aadhaar);
            }
        }

        // Enhanced name patterns for Aadhaar - more comprehensive and flexible
        const namePatterns = [
            // Most common: Name on first line or before relationship
            /^([A-Z][A-Za-z\s]{3,45})\s*(?:\n|\r|D\/O|S\/O|W\/O|DOB|जन्म|Address|पता|\d{4})/im,

            // Name before relationship indicators with flexible spacing
            /([A-Z][A-Za-z\s]{3,45})\s*(?:D\/O|S\/O|W\/O|पुत्र|पुत्री|पत्नी)\s*[:]*\s*([A-Z][A-Za-z\s]{3,45})/i,

            // Name with explicit labels
            /(?:Name|नाम|Card\s*Holder)[:\s]*([A-Z][A-Za-z\s]{3,45})/i,

            // Name before DOB with various formats
            /([A-Z][A-Za-z\s]{3,45})\s*(?:DOB|Date\s*of\s*Birth|जन्म\s*तिथि)[:\s]*\d/i,

            // Name followed by address
            /([A-Z][A-Za-z\s]{3,45})\s*(?:Address|पता|Add)[:\s]/i,

            // Line-by-line name detection (3+ capital words)
            /^([A-Z][A-Z\s]{6,45})$/m,

            // Multiple capital words not followed by numbers or common words
            /\b([A-Z][A-Za-z]{2,12}\s+[A-Z][A-Za-z]{2,12}(?:\s+[A-Z][A-Za-z]{2,12})?)\b(?!\s*(?:\d|Address|DOB|Male|Female|Government|India|Aadhaar))/i
        ];

        for (const pattern of namePatterns) {
            const match = cleanText.match(pattern);
            if (match && match[1]) {
                let name = match[1].trim();

                // Clean up name - remove extra spaces and special characters
                name = name.replace(/[^A-Za-z\s]/g, '').replace(/\s+/g, ' ').trim();

                // Additional filtering to avoid false matches
                const excludeWords = ['GOVERNMENT', 'INDIA', 'UNIQUE', 'IDENTIFICATION', 'AUTHORITY', 'AADHAAR', 'CARD', 'NUMBER', 'ADDRESS', 'MALE', 'FEMALE'];
                const isValidName = !excludeWords.some(word => name.toUpperCase().includes(word));

                if (name.length >= 2 && name.length <= 50 && /^[A-Za-z\s]+$/.test(name) && isValidName) {
                    // Convert to proper case
                    name = name.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
                    extracted.name = name;
                    console.log('Extracted Aadhaar name:', name);
                    break;
                }
            }
        }

        // Enhanced manual extraction if standard patterns fail
        if (!extracted.name) {
            console.log('Standard patterns failed, trying enhanced manual extraction...');

            // Split text into lines and words for analysis
            const lines = cleanText.split(/[\n\r]+/).filter(line => line.trim().length > 0);
            const words = cleanText.split(/\s+/).filter(word => word.length > 0);

            // Try line-by-line analysis
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();

                // Skip obvious non-name lines
                if (/^\d+$/.test(line) ||
                    /^[^A-Za-z]*$/.test(line) ||
                    line.length < 3 ||
                    line.length > 50 ||
                    /(?:Address|DOB|Date|Birth|Male|Female|Government|India|Aadhaar|Card|Number|PIN|VID|QR)/i.test(line)) {
                    continue;
                }

                // Look for name patterns
                if (/^[A-Z][A-Za-z\s]{2,45}$/.test(line)) {
                    // Check if next line contains relationship info (confirms this is a name)
                    const nextLine = lines[i + 1];
                    if (nextLine && /(?:D\/O|S\/O|W\/O|पुत्र|पुत्री)/i.test(nextLine)) {
                        const name = line.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
                        extracted.name = name;
                        console.log('Line-by-line extraction - Aadhaar name:', name);
                        break;
                    }
                    // If it's the first substantial line, likely a name
                    else if (i <= 2) {
                        const name = line.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
                        extracted.name = name;
                        console.log('First line extraction - Aadhaar name:', name);
                        break;
                    }
                }
            }

            // If still no name, try word combination analysis
            if (!extracted.name) {
                console.log('Trying word combination analysis...');

                for (let i = 0; i < words.length - 1; i++) {
                    const word1 = words[i];
                    const word2 = words[i + 1];
                    const word3 = words[i + 2] || '';

                    // Look for 2-3 consecutive capitalized words
                    if (/^[A-Z][A-Za-z]{2,15}$/.test(word1) &&
                        /^[A-Z][A-Za-z]{2,15}$/.test(word2) &&
                        !/(?:Address|DOB|Date|Birth|Male|Female|Government|India|Aadhaar|Card|Number)/i.test(word1) &&
                        !/(?:Address|DOB|Date|Birth|Male|Female|Government|India|Aadhaar|Card|Number)/i.test(word2)) {

                        let name = `${word1} ${word2}`;

                        // Add third word if it's also a name part
                        if (word3 && /^[A-Z][A-Za-z]{2,15}$/.test(word3) &&
                            !/(?:Address|DOB|Date|Birth|Male|Female|Government|India|Aadhaar|Card|Number)/i.test(word3)) {
                            name += ` ${word3}`;
                        }

                        if (name.length >= 6 && name.length <= 45) {
                            extracted.name = name.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
                            console.log('Word combination extraction - Aadhaar name:', extracted.name);
                            break;
                        }
                    }
                }
            }
        }

        // Date of birth patterns
        const dobPatterns = [
            /(?:DOB|Date of Birth|जन्म)[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i,
            /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/g
        ];

        for (const pattern of dobPatterns) {
            const matches = cleanText.match(pattern);
            if (matches) {
                for (const match of matches) {
                    const dateStr = match.replace(/[^\d\/\-\.]/g, '');
                    const formattedDate = this.formatDate(dateStr);
                    if (formattedDate) {
                        extracted.dateOfBirth = formattedDate;
                        console.log('Extracted DOB:', formattedDate);
                        break;
                    }
                }
                if (extracted.dateOfBirth) break;
            }
        }

        // Address patterns
        const addressPatterns = [
            /(?:Address|पता)[:\s]*([A-Za-z0-9\s,.\-\/]{10,200})/i,
            /(?:S\/O|D\/O|W\/O)[^,]*,\s*([A-Za-z0-9\s,.\-\/]{10,200})/i
        ];

        for (const pattern of addressPatterns) {
            const match = cleanText.match(pattern);
            if (match && match[1]) {
                let address = match[1].trim();
                address = address.replace(/\s+/g, ' ').substring(0, 200);
                if (address.length >= 10) {
                    extracted.address = address;
                    console.log('Extracted address:', address);
                    break;
                }
            }
        }

        // Enhanced Gender extraction for Aadhaar
        const genderPatterns = [
            /(?:Gender|Sex|लिंग)[:\s]*(Male|Female|M|F|पुरुष|महिला)/i,
            /\b(Male|Female|MALE|FEMALE|M|F)\b(?!\s*(?:\d|Address|DOB))/i,
            /(?:पुरुष|महिला)/i,
            // Sometimes gender appears alone on a line
            /^(Male|Female|M|F)$/im
        ];

        for (const pattern of genderPatterns) {
            const match = cleanText.match(pattern);
            if (match && match[1]) {
                const gender = match[1].toLowerCase();
                extracted.gender = (gender === 'm' || gender === 'male' || gender === 'पुरुष') ? 'Male' : 'Female';
                console.log('Extracted gender:', extracted.gender);
                break;
            }
        }

        // Mobile number
        const mobileMatch = cleanText.match(/(?:Mobile|Mob|मोबाइल)[:\s]*(\+?91\s*\d{10}|\d{10})/i);
        if (mobileMatch) {
            const mobile = mobileMatch[1].replace(/[^\d]/g, '');
            if (mobile.length === 10 || (mobile.length === 12 && mobile.startsWith('91'))) {
                extracted.phone = mobile.length === 12 ? mobile.substring(2) : mobile;
                console.log('Extracted mobile:', extracted.phone);
            }
        }

        // Auto-set nationality for Aadhaar cards
        extracted.nationality = 'Indian';
        console.log('Auto-set nationality to Indian for Aadhaar card');

        console.log('Final Aadhaar extraction result:', extracted);
        return extracted;
    }

    static extractPassportInfo(text) {
        const cleanText = text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
        const extracted = {};

        console.log('Processing passport text:', cleanText);

        // Enhanced passport number extraction - more flexible patterns
        const passportPatterns = [
            // Standard format with various labels (top section priority)
            /(?:Passport\s*(?:No|Number|#)\.?)[:\s]*([A-Z]\d{7})/i,
            /(?:Passport)[:\s]*([A-Z]\d{7})/i,
            /(?:No\.?)[:\s]*([A-Z]\d{7})/i,

            // Passport number on its own line (not in MRZ)
            /^([A-Z]\d{7})$/m,
            /\b([A-Z]\d{7})\b(?!\s*<)/,

            // With spacing variations
            /([A-Z]\s*\d{7})(?!\s*<)/,
            /([A-Z]\d{7})(?!\s*[<>])/,

            // MRZ format as last resort
            /([A-Z]\d{7})</,

            // Alternative 8-character format
            /Passport[:\s]*([A-Z0-9]{8})/i
        ];

        for (const pattern of passportPatterns) {
            const match = cleanText.match(pattern);
            if (match && match[1]) {
                const passport = match[1].trim();
                console.log('Found potential passport:', passport);
                if (/^[A-Z]\d{7}$/.test(passport)) {
                    extracted.idNumber = passport;
                    console.log('Extracted passport number:', passport);
                    break;
                }
            }
        }

        // Enhanced MRZ parsing for the bottom line
        // MRZ Format: P<COUNTRYSURNAME<<GIVENNAMES<<<<<<<<<<
        // Second line: PASSPORTNUMBER<DIGIT(NATIONALITY)(YYMMDD)(GENDER)(YYMMDD)(CHECKDIGIT)<<<<<<<<<<<<<<<DIGIT

        // Try to find MRZ lines
        const mrzLines = cleanText.match(/([A-Z0-9<]+){28,44}/g);
        if (mrzLines && mrzLines.length >= 2) {
            console.log('Found MRZ lines:', mrzLines);

            // Parse first MRZ line for names
            const firstLine = mrzLines[0];
            const nameMatch = firstLine.match(/P<([A-Z]{3})([A-Z]+)<<([A-Z<]+)/);
            if (nameMatch) {
                const nationality = nameMatch[1];
                const surname = nameMatch[2];
                const givenNames = nameMatch[3].replace(/</g, ' ').trim();

                // Convert nationality code to full name
                const countryNames = {
                    'IND': 'Indian',
                    'USA': 'American',
                    'GBR': 'British',
                    'CAN': 'Canadian',
                    'AUS': 'Australian',
                    'DEU': 'German',
                    'FRA': 'French'
                };

                extracted.nationality = countryNames[nationality] || nationality;
                extracted.name = `${givenNames} ${surname}`;
                console.log('MRZ extracted name:', extracted.name);
                console.log('MRZ extracted nationality:', extracted.nationality);
            }

            // Parse second MRZ line for passport number, DOB, gender
            const secondLine = mrzLines[1];
            console.log('Second MRZ line:', secondLine);

            // Updated regex pattern for second line parsing
            // Format: PASSPORTNUMBER<DIGIT NATIONALITY YYMMDD GENDER YYMMDD CHECKSUM <<<<<<<<<<<<<<<< DIGIT
            const mrzMatch = secondLine.match(/([A-Z]\d{7})<(\d)([A-Z]{3})(\d{6})([MF])(\d{6})(\d)/);

            if (mrzMatch) {
                console.log('MRZ match found:', mrzMatch);

                // Extract passport number if not already found
                if (!extracted.idNumber && mrzMatch[1]) {
                    extracted.idNumber = mrzMatch[1];
                    console.log('MRZ extracted passport number:', extracted.idNumber);
                }

                // Extract nationality if not already found
                if (!extracted.nationality && mrzMatch[3]) {
                    const countryCode = mrzMatch[3];
                    const countryNames = {
                        'IND': 'Indian',
                        'USA': 'American',
                        'GBR': 'British',
                        'CAN': 'Canadian',
                        'AUS': 'Australian'
                    };
                    extracted.nationality = countryNames[countryCode] || countryCode;
                    console.log('MRZ extracted nationality from second line:', extracted.nationality);
                }

                // Extract date of birth (YYMMDD format)
                if (mrzMatch[4]) {
                    const dobStr = mrzMatch[4]; // YYMMDD format
                    const year = parseInt(dobStr.substring(0, 2));
                    const month = dobStr.substring(2, 4);
                    const day = dobStr.substring(4, 6);

                    // Convert 2-digit year to 4-digit (assuming birth years 1930-2030)
                    const fullYear = year > 30 ? 1900 + year : 2000 + year;

                    const formattedDate = `${fullYear}-${month}-${day}`;
                    const dateObj = new Date(formattedDate);
                    if (dateObj.getFullYear() == fullYear && dateObj.getMonth() + 1 == month && dateObj.getDate() == day) {
                        extracted.dateOfBirth = formattedDate;
                        console.log('MRZ extracted DOB:', formattedDate);
                    }
                }

                // Extract gender
                if (mrzMatch[5]) {
                    extracted.gender = mrzMatch[5] === 'M' ? 'Male' : 'Female';
                    console.log('MRZ extracted gender:', extracted.gender);
                }

                // Extract expiry date (YYMMDD format)
                if (mrzMatch[6]) {
                    const expiryStr = mrzMatch[6]; // YYMMDD format
                    const year = parseInt(expiryStr.substring(0, 2));
                    const month = expiryStr.substring(2, 4);
                    const day = expiryStr.substring(4, 6);

                    // Convert 2-digit year to 4-digit (assuming expiry years 2020-2040)
                    const fullYear = year > 50 ? 1900 + year : 2000 + year;

                    const formattedDate = `${fullYear}-${month}-${day}`;
                    const dateObj = new Date(formattedDate);
                    if (dateObj.getFullYear() == fullYear && dateObj.getMonth() + 1 == month && dateObj.getDate() == day) {
                        extracted.expiryDate = formattedDate;
                        console.log('MRZ extracted expiry date:', formattedDate);
                    }
                }
            } else {
                console.log('MRZ second line pattern did not match, trying alternative patterns...');

                // Alternative parsing for different MRZ formats
                const altMatch = secondLine.match(/([A-Z]\d{7})<\d([A-Z]{3})(\d{6})[MF](\d{6})/);
                if (altMatch) {
                    console.log('Alternative MRZ match found:', altMatch);

                    if (!extracted.idNumber) {
                        extracted.idNumber = altMatch[1];
                    }

                    if (!extracted.nationality) {
                        const countryCode = altMatch[2];
                        const countryNames = {
                            'IND': 'Indian',
                            'USA': 'American',
                            'GBR': 'British',
                            'CAN': 'Canadian',
                            'AUS': 'Australian'
                        };
                        extracted.nationality = countryNames[countryCode] || countryCode;
                    }

                    // DOB extraction
                    if (altMatch[3]) {
                        const dobStr = altMatch[3];
                        const year = parseInt(dobStr.substring(0, 2));
                        const month = dobStr.substring(2, 4);
                        const day = dobStr.substring(4, 6);
                        const fullYear = year > 30 ? 1900 + year : 2000 + year;

                        const formattedDate = `${fullYear}-${month}-${day}`;
                        const dateObj = new Date(formattedDate);
                        if (dateObj.getFullYear() == fullYear && dateObj.getMonth() + 1 == month && dateObj.getDate() == day) {
                            extracted.dateOfBirth = formattedDate;
                        }
                    }

                    // Gender from the character between DOB and expiry
                    const genderMatch = secondLine.match(/\d{6}([MF])\d{6}/);
                    if (genderMatch) {
                        extracted.gender = genderMatch[1] === 'M' ? 'Male' : 'Female';
                    }
                }
            }
        }

        // Prioritize top section name extraction over MRZ if available
        const namePatterns = [
            // Top section patterns (prioritized)
            /(?:Given\s*Names?)[:\s]*([A-Z][A-Za-z\s]{2,30})/i,
            /(?:Given\s*Name)[:\s]*([A-Z][A-Za-z\s]{2,30})\s*(?:Surname)[:\s]*([A-Z][A-Za-z\s]{2,30})/i,
            /(?:Surname)[:\s]*([A-Z][A-Za-z\s]{2,30})/i,
            /(?:Name)[:\s]*([A-Z][A-Za-z\s]{2,50})/i,
            // Combined Given Name + Surname pattern
            /(?:Given\s*Name|First\s*Name)[:\s]*([A-Z][A-Za-z\s]{2,30})[\s\n]*(?:Surname|Last\s*Name)[:\s]*([A-Z][A-Za-z\s]{2,30})/i,
            // Direct name extraction (multiple words in caps)
            /\b([A-Z]{2,15}\s+[A-Z]{2,15}(?:\s+[A-Z]{2,15})?)\b/
        ];

        let givenName = '';
        let surname = '';

        // First, try to extract given name and surname separately from top section
        const givenNameMatch = cleanText.match(/(?:Given\s*Names?)[:\s]*([A-Z][A-Za-z\s]{2,30})/i);
        if (givenNameMatch) {
            givenName = givenNameMatch[1].trim();
            console.log('Top section extracted given name:', givenName);
        }

        const surnameMatch = cleanText.match(/(?:Surname)[:\s]*([A-Z][A-Za-z\s]{2,30})/i);
        if (surnameMatch) {
            surname = surnameMatch[1].trim();
            console.log('Top section extracted surname:', surname);
        }

        // Combine given name and surname if both found from top section (prioritize over MRZ)
        if (givenName && surname) {
            const fullName = `${givenName} ${surname}`;
            extracted.name = fullName.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
            console.log('Top section combined name extracted:', extracted.name);
        }

        // Prioritize top section date of birth extraction
        const dobPatterns = [
            // Top section patterns (prioritized)
            /(?:Date of Birth)[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i,
            /(?:DOB)[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i,
            /(?:Born)[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i,
            // Any date pattern in DD/MM/YYYY or similar format
            /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/g
        ];

        if (!extracted.dateOfBirth) {
            for (const pattern of dobPatterns) {
                const matches = cleanText.match(pattern);
                if (matches) {
                    for (const match of matches) {
                        const dateStr = match.replace(/[^\d\/\-\.]/g, '');
                        const formattedDate = this.formatDate(dateStr);
                        if (formattedDate) {
                            extracted.dateOfBirth = formattedDate;
                            console.log('Top section date extracted:', formattedDate);
                            break;
                        }
                    }
                    if (extracted.dateOfBirth) break;
                }
            }
        }

        // Extract gender from top section (prioritized)
        if (!extracted.gender) {
            const genderPatterns = [
                /(?:Sex)[:\s]*(M|F|Male|Female)/i,
                /(?:Gender)[:\s]*(M|F|Male|Female)/i,
                /\b(Male|Female|M|F)\b/i
            ];

            for (const pattern of genderPatterns) {
                const match = cleanText.match(pattern);
                if (match && match[1]) {
                    const gender = match[1].toLowerCase();
                    extracted.gender = (gender === 'm' || gender === 'male') ? 'Male' : 'Female';
                    console.log('Top section extracted gender:', extracted.gender);
                    break;
                }
            }
        }

        // Place of birth
        const placeOfBirthMatch = cleanText.match(/Place of Birth[:\s]*([A-Za-z\s,]{2,50})/i);
        if (placeOfBirthMatch) {
            extracted.placeOfBirth = placeOfBirthMatch[1].trim();
        }

        console.log('Final passport extraction result:', extracted);
        return extracted;
    }

    static async processDocument(file, onProgress) {
        try {
            // Extract text using OCR
            const text = await this.extractTextFromImage(file, onProgress);
            console.log('Raw extracted text:', text);
            console.log('Text length:', text.length);

            // Determine document type and extract relevant information
            let extractedData = {};

            // Enhanced Aadhaar detection (check first as it's more common)
            const hasAadhaarNumber = /\d{4}\s*\d{4}\s*\d{4}/.test(text);
            const hasAadhaarKeywords = /(?:Aadhaar|आधार|UIDAI|Unique Identification)/i.test(text);

            // Enhanced passport detection
            const hasPassportNumber = /[A-Z]\d{7}/.test(text);
            const hasPassportKeywords = /Passport/i.test(text);
            const hasMRZ = /P[A-Z]{3}[A-Z]+<</i.test(text);

            if (hasAadhaarNumber || hasAadhaarKeywords) {
                console.log('Detected Aadhaar document');
                console.log('Aadhaar number found:', hasAadhaarNumber);
                console.log('Aadhaar keywords found:', hasAadhaarKeywords);
                extractedData = this.extractAadhaarInfo(text);
                extractedData.documentType = 'aadhaar';
            }
            else if (hasPassportNumber || hasPassportKeywords || hasMRZ) {
                console.log('Detected passport document');
                console.log('Passport number found:', hasPassportNumber);
                console.log('Passport keywords found:', hasPassportKeywords);
                console.log('MRZ format found:', hasMRZ);
                extractedData = this.extractPassportInfo(text);
                extractedData.documentType = 'passport';
            }
            // Generic extraction for other documents
            else {
                console.log('Using generic document extraction');
                extractedData = this.extractGenericInfo(text);
                extractedData.documentType = 'other';
            }

            console.log('Final processed data:', extractedData);
            return extractedData;
        } catch (error) {
            console.error('Document processing error:', error);
            // Return empty data instead of throwing error
            console.warn('Returning empty extraction data to allow manual form filling');
            return { documentType: 'unknown' };
        }
    }

    static extractGenericInfo(text) {
        const cleanText = text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
        const extracted = {};

        // Generic name pattern
        const nameMatch = cleanText.match(/Name[:\s]*([A-Z][A-Za-z\s]{2,40})/i);
        if (nameMatch) {
            extracted.name = nameMatch[1].trim();
        }

        // Generic date pattern
        const dateMatch = cleanText.match(/(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/);
        if (dateMatch) {
            const formattedDate = this.formatDate(dateMatch[1]);
            if (formattedDate) {
                extracted.dateOfBirth = formattedDate;
            }
        }

        // Generic phone pattern
        const phoneMatch = cleanText.match(/(\+?91\s*\d{10}|\d{10})/);
        if (phoneMatch) {
            const phone = phoneMatch[1].replace(/[^\d]/g, '');
            if (phone.length === 10 || (phone.length === 12 && phone.startsWith('91'))) {
                extracted.phone = phone.length === 12 ? phone.substring(2) : phone;
            }
        }

        return extracted;
    }

    static formatDate(dateStr) {
        const dateParts = dateStr.split(/[\/\-\.]/);
        if (dateParts.length === 3) {
            let day, month, year;

            // Handle different date formats
            if (dateParts[2].length === 4) {
                day = dateParts[0].padStart(2, '0');
                month = dateParts[1].padStart(2, '0');
                year = dateParts[2];
            } else if (dateParts[0].length === 4) {
                year = dateParts[0];
                month = dateParts[1].padStart(2, '0');
                day = dateParts[2].padStart(2, '0');
            }

            if (year && month && day && year.length === 4) {
                const formattedDate = `${year}-${month}-${day}`;
                // Validate date
                const dateObj = new Date(formattedDate);
                if (dateObj.getFullYear() == year && dateObj.getMonth() + 1 == month && dateObj.getDate() == day) {
                    return formattedDate;
                }
            }
        }
        return null;
    }
}

export default OCRService;