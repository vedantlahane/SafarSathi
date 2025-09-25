//pages/Register.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Tesseract from 'tesseract.js';
import { useAuth } from '../services/AuthContext';
import '../styles/Register.css';

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
    <div className="register-container">
      <div className="register-form">
        <h2>🛡️ SafarSathi Registration</h2>
        <p>Register for secure and safe tourism</p>

        <form onSubmit={handleSubmit}>
          {/* ID Document Upload */}
          <div className="form-group">
            <label>Upload ID Document (Aadhaar/Passport)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="file-input"
            />
            {isProcessing && <p className="processing">🔄 Processing document...</p>}
          </div>

          {/* Personal Information */}
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label>Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              placeholder="Enter your phone number"
            />
          </div>

          <div className="form-group">
            <label>ID Number</label>
            <input
              type="text"
              name="idNumber"
              value={formData.idNumber}
              onChange={handleInputChange}
              placeholder="Aadhaar/Passport number"
            />
          </div>

          <div className="form-group">
            <label>Date of Birth</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter your address"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Emergency Contact</label>
            <input
              type="tel"
              name="emergencyContact"
              value={formData.emergencyContact}
              onChange={handleInputChange}
              placeholder="Emergency contact number"
            />
          </div>

          <button type="submit" className="submit-btn" disabled={isProcessing}>
            {isProcessing ? '⏳ Processing...' : '🚀 Register & Generate Blockchain ID'}
          </button>
        </form>

        <p className="login-link">
          Already have an account? 
          <button onClick={() => navigate('/login')} className="link-btn">
            Login here
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;