//pages/Register.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../services/AuthContext';
import { motion } from 'framer-motion';
import OCRService from '../services/ocrService';

const FIELD_LABELS = {
  name: 'Full Name',
  email: 'Email',
  phone: 'Phone',
  idNumber: 'ID Number',
  dateOfBirth: 'Date of Birth',
  address: 'Address',
  emergencyContact: 'Emergency Contact',
  gender: 'Gender',
  nationality: 'Nationality'
};

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
  const [documentDetails, setDocumentDetails] = useState({ type: '', fields: [] });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateExtractedData = (data = {}) => {
    const cleaned = {};

    if (typeof data.name === 'string') {
      const name = data.name.trim();
      if (/^[A-Za-z\s]{2,50}$/.test(name)) {
        cleaned.name = name;
      }
    }

    if (typeof data.idNumber === 'string') {
      const id = data.idNumber.replace(/\s+/g, '').toUpperCase();
      if (/^\d{12}$/.test(id) || /^[A-Z]\d{7}$/.test(id) || /^[A-Z0-9]{8,12}$/.test(id)) {
        cleaned.idNumber = id;
      }
    }

    if (typeof data.dateOfBirth === 'string') {
      const dob = data.dateOfBirth.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
        cleaned.dateOfBirth = dob;
      }
    }

    if (typeof data.address === 'string') {
      const address = data.address.trim();
      if (address.length >= 10) {
        cleaned.address = address.slice(0, 200);
      }
    }

    if (typeof data.phone === 'string') {
      const digits = data.phone.replace(/[^\d]/g, '');
      if (digits.length === 10) {
        cleaned.phone = digits;
      } else if (digits.length === 12 && digits.startsWith('91')) {
        cleaned.phone = digits.slice(2);
      }
    }

    if (typeof data.gender === 'string') {
      const gender = data.gender.toLowerCase();
      if (gender === 'male' || gender === 'm') {
        cleaned.gender = 'Male';
      } else if (gender === 'female' || gender === 'f') {
        cleaned.gender = 'Female';
      }
    }

    if (typeof data.nationality === 'string') {
      const nationality = data.nationality.trim();
      if (nationality.length >= 2) {
        cleaned.nationality = nationality;
      }
    }

    return cleaned;
  };

  const applyExtractedData = (validated, raw) => {
    const appliedKeys = Object.keys(validated);
    setDocumentDetails({
      type: raw?.documentType || 'unknown',
      fields: appliedKeys.map(key => ({ key, value: validated[key] }))
    });

    if (!appliedKeys.length) {
      toast.warning('⚠️ Could not auto-fill details. Please enter them manually.');
      return;
    }

    setFormData(prev => ({ ...prev, ...validated }));
    toast.success(`✅ Auto-filled: ${appliedKeys.join(', ')}`);
  };

  const processImageWithOCR = async (file) => {
    setIsProcessing(true);
    const toastId = toast.loading('🤖 Analyzing document...');

    try {
      const extracted = await OCRService.processDocument(file, (progress) => {
        if (typeof progress === 'number') {
          toast.update(toastId, {
            render: `🤖 Analyzing document… ${Math.round(progress * 100)}%`,
            isLoading: true
          });
        }
      });

      const validated = validateExtractedData(extracted);
      applyExtractedData(validated, extracted);
    } catch (error) {
      console.error('OCR processing failed', error);
      toast.error('❌ Unable to extract information automatically. Please fill the form manually.');
    } finally {
      toast.dismiss(toastId);
      setIsProcessing(false);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIdImage(file);
    processImageWithOCR(file);
  };

  const handleDeleteImage = () => {
    setIdImage(null);
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = '';
    }
    setDocumentDetails({ type: '', fields: [] });
    toast.info('📄 Document removed. You can upload a new one.');
  };

  const generateBlockchainID = (userData) => {
    const payload = `${userData.name}-${userData.idNumber}-${Date.now()}`;
    return btoa(payload).substring(0, 16).toUpperCase();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const blockchainID = generateBlockchainID(formData);
      const userData = {
        ...formData,
        blockchainID,
        registeredAt: new Date().toISOString(),
        isActive: true
      };

      login(userData);
      toast.success('Registration successful!');
      navigate('/dashboard');
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

            {documentDetails.fields.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-teal-500/10 border border-teal-500/30 rounded-lg p-3"
              >
                <p className="text-teal-200 text-sm font-semibold mb-2">
                  ✅ Auto-filled details {documentDetails.type ? `(${documentDetails.type.toUpperCase()})` : ''}
                </p>
                <ul className="space-y-1 text-xs text-teal-100/90">
                  {documentDetails.fields.map(({ key, value }) => (
                    <li key={key}>
                      <span className="font-semibold">{FIELD_LABELS[key] || key}:</span> {value}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
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