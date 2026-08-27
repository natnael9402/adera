'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Store, Award, Check, ArrowRight, ArrowLeft, ShieldCheck, 
  DollarSign, AlertCircle, Loader2, CreditCard, Sparkles, User, 
  Lock, CheckCircle2, Upload, Link as LinkIcon, Image as ImageIcon
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

const STEP_TITLES = [
  { num: '01', title: 'Choose Tier Plan', subtitle: 'Select your profit margin & store tier' },
  { num: '02', title: 'Store Identity', subtitle: 'Set your store name & public URL handle' },
  { num: '03', title: 'Branding & Logo', subtitle: 'Pick a store emblem or upload your logo' },
  { num: '04', title: 'Account & Payout', subtitle: 'Set login credentials and profit payout method' },
];

export default function ResellerRegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [direction, setDirection] = useState(1);
  const [tier, setTier] = useState<ShopTierType>('GOLD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    handle: '',
    email: '',
    password: '',
    walletAddress: '',
    description: '',
    logo: 'preset:store_apex',
  });

  // Upload Tab State for Step 3
  const [brandingMode, setBrandingMode] = useState<'presets' | 'upload' | 'url'>('presets');
  const [customUrl, setCustomUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-_]/g, '-')
      .replace(/-+/g, '-');
    setFormData((prev) => ({
      ...prev,
      name,
      handle: prev.handle === '' || prev.handle === slug.slice(0, -1) ? slug : prev.handle,
    }));
  };

  const goToStep = (step: 1 | 2 | 3 | 4) => {
    setDirection(step > currentStep ? 1 : -1);
    setError(null);
    setCurrentStep(step);
  };

  const handleNextFromStep1 = () => {
    goToStep(2);
  };

  const handleNextFromStep2 = () => {
    if (!formData.name.trim()) {
      setError('Please enter a display name for your shop.');
      return;
    }
    if (!formData.handle.trim()) {
      setError('Please choose a URL handle/slug for your shop.');
      return;
    }
    setError(null);
    goToStep(3);
  };

  const handleNextFromStep3 = () => {
    setError(null);
    goToStep(4);
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WebP, SVG, GIF).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds the 10MB limit.');
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
        setFormData((prev) => ({ ...prev, logo: data.url }));
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
        setFormData((prev) => ({ ...prev, logo: e.target?.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.handle.trim()) {
      setError('Please complete store details in Step 2.');
      goToStep(2);
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please enter a valid business/contact email.');
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await api.resellers.register({
        ...formData,
        tier,
      });

      if (res.token) {
        localStorage.setItem('reseller_token', res.token);
        localStorage.setItem('reseller_shop', JSON.stringify(res.shop));
        router.push('/reseller/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
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
      
      {/* Sleek Minimalist Top Navbar */}
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

      {/* Modern Slim Progress Bar */}
      <div className="w-full bg-slate-100 h-1 relative overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
          initial={{ width: '25%' }}
          animate={{ width: `${(currentStep / 4) * 100}%` }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 w-full flex flex-col justify-center">
        
        {/* Dynamic Header Displaying Current Step Name (No Clunky Tabs) */}
        <div className="mb-6 sm:mb-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest block mb-1">
              Step {STEP_TITLES[currentStep - 1].num} of 04
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {STEP_TITLES[currentStep - 1].title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              {STEP_TITLES[currentStep - 1].subtitle}
            </p>
          </div>

          <div className="flex items-center justify-center sm:justify-end gap-1.5">
            {[1, 2, 3, 4].map((stepIndex) => (
              <div
                key={stepIndex}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentStep === stepIndex
                    ? 'w-8 bg-emerald-600'
                    : currentStep > stepIndex
                    ? 'w-3 bg-emerald-300'
                    : 'w-3 bg-slate-200'
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
            {/* STEP 1: SELECT SHOP TIER */}
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

                {/* Step 1 Navigation */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleNextFromStep1}
                    className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
                  >
                    <span>Next: Store Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ================================================================= */}
            {/* STEP 2: STORE IDENTITY & URL */}
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
                <div className="space-y-5">
                  
                  {/* Store Name Input */}
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                      Store Display Name *
                    </label>
                    <input
                      autoFocus
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g. Apex Tech & Essentials"
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  {/* Store Handle / URL Slug */}
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                      Custom Store URL Address *
                    </label>
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:border-emerald-500 focus-within:bg-white transition-colors">
                      <span className="px-3.5 text-xs text-slate-500 font-mono font-bold select-none bg-slate-100 py-3.5 border-r border-slate-200">
                        adera.store/shop/
                      </span>
                      <input
                        required
                        type="text"
                        value={formData.handle}
                        onChange={(e) => setFormData({ ...formData, handle: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '') })}
                        placeholder="apex-tech"
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
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="e.g. Curated premium electronics, outdoor gear, and sustainable goods with verified social impact."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 resize-none transition-colors"
                    />
                  </div>

                </div>

                {/* Step 2 Navigation */}
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
                    onClick={handleNextFromStep2}
                    className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-emerald-600/25 flex items-center gap-2 cursor-pointer hover:scale-[1.01]"
                  >
                    <span>Next: Brand Logo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ================================================================= */}
            {/* STEP 3: STORE LOGO & BRANDING (SPACIOUS & DEDICATED) */}
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
                {/* Live Storefront Mockup Preview */}
                <div className="p-4 bg-slate-900 rounded-2xl text-white flex items-center justify-between gap-4 border border-slate-800 shadow-xs">
                  <div className="flex items-center gap-3.5">
                    <StoreAvatar
                      name={formData.name || 'Your Shop'}
                      avatar={formData.logo}
                      tier={tier}
                      size="md"
                    />
                    <div>
                      <h4 className="text-sm font-black text-white">
                        {formData.name || 'Your Store Name'}
                      </h4>
                      <p className="text-xs font-mono text-emerald-400 font-bold">
                        adera.store/shop/{formData.handle || 'your-slug'}
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
                        const isSelected = formData.logo === preset.id;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, logo: preset.id })}
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
                            setFormData({ ...formData, logo: e.target.value.trim() });
                          }
                        }}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  )}

                </div>

                {/* Step 3 Navigation */}
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
                    type="button"
                    onClick={handleNextFromStep3}
                    className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-emerald-600/25 flex items-center gap-2 cursor-pointer hover:scale-[1.01]"
                  >
                    <span>Next: Account & Payout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ================================================================= */}
            {/* STEP 4: ACCOUNT & PAYOUT METHOD */}
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
                <form onSubmit={handleSubmit} className="space-y-5">
                  
                  {/* Account Email */}
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                      Merchant Login Email *
                    </label>
                    <input
                      autoFocus
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="merchant@yourdomain.com"
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                      Account Password *
                    </label>
                    <input
                      required
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="At least 6 characters"
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  {/* Payout Method (Strictly avoids "crypto wallet address") */}
                  <div className="space-y-1.5 pt-1">
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800">
                      Payout Method (For Profit Distributions)
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Where you want your store earnings and markups disbursed (USDC, USDT, Bank routing, or payout address).
                    </p>
                    <input
                      type="text"
                      value={formData.walletAddress}
                      onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                      placeholder="e.g. USDC (ERC20/SPL), USDT, Bank account routing, or payout address"
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  {/* Store Summary Badge */}
                  <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <StoreAvatar
                        name={formData.name || 'Store'}
                        avatar={formData.logo}
                        tier={tier}
                        size="sm"
                      />
                      <div>
                        <span className="text-xs font-black text-slate-900 block">
                          {formData.name || 'Your Store'}
                        </span>
                        <span className="text-[11px] font-mono text-emerald-700 font-bold">
                          /{formData.handle || 'slug'} • {tier} Tier
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-lg">
                      +{TIERS.find(t => t.id === tier)?.margin}% Margin
                    </span>
                  </div>

                  {/* Step 4 Submit & Back */}
                  <div className="flex items-center justify-between gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => goToStep(3)}
                      className="px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 sm:flex-initial px-8 py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black text-sm rounded-xl transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Creating Storefront...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Launch My Storefront</span>
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
