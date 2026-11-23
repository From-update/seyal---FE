'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import { api } from '@/lib/api';
import {
  Mail,
  Lock,
  Phone,
  ArrowRight,
  CheckCircle2,
  Loader2,
  X,
  Eye,
  EyeOff,
  Globe,
  Sparkles,
  HelpCircle,
  Building2,
} from 'lucide-react';
import { SeyalLogo } from '@/components/SeyalLogo';
import { DashboardShowcase } from '@/components/DashboardShowcase';

export default function LoginPage() {
  const router = useRouter();
  const { user, loginUser, lang, setLang, t } = useAuth();

  // Mode: 'email_password' (default) | 'email_otp' | 'phone_otp'
  const [authMode, setAuthMode] = useState<'email_password' | 'email_otp' | 'phone_otp'>('email_password');
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Email OTP states
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpCode, setEmailOtpCode] = useState('');
  const [emailCooldown, setEmailCooldown] = useState(0);

  // Phone OTP states
  const [phone, setPhone] = useState('');
  const [phoneOtpCode, setPhoneOtpCode] = useState('');
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneCooldown, setPhoneCooldown] = useState(0);

  // Google Sign-in OTP states
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleOtpSent, setGoogleOtpSent] = useState(false);
  const [googleOtpCode, setGoogleOtpCode] = useState('');
  const [googleCooldown, setGoogleCooldown] = useState(0);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');
  const [googleEmailSentSuccess, setGoogleEmailSentSuccess] = useState(false);

  // Secondary modals
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showContactAdminModal, setShowContactAdminModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (googleCooldown > 0) {
      timer = setTimeout(() => setGoogleCooldown(googleCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [googleCooldown]);

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
      setError(err?.data?.error || err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // --- Email OTP Auth ---
  const handleSendEmailOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid work email address');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await api.requestOtp({ email: email.trim().toLowerCase() });
      setEmailOtpSent(true);
      setEmailCooldown(res.cooldown_seconds || 45);
      setEmailOtpCode('');
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
      setError('Please enter your mobile phone number');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await api.requestOtp({ phone: phone.trim() });
      setPhoneOtpSent(true);
      setPhoneCooldown(res.cooldown_seconds || 45);
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

  // --- Google Account OTP Sign In ---
  const handleStartGoogleSignIn = () => {
    setShowGoogleModal(true);
    setGoogleError('');
    setGoogleOtpSent(false);
    setGoogleOtpCode('');
    setGoogleEmailSentSuccess(false);
  };

  const handleSendGoogleOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = googleEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setGoogleError('Please enter a valid Google account email address');
      return;
    }
    setGoogleError('');
    setGoogleLoading(true);
    try {
      const res = await api.requestOtp({ email: cleanEmail, provider: 'google' });
      setGoogleOtpSent(true);
      setEmailCooldown(res.cooldown_seconds || 45);
      setGoogleEmailSentSuccess(!!res.email_sent);
      setGoogleOtpCode('');
    } catch (err: any) {
      setGoogleError(err?.data?.error || err.message || 'Failed to send OTP to Google email');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleVerifyGoogleOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = googleEmail.trim().toLowerCase();
    if (!googleOtpCode) {
      setGoogleError('Please enter the 6-digit verification code');
      return;
    }
    setGoogleError('');
    setGoogleLoading(true);
    try {
      const displayName = cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      const res = await api.verifyOtp({
        email: cleanEmail,
        code: googleOtpCode.trim(),
        provider: 'google',
        name: displayName,
      });
      await loginUser(res.tokens, res.default_workspace_id);
      setShowGoogleModal(false);
      router.push('/');
    } catch (err: any) {
      setGoogleError(err?.data?.error || err.message || 'Invalid or expired OTP code');
    } finally {
      setGoogleLoading(false);
    }
  };

  // --- Social Logins ---
  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple' | 'microsoft') => {
    if (provider === 'google') {
      handleStartGoogleSignIn();
      return;
    }
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
        microsoft: {
          token: 'microsoft_token_' + Date.now(),
          provider_user_id: 'ms_' + Date.now().toString().slice(-6),
          name: 'Microsoft User',
          email: `user.${Date.now().toString().slice(-4)}@outlook.com`,
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=microsoft',
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

      const res = await api.socialAuth(provider === 'microsoft' ? 'google' : provider, mockSocialPayload[provider]);
      await loginUser(res.tokens, res.default_workspace_id);
      router.push('/');
    } catch (err: any) {
      setError(err?.data?.error || err.message || `${provider} authentication failed`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="h-screen h-[100dvh] w-full overflow-hidden flex flex-col lg:grid lg:grid-cols-12 bg-white antialiased font-sans box-border"
      suppressHydrationWarning
    >
      {/* ========================================================================= */}
      {/* LEFT PANEL: Branding & Product Showcase (Video Background)                */}
      {/* ========================================================================= */}
      <section className="lg:col-span-7 xl:col-span-7 bg-[#042e24] relative overflow-hidden hidden lg:flex flex-col justify-between p-4 sm:p-6 lg:p-7 xl:p-8 text-white h-full box-border select-none">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
        >
          <source src="/seyal-login-bg.mp4" type="video/mp4" />
        </video>

        {/* Video Overlay with Emerald Tint to maintain brand identity & crisp legibility */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#042e24]/75 via-[#064b3b]/65 to-[#08745b]/75 pointer-events-none z-[1]" />

        {/* Ambient background glow accents */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-[#119875]/20 blur-3xl pointer-events-none z-[2]" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-[#10b981]/15 blur-3xl pointer-events-none z-[2]" />

        {/* Top: SEYAL Logo */}
        <div className="relative z-10 shrink-0">
          <SeyalLogo theme="dark" size="md" />
        </div>

        {/* Center: Headings & Realistic Dashboard Preview */}
        <div className="relative z-10 my-auto py-2 shrink-0">
          {/* Main Heading */}
          <div className="text-center max-w-lg mx-auto mb-3 xl:mb-4">
            <h1 className="text-xl sm:text-2xl xl:text-3xl font-extrabold text-white tracking-tight leading-snug">
              Your Work Assignment &amp;{' '}
              <span className="text-[#34D399] drop-shadow-sm">Tracking Platform</span>
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-emerald-100/80 leading-relaxed max-w-md mx-auto">
              Assign work, track progress, monitor outcomes and bring complete accountability to your team.
            </p>
          </div>

          {/* Interactive / Realistic Dashboard Mockup */}
          <DashboardShowcase
            userName="Prabanjan R"
            phoneUserName="Sanjay A"
            avatarInitials="PR"
          />
        </div>

        {/* Bottom subtle copyright / branding note */}
        <div className="relative z-10 pt-2 flex items-center justify-between text-[11px] text-emerald-200/60 border-t border-emerald-800/40 shrink-0">
          <span>&copy; {new Date().getFullYear()} SEYAL Platform. All rights reserved.</span>
          <span className="flex items-center gap-1.5 text-emerald-300">
            <Sparkles className="w-3 h-3" /> High Performance Workspace
          </span>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* RIGHT PANEL: Clean White Enterprise Login Interface                       */}
      {/* ========================================================================= */}
      <section className="col-span-12 lg:col-span-5 xl:col-span-5 bg-white flex flex-col justify-between p-4 sm:p-6 lg:p-7 xl:p-8 relative h-full overflow-y-auto lg:overflow-hidden box-border">
        {/* Top Bar: Mobile Logo & Language Switcher */}
        <div className="flex items-center justify-between w-full shrink-0 mb-1">
          {/* Mobile-only logo */}
          <div className="lg:hidden">
            <SeyalLogo theme="light" size="sm" />
          </div>

          {/* Language Toggle */}
          <div className="ml-auto flex items-center space-x-1 text-xs bg-[#EDF6F1] p-0.5 rounded-xl border border-emerald-200/60">
            <Globe className="w-3.5 h-3.5 text-[#08745B] ml-1.5" />
            <button
              onClick={() => setLang('en')}
              className={`px-2 py-0.5 rounded-lg font-semibold transition text-[11px] ${
                lang === 'en'
                  ? 'bg-[#08745B] text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLang('ta')}
              className={`px-2 py-0.5 rounded-lg font-semibold transition text-[11px] ${
                lang === 'ta'
                  ? 'bg-[#08745B] text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              தமிழ்
            </button>
          </div>
        </div>

        {/* Center: Main Login Form */}
        <div className="w-full max-w-[350px] mx-auto my-auto py-1 shrink-0">
          {/* Logo on Right Panel */}
          <div className="text-center mb-3">
            <div className="flex justify-center mb-1.5">
              <SeyalLogo theme="light" size="md" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#14251F] tracking-tight">
              Welcome to <span className="text-[#08745B]">SEYAL</span>
            </h2>
            <p className="text-xs text-[#77847E] mt-0.5 font-medium">
              Sign in to access your workspace
            </p>
          </div>

          {/* Segmented Control for Authentication Modes */}
          <div className="mb-3.5 grid grid-cols-3 gap-1 p-0.5 bg-[#EDF6F1] rounded-xl border border-emerald-200/70 text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setAuthMode('email_password'); setError(''); }}
              className={`py-1.5 rounded-lg transition flex items-center justify-center gap-1 ${
                authMode === 'email_password'
                  ? 'bg-white text-[#08745B] shadow-xs font-bold'
                  : 'text-[#77847E] hover:text-[#14251F]'
              }`}
            >
              <Lock className="w-3 h-3" />
              <span>Password</span>
            </button>

            <button
              type="button"
              onClick={() => { setAuthMode('email_otp'); setError(''); }}
              className={`py-1.5 rounded-lg transition flex items-center justify-center gap-1 ${
                authMode === 'email_otp'
                  ? 'bg-white text-[#08745B] shadow-xs font-bold'
                  : 'text-[#77847E] hover:text-[#14251F]'
              }`}
            >
              <Mail className="w-3 h-3" />
              <span>Email OTP</span>
            </button>

            <button
              type="button"
              onClick={() => { setAuthMode('phone_otp'); setError(''); }}
              className={`py-1.5 rounded-lg transition flex items-center justify-center gap-1 ${
                authMode === 'phone_otp'
                  ? 'bg-white text-[#08745B] shadow-xs font-bold'
                  : 'text-[#77847E] hover:text-[#14251F]'
              }`}
            >
              <Phone className="w-3 h-3" />
              <span>Phone OTP</span>
            </button>
          </div>

          {/* Global Error Banner */}
          {error && (
            <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2">
              <span className="font-semibold text-rose-800">Error:</span>
              <span className="flex-1">{error}</span>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 1: EMAIL & PASSWORD (MATCHING REFERENCE DESIGN EXACTLY)    */}
          {/* ------------------------------------------------------------- */}
          {authMode === 'email_password' && (
            <form onSubmit={handleEmailPasswordAuth} className="space-y-3">
              {isRegister && (
                <div>
                  <label className="block text-xs font-semibold text-[#14251F] mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Prof. Rajesh Sundaram"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-[#08745B] focus:ring-2 focus:ring-[#08745B]/20 transition bg-white"
                  />
                </div>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-[#14251F] mb-1">
                  Email Address or Username
                </label>
                <div className="relative rounded-xl border border-neutral-300 focus-within:border-[#08745B] focus-within:ring-2 focus-within:ring-[#08745B]/20 transition bg-white">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#77847E]">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin or you@seyal.app"
                    className="block w-full pl-9 pr-3 py-2 rounded-xl text-sm focus:outline-none bg-transparent placeholder:text-neutral-400 text-[#14251F]"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-[#14251F] mb-1">
                  Password
                </label>
                <div className="relative rounded-xl border border-neutral-300 focus-within:border-[#08745B] focus-within:ring-2 focus-within:ring-[#08745B]/20 transition bg-white">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#77847E]">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="block w-full pl-9 pr-9 py-2 rounded-xl text-sm focus:outline-none bg-transparent placeholder:text-neutral-400 text-[#14251F]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#77847E] hover:text-[#14251F] transition"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password Row */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center space-x-1.5 text-[#77847E] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-[#08745B] border-neutral-300 focus:ring-[#08745B]"
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="font-semibold text-[#08745B] hover:text-[#119875] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Primary Emerald Green Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-[#08745B] hover:bg-[#119875] shadow-[0_4px_12px_rgba(8,116,91,0.25)] transition-all duration-150 disabled:opacity-50 mt-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 2: EMAIL OTP (PASSWORDLESS MAGIC CODE)                     */}
          {/* ------------------------------------------------------------- */}
          {authMode === 'email_otp' && (
            <div className="space-y-3">
              {!emailOtpSent ? (
                <form onSubmit={handleSendEmailOtp} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#14251F] mb-1">
                      Work Email Address
                    </label>
                    <div className="relative rounded-xl border border-neutral-300 focus-within:border-[#08745B] focus-within:ring-2 focus-within:ring-[#08745B]/20 transition bg-white">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#77847E]">
                        <Mail className="h-4 w-4" />
                      </div>
                      <input
                        type="email"
                        required
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@lexiontech.com or you@seyal.app"
                        className="block w-full pl-9 pr-3 py-2 rounded-xl text-sm focus:outline-none bg-transparent placeholder:text-neutral-400 text-[#14251F]"
                      />
                    </div>
                    <p className="text-[11px] text-[#77847E] mt-1">
                      We will email a secure 6-digit magic code to verify your identity.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-[#08745B] hover:bg-[#119875] shadow-[0_4px_12px_rgba(8,116,91,0.25)] transition-all duration-150 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending Code...
                      </>
                    ) : (
                      <>
                        <span>Get 6-Digit Email OTP</span>
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyEmailOtp} className="space-y-3">
                  <div className="p-2.5 bg-[#EDF6F1] border border-emerald-200 rounded-xl text-xs text-[#064B3B] space-y-0.5">
                    <div className="flex items-center space-x-1.5 font-bold text-[#08745B]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>OTP Dispatched via Email</span>
                    </div>
                    <p className="text-neutral-600 text-[11px]">
                      Enter the 6-digit code sent to <strong>{email}</strong>. Check your inbox.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#14251F] mb-1">
                      Enter 6-Digit OTP
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      autoFocus
                      value={emailOtpCode}
                      onChange={(e) => setEmailOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••••"
                      className="block w-full px-3 py-2 text-center tracking-widest text-xl font-mono rounded-xl border border-neutral-300 focus:outline-none focus:border-[#08745B] focus:ring-2 focus:ring-[#08745B]/20 transition bg-white text-[#14251F]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-[#08745B] hover:bg-[#119875] shadow-[0_4px_12px_rgba(8,116,91,0.25)] transition-all duration-150 disabled:opacity-50"
                  >
                    {loading ? 'Verifying OTP...' : 'Verify OTP & Sign In →'}
                  </button>

                  <div className="flex justify-between items-center text-xs text-[#77847E] pt-0.5">
                    <button
                      type="button"
                      onClick={() => { setEmailOtpSent(false); setEmailOtpCode(''); }}
                      className="hover:underline text-neutral-600 font-medium"
                    >
                      Change email
                    </button>
                    <button
                      type="button"
                      disabled={emailCooldown > 0}
                      onClick={() => handleSendEmailOtp()}
                      className={`font-semibold ${emailCooldown > 0 ? 'text-neutral-400' : 'text-[#08745B] hover:underline'}`}
                    >
                      {emailCooldown > 0 ? `Resend in ${emailCooldown}s` : 'Resend Code'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 3: PHONE OTP AUTHENTICATION                                */}
          {/* ------------------------------------------------------------- */}
          {authMode === 'phone_otp' && (
            <div className="space-y-3">
              {!phoneOtpSent ? (
                <form onSubmit={handleSendPhoneOtp} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#14251F] mb-1">
                      Mobile Phone Number
                    </label>
                    <div className="relative rounded-xl border border-neutral-300 focus-within:border-[#08745B] focus-within:ring-2 focus-within:ring-[#08745B]/20 transition bg-white flex items-center">
                      <div className="pl-3 pr-2 py-2 text-xs font-bold text-neutral-600 border-r border-neutral-200">
                        +91
                      </div>
                      <input
                        type="tel"
                        required
                        autoFocus
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="98765 43210"
                        className="block w-full px-3 py-2 rounded-r-xl text-sm focus:outline-none bg-transparent placeholder:text-neutral-400 text-[#14251F]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-[#08745B] hover:bg-[#119875] shadow-[0_4px_12px_rgba(8,116,91,0.25)] transition-all duration-150 disabled:opacity-50"
                  >
                    {loading ? 'Sending SMS Code...' : 'Get Phone OTP →'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyPhoneOtp} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#14251F] mb-1">
                      Enter 6-Digit SMS Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      autoFocus
                      value={phoneOtpCode}
                      onChange={(e) => setPhoneOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••••"
                      className="block w-full px-3 py-2 text-center tracking-widest text-xl font-mono rounded-xl border border-neutral-300 focus:outline-none focus:border-[#08745B] focus:ring-2 focus:ring-[#08745B]/20 transition bg-white text-[#14251F]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-[#08745B] hover:bg-[#119875] shadow-[0_4px_12px_rgba(8,116,91,0.25)] transition-all duration-150 disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : 'Verify & Continue →'}
                  </button>

                  <div className="flex justify-between items-center text-xs text-[#77847E] pt-0.5">
                    <button
                      type="button"
                      onClick={() => setPhoneOtpSent(false)}
                      className="hover:underline text-neutral-600 font-medium"
                    >
                      Change number
                    </button>
                    <button
                      type="button"
                      disabled={phoneCooldown > 0}
                      onClick={() => handleSendPhoneOtp()}
                      className={`font-semibold ${phoneCooldown > 0 ? 'text-neutral-400' : 'text-[#08745B] hover:underline'}`}
                    >
                      {phoneCooldown > 0 ? `Resend in ${phoneCooldown}s` : 'Resend OTP'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* OR CONTINUE WITH (SOCIAL LOGINS AS IN REFERENCE IMAGE)        */}
          {/* ------------------------------------------------------------- */}
          <div className="relative my-3.5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200" />
            </div>
            <div className="relative flex justify-center text-[11px]">
              <span className="bg-white px-2.5 text-[#77847E]">Or continue with</span>
            </div>
          </div>

          {/* Social Buttons Row (Google & Microsoft) */}
          <div className="grid grid-cols-2 gap-2">
            {/* Google Button */}
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              disabled={loading}
              className="flex items-center justify-center px-3 py-2 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-700 bg-white hover:bg-neutral-50 shadow-2xs transition hover:border-neutral-300"
            >
              <svg className="w-3.5 h-3.5 mr-1.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Google
            </button>

            {/* Microsoft Button */}
            <button
              type="button"
              onClick={() => handleSocialLogin('microsoft')}
              disabled={loading}
              className="flex items-center justify-center px-3 py-2 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-700 bg-white hover:bg-neutral-50 shadow-2xs transition hover:border-neutral-300"
            >
              <svg className="w-3.5 h-3.5 mr-1.5" viewBox="0 0 23 23">
                <path fill="#f35325" d="M1 1h10v10H1z" />
                <path fill="#81bc06" d="M12 1h10v10H12z" />
                <path fill="#05a6f0" d="M1 12h10v10H1z" />
                <path fill="#ffba08" d="M12 12h10v10H12z" />
              </svg>
              Microsoft
            </button>
          </div>
        </div>

        {/* Bottom: Register & Superadmin link */}
        <div className="pt-2 border-t border-neutral-100 shrink-0 space-y-1">
          <div className="text-center text-xs text-[#77847E]">
            <span>Don&apos;t have an account? </span>
            <Link
              href="/register"
              className="font-bold text-[#08745B] hover:text-[#119875] hover:underline"
            >
              Register
            </Link>
          </div>
          <div className="text-center text-[11px] text-neutral-400">
            <Link
              href="/superadmin"
              className="hover:text-[#08745B] hover:underline inline-flex items-center gap-1 transition"
            >
              <span>🔒</span> Superadmin Portal
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* GOOGLE ACCOUNT OTP SIGN IN MODAL                                         */}
      {/* ========================================================================= */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-md overflow-hidden relative">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full border border-neutral-200 flex items-center justify-center bg-white shadow-xs">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-[#14251F] text-base">Sign in with Google</h3>
                  <p className="text-xs text-[#77847E]">to continue to SEYAL Workspace</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                className="text-neutral-400 hover:text-neutral-600 p-1.5 rounded-lg hover:bg-neutral-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content body */}
            <div className="p-5">
              {/* Notice that emails are dispatched from prabanprabanjan@gmail.com */}
              <div className="mb-3.5 p-3 bg-[#EDF6F1] border border-emerald-200 rounded-xl flex items-start space-x-2.5 text-xs text-[#064B3B]">
                <Mail className="w-4 h-4 text-[#08745B] mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold">Security Email Verification</span>
                  <p className="text-[#08745B] text-[11px] mt-0.5 leading-relaxed">
                    A secure 6-digit verification code will be sent from <strong className="font-mono">prabanprabanjan@gmail.com</strong> to your Google email address.
                  </p>
                </div>
              </div>

              {googleError && (
                <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                  {googleError}
                </div>
              )}

              {!googleOtpSent ? (
                <form onSubmit={handleSendGoogleOtp} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#14251F] mb-1">
                      Google Account Email Address
                    </label>
                    <div className="relative rounded-xl border border-neutral-300 focus-within:border-[#08745B] focus-within:ring-2 focus-within:ring-[#08745B]/20 transition bg-white">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#77847E]">
                        <Mail className="h-4 w-4" />
                      </div>
                      <input
                        type="email"
                        required
                        autoFocus
                        value={googleEmail}
                        onChange={(e) => setGoogleEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="block w-full pl-9 pr-3 py-2 rounded-xl text-sm focus:outline-none bg-transparent placeholder:text-neutral-400 text-[#14251F]"
                      />
                    </div>
                  </div>

                  {/* Quick autofill suggestion */}
                  <div className="flex items-center space-x-1.5 text-xs text-[#77847E]">
                    <span>Quick fill:</span>
                    <button
                      type="button"
                      onClick={() => setGoogleEmail('prabanprabanjan@gmail.com')}
                      className="text-[#08745B] hover:underline font-mono text-[11px] bg-[#EDF6F1] px-2 py-0.5 rounded border border-emerald-200"
                    >
                      prabanprabanjan@gmail.com
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={googleLoading}
                    className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-[#08745B] hover:bg-[#119875] shadow-[0_4px_12px_rgba(8,116,91,0.25)] transition-all duration-150 disabled:opacity-50"
                  >
                    {googleLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      'Send OTP to Google Account'
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyGoogleOtp} className="space-y-3">
                  <div className="p-2.5 bg-[#EDF6F1] border border-emerald-200 rounded-xl text-xs text-[#064B3B] space-y-0.5">
                    <div className="flex items-center space-x-1 font-bold text-[#08745B]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>OTP Dispatched via Email</span>
                    </div>
                    <p className="text-neutral-600 text-[11px]">
                      Enter the 6-digit verification code sent to <strong>{googleEmail}</strong>. Please check your inbox.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#14251F] mb-1">
                      Enter 6-Digit OTP
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      autoFocus
                      value={googleOtpCode}
                      onChange={(e) => setGoogleOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••••"
                      className="block w-full px-3 py-2 text-center tracking-widest text-xl font-mono rounded-xl border border-neutral-300 focus:outline-none focus:border-[#08745B] focus:ring-2 focus:ring-[#08745B]/20 transition bg-white text-[#14251F]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={googleLoading}
                    className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-[#08745B] hover:bg-[#119875] shadow-[0_4px_12px_rgba(8,116,91,0.25)] transition-all duration-150 disabled:opacity-50"
                  >
                    {googleLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying Google Account...
                      </>
                    ) : (
                      'Verify & Sign In with Google'
                    )}
                  </button>

                  <div className="flex justify-between items-center text-xs text-[#77847E] pt-0.5">
                    <button
                      type="button"
                      onClick={() => { setGoogleOtpSent(false); setGoogleOtpCode(''); }}
                      className="hover:underline text-neutral-600 font-medium"
                    >
                      Use different email
                    </button>
                    <button
                      type="button"
                      disabled={googleCooldown > 0}
                      onClick={() => handleSendGoogleOtp()}
                      className={`font-semibold ${googleCooldown > 0 ? 'text-neutral-400' : 'text-[#08745B] hover:underline'}`}
                    >
                      {googleCooldown > 0 ? `Resend in ${googleCooldown}s` : 'Resend OTP'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FORGOT PASSWORD MODAL                                                    */}
      {/* ========================================================================= */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-sm overflow-hidden p-5 text-center">
            <div className="w-10 h-10 rounded-full bg-[#EDF6F1] text-[#08745B] flex items-center justify-center mx-auto mb-2.5">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#14251F]">Password Reset Assistance</h3>
            <p className="text-xs text-[#77847E] mt-1.5 leading-relaxed">
              For security, workspace password resets are managed by your institution or organization administrator.
            </p>
            <div className="mt-3.5 p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-600">
              💡 <strong>Instant Alternative:</strong> You can sign in immediately using <strong>Email OTP</strong> or <strong>Google Login</strong> without needing your password!
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setAuthMode('email_otp');
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-[#08745B] text-white text-xs font-bold hover:bg-[#119875] transition"
              >
                Use Email OTP
              </button>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="py-2 px-3.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONTACT ADMIN MODAL                                                      */}
      {/* ========================================================================= */}
      {showContactAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-sm overflow-hidden p-5 text-center">
            <div className="w-10 h-10 rounded-full bg-[#EDF6F1] text-[#08745B] flex items-center justify-center mx-auto mb-2.5">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#14251F]">Contact Workspace Administrator</h3>
            <p className="text-xs text-[#77847E] mt-1.5 leading-relaxed">
              Seyal is an enterprise work tracking platform. Workspace access is provisioned by your department or campus admin.
            </p>
            <div className="mt-3.5 p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-left space-y-1 text-neutral-700">
              <div>📧 <strong>Admin Support:</strong> support@seyal.app</div>
              <div>🏢 <strong>Enterprise Portal:</strong> admin@lexiontech.com</div>
            </div>
            <button
              type="button"
              onClick={() => setShowContactAdminModal(false)}
              className="mt-4 w-full py-2 px-4 rounded-xl bg-[#08745B] text-white text-xs font-bold hover:bg-[#119875] transition"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
