import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import './LoginModal.css';

function LoginModal({ onClose }) {
  const { login, register } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.username || !formData.email || !formData.password) {
      setError('All fields are required');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await register(formData.username, formData.email, formData.password);
    setLoading(false);

    if (result.success) {
      setSuccess(`Welcome ${result.user.username}! Registration successful.`);
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setError(result.error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return;
    }

    setLoading(true);
    const result = await login(formData.email, formData.password);
    setLoading(false);

    if (result.success) {
      setSuccess(`Welcome back ${result.user.username}!`);
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setError(result.error);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setSuccess('');
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="login-modal-overlay" onClick={onClose}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="modal-close" onClick={onClose}>✕</button>

        {/* Header */}
        <div className="modal-header">
          <h2>{isRegistering ? '📝 Create Account' : '🔐 Login to Huddle'}</h2>
          <p>Stay connected with the community</p>
        </div>

        {/* Form */}
        <form onSubmit={isRegistering ? handleRegister : handleLogin} className="auth-form">
          {/* Username (only for registration) */}
          {isRegistering && (
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                name="username"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleInputChange}
                disabled={loading}
                autoComplete="username"
              />
            </div>
          )}

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleInputChange}
              disabled={loading}
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleInputChange}
              disabled={loading}
              autoComplete={isRegistering ? 'new-password' : 'current-password'}
            />
          </div>

          {/* Confirm Password (only for registration) */}
          {isRegistering && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                disabled={loading}
                autoComplete="new-password"
              />
            </div>
          )}

          {/* Error Message */}
          {error && <div className="error-message">⚠️ {error}</div>}

          {/* Success Message */}
          {success && <div className="success-message">✅ {success}</div>}

          {/* Submit Button */}
          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Processing...' : (isRegistering ? 'Create Account' : 'Login')}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="toggle-mode">
          <p>
            {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
            <button
              type="button"
              className="toggle-link"
              onClick={toggleMode}
              disabled={loading}
            >
              {isRegistering ? 'Login here' : 'Register here'}
            </button>
          </p>
        </div>

        {/* Guest Option */}
        <div className="guest-option">
          <p>
            Want to explore first?{' '}
            <button
              type="button"
              className="guest-link"
              onClick={onClose}
            >
              Continue as Guest
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginModal;
