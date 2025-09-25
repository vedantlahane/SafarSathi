//pages/Register.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Tesseract from 'tesseract.js';
import { useAuth } from '../services/AuthContext';
import { motion } from 'framer-motion';

/**
 * Registration page supporting OCR-assisted onboarding and blockchain ID generation.
 * Handles file uploads, extracts structured vLdata, and persists mock user accounts.
 */
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
    emergencyContact: ''
  });
  const [idImage, setIdImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Updates the controlled form state for textual inputs.
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e - Input change event.
   */
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  /**
   * Stores the uploaded document image and triggers OCR processing.
   * @param {React.ChangeEvent<HTMLInputElement>} e - File input change event.
   */
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIdImage(file);
      processImageWithOCR(file);
    }
  };

  /**
   * Runs the client-side OCR workflow and merges any extracted fields into the form data.
   * @param {File} file - ID document image selected by the user.
   */
  const processImageWithOCR = async (file) => {
    setIsProcessing(true);
    toast.info('Processing your ID document...');

    try {
      const result = await Tesseract.recognize(file, 'eng', {
        logger: m => console.log(m)
      });

      const text = result.data.text;
      console.log('OCR Result:', text);

      // Extract information using regex patterns
      const extractedData = extractDataFromOCR(text);
      
      // Update form with extracted data
      setFormData(prev => ({
        ...prev,
        ...extractedData
      }));

      toast.success('ID information extracted successfully!');
    } catch (error) {
      console.error('OCR Error:', error);
      toast.error('Failed to process ID document. Please fill manually.');
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Attempts to recognize common identity fields from the OCR output.
   * @param {string} text - Full OCR text extracted from the ID document.
   * @returns {object} Key-value pairs containing recognized attributes.
   */
  const extractDataFromOCR = (text) => {
    const extracted = {};
    
    // Common patterns for Indian Aadhaar and Passport
    const patterns = {
      name: /Name[:\s]*([A-Za-z\s]+)/i,
      idNumber: /(?:Aadhaar|Passport|ID)[:\s]*([A-Z0-9\s]+)/i,
      dateOfBirth: /(?:DOB|Date of Birth)[:\s]*(\d{2}[\/\-]\d{2}[\/\-]\d{4})/i,
      address: /Address[:\s]*([A-Za-z0-9\s,.-]+)/i
    };

    Object.keys(patterns).forEach(key => {
      const match = text.match(patterns[key]);
      if (match && match[1]) {
        extracted[key] = match[1].trim();
      }
    });

    return extracted;
  };

  /**
   * Generates a deterministic blockchain identifier for the demo account.
   * @param {object} userData - Current registration form values.
   * @returns {string} Pseudo blockchain ID for the user.
   */
  const generateBlockchainID = (userData) => {
    // Simple hash simulation for demo
    const data = `${userData.name}-${userData.idNumber}-${Date.now()}`;
    return btoa(data).substring(0, 16).toUpperCase();
  };

  /**
   * Validates the form, creates the mock user record, and transitions to the dashboard.
   * @param {React.FormEvent<HTMLFormElement>} e - Form submission event.
   */
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
            className="space-y-2"
          >
            <label className="block text-white/90 font-semibold">Upload ID Document (Aadhaar/Passport)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full bg-white/10 border border-white/20 text-white p-3 rounded-lg backdrop-blur-md file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-teal-500/20 file:text-teal-200 file:font-semibold hover:file:bg-teal-500/30 transition-all duration-300"
            />
            {isProcessing && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-teal-400 text-sm font-medium"
              >
                🔄 Processing document...
              </motion.p>
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
            transition={{ delay: 1.2, duration: 0.6 }}
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
            transition={{ delay: 1.3, duration: 0.6 }}
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
          transition={{ delay: 1.4, duration: 0.6 }}
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