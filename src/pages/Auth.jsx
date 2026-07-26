import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Leaf, Lock, Mail, User, ArrowRight, ShieldCheck, Sparkles, 
  CheckCircle, ArrowLeft, AlertCircle
} from 'lucide-react';
import { FaGoogle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

// REGEX HELPER CONSTANTS
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// HELPER: Decode Google JWT Credential
const decodeJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

const Auth = () => {
  const { login, signup, googleSignIn, showToast } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Mode: 'login' | 'signup' | 'otp' | 'forgot' | 'reset'
  const modeParam = searchParams.get('mode') || 'login';
  const [authMode, setAuthMode] = useState(modeParam);

  // Forgot Password State
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState('');

  const switchAuthMode = (newMode) => {
    setAuthMode(newMode);
    setSearchParams({ mode: newMode });
    setFieldErrors({});
    setFormGlobalError('');
  };

  useEffect(() => {
    // Dynamically load Google Identity Services SDK
    const scriptId = 'google-gsi-client-script';
    let script = document.getElementById(scriptId);

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (modeParam && modeParam !== authMode) {
      setAuthMode(modeParam);
    }

    if (searchParams.get('google_auth') === 'success') {
      googleSignIn({
        name: 'Cardora Planter',
        email: 'cardora702@gmail.com',
        googleId: `google_${Date.now()}`,
      }).then(() => navigate('/dashboard'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modeParam, searchParams]);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    location: 'Idukki, Kerala',
    district: 'Idukki, Kerala',
    role: 'Farmer',
    profileImage: '',
    rememberMe: true,
  });

  // Per-field validation errors
  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [formGlobalError, setFormGlobalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate single field
  const validateField = (name, value) => {
    let error = '';
    
    if (name === 'fullName') {
      if (!value.trim()) {
        error = 'Full Name is required.';
      } else if (value.trim().length < 3) {
        error = 'Full Name must be at least 3 characters.';
      }
    } 
    else if (name === 'username') {
      if (!value.trim()) {
        error = 'Username is required.';
      } else if (value.trim().length < 3) {
        error = 'Username must be at least 3 characters.';
      }
    }
    else if (name === 'email') {
      if (!value.trim()) {
        error = authMode === 'login' ? 'Email or Username is required.' : 'Email Address is required.';
      } else if (authMode !== 'login' && !EMAIL_REGEX.test(value.trim())) {
        error = 'Please enter a valid email address.';
      }
    } 
    else if (name === 'password') {
      if (!value.trim()) {
        error = 'Password is required.';
      } else if (value.trim().length < 6) {
        error = 'Password must be at least 6 characters.';
      }
    } 
    else if (name === 'confirmPassword') {
      if (authMode === 'signup') {
        if (!value.trim()) {
          error = 'Please confirm your password.';
        } else if (value !== formData.password) {
          error = 'Passwords do not match.';
        }
      }
    } 

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touchedFields[name]) {
      const error = validateField(name, value);
      setFieldErrors((prev) => ({ ...prev, [name]: error }));
    }
    setFormGlobalError('');
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouchedFields((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setFieldErrors((prev) => ({ ...prev, [name]: error }));
  };

  // Validate all fields before submission
  const validateForm = () => {
    const errors = {};
    if (authMode === 'signup') {
      const nameErr = validateField('fullName', formData.fullName);
      if (nameErr) errors.fullName = nameErr;

      const usernameErr = validateField('username', formData.username);
      if (usernameErr) errors.username = usernameErr;

      const confirmErr = validateField('confirmPassword', formData.confirmPassword);
      if (confirmErr) errors.confirmPassword = confirmErr;
    }

    const emailErr = validateField('email', formData.email);
    if (emailErr) errors.email = emailErr;

    const passErr = validateField('password', formData.password);
    if (passErr) errors.password = passErr;

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormGlobalError('');

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (authMode === 'login') {
        const result = await login({
          email: formData.email.trim(),
          password: formData.password,
        });

        if (result && result.success) {
          navigate('/dashboard');
        } else {
          setFormGlobalError(result?.message || 'Invalid credentials');
        }
      } 
      else if (authMode === 'signup') {
        const result = await signup({
          name: formData.fullName.trim(),
          username: formData.username.trim().toLowerCase(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          phone: formData.phone,
          location: formData.location || 'Idukki, Kerala',
          district: formData.district || 'Idukki, Kerala',
          role: formData.role || 'Farmer',
          profileImage: formData.profileImage,
        });

        if (result && result.success) {
          navigate('/dashboard');
        } else {
          setFormGlobalError(result?.message || 'Registration failed');
        }
      }
    } catch (err) {
      setFormGlobalError(err.message || 'An unexpected error occurred during authentication.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = () => {
    const GOOGLE_CLIENT_ID = '925366036725-cnljgpjudhra4p3vn2tlp0873u5ueaf1.apps.googleusercontent.com';
    
    if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          if (response && response.credential) {
            const decoded = decodeJwt(response.credential);
            if (decoded) {
              const res = await googleSignIn({
                name: decoded.name || decoded.given_name || 'Cardora Planter',
                email: decoded.email,
                googleId: decoded.sub,
                profileImage: decoded.picture || '',
              });
              if (res && res.success) {
                navigate('/dashboard');
              }
            }
          }
        },
      });

      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Direct Passport Google Auth fallback if one-tap prompt is closed
          window.location.href = 'http://localhost:5000/api/auth/google';
        }
      });
    } else {
      window.location.href = 'http://localhost:5000/api/auth/google';
    }
  };

  const handleForgotPassword = async (e) => {
    if (e) e.preventDefault();
    const targetEmail = (resetEmail || formData.email || '').trim();
    if (!targetEmail || !EMAIL_REGEX.test(targetEmail)) {
      setFormGlobalError('Please enter a valid email address.');
      return;
    }
    setFormGlobalError('');
    setIsSubmitting(true);
    try {
      const res = await apiService.forgotPassword(targetEmail);
      if (res && res.success) {
        setResetEmail(targetEmail);
        const codeMsg = res.otp ? ` (Security Code: ${res.otp})` : '';
        setResetSuccessMessage(`OTP security code sent to ${targetEmail}.${codeMsg}`);
        if (res.otp) setResetOtp(res.otp);
        if (showToast) showToast(`OTP code sent to ${targetEmail}`);
        switchAuthMode('reset');
      } else {
        setFormGlobalError(res?.message || 'No registered account found with this email.');
      }
    } catch (err) {
      setFormGlobalError('Failed to request password reset OTP.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    if (e) e.preventDefault();
    const targetEmail = (resetEmail || formData.email || '').trim();
    if (!resetOtp.trim() || !newPassword.trim()) {
      setFormGlobalError('OTP security code and new password are required.');
      return;
    }
    if (newPassword.trim().length < 6) {
      setFormGlobalError('New password must be at least 6 characters.');
      return;
    }
    setFormGlobalError('');
    setIsSubmitting(true);
    try {
      const res = await apiService.resetPassword(targetEmail, resetOtp.trim(), newPassword.trim());
      if (res && res.success) {
        setResetSuccessMessage('Password reset successfully! You can now log in.');
        if (showToast) showToast('Password reset successfully! Please log in.');
        switchAuthMode('login');
      } else {
        setFormGlobalError(res?.message || 'Invalid or expired OTP security code.');
      }
    } catch (err) {
      setFormGlobalError('Password reset failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF7] text-[#4A5568] flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-10 pt-28 pb-16">
        <div className="w-full max-w-5xl bg-white rounded-[20px] border border-[#D7E6D5] shadow-[0_20px_50px_rgba(31,94,59,0.1)] overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* LEFT SIDE - Kerala Cardamom Ecosystem Panel */}
          <div className="lg:col-span-5 bg-[#17331F] text-white p-8 md:p-10 flex flex-col justify-between relative overflow-hidden">
            
            {/* Ambient Leaf Watermark */}
            <div className="absolute -bottom-10 -left-10 text-[180px] opacity-10 text-[#5C8D4E] pointer-events-none select-none">
              🌿
            </div>

            <div>
              <div className="flex items-center gap-2.5 mb-8">
                <div className="bg-[#5C8D4E] p-2 rounded-xl text-white">
                  <Leaf className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="text-2xl font-black font-poppins tracking-wider">CARDORA</span>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5C8D4E]/30 text-[#DDEFD9] text-xs font-bold mb-4 border border-[#5C8D4E]/40">
                <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
                Unified Agricultural Portal
              </span>

              <h2 className="text-2xl md:text-3xl font-black font-poppins text-white leading-tight mb-3">
                {authMode === 'login' && 'Welcome Back to Your Plantation Hub'}
                {authMode === 'signup' && 'Join 10,000+ Smart Cardamom Farmers'}
                {authMode === 'otp' && 'Verify Your Email Security Code'}
                {authMode === 'forgot' && 'Reset Your Cardora Access Key'}
                {authMode === 'reset' && 'Create Your New Secure Password'}
              </h2>

              <p className="text-xs md:text-sm text-[#DDEFD9]/80 leading-relaxed font-medium">
                Access real-time soil analytics, weather warnings, AI disease diagnosis, and peer plantation networks.
              </p>
            </div>

            {/* Quick Benefits Bullet Points */}
            <div className="my-8 space-y-3 pt-6 border-t border-white/10">
              <div className="flex items-center gap-2.5 text-xs font-bold text-[#DDEFD9]">
                <CheckCircle className="w-4 h-4 text-[#C9A227]" />
                <span>MongoDB Atlas Secured Auth</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-bold text-[#DDEFD9]">
                <CheckCircle className="w-4 h-4 text-[#C9A227]" />
                <span>Real-Time Idukki Weather & NPK Sync</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-bold text-[#DDEFD9]">
                <CheckCircle className="w-4 h-4 text-[#C9A227]" />
                <span>AI Harvest Yield Optimization</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-bold text-[#DDEFD9]/60">
              <ShieldCheck className="w-4 h-4 text-[#5C8D4E]" />
              <span>256-Bit Encrypted Agricultural Security</span>
            </div>

          </div>

          {/* RIGHT SIDE - Authentication Forms & Flow */}
          <div className="lg:col-span-7 p-6 sm:p-8 md:p-12 flex flex-col justify-center">
            
            {/* Form View Selector Bar */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#D7E6D5]">
              <h3 className="text-xl md:text-2xl font-black text-[#17331F] font-poppins">
                {authMode === 'login' && 'Sign In to Account'}
                {authMode === 'signup' && 'Create New Account'}
                {authMode === 'otp' && 'Email OTP Verification'}
                {authMode === 'forgot' && 'Forgot Password'}
                {authMode === 'reset' && 'Reset Password'}
              </h3>

              {authMode !== 'login' && authMode !== 'signup' && (
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setFieldErrors({});
                    setFormGlobalError('');
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-[#1F5E3B] hover:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Login</span>
                </button>
              )}
            </div>

            {formGlobalError && (
              <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
                <span>{formGlobalError}</span>
              </div>
            )}

            {resetSuccessMessage && (
              <div className="mb-6 p-3.5 rounded-xl bg-[#DDEFD9] border border-[#5C8D4E]/40 text-[#1F5E3B] text-xs font-bold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0 text-[#1F5E3B]" />
                <span>{resetSuccessMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              
              {/* ===== 1. SIGNUP EXTRA FIELDS ===== */}
              {authMode === 'signup' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-[#17331F] mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className={`w-4 h-4 absolute left-3.5 top-3.5 ${fieldErrors.fullName ? 'text-red-500' : 'text-[#5C8D4E]'}`} />
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="e.g. Milu George"
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium focus:outline-none transition-colors ${
                          fieldErrors.fullName 
                            ? 'bg-red-50/50 border-2 border-red-400 text-red-900' 
                            : 'bg-[#F8FAF7] border border-[#D7E6D5] text-[#17331F] focus:border-[#1F5E3B]'
                        }`}
                      />
                    </div>
                    {fieldErrors.fullName && (
                      <p className="mt-1 text-[11px] font-bold text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{fieldErrors.fullName}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17331F] mb-1.5">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className={`w-4 h-4 absolute left-3.5 top-3.5 ${fieldErrors.username ? 'text-red-500' : 'text-[#5C8D4E]'}`} />
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="e.g. milu_planter"
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium focus:outline-none transition-colors ${
                          fieldErrors.username 
                            ? 'bg-red-50/50 border-2 border-red-400 text-red-900' 
                            : 'bg-[#F8FAF7] border border-[#D7E6D5] text-[#17331F] focus:border-[#1F5E3B]'
                        }`}
                      />
                    </div>
                    {fieldErrors.username && (
                      <p className="mt-1 text-[11px] font-bold text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{fieldErrors.username}</span>
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#17331F] mb-1.5">
                        District / Location <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="district"
                        value={formData.district}
                        onChange={(e) => {
                          handleChange(e);
                          setFormData(prev => ({ ...prev, district: e.target.value, location: e.target.value }));
                        }}
                        placeholder="e.g. Idukki, Wayanad, Palakkad"
                        className="w-full px-4 py-2.5 rounded-xl text-xs font-medium bg-[#F8FAF7] border border-[#D7E6D5] text-[#17331F] focus:border-[#1F5E3B]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#17331F] mb-1.5">
                        Role
                      </label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-xl text-xs font-bold bg-[#F8FAF7] border border-[#D7E6D5] text-[#17331F] focus:border-[#1F5E3B]"
                      >
                        <option value="Farmer">Farmer / Cultivator</option>
                        <option value="Expert">Agro Specialist / Expert</option>
                        <option value="Investor">Plantation Investor</option>
                        <option value="User">General Member</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17331F] mb-1.5">
                      Profile Image URL (Optional)
                    </label>
                    <input
                      type="text"
                      name="profileImage"
                      value={formData.profileImage}
                      onChange={handleChange}
                      placeholder="https://... or leave blank"
                      className="w-full px-4 py-2.5 rounded-xl text-xs font-medium bg-[#F8FAF7] border border-[#D7E6D5] text-[#17331F] focus:border-[#1F5E3B]"
                    />
                  </div>
                </>
              )}

              {/* ===== 2. EMAIL / USERNAME FIELD ===== */}
              {(authMode === 'login' || authMode === 'signup') && (
                <div>
                  <label className="block text-xs font-bold text-[#17331F] mb-1.5">
                    {authMode === 'login' ? 'Email Address or Username' : 'Email Address'} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className={`w-4 h-4 absolute left-3.5 top-3.5 ${fieldErrors.email ? 'text-red-500' : 'text-[#5C8D4E]'}`} />
                    <input
                      type="text"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder={authMode === 'login' ? 'Enter email or username' : 'user@domain.com'}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium focus:outline-none transition-colors ${
                        fieldErrors.email 
                          ? 'bg-red-50/50 border-2 border-red-400 text-red-900' 
                          : 'bg-[#F8FAF7] border border-[#D7E6D5] text-[#17331F] focus:border-[#1F5E3B]'
                      }`}
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="mt-1 text-[11px] font-bold text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{fieldErrors.email}</span>
                    </p>
                  )}
                </div>
              )}

              {/* ===== 3. PASSWORD FIELD ===== */}
              {(authMode === 'login' || authMode === 'signup') && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-[#17331F]">
                      Password <span className="text-red-500">*</span>
                    </label>
                    {authMode === 'login' && (
                      <button
                        type="button"
                        onClick={() => switchAuthMode('forgot')}
                        className="text-[11px] font-bold text-[#1F5E3B] hover:underline cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className={`w-4 h-4 absolute left-3.5 top-3.5 ${fieldErrors.password ? 'text-red-500' : 'text-[#5C8D4E]'}`} />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium focus:outline-none transition-colors ${
                        fieldErrors.password 
                          ? 'bg-red-50/50 border-2 border-red-400 text-red-900' 
                          : 'bg-[#F8FAF7] border border-[#D7E6D5] text-[#17331F] focus:border-[#1F5E3B]'
                      }`}
                    />
                  </div>
                  {fieldErrors.password && (
                    <p className="mt-1 text-[11px] font-bold text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{fieldErrors.password}</span>
                    </p>
                  )}
                </div>
              )}

              {/* ===== FORGOT PASSWORD FORM ===== */}
              {authMode === 'forgot' && (
                <div className="space-y-4">
                  <p className="text-xs text-[#4A5568] leading-relaxed font-medium">
                    Enter your registered email address below. We will send a 6-digit OTP security code to reset your password.
                  </p>
                  <div>
                    <label className="block text-xs font-bold text-[#17331F] mb-1.5">Registered Email Address <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-[#5C8D4E]" />
                      <input 
                        type="email"
                        value={resetEmail || formData.email}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="user@domain.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium bg-[#F8FAF7] border border-[#D7E6D5] text-[#17331F] focus:outline-none focus:border-[#1F5E3B]"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#1F5E3B] to-[#5C8D4E] hover:from-[#5C8D4E] hover:to-[#1F5E3B] text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
                  >
                    <span>{isSubmitting ? 'Sending OTP...' : 'Send Reset OTP Code'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => switchAuthMode('login')}
                    className="w-full text-xs font-bold text-[#4A5568] hover:text-[#1F5E3B] text-center block pt-2 cursor-pointer"
                  >
                    ← Back to Login
                  </button>
                </div>
              )}

              {/* ===== RESET PASSWORD FORM ===== */}
              {authMode === 'reset' && (
                <div className="space-y-4">
                  <p className="text-xs text-[#4A5568] leading-relaxed font-medium">
                    Enter the 6-digit OTP code sent to <strong>{resetEmail || formData.email}</strong> and your new password.
                  </p>
                  <div>
                    <label className="block text-xs font-bold text-[#17331F] mb-1.5">6-Digit OTP Code <span className="text-red-500">*</span></label>
                    <input 
                      type="text"
                      value={resetOtp}
                      onChange={(e) => setResetOtp(e.target.value)}
                      placeholder="e.g. 123456"
                      className="w-full px-4 py-2.5 rounded-xl text-xs font-bold bg-[#F8FAF7] border border-[#D7E6D5] text-[#17331F] focus:outline-none focus:border-[#1F5E3B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#17331F] mb-1.5">New Password <span className="text-red-500">*</span></label>
                    <input 
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full px-4 py-2.5 rounded-xl text-xs font-medium bg-[#F8FAF7] border border-[#D7E6D5] text-[#17331F] focus:outline-none focus:border-[#1F5E3B]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#1F5E3B] to-[#5C8D4E] hover:from-[#5C8D4E] hover:to-[#1F5E3B] text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
                  >
                    <span>{isSubmitting ? 'Resetting Password...' : 'Reset Password & Log In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => switchAuthMode('login')}
                    className="w-full text-xs font-bold text-[#4A5568] hover:text-[#1F5E3B] text-center block pt-2 cursor-pointer"
                  >
                    ← Back to Login
                  </button>
                </div>
              )}

              {/* ===== 4. CONFIRM PASSWORD ===== */}
              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-bold text-[#17331F] mb-1.5">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className={`w-4 h-4 absolute left-3.5 top-3.5 ${fieldErrors.confirmPassword ? 'text-red-500' : 'text-[#5C8D4E]'}`} />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium focus:outline-none transition-colors ${
                        fieldErrors.confirmPassword 
                          ? 'bg-red-50/50 border-2 border-red-400 text-red-900' 
                          : 'bg-[#F8FAF7] border border-[#D7E6D5] text-[#17331F] focus:border-[#1F5E3B]'
                      }`}
                    />
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="mt-1 text-[11px] font-bold text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{fieldErrors.confirmPassword}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Main Submit Button */}
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#1F5E3B] to-[#5C8D4E] hover:from-[#5C8D4E] hover:to-[#1F5E3B] text-white font-extrabold text-sm shadow-[0_6px_20px_rgba(31,94,59,0.25)] hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                <span>
                  {authMode === 'login' && (isSubmitting ? 'Signing In...' : 'Sign In')}
                  {authMode === 'signup' && (isSubmitting ? 'Registering Account...' : 'Sign Up & Create Account')}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </form>

            {/* Social Google Login option */}
            {(authMode === 'login' || authMode === 'signup') && (
              <>
                <div className="relative my-6 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#D7E6D5]" />
                  </div>
                  <span className="relative px-4 bg-white text-xs font-bold text-[#4A5568]">
                    OR CONTINUE WITH
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  className="w-full py-2.5 rounded-full bg-[#F8FAF7] hover:bg-[#DDEFD9] border border-[#D7E6D5] text-[#17331F] font-bold text-xs transition-colors flex items-center justify-center gap-2.5 shadow-sm"
                >
                  <FaGoogle className="w-4 h-4 text-[#1F5E3B]" />
                  <span>Google Authentication</span>
                </button>
              </>
            )}

            {/* Bottom Toggle Text */}
            <div className="mt-8 text-center text-xs font-medium text-[#4A5568]">
              {authMode === 'login' ? (
                <p>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchAuthMode('signup')}
                    className="text-[#1F5E3B] font-extrabold hover:underline cursor-pointer"
                  >
                    Sign Up Free
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchAuthMode('login')}
                    className="text-[#1F5E3B] font-extrabold hover:underline cursor-pointer"
                  >
                    Log In
                  </button>
                </p>
              )}
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Auth;
