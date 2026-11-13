'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { api } from '@/lib/api';
import {
  Shield, Sparkles, Mail, Lock, Phone, ArrowRight,
  CheckCircle2, UserCheck, Key, RefreshCw, Loader2
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { user, loginUser, lang, setLang, t } = useAuth();

  const [authMode, setAuthMode] = useState<'email_otp' | 'email_password' | 'phone_otp'>('email_otp');
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Email OTP states
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpCode, setEmailOtpCode] = useState('');
  const [emailDevCode, setEmailDevCode] = useState('');
  const [emailCooldown, setEmailCooldown] = useState(0);

  // Phone OTP states
  const [phone, setPhone] = useState('');
  const [phoneOtpCode, setPhoneOtpCode] = useState('');
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneCooldown, setPhoneCooldown] = useState(0);
  const [phoneDevCode, setPhoneDevCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  // Timers for resend cooldowns
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (emailCooldown > 0) {
      timer = setTimeout(() => setEmailCooldown(emailCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [emailCooldown]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (phoneCooldown > 0) {
      timer = setTimeout(() => setPhoneCooldown(phoneCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [phoneCooldown]);

  // --- Email + Password Auth ---
  const handleEmailPasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        const res = await api.register({ email, password, name });
        await loginUser(res.tokens, res.default_workspace_id);
      } else {
        const res = await api.login({ email, password });
        await loginUser(res.tokens, res.default_workspace_id);
      }
      router.push('/');
    } catch (err: any) {
      setError(err?.data?.error || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // --- Email OTP Auth ---
  const handleSendEmailOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await api.requestOtp({ email: email.trim().toLowerCase() });
      setEmailOtpSent(true);
      setEmailCooldown(res.cooldown_seconds || 45);
      if (res.dev_code) {
        setEmailDevCode(res.dev_code);
        setEmailOtpCode(res.dev_code);
      }
    } catch (err: any) {
      setError(err?.data?.error || err.message || 'Failed to send OTP to email');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOtpCode || emailOtpCode.trim().length !== 6) {
      setError('Please enter the 6-digit OTP sent to your email');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await api.verifyOtp({
        email: email.trim().toLowerCase(),
        code: emailOtpCode.trim(),
        name: name.trim() || undefined,
      });
      await loginUser(res.tokens, res.default_workspace_id);
      if (res.is_new_user) {
        router.push('/onboarding');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err?.data?.error || err.message || 'Invalid or expired OTP code');
    } finally {
      setLoading(false);
    }
  };

  // --- Phone OTP Auth ---
  const handleSendPhoneOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!phone) {
      setError('Please enter your mobile number');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await api.requestOtp({ phone: phone.trim() });
      setPhoneOtpSent(true);
      setPhoneCooldown(res.cooldown_seconds || 45);
      if (res.dev_code) {
        setPhoneDevCode(res.dev_code);
        setPhoneOtpCode(res.dev_code);
      }
    } catch (err: any) {
      setError(err?.data?.error || err.message || 'Failed to send Phone OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneOtpCode) {
      setError('Please enter the 6-digit code');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await api.verifyOtp({ phone: phone.trim(), code: phoneOtpCode.trim(), name: name.trim() });
      await loginUser(res.tokens, res.default_workspace_id);
      if (res.is_new_user) {
        router.push('/onboarding');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err?.data?.error || err.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  // --- Social Logins ---
  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple') => {
    setError('');
    setLoading(true);
    try {
      const mockSocialPayload = {
        google: {
          token: 'google_oauth_token_' + Date.now(),
          provider_user_id: 'goog_' + Date.now().toString().slice(-6),
          email: `user.${Date.now().toString().slice(-4)}@gmail.com`,
          name: 'Google User',
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=google',
        },
        facebook: {
          token: 'facebook_token_' + Date.now(),
          provider_user_id: 'fb_' + Date.now().toString().slice(-6),
          name: 'Facebook User',
          email: `fb.${Date.now().toString().slice(-4)}@facebook.com`,
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=facebook',
        },
        apple: {
          token: 'apple_identity_token_' + Date.now(),
          provider_user_id: 'apple_' + Date.now().toString().slice(-6),
          email: `apple.${Date.now().toString().slice(-4)}@privaterelay.appleid.com`,
          name: 'Apple User',
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=apple',
        },
      };

      const res = await api.socialAuth(provider, mockSocialPayload[provider]);
      await loginUser(res.tokens, res.default_workspace_id);
      router.push('/');
    } catch (err: any) {
      setError(err?.data?.error || err.message || `${provider} authentication failed`);
    } finally {
      setLoading(false);
    }
  };

  // Demo role one-click login
  const loginAsDemo = async (demoEmail: string) => {
    setError('');
    setLoading(true);
    try {
      const res = await api.login({ email: demoEmail, password: 'password123' });
      await loginUser(res.tokens, res.default_workspace_id);
      router.push('/');
    } catch (err: any) {
      setError(err?.data?.error || err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Language switcher top bar */}
      <div className="absolute top-4 right-6 flex items-center space-x-2 text-xs text-gray-500">
        <span>Language:</span>
        <button
          onClick={() => setLang('en')}
          className={`px-2 py-1 rounded font-medium ${lang === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          English
        </button>
        <button
          onClick={() => setLang('ta')}
          className={`px-2 py-1 rounded font-medium ${lang === 'ta' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          தமிழ்
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center space-x-2">
          <span className="text-3xl">🚀</span>
          <span className="text-2xl font-bold tracking-tight text-gray-900">{t.appName}</span>
        </div>
        <h2 className="mt-2 text-center text-sm text-gray-600">
          {t.tagline} · Notion-Style Workspace + Task Hierarchy
        </h2>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-gray-200 sm:rounded-xl sm:px-10">
          {/* Quick Demo Role Switcher */}
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-1 text-xs font-semibold text-blue-900 mb-2">
              <UserCheck className="w-3.5 h-3.5" />
              <span>One-Click Demo Roles (Ready to Explore):</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => loginAsDemo('gm@seyal.app')}
                className="p-1.5 bg-white border border-blue-200 rounded text-left hover:border-blue-400 font-medium text-gray-800 transition"
              >
                👑 GM / Principal
              </button>
              <button
                type="button"
                onClick={() => loginAsDemo('manager@seyal.app')}
                className="p-1.5 bg-white border border-blue-200 rounded text-left hover:border-blue-400 font-medium text-gray-800 transition"
              >
                💼 HOD / Manager
              </button>
              <button
                type="button"
                onClick={() => loginAsDemo('staff@seyal.app')}
                className="p-1.5 bg-white border border-blue-200 rounded text-left hover:border-blue-400 font-medium text-gray-800 transition"
              >
                ✍️ Faculty / Staff
              </button>
              <button
                type="button"
                onClick={() => loginAsDemo('student@seyal.app')}
                className="p-1.5 bg-white border border-blue-200 rounded text-left hover:border-blue-400 font-medium text-gray-800 transition"
              >
                🎒 Personal Student
              </button>
            </div>
          </div>

          {/* Social Logins */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              disabled={loading}
              className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Continue with Google
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSocialLogin('apple')}
                disabled={loading}
                className="flex justify-center items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
              >
                <span className="mr-1.5 text-base"></span> Apple
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin('facebook')}
                disabled={loading}
                className="flex justify-center items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
              >
                <span className="mr-1.5 text-blue-600 font-bold">f</span> Facebook
              </button>
            </div>
          </div>

          <div className="mt-5 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-400">or sign in with</span>
            </div>
          </div>

          {/* Switcher: Email OTP | Email Password | Phone OTP */}
          <div className="mt-4 grid grid-cols-3 gap-1 border border-gray-200 rounded-lg p-1 bg-gray-50 text-xs">
            <button
              type="button"
              onClick={() => { setAuthMode('email_otp'); setError(''); }}
              className={`py-1.5 font-medium rounded-md transition flex items-center justify-center gap-1 ${
                authMode === 'email_otp' ? 'bg-white shadow text-blue-600 font-semibold' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email OTP</span>
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('email_password'); setError(''); }}
              className={`py-1.5 font-medium rounded-md transition flex items-center justify-center gap-1 ${
                authMode === 'email_password' ? 'bg-white shadow text-gray-900 font-semibold' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Password</span>
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('phone_otp'); setError(''); }}
              className={`py-1.5 font-medium rounded-md transition flex items-center justify-center gap-1 ${
                authMode === 'phone_otp' ? 'bg-white shadow text-gray-900 font-semibold' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Phone OTP</span>
            </button>
          </div>

          {error && (
            <div className="mt-4 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          {/* 1. EMAIL OTP (PASSWORDLESS MAGIC CODE) */}
          {authMode === 'email_otp' && (
            <div className="mt-4 space-y-3.5">
              {!emailOtpSent ? (
                <form onSubmit={handleSendEmailOtp} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700">
                      Work or Personal Email Address
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com or gm@seyal.app"
                        className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                      />
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">
                      We will send a 6-digit magic code to verify your identity. No password needed.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {loading ? 'Sending Code...' : 'Get 6-Digit Email OTP'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyEmailOtp} className="space-y-3">
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-900 space-y-1">
                    <p>
                      Enter the 6-digit verification code sent to <strong>{email}</strong>
                    </p>
                    {emailDevCode && (
                      <div className="mt-1 p-2 bg-emerald-100/70 border border-emerald-300 rounded text-emerald-900 flex items-center justify-between">
                        <span className="font-semibold">
                          🧪 Dev OTP: <span className="font-mono tracking-widest">{emailDevCode}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setEmailOtpCode(emailDevCode)}
                          className="text-[11px] bg-emerald-600 text-white px-2 py-0.5 rounded font-medium hover:bg-emerald-700 transition"
                        >
                          Auto-fill
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700">Enter 6-Digit OTP</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      autoFocus
                      value={emailOtpCode}
                      onChange={(e) => setEmailOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••••"
                      className="mt-1 block w-full px-3 py-2 text-center tracking-widest text-xl font-mono border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {loading ? 'Validating OTP...' : 'Verify OTP & Log In'}
                  </button>

                  <div className="flex justify-between items-center text-xs text-gray-500 pt-1">
                    <button
                      type="button"
                      onClick={() => { setEmailOtpSent(false); setEmailOtpCode(''); }}
                      className="text-gray-500 hover:underline"
                    >
                      Change email
                    </button>
                    <button
                      type="button"
                      disabled={emailCooldown > 0}
                      onClick={() => handleSendEmailOtp()}
                      className={`font-medium ${emailCooldown > 0 ? 'text-gray-400' : 'text-blue-600 hover:underline'}`}
                    >
                      {emailCooldown > 0 ? `Resend in ${emailCooldown}s` : 'Resend Email OTP'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* 2. EMAIL & PASSWORD AUTH */}
          {authMode === 'email_password' && (
            <form onSubmit={handleEmailPasswordAuth} className="mt-4 space-y-3.5">
              {isRegister && (
                <div>
                  <label className="block text-xs font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Anand Kumar"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-700">Email Address</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Password</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}
              </button>

              <div className="text-center text-xs text-gray-500 pt-1">
                {isRegister ? (
                  <>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setIsRegister(false)}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Sign In
                    </button>
                  </>
                ) : (
                  <>
                    Don&apos;t have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setIsRegister(true)}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </form>
          )}

          {/* 3. MOBILE PHONE OTP */}
          {authMode === 'phone_otp' && (
            <div className="mt-4 space-y-3.5">
              {!phoneOtpSent ? (
                <form onSubmit={handleSendPhoneOtp} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Mobile Number (India / Global)</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 9876543210"
                        className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Send 6-Digit Mobile OTP'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyPhoneOtp} className="space-y-3">
                  <div className="p-2.5 bg-blue-50 border border-blue-100 rounded text-xs text-blue-900">
                    OTP sent to <strong>{phone}</strong>.
                    {phoneDevCode && (
                      <span className="block mt-1 font-semibold text-emerald-700">
                        🧪 Dev Simulator OTP: {phoneDevCode}
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Enter 6-Digit OTP</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={phoneOtpCode}
                      onChange={(e) => setPhoneOtpCode(e.target.value)}
                      placeholder="123456"
                      className="mt-1 block w-full px-3 py-2 text-center tracking-widest text-lg font-mono border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : 'Verify & Continue'}
                  </button>

                  <div className="flex justify-between items-center text-xs text-gray-500 pt-1">
                    <button
                      type="button"
                      onClick={() => setPhoneOtpSent(false)}
                      className="text-gray-500 hover:underline"
                    >
                      Change number
                    </button>
                    <button
                      type="button"
                      disabled={phoneCooldown > 0}
                      onClick={() => handleSendPhoneOtp()}
                      className={`font-medium ${phoneCooldown > 0 ? 'text-gray-400' : 'text-blue-600 hover:underline'}`}
                    >
                      {phoneCooldown > 0 ? `Resend in ${phoneCooldown}s` : 'Resend OTP'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
