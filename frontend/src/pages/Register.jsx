//pages/Register.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../services/AuthContext';
import { motion } from 'framer-motion';
import OCRService from '../services/ocrService';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    idNumber: '',
    dateOfBirth: '',
    address: '',
    emergencyContact: '',
    gender: '',
    nationality: ''
  });
  const [idImage, setIdImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIdImage(file);
      processImageWithOCR(file);
    }
  };

  const handleDeleteImage = () => {
    setIdImage(null);
    // Reset the file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = '';
    }
    // Show confirmation
    toast.info('📄 Document removed. You can upload a new one.');
  };

  const processImageWithOCR = async (file) => {
    setIsProcessing(true);
    toast.info('🔍 Analyzing your ID document...');

    try {
      // Use the enhanced OCR service
      const extractedData = await OCRService.processDocument(file, (progress) => {
        toast.info(`🤖 AI Processing... ${progress}%`);
      });

      console.log('Extracted Data:', extractedData);
      
      // Validate extracted data
      const validatedData = validateExtractedData(extractedData);
      
      // Update form with extracted data
      if (Object.keys(validatedData).length > 0) {
        setFormData(prev => ({
          ...prev,
          ...validatedData
        }));

        // Show success message with extracted fields
        const extractedFields = Object.keys(validatedData).join(', ');
        toast.success(`✅ Successfully extracted: ${extractedFields}`);
        
        // Show document type detected
        if (extractedData.documentType) {
          const docTypeMsg = extractedData.documentType === 'aadhaar' ? 'Aadhaar Card' : 
                            extractedData.documentType === 'passport' ? 'Passport' : 'ID Document';
          setTimeout(() => {
            let message = `📄 ${docTypeMsg} detected! Please verify the auto-filled information.`;
            if (extractedData.documentType === 'aadhaar') {
              message += ' 🇮🇳 Nationality set to Indian.';
            }
            toast.info(message, {
              autoClose: 5000
            });
          }, 1000);
        }
      } else {
        toast.warning('⚠️ Could not extract information automatically. Please fill the form manually.');
      }
    } catch (error) {
      console.error('OCR Error:', error);
      toast.error('❌ Unable to extract information from document. Please fill the form manually.');
    } finally {
      setIsProcessing(false);
    }
  };

  const validateExtractedData = (data) => {
    const validated = {};
    
    // Validate name
    if (data.name && data.name.length >= 2 && data.name.length <= 50 && /^[A-Za-z\s]+$/.test(data.name)) {
      validated.name = data.name;
    }
    
    // Validate ID number
    if (data.idNumber) {
      const cleanId = data.idNumber.replace(/\s/g, '');
      if (/^\d{12}$/.test(cleanId) || /^[A-Z]\d{7}$/.test(cleanId) || /^[A-Z0-9]{8}$/.test(cleanId)) {
        validated.idNumber = cleanId;
      }
    }
    
    // Validate date of birth
    if (data.dateOfBirth && /^\d{4}-\d{2}-\d{2}$/.test(data.dateOfBirth)) {
      const date = new Date(data.dateOfBirth);
      const now = new Date();
      if (date < now && date.getFullYear() > 1900) {
        validated.dateOfBirth = data.dateOfBirth;
      }
    }
    
    // Validate address
    if (data.address && data.address.length >= 10 && data.address.length <= 200) {
      validated.address = data.address;
    }
    
    // Validate phone
    if (data.phone) {
      const cleanPhone = data.phone.replace(/[^\d]/g, '');
      if (/^\d{10}$/.test(cleanPhone) || /^91\d{10}$/.test(cleanPhone)) {
        validated.phone = cleanPhone.length === 12 ? cleanPhone.substring(2) : cleanPhone;
      }
    }
    
    // Validate gender
    if (data.gender && (data.gender === 'Male' || data.gender === 'Female')) {
      validated.gender = data.gender;
    }
    
    // Validate nationality
    if (data.nationality && data.nationality.length > 0) {
      validated.nationality = data.nationality;
    }
    
    return validated;
  };

  const extractDataFromOCR = (text) => {
    const extracted = {};
    const cleanText = text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    
    console.log('Cleaned OCR Text:', cleanText);
    
    // Enhanced patterns for Indian Aadhaar and Passport
    const patterns = {
      // Aadhaar patterns
      aadhaarNumber: [
        /(\d{4}\s*\d{4}\s*\d{4})/g,
        /Aadhaar\s*No[:\s]*(\d{4}\s*\d{4}\s*\d{4})/i,
        /UID[:\s]*(\d{4}\s*\d{4}\s*\d{4})/i
      ],
      
      // Passport patterns
      passportNumber: [
        /Passport\s*No[:\s]*([A-Z]\d{7})/i,
        /([A-Z]\d{7})/g,
        /Passport[:\s]*([A-Z0-9]{8})/i
      ],
      
      // Name patterns (more comprehensive)
      name: [
        /Name[:\s]*([A-Z][A-Za-z\s]{2,40})/i,
        /^([A-Z][A-Za-z\s]{2,40})\s*(?:D\/O|S\/O|W\/O)/i,
        /(?:Mr|Ms|Mrs|Dr)\.?\s*([A-Z][A-Za-z\s]{2,40})/i,
        /([A-Z][A-Za-z\s]{2,40})\s*D\/O/i
      ],
      
      // Date of Birth patterns
      dateOfBirth: [
        /(?:DOB|Date of Birth|Born)[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i,
        /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/g,
        /Born[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i
      ],
      
      // Address patterns
      address: [
        /Address[:\s]*([A-Za-z0-9\s,.\-\/]{10,200})/i,
        /(?:S\/O|D\/O|W\/O)[^,]*,\s*([A-Za-z0-9\s,.\-\/]{10,200})/i,
        /PIN[:\s]*\d{6}[^,]*,?\s*([A-Za-z0-9\s,.\-\/]{10,100})/i
      ],
      
      // Phone patterns
      phone: [
        /(?:Mobile|Phone|Mob)[:\s]*(\+?91\s*\d{10})/i,
        /(\+?91\s*\d{10})/g,
        /(\d{10})/g
      ],
      
      // Gender patterns
      gender: [
        /(?:Gender|Sex)[:\s]*(Male|Female|M|F)/i,
        /(Male|Female)\s/i
      ]
    };

    // Extract Aadhaar or Passport number first to determine document type
    let documentType = 'unknown';
    let idNumber = '';
    
    // Check for Aadhaar
    for (const pattern of patterns.aadhaarNumber) {
      const matches = cleanText.match(pattern);
      if (matches) {
        idNumber = matches[0].replace(/\s/g, '');
        if (idNumber.length === 12 && /^\d{12}$/.test(idNumber)) {
          documentType = 'aadhaar';
          extracted.idNumber = idNumber;
          break;
        }
      }
    }
    
    // Check for Passport if not Aadhaar
    if (documentType === 'unknown') {
      for (const pattern of patterns.passportNumber) {
        const matches = cleanText.match(pattern);
        if (matches) {
          const potentialPassport = matches[0].replace(/\s/g, '');
          if (/^[A-Z]\d{7}$/.test(potentialPassport) || /^[A-Z0-9]{8}$/.test(potentialPassport)) {
            documentType = 'passport';
            extracted.idNumber = potentialPassport;
            break;
          }
        }
      }
    }
    
    console.log('Document Type Detected:', documentType);
    
    // Extract name
    for (const pattern of patterns.name) {
      const match = cleanText.match(pattern);
      if (match && match[1]) {
        const name = match[1].trim();
        // Validate name (should be 2-40 chars, only letters and spaces)
        if (name.length >= 2 && name.length <= 40 && /^[A-Za-z\s]+$/.test(name)) {
          extracted.name = name;
          break;
        }
      }
    }
    
    // Extract date of birth
    for (const pattern of patterns.dateOfBirth) {
      const matches = cleanText.match(pattern);
      if (matches) {
        for (const match of matches) {
          const dateStr = match.replace(/[^\d\/\-\.]/g, '');
          if (dateStr && dateStr.length >= 8) {
            // Convert to YYYY-MM-DD format for date input
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
                  extracted.dateOfBirth = formattedDate;
                  break;
                }
              }
            }
          }
        }
        if (extracted.dateOfBirth) break;
      }
    }
    
    // Extract address
    for (const pattern of patterns.address) {
      const match = cleanText.match(pattern);
      if (match && match[1]) {
        let address = match[1].trim();
        // Clean up address
        address = address.replace(/\s+/g, ' ').substring(0, 200);
        if (address.length >= 10) {
          extracted.address = address;
          break;
        }
      }
    }
    
    // Extract phone number
    for (const pattern of patterns.phone) {
      const matches = cleanText.match(pattern);
      if (matches) {
        for (const match of matches) {
          const phone = match.replace(/[^\d]/g, '');
          if (phone.length === 10 || (phone.length === 12 && phone.startsWith('91'))) {
            extracted.phone = phone.length === 12 ? phone : phone;
            break;
          }
        }
        if (extracted.phone) break;
      }
    }
    
    // Document-specific extraction
    if (documentType === 'aadhaar') {
      // Aadhaar-specific patterns
      const pinMatch = cleanText.match(/PIN[:\s]*(\d{6})/i);
      if (pinMatch) {
        extracted.pinCode = pinMatch[1];
      }
      
      // Extract father's/husband's name for Aadhaar
      const relativeName = cleanText.match(/(?:S\/O|D\/O|W\/O)[:\s]*([A-Za-z\s]{2,40})/i);
      if (relativeName) {
        extracted.guardianName = relativeName[1].trim();
      }
    }
    
    if (documentType === 'passport') {
      // Passport-specific patterns
      const placeOfBirth = cleanText.match(/Place of Birth[:\s]*([A-Za-z\s,]{2,50})/i);
      if (placeOfBirth) {
        extracted.placeOfBirth = placeOfBirth[1].trim();
      }
      
      const issuePlace = cleanText.match(/Place of Issue[:\s]*([A-Za-z\s,]{2,50})/i);
      if (issuePlace) {
        extracted.issuePlace = issuePlace[1].trim();
      }
    }
    
    console.log('Extracted Data:', extracted);
    return extracted;
  };

  const generateBlockchainID = (userData) => {
    // Simple hash simulation for demo
    const data = `${userData.name}-${userData.idNumber}-${Date.now()}`;
    return btoa(data).substring(0, 16).toUpperCase();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Generate blockchain ID
      const blockchainID = generateBlockchainID(formData);
      
      const userData = {
        ...formData,
        blockchainID,
        registeredAt: new Date().toISOString(),
        isActive: true
      };

      // Simulate API call - replace with actual backend
      setTimeout(() => {
        login(userData);
        toast.success('Registration successful!');
        navigate('/dashboard');
      }, 1000);

    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5 relative overflow-hidden bg-gradient-to-br from-purple-900 via-slate-900 to-teal-900">
      {/* Animated Background */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            'radial-gradient(ellipse at top right, rgba(124, 58, 237, 0.4) 0%, transparent 70%)',
            'radial-gradient(ellipse at bottom left, rgba(13, 148, 136, 0.4) 0%, transparent 70%)',
            'radial-gradient(ellipse at center right, rgba(249, 115, 22, 0.3) 0%, transparent 70%)'
          ]
        }}
        transition={{ duration: 25, repeat: Infinity, repeatType: "reverse" }}
      />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/10 backdrop-blur-xl border border-white/20 p-10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative"
      >
        {/* Top Border Accent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent">
            🛡️ SafarSathi Registration
          </h2>
          <p className="text-white/80 text-lg">Register for secure and safe tourism</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* ID Document Upload */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-white/90 font-semibold mb-2">
                📄 Upload ID Document (Aadhaar/Passport)
              </label>
              <p className="text-white/60 text-sm mb-3">
                💡 For best results: Use clear, well-lit photos with all text visible
              </p>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full bg-white/10 border border-white/20 text-white p-3 rounded-lg backdrop-blur-md file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-teal-500/20 file:text-teal-200 file:font-semibold hover:file:bg-teal-500/30 transition-all duration-300"
                />
                {isProcessing && (
                  <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <div className="bg-white/10 px-4 py-2 rounded-lg">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full inline-block mr-2"
                      />
                      <span className="text-teal-400 font-medium">AI Processing...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Image Preview */}
            {idImage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white/80 text-sm">📷 Uploaded Image:</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDeleteImage}
                    className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 flex items-center space-x-1"
                  >
                    <span>🗑️</span>
                    <span>Delete</span>
                  </motion.button>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-2 relative">
                  <img
                    src={URL.createObjectURL(idImage)}
                    alt="Uploaded ID"
                    className="w-full max-h-40 object-contain rounded-lg"
                  />
                </div>
              </motion.div>
            )}

            {/* Processing Status */}
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-teal-500/10 border border-teal-500/20 rounded-lg p-3"
              >
                <div className="flex items-center space-x-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full"
                  />
                  <span className="text-teal-400 text-sm font-medium">
                    🤖 AI is analyzing your document...
                  </span>
                </div>
                <p className="text-teal-300/70 text-xs mt-1">
                  This may take a few seconds
                </p>
              </motion.div>
            )}

            {/* Tips */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3"
            >
              <p className="text-purple-300 text-sm font-medium mb-1">📝 Tips for better extraction:</p>
              <ul className="text-purple-200/80 text-xs space-y-1">
                <li>• Ensure good lighting and avoid shadows</li>
                <li>• Keep the document flat and fully visible</li>
                <li>• Avoid blur - hold steady while taking photo</li>
                <li>• Make sure all text is readable</li>
              </ul>
            </motion.div>
          </motion.div>

          {/* Personal Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <label className="block text-white/90 font-semibold mb-2">Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter your full name"
                className="w-full bg-white/10 border border-white/20 text-white p-3 rounded-lg backdrop-blur-md placeholder-white/50 focus:bg-white/15 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <label className="block text-white/90 font-semibold mb-2">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="Enter your email"
                className="w-full bg-white/10 border border-white/20 text-white p-3 rounded-lg backdrop-blur-md placeholder-white/50 focus:bg-white/15 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <label className="block text-white/90 font-semibold mb-2">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                placeholder="Enter your phone number"
                className="w-full bg-white/10 border border-white/20 text-white p-3 rounded-lg backdrop-blur-md placeholder-white/50 focus:bg-white/15 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
            >
              <label className="block text-white/90 font-semibold mb-2">ID Number</label>
              <input
                type="text"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleInputChange}
                placeholder="Aadhaar/Passport number"
                className="w-full bg-white/10 border border-white/20 text-white p-3 rounded-lg backdrop-blur-md placeholder-white/50 focus:bg-white/15 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
            >
              <label className="block text-white/90 font-semibold mb-2">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-white/20 text-white p-3 rounded-lg backdrop-blur-md focus:bg-white/15 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1, duration: 0.6 }}
            >
              <label className="block text-white/90 font-semibold mb-2">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-white/20 text-white p-3 rounded-lg backdrop-blur-md focus:bg-white/15 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
              >
                <option value="" className="bg-gray-800">Select Gender</option>
                <option value="Male" className="bg-gray-800">Male</option>
                <option value="Female" className="bg-gray-800">Female</option>
                <option value="Other" className="bg-gray-800">Other</option>
              </select>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
            >
              <label className="block text-white/90 font-semibold mb-2">Nationality</label>
              <select
                name="nationality"
                value={formData.nationality}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-white/20 text-white p-3 rounded-lg backdrop-blur-md focus:bg-white/15 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
              >
                <option value="" className="bg-gray-800">Select Nationality</option>
                <option value="Indian" className="bg-gray-800">🇮🇳 Indian</option>
                <option value="American" className="bg-gray-800">🇺🇸 American</option>
                <option value="British" className="bg-gray-800">🇬🇧 British</option>
                <option value="Canadian" className="bg-gray-800">🇨🇦 Canadian</option>
                <option value="Australian" className="bg-gray-800">🇦🇺 Australian</option>
                <option value="German" className="bg-gray-800">🇩🇪 German</option>
                <option value="French" className="bg-gray-800">🇫🇷 French</option>
                <option value="Japanese" className="bg-gray-800">🇯🇵 Japanese</option>
                <option value="Chinese" className="bg-gray-800">🇨🇳 Chinese</option>
                <option value="Russian" className="bg-gray-800">🇷🇺 Russian</option>
                <option value="Brazilian" className="bg-gray-800">🇧🇷 Brazilian</option>
                <option value="South African" className="bg-gray-800">🇿🇦 South African</option>
                <option value="Other" className="bg-gray-800">🌍 Other</option>
              </select>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.3, duration: 0.6 }}
            >
              <label className="block text-white/90 font-semibold mb-2">Emergency Contact</label>
              <input
                type="tel"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleInputChange}
                placeholder="Emergency contact number"
                className="w-full bg-white/10 border border-white/20 text-white p-3 rounded-lg backdrop-blur-md placeholder-white/50 focus:bg-white/15 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
              />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.6 }}
          >
            <label className="block text-white/90 font-semibold mb-2">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter your address"
              rows="3"
              className="w-full bg-white/10 border border-white/20 text-white p-3 rounded-lg backdrop-blur-md placeholder-white/50 focus:bg-white/15 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300 resize-none"
            />
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.6 }}
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-purple-500 to-teal-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:from-purple-600 hover:to-teal-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 relative overflow-hidden group"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full"
              whileHover={{ translateX: "200%" }}
              transition={{ duration: 0.6 }}
            />
            {isProcessing ? '⏳ Processing...' : '🚀 Register & Generate Blockchain ID'}
          </motion.button>
        </motion.form>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.6 }}
          className="mt-6 text-center text-white/70"
        >
          Already have an account?{' '}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/login')}
            className="text-purple-400 hover:text-white transition-colors duration-300 underline font-semibold"
          >
            Login here
          </motion.button>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Register;