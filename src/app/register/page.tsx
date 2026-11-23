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
  Sliders,
  AlertCircle,
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
  const [subdivision, setSubdivision] = useState<'organisation' | 'personal' | 'freelancer' | 'customize'>('organisation');
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

  // OTP Verification Modal states
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [devOtpHint, setDevOtpHint] = useState('');
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState('');

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

  // Cooldown timers
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpCooldown > 0) {
      timer = setTimeout(() => setOtpCooldown(otpCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCooldown]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (googleCooldown > 0) {
      timer = setTimeout(() => setGoogleCooldown(googleCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [googleCooldown]);

  const getFullPhone = () => {
    return phoneNumber.trim() ? `${phonePrefix}${phoneNumber.trim().replace(/^0+/, '')}` : '';
  };

  // Step 1: Request OTP and trigger verification modal
  const handleStartRegisterOtp = async (e: React.FormEvent) => {
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
    if ((subdivision === 'organisation' || subdivision === 'customize') && !organizationName.trim()) {
      setError(`Please enter your ${subdivision === 'organisation' ? 'organisation' : 'workspace'} name`);
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
      const fullPhone = getFullPhone();
      const res = await api.requestOtp({
        email: email.trim().toLowerCase(),
        phone: fullPhone || undefined,
        purpose: 'register',
      });

      if (res?.dev_otp) {
        setDevOtpHint(res.dev_otp);
      }
      setShowOtpModal(true);
      setOtpError('');
      setOtpCode('');
      setOtpCooldown(45);
    } catch (err: any) {
      setError(err?.data?.error || err.message || 'Failed to dispatch verification code');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and save user in DB with workspace profile creation
  const handleVerifyOtpAndCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      setOtpError('Please enter the 6-digit verification code');
      return;
    }

    setOtpError('');
    setOtpVerifying(true);
    try {
      const fullPhone = getFullPhone();
      const res = await api.verifyOtp({
        email: email.trim().toLowerCase(),
        phone: fullPhone || undefined,
        code: otpCode.trim(),
        name: fullName.trim(),
        password,
        subdivision,
        organization_name: (subdivision === 'organisation' || subdivision === 'customize') ? organizationName.trim() : undefined,
      });

      await loginUser(res.tokens, res.default_workspace_id);
      setShowOtpModal(false);
      router.push('/');
    } catch (err: any) {
      setOtpError(err?.data?.error || err.message || 'Invalid or expired verification code');
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpCooldown > 0) return;
    setOtpError('');
    try {
      const fullPhone = getFullPhone();
      const res = await api.requestOtp({
        email: email.trim().toLowerCase(),
        phone: fullPhone || undefined,
        purpose: 'register',
      });
      if (res?.dev_otp) {
        setDevOtpHint(res.dev_otp);
      }
      setOtpCooldown(45);
      setOtpError('');
    } catch (err: any) {
      setOtpError(err?.data?.error || err.message || 'Failed to resend code');
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
      const res = await api.requestOtp({ email: cleanEmail, provider: 'google', purpose: 'register' });
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
        subdivision,
        organization_name: (subdivision === 'organisation' || subdivision === 'customize') ? organizationName.trim() : undefined,
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
      {/* LEFT PANEL: Showcase Brand Visualizer                                     */}
      {/* ========================================================================= */}
      <section className="relative hidden lg:flex lg:col-span-6 xl:col-span-7 bg-[#064B3B] p-6 xl:p-8 flex-col justify-between overflow-hidden select-none">
        {/* Subtle radial ambient light */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#10B981]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#08745B]/40 rounded-full blur-3xl pointer-events-none" />

        {/* Top Branding */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <SeyalLogo size="md" className="text-white drop-shadow-sm" />
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/20 text-[11px] text-emerald-200">
            <Globe className="w-3 h-3 text-emerald-400" />
            <span>English</span>
          </div>
        </div>

        {/* Middle: Headline + Realistic Dashboard Mockup */}
        <div className="relative z-10 my-auto py-2 xl:py-4 flex flex-col items-center">
          <div className="text-center max-w-lg mb-3">
            <h1 className="text-2xl xl:text-3xl font-extrabold text-white tracking-tight leading-snug drop-shadow-sm">
              Create your{' '}
              <span className="text-[#34D399] drop-shadow-sm">SEYAL Workspace</span>
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-emerald-100/80 leading-relaxed max-w-md mx-auto">
              Register with OTP authentication, select your subdivision, and collaborate with your team in one unified platform.
            </p>
          </div>

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
      <section className="w-full flex-1 lg:col-span-6 xl:col-span-5 bg-white p-5 sm:p-7 lg:p-8 flex flex-col justify-between overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100 shrink-0">
          <div className="lg:hidden flex items-center space-x-2">
            <SeyalLogo size="sm" />
          </div>
          <div className="hidden lg:block">
            <SeyalLogo size="sm" showIconOnly />
          </div>

          <div className="flex items-center space-x-1.5 text-xs font-medium text-[#77847E]">
            <Globe className="w-3.5 h-3.5 text-[#08745B]" />
            <button
              type="button"
              onClick={() => setLang(lang === 'en' ? 'ta' : 'en')}
              className="hover:text-[#08745B] transition font-semibold"
            >
              {lang === 'en' ? 'தமிழ்' : 'English'}
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="my-auto py-3 max-w-sm sm:max-w-md mx-auto w-full">
          <div className="text-center mb-4">
            <h2 className="text-xl sm:text-2xl font-black text-[#14251F] tracking-tight">
              Create Your SEYAL Account
            </h2>
            <p className="mt-1 text-xs text-[#77847E]">
              OTP-verified registration &amp; instant workspace setup
            </p>
          </div>

          {error && (
            <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleStartRegisterOtp} className="space-y-3">
            {/* Grid 2 Columns: Full Name + Work Email */}
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
                    placeholder="you@company.com"
                    className="block w-full pl-9 pr-3 py-2 rounded-xl text-xs sm:text-sm focus:outline-none bg-transparent placeholder:text-neutral-400 text-[#14251F]"
                  />
                </div>
              </div>
            </div>

            {/* Grid 2 Columns: Phone Number + Subdivision */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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

              {/* Subdivision / Workspace Type */}
              <div>
                <label className="block text-xs font-semibold text-[#14251F] mb-1">
                  Subdivision / Workspace <span className="text-rose-500">*</span>
                </label>
                <div className="relative rounded-xl border border-neutral-300 focus-within:border-[#08745B] focus-within:ring-2 focus-within:ring-[#08745B]/20 transition bg-white">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#77847E]">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <select
                    required
                    value={subdivision}
                    onChange={(e) => setSubdivision(e.target.value as any)}
                    className="block w-full pl-9 pr-8 py-2 rounded-xl text-xs sm:text-sm focus:outline-none bg-transparent text-[#14251F] appearance-none cursor-pointer font-medium"
                  >
                    <option value="organisation">Organisation (Enterprise &amp; Teams)</option>
                    <option value="personal">Personal (Individual Productivity)</option>
                    <option value="freelancer">Freelancer (Client &amp; Deliverables)</option>
                    <option value="customize">Customize (Configurable Engine)</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#77847E]">
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Organisation / Custom Workspace Name */}
            {(subdivision === 'organisation' || subdivision === 'customize') && (
              <div>
                <label className="block text-xs font-semibold text-[#14251F] mb-1">
                  {subdivision === 'organisation' ? 'Organisation Name' : 'Custom Workspace Name'} <span className="text-rose-500">*</span>
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
                    placeholder={subdivision === 'organisation' ? 'e.g. Acme Corporation' : 'e.g. My Operations Hub'}
                    className="block w-full pl-9 pr-3 py-2 rounded-xl text-xs sm:text-sm focus:outline-none bg-transparent placeholder:text-neutral-400 text-[#14251F]"
                  />
                </div>
              </div>
            )}

            {/* Grid 2 Columns: Password + Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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

            {/* Terms of Service Checkbox */}
            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="agree-terms"
                required
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 rounded text-[#08745B] focus:ring-[#08745B] border-neutral-300 cursor-pointer"
              />
              <label htmlFor="agree-terms" className="text-xs text-[#77847E] select-none">
                I agree to the{' '}
                <button
                  type="button"
                  onClick={() => setTermsModal('terms')}
                  className="text-[#08745B] font-semibold hover:underline"
                >
                  Terms of Service
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  onClick={() => setTermsModal('privacy')}
                  className="text-[#08745B] font-semibold hover:underline"
                >
                  Privacy Policy
                </button>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#08745B] hover:bg-[#119875] shadow-[0_4px_12px_rgba(8,116,91,0.25)] transition-all duration-150 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending Verification Code...
                </>
              ) : (
                <>
                  <span>Register &amp; Verify Code</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </>
              )}
            </button>
          </form>

          {/* Or Divider */}
          <div className="relative my-3 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200" />
            </div>
            <span className="relative px-3 bg-white text-[11px] text-neutral-400 uppercase tracking-wider">
              Or register with
            </span>
          </div>

          {/* Social Auth Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleSocialAuth('google')}
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

            <button
              type="button"
              onClick={() => handleSocialAuth('microsoft')}
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

        {/* Bottom Switch to Login */}
        <div className="pt-2 border-t border-neutral-100 shrink-0 text-center text-xs text-[#77847E]">
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
      {/* MODAL 1: OTP VERIFICATION & IMMEDIATE WORKSPACE CREATION                  */}
      {/* ========================================================================= */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-md overflow-hidden relative p-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#EDF6F1] text-[#08745B] flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#14251F]">Verify Registration Code</h3>
                  <p className="text-[11px] text-[#77847E]">Securing your account &amp; creating workspace</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                className="text-neutral-400 hover:text-neutral-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-[#EDF6F1] border border-emerald-200 rounded-xl text-xs text-[#064B3B] space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#08745B]" />
                <span>Verification Code Dispatched</span>
              </div>
              <p className="text-[11px] text-neutral-600 leading-relaxed">
                We sent a 6-digit verification code to <strong>{email}</strong>
                {phoneNumber ? ` and your phone ${getFullPhone()}` : ''}.
              </p>
            </div>

            {devOtpHint && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-1.5 font-bold text-amber-900">
                    <span>⚡ Development / Fast Test OTP:</span>
                    <span className="font-mono text-sm tracking-widest text-[#08745B] bg-white px-2 py-0.5 rounded border border-emerald-300 font-extrabold">{devOtpHint}</span>
                  </div>
                  <div className="text-[10px] text-amber-700 mt-1">
                    (Email dispatched. Check Spam/Junk folder if delayed in institutional inbox)
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOtpCode(devOtpHint)}
                  className="px-2.5 py-1 text-[11px] font-bold bg-[#08745B] hover:bg-[#119875] text-white rounded-lg transition shrink-0 ml-2"
                >
                  Auto-fill
                </button>
              </div>
            )}

            {otpError && (
              <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{otpError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtpAndCreateWorkspace} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#14251F] mb-1.5 text-center">
                  Enter 6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  className="block w-full py-2.5 text-center tracking-[0.5em] text-2xl font-mono rounded-xl border border-neutral-300 focus:outline-none focus:border-[#08745B] focus:ring-2 focus:ring-[#08745B]/20 transition bg-white text-[#14251F]"
                />
              </div>

              <div className="text-xs text-neutral-500 bg-neutral-50 p-2.5 rounded-xl border border-neutral-200 space-y-0.5">
                <div>🏢 <strong>Subdivision:</strong> <span className="capitalize">{subdivision}</span></div>
                {(subdivision === 'organisation' || subdivision === 'customize') && organizationName && (
                  <div>🏷️ <strong>Workspace:</strong> {organizationName}</div>
                )}
              </div>

              <button
                type="submit"
                disabled={otpVerifying || otpCode.length !== 6}
                className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#08745B] hover:bg-[#119875] shadow-[0_4px_12px_rgba(8,116,91,0.25)] transition disabled:opacity-50"
              >
                {otpVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying &amp; Creating Workspace...
                  </>
                ) : (
                  'Verify & Enter Workspace'
                )}
              </button>

              <div className="flex justify-between items-center text-xs text-[#77847E] pt-1">
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="hover:underline text-neutral-600"
                >
                  Edit registration details
                </button>
                <button
                  type="button"
                  disabled={otpCooldown > 0}
                  onClick={handleResendOtp}
                  className={`font-semibold ${otpCooldown > 0 ? 'text-neutral-400' : 'text-[#08745B] hover:underline'}`}
                >
                  {otpCooldown > 0 ? `Resend in ${otpCooldown}s` : 'Resend Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: GOOGLE SIGN IN OTP MODAL                                         */}
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
                  <h3 className="font-bold text-[#14251F] text-base">Register with Google</h3>
                  <p className="text-xs text-[#77847E]">Verified Google account registration</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                className="text-neutral-400 hover:text-neutral-600 p-1.5 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5">
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
                    <input
                      type="email"
                      required
                      autoFocus
                      value={googleEmail}
                      onChange={(e) => setGoogleEmail(e.target.value)}
                      placeholder="yourname@gmail.com"
                      className="block w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-[#08745B] bg-white text-[#14251F]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={googleLoading}
                    className="w-full py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-[#08745B] hover:bg-[#119875] transition disabled:opacity-50"
                  >
                    {googleLoading ? 'Sending Verification Code...' : 'Send OTP to Google Email'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyGoogleOtp} className="space-y-3">
                  <div className="p-2.5 bg-[#EDF6F1] border border-emerald-200 rounded-xl text-xs text-[#064B3B]">
                    Enter the 6-digit code sent to <strong>{googleEmail}</strong>.
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    autoFocus
                    value={googleOtpCode}
                    onChange={(e) => setGoogleOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    className="block w-full py-2 text-center text-xl font-mono rounded-xl border border-neutral-300 focus:outline-none focus:border-[#08745B] bg-white text-[#14251F]"
                  />
                  <button
                    type="submit"
                    disabled={googleLoading}
                    className="w-full py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-[#08745B] hover:bg-[#119875] transition disabled:opacity-50"
                  >
                    {googleLoading ? 'Verifying...' : 'Verify &amp; Create Workspace'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: TERMS & PRIVACY                                                  */}
      {/* ========================================================================= */}
      {termsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-lg overflow-hidden p-6 max-h-[80vh] flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-3">
              <h3 className="font-bold text-base text-[#14251F]">
                {termsModal === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
              </h3>
              <button
                type="button"
                onClick={() => setTermsModal(null)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-y-auto text-xs text-[#77847E] space-y-2.5 pr-1">
              <p>
                By registering for a SEYAL account, you agree to access high-performance collaborative workspace tools in compliance with enterprise security protocols.
              </p>
              <p>
                Your personal and organisational data is secured with strict role-based access control (RBAC), multi-subdivision boundaries, and cryptographic session management.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setTermsModal(null)}
              className="mt-4 w-full py-2 rounded-xl bg-[#08745B] text-white text-xs font-bold hover:bg-[#119875] transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
