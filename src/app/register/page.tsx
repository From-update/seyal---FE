'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import { api } from '@/lib/api';
import {
  User as UserIcon,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  Globe,
  Sparkles,
  Briefcase,
  Building2,
  ChevronDown,
  X,
  FileText,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { SeyalLogo } from '@/components/SeyalLogo';
import { DashboardShowcase } from '@/components/DashboardShowcase';

export default function RegisterPage() {
  const router = useRouter();
  const { user, loginUser, lang, setLang } = useAuth();

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phonePrefix, setPhonePrefix] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('');
  const [accountType, setAccountType] = useState<'personal' | 'company' | 'organization'>('personal');
  const [organizationName, setOrganizationName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & modal states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [termsModal, setTermsModal] = useState<null | 'terms' | 'privacy'>(null);

  // Google Sign-in OTP states
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleOtpSent, setGoogleOtpSent] = useState(false);
  const [googleOtpCode, setGoogleOtpCode] = useState('');
  const [googleCooldown, setGoogleCooldown] = useState(0);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  // Google cooldown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (googleCooldown > 0) {
      timer = setTimeout(() => setGoogleCooldown(googleCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [googleCooldown]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid work email address');
      return;
    }
    if ((accountType === 'company' || accountType === 'organization') && !organizationName.trim()) {
      setError(`Please enter your ${accountType === 'company' ? 'company' : 'organization'} name`);
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }
    if (!agreeTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy to register');
      return;
    }

    setLoading(true);
    try {
      const fullPhone = phoneNumber.trim() ? `${phonePrefix}${phoneNumber.trim().replace(/^0+/, '')}` : '';
      const res = await api.register({
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: fullPhone || undefined,
        role: role || undefined,
        account_type: accountType,
        organization_name: (accountType !== 'personal' && organizationName.trim()) ? organizationName.trim() : undefined,
      });

      await loginUser(res.tokens, res.default_workspace_id);
      router.push('/');
    } catch (err: any) {
      setError(err?.data?.error || err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  // Google Account Registration Flow
  const handleStartGoogleSignIn = () => {
    setShowGoogleModal(true);
    setGoogleError('');
    setGoogleOtpSent(false);
    setGoogleOtpCode('');
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
      setGoogleCooldown(res.cooldown_seconds || 45);
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
      const displayName = fullName.trim() || cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
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

  const handleSocialAuth = async (provider: 'google' | 'microsoft') => {
    if (provider === 'google') {
      handleStartGoogleSignIn();
      return;
    }
    setError('');
    setLoading(true);
    try {
      const mockSocialPayload = {
        token: 'microsoft_token_' + Date.now(),
        provider_user_id: 'ms_' + Date.now().toString().slice(-6),
        name: fullName.trim() || 'Microsoft User',
        email: `user.${Date.now().toString().slice(-4)}@outlook.com`,
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=microsoft',
      };
      const res = await api.socialAuth('google', mockSocialPayload);
      await loginUser(res.tokens, res.default_workspace_id);
      router.push('/');
    } catch (err: any) {
      setError(err?.data?.error || err.message || `${provider} registration failed`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen lg:h-screen lg:h-[100dvh] w-full overflow-y-auto lg:overflow-hidden flex flex-col lg:grid lg:grid-cols-12 bg-white antialiased font-sans box-border"
      suppressHydrationWarning
    >
      {/* ========================================================================= */}
      {/* LEFT PANEL: Create your SEYAL Workspace Showcase                           */}
      {/* ========================================================================= */}
      <section className="lg:col-span-6 xl:col-span-6 bg-[#042e24] relative overflow-hidden hidden lg:flex flex-col justify-between p-4 sm:p-6 lg:p-7 xl:p-8 text-white h-full box-border select-none">
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

        {/* Emerald gradient overlay for contrast & readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#042e24]/75 via-[#064b3b]/65 to-[#08745b]/75 pointer-events-none z-[1]" />

        {/* Ambient background glow accents */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-[#119875]/20 blur-3xl pointer-events-none z-[2]" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-[#10b981]/15 blur-3xl pointer-events-none z-[2]" />

        {/* Top: SEYAL Logo */}
        <div className="relative z-10 shrink-0">
          <SeyalLogo theme="dark" size="md" />
        </div>

        {/* Center: Headings & Mockup */}
        <div className="relative z-10 my-auto py-2 shrink-0">
          <div className="text-center max-w-lg mx-auto mb-3 xl:mb-4">
            <h1 className="text-xl sm:text-2xl xl:text-3xl font-extrabold text-white tracking-tight leading-snug">
              Create your{' '}
              <span className="text-[#34D399] drop-shadow-sm">SEYAL Workspace</span>
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-emerald-100/80 leading-relaxed max-w-md mx-auto">
              Register to assign work, track progress and collaborate with your team in one platform.
            </p>
          </div>

          {/* Realistic Dashboard Mockup */}
          <DashboardShowcase
            userName="Sanjay A"
            avatarInitials="SA"
            welcomeSubtitle="Tasks and department progress & transactions"
            showMobile={false}
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
      {/* RIGHT PANEL: Create Your SEYAL Account Form                                */}
      {/* ========================================================================= */}
      <section className="col-span-12 lg:col-span-6 xl:col-span-6 bg-white flex flex-col justify-between p-4 sm:p-6 lg:p-7 xl:p-8 relative h-full overflow-y-auto box-border">
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

        {/* Center: Main Registration Card */}
        <div className="w-full max-w-[480px] mx-auto my-auto py-1 shrink-0">
          {/* Logo on Right Panel */}
          <div className="text-center mb-3">
            <div className="flex justify-center mb-1.5">
              <SeyalLogo theme="light" size="md" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#14251F] tracking-tight">
              Create Your <span className="text-[#08745B]">SEYAL Account</span>
            </h2>
            <p className="text-xs text-[#77847E] mt-0.5 font-medium">
              Get started with your work management workspace
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2">
              <span className="font-semibold text-rose-800">Error:</span>
              <span className="flex-1">{error}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleRegister} className="space-y-2.5">
            {/* Grid 2 Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-[#14251F] mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative rounded-xl border border-neutral-300 focus-within:border-[#08745B] focus-within:ring-2 focus-within:ring-[#08745B]/20 transition bg-white">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#77847E]">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="block w-full pl-9 pr-3 py-2 rounded-xl text-xs sm:text-sm focus:outline-none bg-transparent placeholder:text-neutral-400 text-[#14251F]"
                  />
                </div>
              </div>

              {/* Work Email Address */}
              <div>
                <label className="block text-xs font-semibold text-[#14251F] mb-1">
                  Work Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative rounded-xl border border-neutral-300 focus-within:border-[#08745B] focus-within:ring-2 focus-within:ring-[#08745B]/20 transition bg-white">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#77847E]">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@lexiontech.com or you@seyal.app"
                    className="block w-full pl-9 pr-3 py-2 rounded-xl text-xs sm:text-sm focus:outline-none bg-transparent placeholder:text-neutral-400 text-[#14251F]"
                  />
                </div>
              </div>

              {/* Phone Number with Country Code */}
              <div>
                <label className="block text-xs font-semibold text-[#14251F] mb-1">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="flex rounded-xl border border-neutral-300 focus-within:border-[#08745B] focus-within:ring-2 focus-within:ring-[#08745B]/20 transition bg-white overflow-hidden">
                  <div className="relative border-r border-neutral-200 bg-neutral-50 px-2 flex items-center">
                    <Phone className="h-3.5 w-3.5 text-[#77847E] mr-1" />
                    <select
                      value={phonePrefix}
                      onChange={(e) => setPhonePrefix(e.target.value)}
                      aria-label="Country Code"
                      className="bg-transparent text-xs font-semibold text-neutral-700 focus:outline-none cursor-pointer pr-1"
                    >
                      <option value="+91">+91</option>
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                      <option value="+65">+65</option>
                      <option value="+971">+971</option>
                    </select>
                  </div>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter phone number"
                    className="block w-full px-3 py-2 text-xs sm:text-sm focus:outline-none bg-transparent placeholder:text-neutral-400 text-[#14251F]"
                  />
                </div>
              </div>

              {/* Account / Workspace Type */}
              <div>
                <label className="block text-xs font-semibold text-[#14251F] mb-1">
                  Account Type <span className="text-rose-500">*</span>
                </label>
                <div className="relative rounded-xl border border-neutral-300 focus-within:border-[#08745B] focus-within:ring-2 focus-within:ring-[#08745B]/20 transition bg-white">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#77847E]">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <select
                    required
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value as 'personal' | 'company' | 'organization')}
                    className="block w-full pl-9 pr-8 py-2 rounded-xl text-xs sm:text-sm focus:outline-none bg-transparent text-[#14251F] appearance-none cursor-pointer"
                  >
                    <option value="personal">Personal</option>
                    <option value="company">Company</option>
                    <option value="organization">Organization</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#77847E]">
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* Company / Organization Name (Conditional if Company or Organization) */}
              {(accountType === 'company' || accountType === 'organization') && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#14251F] mb-1">
                    {accountType === 'company' ? 'Company Name' : 'Organization Name'} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative rounded-xl border border-neutral-300 focus-within:border-[#08745B] focus-within:ring-2 focus-within:ring-[#08745B]/20 transition bg-white">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#77847E]">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      placeholder={accountType === 'company' ? 'e.g. Lexiontech Inc.' : 'e.g. SEYAL Foundation'}
                      className="block w-full pl-9 pr-3 py-2 rounded-xl text-xs sm:text-sm focus:outline-none bg-transparent placeholder:text-neutral-400 text-[#14251F]"
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-[#14251F] mb-1">
                  Password <span className="text-rose-500">*</span>
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
                    placeholder="Create a password"
                    className="block w-full pl-9 pr-9 py-2 rounded-xl text-xs sm:text-sm focus:outline-none bg-transparent placeholder:text-neutral-400 text-[#14251F]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#77847E] hover:text-[#14251F] transition"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-[#14251F] mb-1">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative rounded-xl border border-neutral-300 focus-within:border-[#08745B] focus-within:ring-2 focus-within:ring-[#08745B]/20 transition bg-white">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#77847E]">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="block w-full pl-9 pr-9 py-2 rounded-xl text-xs sm:text-sm focus:outline-none bg-transparent placeholder:text-neutral-400 text-[#14251F]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#77847E] hover:text-[#14251F] transition"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Terms of Service & Privacy Policy Agreement Checkbox */}
            <div className="flex items-start space-x-2 pt-1 text-xs">
              <input
                type="checkbox"
                id="terms"
                required
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-[#08745B] border-neutral-300 focus:ring-[#08745B]"
              />
              <label htmlFor="terms" className="text-neutral-600 leading-tight select-none">
                I agree to the{' '}
                <button
                  type="button"
                  onClick={() => setTermsModal('terms')}
                  className="font-semibold text-[#08745B] hover:underline"
                >
                  Terms of Service
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  onClick={() => setTermsModal('privacy')}
                  className="font-semibold text-[#08745B] hover:underline"
                >
                  Privacy Policy
                </button>
              </label>
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-[#08745B] hover:bg-[#119875] shadow-[0_4px_12px_rgba(8,116,91,0.25)] transition-all duration-150 disabled:opacity-50 mt-1 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <span>Register Account</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>

          {/* Social Register Divider */}
          <div className="relative my-3 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200" />
            </div>
            <span className="relative bg-white px-2.5 text-[11px] text-[#77847E] font-medium">
              Or register with
            </span>
          </div>

          {/* Social Sign-in Buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Google Button */}
            <button
              type="button"
              onClick={() => handleSocialAuth('google')}
              disabled={loading}
              className="flex items-center justify-center px-3 py-2 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-700 bg-white hover:bg-neutral-50 shadow-2xs transition hover:border-neutral-300 cursor-pointer"
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
              onClick={() => handleSocialAuth('microsoft')}
              disabled={loading}
              className="flex items-center justify-center px-3 py-2 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-700 bg-white hover:bg-neutral-50 shadow-2xs transition hover:border-neutral-300 cursor-pointer"
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

        {/* Bottom: Already have an account? Login */}
        <div className="text-center text-xs text-[#77847E] pt-2 border-t border-neutral-100 shrink-0">
          <span>Already have an account? </span>
          <Link
            href="/login"
            className="font-bold text-[#08745B] hover:text-[#119875] hover:underline"
          >
            Login
          </Link>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* GOOGLE ACCOUNT OTP SIGN IN MODAL                                         */}
      {/* ========================================================================= */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-md overflow-hidden relative">
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
                  <h3 className="font-bold text-[#14251F] text-base">Sign up with Google</h3>
                  <p className="text-xs text-[#77847E]">to register your SEYAL account</p>
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

            <div className="p-5">
              <div className="mb-3.5 p-3 bg-[#EDF6F1] border border-emerald-200 rounded-xl flex items-start space-x-2.5 text-xs text-[#064B3B]">
                <Mail className="w-4 h-4 text-[#08745B] mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold">Security Email Verification</span>
                  <p className="text-[#08745B] text-[11px] mt-0.5 leading-relaxed">
                    A secure 6-digit verification code will be sent to your Google email address from <strong className="font-mono">prabanprabanjan@gmail.com</strong>.
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
                      Enter the 6-digit verification code sent to <strong>{googleEmail}</strong>. Check your inbox.
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
                      'Verify & Create Account'
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
      {/* TERMS & PRIVACY MODAL                                                    */}
      {/* ========================================================================= */}
      {termsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-lg overflow-hidden p-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center space-x-2 text-[#08745B]">
                {termsModal === 'terms' ? <FileText className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                <h3 className="font-bold text-lg text-[#14251F]">
                  {termsModal === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTermsModal(null)}
                className="text-neutral-400 hover:text-neutral-600 p-1 rounded-lg hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 text-xs text-neutral-600 space-y-3 max-h-[60vh] overflow-y-auto leading-relaxed">
              {termsModal === 'terms' ? (
                <>
                  <p>
                    <strong>1. Acceptance of Terms:</strong> By creating an account on SEYAL, you agree to comply with and be bound by these Terms of Service.
                  </p>
                  <p>
                    <strong>2. Workspace Conduct:</strong> SEYAL provides an institutional work assignment and accountability tracking platform. Users agree not to misuse workspaces or attempt unauthorized access.
                  </p>
                  <p>
                    <strong>3. Data Ownership:</strong> Organization and workspace data remain the property of the tenant institution or user.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>1. Information Collection:</strong> We collect minimal account data necessary for workspace authentication, role verification, and notification delivery.
                  </p>
                  <p>
                    <strong>2. Communication Security:</strong> Verification codes and status updates are delivered securely through authorized email gateways.
                  </p>
                  <p>
                    <strong>3. Confidentiality:</strong> Your enterprise data and task progress metrics are protected with modern encryption and access control protocols.
                  </p>
                </>
              )}
            </div>

            <div className="pt-3 border-t border-neutral-100 flex justify-end">
              <button
                type="button"
                onClick={() => setTermsModal(null)}
                className="px-4 py-2 rounded-xl bg-[#08745B] text-white text-xs font-bold hover:bg-[#119875] transition"
              >
                Understood &amp; Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
