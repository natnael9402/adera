'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  X, Mail, Lock, User, Phone, ArrowRight, ArrowLeft, ShieldCheck, 
  AlertCircle, RefreshCw, Eye, EyeOff, CheckCircle2, 
  MapPin, Building, Globe, Sparkles, LogOut, Check
} from 'lucide-react';
import { useBuyerAuth } from '@/context/BuyerAuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
}

const COUNTRIES = [
  'United States',
  'Canada',
  'United Kingdom',
  'Ethiopia',
  'Australia',
  'Germany',
  'France',
  'Netherlands',
  'Sweden',
  'Switzerland',
  'Norway',
  'Italy',
  'Spain',
  'Japan',
  'United Arab Emirates',
  'Singapore',
  'South Africa',
  'Kenya',
  'Nigeria',
  'Other',
];

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess,
}: AuthModalProps) {
  const { buyer, login, signup, verifyCode, resendVerification, logout } = useBuyerAuth();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [registerStep, setRegisterStep] = useState<1 | 2 | 3>(1);

  // Form State - Step 1 (Account Credentials)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form State - Step 2 (Shipping Address)
  const [address, setAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [stateProvince, setStateProvince] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('United States');

  // Verification state - Step 3 (6-digit OTP fallback only)
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Reset or initialize state when opening modal
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setRegisterStep(1);
      setError(null);
      setSuccessMsg(null);
      setDigits(['', '', '', '', '', '']);
    }
  }, [isOpen, initialMode]);

  // Resend cooldown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Focus first digit box if step 3 fallback opens
  useEffect(() => {
    if (registerStep === 3 && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [registerStep]);

  if (!isOpen) return null;

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return { level: 0, text: '', color: 'bg-slate-200' };
    if (password.length < 6) return { level: 1, text: 'Too short (min 6)', color: 'bg-rose-500' };
    let score = 1;
    if (password.length >= 8) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 2) return { level: 2, text: 'Medium strength', color: 'bg-amber-500' };
    return { level: 3, text: 'Strong password', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength();

  // Handlers: Sign In
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setError('Please provide both your email and password.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await login(cleanEmail, password);
      setSuccessMsg('Signed in successfully!');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 600);
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('wrong password') || msg.toLowerCase().includes('incorrect password')) {
        setError('Wrong password. Please check your password and try again.');
      } else if (msg.toLowerCase().includes('wrong email') || msg.toLowerCase().includes('no account found') || msg.toLowerCase().includes('not found')) {
        setError('Wrong email. No account found with this email address.');
      } else if (msg.toLowerCase().includes('verify your email') || msg.toLowerCase().includes('6-digit code')) {
        setMode('register');
        setRegisterStep(3);
        setResendCooldown(45);
      } else {
        setError(msg || 'Sign in failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers: Step 1 Validation -> Proceed to Shipping Address
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide your full name.');
      return;
    }
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setError(null);
    setRegisterStep(2);
  };

  // Handlers: Execute signup API call
  const executeSignup = async (addressData?: {
    address?: string;
    apartment?: string;
    city?: string;
    stateProvince?: string;
    zipCode?: string;
    country?: string;
  }) => {
    setError(null);
    setIsLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const res = await signup({
        name: name.trim(),
        email: cleanEmail,
        password,
        phone: phone.trim() || undefined,
        savedAddress: addressData,
      });

      // User signed up and authenticated directly
      if (res?.token || res?.user) {
        setSuccessMsg('Account created successfully! Welcome to Adera.');
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 600);
      } else {
        // Fallback only if server explicitly requests code
        setRegisterStep(3);
        setResendCooldown(60);
      }
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('already exists')) {
        setError('An account with this email already exists. Please switch to "Sign In".');
      } else {
        setError(msg || 'Registration failed. Please check your details.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers: Step 2 Address Submit
  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) {
      setError('Please enter your street address.');
      return;
    }
    if (!city.trim()) {
      setError('Please enter your city.');
      return;
    }
    if (!zipCode.trim()) {
      setError('Please enter your ZIP or postal code.');
      return;
    }

    executeSignup({
      address: address.trim(),
      apartment: apartment.trim() || undefined,
      city: city.trim(),
      stateProvince: stateProvince.trim() || undefined,
      zipCode: zipCode.trim(),
      country: country.trim() || 'United States',
    });
  };

  const handleSkipAddress = () => {
    executeSignup(undefined);
  };

  // Handlers: Step 3 Verification OTP (Fallback)
  const handleDigitChange = (index: number, val: string) => {
    setError(null);
    const clean = val.replace(/\D/g, '');
    const newDigits = [...digits];

    if (clean.length > 1) {
      const chars = clean.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newDigits[i] = chars[i] || '';
      }
      setDigits(newDigits);
      const nextFocus = Math.min(clean.length, 5);
      inputRefs.current[nextFocus]?.focus();

      if (clean.length >= 6) {
        submitVerification(clean.slice(0, 6));
      }
      return;
    }

    newDigits[index] = clean;
    setDigits(newDigits);

    if (clean && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    const fullCode = newDigits.join('');
    if (fullCode.length === 6 && !newDigits.includes('')) {
      submitVerification(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setDigits(newDigits);

    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();

    if (pasted.length === 6) {
      submitVerification(pasted);
    }
  };

  const submitVerification = async (codeToVerify: string) => {
    if (codeToVerify.length !== 6) {
      setError('Please enter all 6 digits.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await verifyCode(email.trim().toLowerCase(), codeToVerify);
      setSuccessMsg('Email verified & session activated!');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 600);
    } catch (err: any) {
      setError(err.message || 'Invalid or expired code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isLoading) return;
    setResendStatus('Sending code...');
    setError(null);

    try {
      const res = await resendVerification(email.trim().toLowerCase());
      setResendCooldown(60);
      setResendStatus(res.message || 'Verification code resent!');
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setTimeout(() => setResendStatus(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to resend code.');
      setResendStatus(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Dimmed backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden z-10 my-auto"
      >
        {/* Top Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 relative overflow-hidden rounded-xl bg-slate-950 p-1 flex items-center justify-center shadow-xs">
              <Image src="/logo.png" alt="Adera" fill className="object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-sm font-black text-slate-900 tracking-tight">Adera</span>
                <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded uppercase tracking-wider">
                  Store
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold">
                Direct Philanthropy Network
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ============================================================= */}
        {/* A. USER IS ALREADY SIGNED IN - SHOW PROFILE HUB              */}
        {/* ============================================================= */}
        {buyer ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto text-xl font-black shadow-xs">
              {buyer.name?.[0]?.toUpperCase() || 'B'}
            </div>
            <div>
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full mb-1.5">
                <Check className="w-3 h-3 text-emerald-600" />
                <span>Active Signed-In Session</span>
              </div>
              <h3 className="text-base font-black text-slate-900">{buyer.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{buyer.email}</p>
            </div>

            {buyer.savedAddress?.address && (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <MapPin className="w-3 h-3 text-emerald-600" />
                  <span>Default Shipping Destination</span>
                </div>
                <div className="font-semibold text-slate-800">
                  {buyer.savedAddress.address}{buyer.savedAddress.apartment ? `, ${buyer.savedAddress.apartment}` : ''}
                </div>
                <div className="text-slate-500 text-[11px]">
                  {buyer.savedAddress.city}, {buyer.savedAddress.zipCode} &bull; {buyer.savedAddress.country}
                </div>
              </div>
            )}

            <div className="space-y-2 pt-2">
              <Link
                href="/account"
                onClick={onClose}
                className="w-full py-3 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <span>View Buyer Account & Orders</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={async () => {
                  logout();
                  setMode('login');
                  setRegisterStep(1);
                }}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out / Switch Account</span>
              </button>
            </div>
          </div>
        ) : (
          /* ============================================================= */
          /* B. USER NOT SIGNED IN - SHOW SIGN IN / MULTI-STEP SIGN UP     */
          /* ============================================================= */
          <>
            {/* Segmented Mode Tabs: Sign In / Create Account */}
            <div className="px-5 sm:px-6 pt-4">
              <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex-1 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                    mode === 'login'
                      ? 'bg-white text-slate-950 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setRegisterStep(1);
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex-1 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                    mode === 'register'
                      ? 'bg-white text-slate-950 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Create Account
                </button>
              </div>
            </div>

            {/* Separated Step Dots for Registration */}
            {mode === 'register' && (
              <div className="px-5 sm:px-6 pt-3 flex items-center justify-between text-[11px] font-bold">
                <span className="text-slate-600">
                  {registerStep === 1 && '1. Account Credentials'}
                  {registerStep === 2 && '2. Permanent Shipping Address'}
                  {registerStep === 3 && '3. Email Verification'}
                </span>
                <div className="flex items-center gap-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      registerStep === 1 ? 'w-6 bg-emerald-600' : 'w-2 bg-emerald-400'
                    }`}
                  />
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      registerStep === 2
                        ? 'w-6 bg-emerald-600'
                        : registerStep > 2
                        ? 'w-2 bg-emerald-400'
                        : 'w-2 bg-slate-200'
                    }`}
                  />
                  {registerStep === 3 && (
                    <div className="h-1.5 w-6 rounded-full bg-emerald-600 transition-all duration-300" />
                  )}
                </div>
              </div>
            )}

            {/* Body Content */}
            <div className="p-5 sm:p-6 pt-3 space-y-4">
              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Success Message */}
              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{successMsg}</span>
                </motion.div>
              )}

              {/* ============================================================= */}
              {/* 1. SIGN IN FORM */}
              {/* ============================================================= */}
              {mode === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@domain.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[11px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        required
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600 transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-slate-950 hover:bg-slate-800 text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In to Account</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="pt-2 text-center text-xs text-slate-500">
                    <span>New to Adera Store? </span>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('register');
                        setRegisterStep(1);
                        setError(null);
                      }}
                      className="font-bold text-emerald-700 hover:underline cursor-pointer"
                    >
                      Create an account →
                    </button>
                  </div>
                </form>
              )}

              {/* ============================================================= */}
              {/* 2. REGISTRATION STEP 1: ACCOUNT CREDENTIALS */}
              {/* ============================================================= */}
              {mode === 'register' && registerStep === 1 && (
                <motion.form
                  key="step1"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  onSubmit={handleStep1Submit}
                  className="space-y-3.5"
                >
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        required
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Alex Johnson"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="buyer@example.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                        Password *
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[11px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        required
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600 transition-colors"
                      />
                    </div>

                    {/* Password strength indicator */}
                    {password && (
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-1 flex-1 bg-slate-200 rounded-full overflow-hidden flex gap-1">
                          <div className={`h-full flex-1 ${strength.level >= 1 ? strength.color : 'bg-slate-200'}`} />
                          <div className={`h-full flex-1 ${strength.level >= 2 ? strength.color : 'bg-slate-200'}`} />
                          <div className={`h-full flex-1 ${strength.level >= 3 ? strength.color : 'bg-slate-200'}`} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 font-mono">{strength.text}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Phone (Optional)
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 019-2831"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600 transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-slate-950 hover:bg-slate-800 text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <span>Continue to Shipping Address</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="pt-1 text-center text-xs text-slate-500">
                    <span>Already have an account? </span>
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="font-bold text-emerald-700 hover:underline cursor-pointer"
                    >
                      Sign in here →
                    </button>
                  </div>
                </motion.form>
              )}

              {/* ============================================================= */}
              {/* 3. REGISTRATION STEP 2: DEDICATED SHIPPING ADDRESS FORM */}
              {/* ============================================================= */}
              {mode === 'register' && registerStep === 2 && (
                <motion.form
                  key="step2"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  onSubmit={handleStep2Submit}
                  className="space-y-3.5"
                >
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="text-[11px] text-emerald-900 leading-relaxed">
                      <strong className="block text-emerald-950 font-bold">Permanent Shipping Address</strong>
                      Enter once to speed up all future checkouts. You can always edit it at checkout.
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Street Address *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        required
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="123 Philanthropy Way"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Apt, Suite, Unit <span className="text-slate-400 font-normal lowercase">(optional)</span>
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={apartment}
                        onChange={(e) => setApartment(e.target.value)}
                        placeholder="Apt 4B / Suite 200"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                        City *
                      </label>
                      <input
                        required
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Seattle"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                        State / Province
                      </label>
                      <input
                        type="text"
                        value={stateProvince}
                        onChange={(e) => setStateProvince(e.target.value)}
                        placeholder="WA"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                        ZIP / Postal Code *
                      </label>
                      <input
                        required
                        type="text"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        placeholder="98101"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Country *
                      </label>
                      <div className="relative">
                        <select
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600 transition-colors appearance-none cursor-pointer"
                        >
                          {COUNTRIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                        <Globe className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setRegisterStep(1);
                      }}
                      className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Creating Account...</span>
                        </>
                      ) : (
                        <>
                          <span>Save Address & Create Account</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={handleSkipAddress}
                      disabled={isLoading}
                      className="text-slate-400 hover:text-slate-600 text-xs font-medium underline underline-offset-4 cursor-pointer"
                    >
                      Skip address for now
                    </button>
                  </div>
                </motion.form>
              )}

              {/* ============================================================= */}
              {/* 4. REGISTRATION STEP 3: 6-DIGIT EMAIL CODE (FALLBACK)         */}
              {/* ============================================================= */}
              {mode === 'register' && registerStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="space-y-4"
                >
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs space-y-1 text-center">
                    <span className="font-bold text-emerald-950 block">6-Digit Code Dispatched</span>
                    <p className="text-emerald-800 text-[11px]">
                      We sent a confirmation code to <strong className="font-mono">{email}</strong>
                    </p>
                  </div>

                  {/* 6 Digit Input Boxes */}
                  <div className="pt-1" onPaste={handlePaste}>
                    <div className="flex items-center justify-center gap-2">
                      {digits.map((digit, idx) => (
                        <div key={idx} className="flex items-center">
                          <input
                            ref={(el) => { inputRefs.current[idx] = el; }}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleDigitChange(idx, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(idx, e)}
                            disabled={isLoading}
                            className="w-10 h-13 text-center text-xl font-black font-mono text-slate-900 bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all disabled:opacity-50"
                          />
                          {idx === 2 && (
                            <span className="text-slate-300 font-black px-1">&ndash;</span>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-400 text-center mt-2">
                      Paste or type the 6 digits directly
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => submitVerification(digits.join(''))}
                    disabled={isLoading || digits.join('').length !== 6}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm & Activate Account</span>
                        <CheckCircle2 className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setRegisterStep(1);
                        setError(null);
                      }}
                      className="text-slate-500 hover:text-slate-800 font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Edit Details</span>
                    </button>

                    {resendCooldown > 0 ? (
                      <span className="text-slate-400 font-medium">
                        Resend in <strong className="text-slate-700 font-mono">{resendCooldown}s</strong>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResend}
                        className="text-emerald-700 hover:text-emerald-800 font-bold cursor-pointer"
                      >
                        {resendStatus || "Resend Code"}
                      </button>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Secure note */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>256-Bit SSL Encrypted Philanthropic Identity</span>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
