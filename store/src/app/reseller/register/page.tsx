'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Store, Award, Check, ArrowRight, ArrowLeft, ShieldCheck, 
  DollarSign, AlertCircle, Loader2, CreditCard, Sparkles, User, 
  Lock, CheckCircle2, Upload, Link as LinkIcon, Eye, EyeOff, KeyRound,
  CheckSquare, Square
} from 'lucide-react';
import { api } from '@/lib/api';
import TierMedal, { ShopTierType } from '@/components/TierMedal';
import StoreAvatar, { STORE_AVATAR_PRESETS } from '@/components/StoreAvatar';

const TIERS: {
  id: ShopTierType;
  name: string;
  margin: number;
  highlight: string;
  badge?: string;
  features: string[];
}[] = [
  {
    id: 'BRONZE',
    name: 'Bronze Shop',
    margin: 20,
    highlight: 'Starter Reseller',
    features: ['Up to 20% markup on wholesale', 'Curate up to 50 active items', 'Standard automated payouts'],
  },
  {
    id: 'SILVER',
    name: 'Silver Shop',
    margin: 25,
    highlight: 'Growth Partner',
    features: ['Up to 25% markup on wholesale', 'Curate up to 150 active items', 'Custom storefront theme branding'],
  },
  {
    id: 'GOLD',
    name: 'Gold Shop',
    margin: 30,
    highlight: 'Pro Merchant',
    badge: 'Most Popular',
    features: ['Up to 30% markup on wholesale', 'Unlimited product curation', 'Homepage featured showcase', 'Priority order dispatch'],
  },
  {
    id: 'PLATINUM',
    name: 'Platinum Shop',
    margin: 35,
    highlight: 'Elite Enterprise',
    badge: 'Max Profit',
    features: ['Up to 35% markup on wholesale', 'Unlimited curation + API access', 'Verified Platinum Seal & Medal', 'Instant settlement priority'],
  },
];

const STEP_CONFIG = [
  { num: '01', title: 'Create Merchant Account', subtitle: 'Set up your secure login credentials' },
  { num: '02', title: 'Choose Shop Tier', subtitle: 'Select your profit margin & store tier' },
  { num: '03', title: 'Store Details & URL', subtitle: 'Set your public store name and custom URL' },
  { num: '04', title: 'Branding & Logo', subtitle: 'Pick a store emblem or upload your logo' },
  { num: '05', title: 'Payout & Launch', subtitle: 'Configure profit disbursements and launch' },
];

