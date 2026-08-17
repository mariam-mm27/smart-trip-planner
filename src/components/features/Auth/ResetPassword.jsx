import React, { useState } from 'react';
import { supabase } from '../../../services/supabaseClient';
import { FiCompass, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import '../../../styles/AuthForm.css';

export const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Password updated successfully! You can now log in.' });
      setTimeout(() => {
        window.location.href = '/'; 
      }, 2000);
    }
    setLoading(false);
  };

  return (
    <div className="auth-card">
      <div className="compass-icon-wrapper">
        <FiCompass size={28} />
      </div>

      <h2 className="auth-title">Reset Password</h2>
      <p className="auth-subtitle">Enter your new password below</p>

      {message.text && (
        <div className={`message-banner ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleUpdatePassword}>
        <div>
          <label className="input-label">New Password</label>
          <div className="custom-input-group">
            <FiLock className="input-icon" />
            <input 
              type={showPassword ? "text" : "password"} 
              className="custom-input" 
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button 
              type="button" 
              className="eye-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
};