import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { supabase } from '../../../services/supabaseClient';
import { FiCompass, FiMail, FiLock, FiEye, FiEyeOff, FiUser } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import '../../../styles/AuthForm.css';

export const AuthForm = ({ initialTab = 'login' }) => {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Single source of redirect truth: fires once the session (and role) resolve.
  useEffect(() => {
    if (user && !authLoading) {
      navigate(isAdmin ? '/admin' : '/', { replace: true });
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
      setMessage({ type: '', text: '' });
    }
  }, [initialTab]);

  const formatErrorMessage = (err) => {
    if (!err) return t('unexpectedError');
    const msg = typeof err === 'string' ? err : err.message || '';
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('fetch')) {
      return t('networkError');
    }
    return msg;
  };

  const validateForm = () => {
    if (activeTab === 'register' && !fullName.trim()) {
      setMessage({ type: 'error', text: t('fullNameRequired') });
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage({ type: 'error', text: t('invalidEmail') });
      return false;
    }
    if (password.length < 6) {
      setMessage({ type: 'error', text: t('passwordMinLength') });
      return false;
    }
    setMessage({ type: '', text: '' });
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (activeTab === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setMessage({ type: 'error', text: formatErrorMessage(error) });
        } else {
          setMessage({ type: 'success', text: t('loggedInSuccessfully') });
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        });
        if (error) {
          setMessage({ type: 'error', text: formatErrorMessage(error) });
        } else {
          setMessage({
            type: 'success',
            text: t('accountCreatedSuccessfully'),
          });
        }
      }
    } catch (err) {
      setMessage({ type: 'error', text: formatErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setMessage({ type: 'error', text: t('pleaseEnterEmail') });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        setMessage({ type: 'error', text: formatErrorMessage(error) });
      } else {
        setMessage({ type: 'success', text: t('passwordResetLink') });
      }
    } catch (err) {
      setMessage({ type: 'error', text: formatErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) setMessage({ type: 'error', text: formatErrorMessage(error) });
    } catch (err) {
      setMessage({ type: 'error', text: formatErrorMessage(err) });
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="compass-icon-wrapper">
          <FiCompass size={28} />
        </div>

        <h2 className="auth-title">
          {activeTab === 'login' ? t('welcome') : t('createAccount')}
        </h2>
        <p className="auth-subtitle">
          {activeTab === 'login'
            ? t('loginSubtitle')
            : t('registerSubtitle')}
        </p>

        {/* Tabs */}
        <div className="tabs-container">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('login');
              setMessage({ type: '', text: '' });
            }}
          >
            {t('login')}
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('register');
              setMessage({ type: '', text: '' });
            }}
          >
            {t('register')}
          </button>
        </div>

        {message.text && (
          <div className={`message-banner ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Full Name Field (Register Only) */}
          {activeTab === 'register' && (
            <div>
              <label className="input-label">{t('fullName')}</label>
              <div className="custom-input-group">
                <FiUser className="input-icon" />
                <input
                  type="text"
                  className="custom-input"
                  placeholder={t('enterName')}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="input-label">{t('emailAddress')}</label>
            <div className="custom-input-group">
              <FiMail className="input-icon" />
              <input
                type="email"
                className="custom-input"
                placeholder={t('enterEmail')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="password-label-row">
              <label className="input-label">{t('password')}</label>
              {activeTab === 'login' && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="forgot-btn"
                >
                  {t('forgotPassword')}
                </button>
              )}
            </div>
            <div className="custom-input-group">
              <FiLock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="custom-input"
                placeholder={t('enterPassword')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            {loading
              ? t('processing')
              : activeTab === 'login'
              ? t('accessPlanner')
              : t('registerNow')}
          </button>
        </form>

        <div className="divider">
          <span>{t('orContinueWith')}</span>
        </div>

        <button type="button" className="btn-google" onClick={handleGoogleLogin}>
          <FcGoogle size={20} />
          {t('google')}
        </button>
      </div>
    </div>
  );
};