export default function ResellerRegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [direction, setDirection] = useState(1);
  const [token, setToken] = useState<string | null>(null);
  const [shopId, setShopId] = useState<number | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(true);

  const [tier, setTier] = useState<ShopTierType>('GOLD');
  const [storeName, setStoreName] = useState('');
  const [storeHandle, setStoreHandle] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [logo, setLogo] = useState('preset:store_apex');
  const [walletAddress, setWalletAddress] = useState('');

  // Branding Picker Sub-state
  const [brandingMode, setBrandingMode] = useState<'presets' | 'upload' | 'url'>('presets');
  const [customUrl, setCustomUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Password Strength Calculation
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

  const handleNameChange = (name: string) => {
    setStoreName(name);
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-_]/g, '-')
      .replace(/-+/g, '-');
    if (!storeHandle || storeHandle === slug.slice(0, -1)) {
      setStoreHandle(slug);
    }
  };

  const goToStep = (step: 1 | 2 | 3 | 4 | 5) => {
    setDirection(step > currentStep ? 1 : -1);
    setError(null);
    setCurrentStep(step);
  };

  // =========================================================================
  // STEP 1: CREATE ACCOUNT (Saves to Backend Immediately)
  // =========================================================================
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid merchant business/contact email.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }
    if (!agreedTerms) {
      setError('Please agree to the Terms of Service & Privacy Policy to proceed.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Register initial reseller account in backend
      const res = await api.resellers.register({
        email: email.trim(),
        password,
        tier,
      });

      if (res.token) {
        setToken(res.token);
        setShopId(res.shop?.id || null);
        localStorage.setItem('reseller_token', res.token);
        localStorage.setItem('reseller_shop', JSON.stringify(res.shop));
        goToStep(2);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================================
  // STEP 2: SELECT TIER (Saves Tier to Backend Immediately)
  // =========================================================================
  const handleStep2Submit = async () => {
    if (!token) {
      goToStep(1);
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await api.resellers.updateProfile(token, { tier });
      goToStep(3);
    } catch (err: any) {
      setError(err.message || 'Failed to save tier plan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================================
  // STEP 3: STORE DETAILS (Saves Name & Handle to Backend Immediately)
  // =========================================================================
  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      goToStep(1);
      return;
    }

    if (!storeName.trim()) {
      setError('Please enter a display name for your store.');
      return;
    }
    if (!storeHandle.trim()) {
      setError('Please enter a store URL address slug.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await api.resellers.updateProfile(token, {
        name: storeName.trim(),
        handle: storeHandle.trim(),
        description: storeDescription.trim(),
      });
      goToStep(4);
    } catch (err: any) {
      setError(err.message || 'Failed to save store identity.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================================
  // STEP 4: BRANDING & LOGO (Saves Logo to Backend Immediately)
  // =========================================================================
  const handleStep4Submit = async () => {
    if (!token) {
      goToStep(1);
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await api.resellers.updateProfile(token, { logo });
      goToStep(5);
    } catch (err: any) {
      setError(err.message || 'Failed to save store logo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WebP, SVG, GIF).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit.');
      return;
    }

    setIsUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: form,
      });

      if (res.ok) {
        const data = await res.json();
        setLogo(data.url);
        return;
      }
    } catch (e) {
      console.warn('Upload API fallback:', e);
    } finally {
      setIsUploading(false);
    }

    // Fallback to Data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setLogo(e.target?.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // =========================================================================
  // STEP 5: PAYOUT & LAUNCH (Saves Payout and Opens Dashboard)
  // =========================================================================
  const handleStep5Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      goToStep(1);
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const updated = await api.resellers.updateProfile(token, {
        walletAddress: walletAddress.trim(),
      });
      localStorage.setItem('reseller_shop', JSON.stringify(updated));
      router.push('/reseller/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to finalize store registration.');
      setIsSubmitting(false);
    }
  };

  const stepVariants: any = {
    enter: (dir: number) => ({
      x: dir > 0 ? 35 : -35,
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.35,
        ease: 'easeOut',
      },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -35 : 35,
      opacity: 0,
      scale: 0.98,
      transition: {
        duration: 0.25,
        ease: 'easeIn',
      },
    }),
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Sleek Top Navigation Bar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 py-3.5 px-4 sm:px-8 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 relative overflow-hidden rounded-xl bg-slate-900 p-1 flex items-center justify-center shadow-xs">
              <Image src="/logo.png" alt="Adera Logo" fill className="object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black tracking-tight text-slate-900 leading-none group-hover:text-emerald-700 transition-colors">
                Adera <span className="text-emerald-600">Store</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                Reseller Setup
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-lg transition-colors hidden sm:inline-block"
            >
              Back to Store
            </Link>
            <Link
              href="/reseller/login"
              className="text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-1.5 rounded-xl transition-all shadow-2xs"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Modern Slim Animated Progress Bar */}
      <div className="w-full bg-slate-100 h-1.5 relative overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600"
          initial={{ width: '20%' }}
          animate={{ width: `${(currentStep / 5) * 100}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      {/* Main Container */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 w-full flex flex-col justify-center">
        
        {/* Dynamic Header Displaying Current Step Name (No Clunky Tabs) */}
        <div className="mb-6 sm:mb-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest block mb-1">
              Step {STEP_CONFIG[currentStep - 1].num} of 05
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {STEP_CONFIG[currentStep - 1].title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              {STEP_CONFIG[currentStep - 1].subtitle}
            </p>
          </div>

          {/* Minimalist Step Pill Dots */}
          <div className="flex items-center justify-center sm:justify-end gap-1.5">
            {[1, 2, 3, 4, 5].map((stepIndex) => (
              <div
                key={stepIndex}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentStep === stepIndex
                    ? 'w-7 bg-emerald-600'
                    : currentStep > stepIndex
                    ? 'w-2.5 bg-emerald-300'
                    : 'w-2.5 bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-xs"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Animated Step Container */}
        <div className="relative">
          <AnimatePresence custom={direction} mode="wait">
            
            {/* ================================================================= */}
            {/* STEP 1: CREATE MERCHANT ACCOUNT (EMAIL + PASSWORD) */}
            {/* ================================================================= */}
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6"
              >
                <form onSubmit={handleStep1Submit} className="space-y-5">
                  
                  {/* Email Input */}
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                      Merchant Business / Contact Email *
                    </label>
                    <input
                      autoFocus
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="merchant@yourdomain.com"
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  {/* Password Input */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                        Account Password *
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{showPassword ? 'Hide' : 'Show'}</span>
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        required
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>

                    {/* Password Strength Indicator */}
                    {password && (
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-1.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-300 ${strength.color}`} style={{ width: `${(strength.level / 3) * 100}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 block">
                          {strength.text}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password Input */}
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        required
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your password"
                        className={`w-full px-4 py-3.5 bg-slate-50 border rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none transition-colors ${
                          confirmPassword && confirmPassword === password
                            ? 'border-emerald-500 pr-10'
                            : 'border-slate-200 focus:border-emerald-500'
                        }`}
                      />
                      {confirmPassword && confirmPassword === password && (
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-600">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Terms & Privacy Agreement Checkbox */}
                  <div className="pt-1">
                    <label className="flex items-start gap-2.5 cursor-pointer select-none group">
                      <input
                        type="checkbox"
                        checked={agreedTerms}
                        onChange={(e) => setAgreedTerms(e.target.checked)}
                        className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 w-4 h-4"
                      />
                      <span className="text-xs text-slate-600 leading-snug">
                        I agree to the{' '}
                        <Link href="/terms" target="_blank" className="font-bold text-emerald-700 hover:underline">
                          Terms of Service
                        </Link>{' '}
                        and acknowledge the{' '}
                        <Link href="/privacy" target="_blank" className="font-bold text-emerald-700 hover:underline">
                          Privacy Policy
                        </Link>.
                      </span>
                    </label>
                  </div>

                  {/* Step 1 Action Button */}
                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black text-sm rounded-xl transition-all shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Creating Merchant Account...</span>
                        </>
                      ) : (
                        <>
                          <span>Create Account & Continue</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>

                </form>
              </motion.div>
            )}

            {/* ================================================================= */}
            {/* STEP 2: SELECT SHOP TIER */}
            {/* ================================================================= */}
            {currentStep === 2 && (
              <motion.div
                key="step-2"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {TIERS.map((t) => {
                    const isSelected = tier === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => setTier(t.id)}
                        className={`cursor-pointer rounded-2xl border-2 p-5 transition-all flex flex-col justify-between space-y-4 relative ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-600/20'
                            : 'border-slate-200 bg-slate-50/60 hover:border-slate-300 hover:bg-white'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <TierMedal tier={t.id} size="md" />
                            {t.badge ? (
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                {t.badge}
                              </span>
                            ) : isSelected ? (
                              <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            ) : null}
                          </div>

                          <h3 className="font-black text-slate-900 text-base">{t.name}</h3>
                          <div className="text-2xl font-black text-emerald-700 font-mono mt-0.5">
                            +{t.margin}% <span className="text-xs text-slate-500 font-sans font-medium">Profit Margin</span>
                          </div>
                          <p className="text-xs font-semibold text-slate-500 mt-1">{t.highlight}</p>
                        </div>

                        <ul className="space-y-1.5 pt-3 border-t border-slate-200/80 text-xs text-slate-600">
                          {t.features.map((f, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>

                {/* Step 2 Action Buttons */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => goToStep(1)}
                    className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleStep2Submit}
                    className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-emerald-600/25 flex items-center gap-2 cursor-pointer hover:scale-[1.01] disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving Tier...</span>
                      </>
                    ) : (
                      <>
                        <span>Save Tier & Continue</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ================================================================= */}
            {/* STEP 3: STORE IDENTITY & CUSTOM URL */}
            {/* ================================================================= */}
            {currentStep === 3 && (
              <motion.div
                key="step-3"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6"
              >
                <form onSubmit={handleStep3Submit} className="space-y-5">
                  
                  {/* Store Name Input */}
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                      Store Display Name *
                    </label>
                    <input
                      autoFocus
                      required
                      type="text"
                      value={storeName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g. Apex Hardware & Tech"
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  {/* Store Handle / URL Slug */}
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                      Custom Storefront URL Address *
                    </label>
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:border-emerald-500 focus-within:bg-white transition-colors">
                      <span className="px-3.5 text-xs text-slate-500 font-mono font-bold select-none bg-slate-100 py-3.5 border-r border-slate-200">
                        adera.store/shop/
                      </span>
                      <input
                        required
                        type="text"
                        value={storeHandle}
                        onChange={(e) => setStoreHandle(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                        placeholder="apex-hardware"
                        className="w-full py-3.5 px-3.5 bg-transparent text-sm font-mono font-bold text-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Store Tagline / Bio */}
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                      Store Tagline / Bio (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={storeDescription}
                      onChange={(e) => setStoreDescription(e.target.value)}
                      placeholder="e.g. Premium curated electronics, outdoor essentials, and humanitarian impact gear."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 resize-none transition-colors"
                    />
                  </div>

                  {/* Step 3 Action Buttons */}
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => goToStep(2)}
                      className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-emerald-600/25 flex items-center gap-2 cursor-pointer hover:scale-[1.01] disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Saving Store Identity...</span>
                        </>
                      ) : (
                        <>
                          <span>Save Store & Continue</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>

                </form>
              </motion.div>
            )}

            {/* ================================================================= */}
            {/* STEP 4: STORE LOGO & BRANDING */}
            {/* ================================================================= */}
            {currentStep === 4 && (
              <motion.div
                key="step-4"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6"
              >
                {/* Live Storefront Mockup Preview */}
                <div className="p-4 bg-slate-900 rounded-2xl text-white flex items-center justify-between gap-4 border border-slate-800 shadow-xs">
                  <div className="flex items-center gap-3.5">
                    <StoreAvatar
                      name={storeName || 'Your Store'}
                      avatar={logo}
                      tier={tier}
                      size="md"
                    />
                    <div>
                      <h4 className="text-sm font-black text-white">
                        {storeName || 'Your Store Name'}
                      </h4>
                      <p className="text-xs font-mono text-emerald-400 font-bold">
                        adera.store/shop/{storeHandle || 'your-slug'}
                      </p>
                    </div>
                  </div>
                  <TierMedal tier={tier} size="sm" />
                </div>

                {/* Branding Selector Tabs */}
                <div className="space-y-4">
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setBrandingMode('presets')}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        brandingMode === 'presets'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Curated Vector Emblems</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBrandingMode('upload')}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        brandingMode === 'upload'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Upload Image File</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBrandingMode('url')}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        brandingMode === 'url'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <LinkIcon className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Image URL</span>
                    </button>
                  </div>

                  {/* Mode 1: Curated Vector Emblems Grid */}
                  {brandingMode === 'presets' && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                      {STORE_AVATAR_PRESETS.map((preset) => {
                        const isSelected = logo === preset.id;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => setLogo(preset.id)}
                            className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-2.5 text-center cursor-pointer ${
                              isSelected
                                ? 'border-emerald-600 bg-emerald-50/60 shadow-xs ring-2 ring-emerald-600/20'
                                : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300'
                            }`}
                          >
                            <div className="w-12 h-12 rounded-xl overflow-hidden shadow-xs">
                              <StoreAvatar name={preset.name} avatar={preset.id} tier={tier} size="md" />
                            </div>
                            <span className="text-[11px] font-bold text-slate-800 line-clamp-1">
                              {preset.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Mode 2: File Upload (Up to 10MB) */}
                  {brandingMode === 'upload' && (
                    <div className="p-8 border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl bg-slate-50/60 text-center space-y-3 transition-colors">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-slate-900">
                          Select an image from your device (Up to 10MB)
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Supports PNG, JPG, WebP, SVG, GIF (Square ratio recommended)
                        </p>
                      </div>
                      <label className="inline-block cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleFileUpload(e.target.files[0]);
                            }
                          }}
                        />
                        <span className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs inline-block transition-colors">
                          {isUploading ? 'Uploading...' : 'Browse Image File'}
                        </span>
                      </label>
                    </div>
                  )}

                  {/* Mode 3: Direct URL */}
                  {brandingMode === 'url' && (
                    <div className="space-y-2 pt-1">
                      <input
                        type="url"
                        placeholder="https://example.com/logo.png"
                        value={customUrl}
                        onChange={(e) => {
                          setCustomUrl(e.target.value);
                          if (e.target.value.trim()) {
                            setLogo(e.target.value.trim());
                          }
                        }}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  )}

                </div>

                {/* Step 4 Action Buttons */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => goToStep(3)}
                    className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleStep4Submit}
                    className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-emerald-600/25 flex items-center gap-2 cursor-pointer hover:scale-[1.01] disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving Branding...</span>
                      </>
                    ) : (
                      <>
                        <span>Save Branding & Continue</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ================================================================= */}
            {/* STEP 5: PAYOUT METHOD & LAUNCH */}
            {/* ================================================================= */}
            {currentStep === 5 && (
              <motion.div
                key="step-5"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6"
              >
                <form onSubmit={handleStep5Submit} className="space-y-5">
                  
                  {/* Payout Method Input */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800">
                      Payout Method (For Profit Disbursements)
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Specify where you want your shop sales profits and markups disbursed (USDC, USDT, Bank routing, or payout address).
                    </p>
                    <input
                      autoFocus
                      type="text"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      placeholder="e.g. USDC (ERC20/SPL), USDT, Bank account routing, or payout address"
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  {/* Complete Storefront Launch Summary Card */}
                  <div className="p-5 bg-gradient-to-br from-emerald-50/70 via-white to-slate-50 rounded-2xl border border-emerald-200 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                        Ready to Launch
                      </span>
                      <span className="text-xs font-black text-emerald-700">
                        +{TIERS.find(t => t.id === tier)?.margin}% Margin
                      </span>
                    </div>

                    <div className="flex items-center gap-3.5">
                      <StoreAvatar
                        name={storeName || 'Store'}
                        avatar={logo}
                        tier={tier}
                        size="md"
                      />
                      <div>
                        <h4 className="text-sm font-black text-slate-900">
                          {storeName || 'Your Store Name'}
                        </h4>
                        <p className="text-xs font-mono text-emerald-700 font-bold">
                          adera.store/shop/{storeHandle || 'slug'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Step 5 Submit & Back Buttons */}
                  <div className="flex items-center justify-between gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => goToStep(4)}
                      className="px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 sm:flex-initial px-8 py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black text-sm rounded-xl transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Launching Storefront...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Launch My Storefront & Open Studio</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>

                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </main>
    </div>
  );
}
