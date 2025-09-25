//pages/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../services/AuthContext';
import '../styles/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call - replace with actual backend
      setTimeout(() => {
        // Mock user data for demo
        const userData = {
          name: 'Demo User',
          email: formData.email,
          phone: '+91-9876543210',
          blockchainID: 'BC' + Math.random().toString(36).substr(2, 12).toUpperCase(),
          registeredAt: new Date().toISOString(),
          isActive: true
        };

        login(userData);
        toast.success('Login successful!');
        navigate('/dashboard');
        setIsLoading(false);
      }, 1000);

    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <div className="app-header">
          <h1>🛡️ SafarSathi</h1>
          <p>Your Digital Travel Safety Companion</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
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
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? '⏳ Logging in...' : '🔐 Login'}
          </button>
        </form>

        <div className="demo-info">
          <p>🚀 <strong>Hackathon Demo Mode</strong></p>
          <p>Use any email and password to login</p>
        </div>

        <p className="register-link">
          New to SafarSathi? 
          <button onClick={() => navigate('/register')} className="link-btn">
            Register here
          </button>
        </p>

        <div className="features-preview">
          <h3>🌟 Key Features</h3>
          <ul>
            <li>🆔 Blockchain Digital ID</li>
            <li>🗺️ Real-time Safety Mapping</li>
            <li>🚨 Emergency SOS Button</li>
            <li>📍 Geo-fencing Alerts</li>
            <li>🤖 AI Behavior Monitoring</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;