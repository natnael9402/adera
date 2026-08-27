'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Store, Award, Check, ArrowRight, ArrowLeft, ShieldCheck, 
  DollarSign, AlertCircle, Loader2, CreditCard, Sparkles, User, Lock, CheckCircle2
} from 'lucide-react';
import { api } from '@/lib/api';
import TierMedal, { ShopTierType } from '@/components/TierMedal';
import StoreAvatar from '@/components/StoreAvatar';
import ProfileImagePicker from '@/components/ProfileImagePicker';

const TIERS: {
  id: ShopTierType;
  name: string;
  margin: number;
  highlight: string;
  badge: string;
  features: string[];
}[] = [
  {
    id: 'BRONZE',
    name: 'Bronze Shop',
    margin: 20,
    highlight: 'Starter Reseller',
    badge: 'Popular for Beginners',
    features: ['Up to 20% markup on wholesale', 'Curate up to 50 active items', 'Standard automated payouts'],
  },
  {
    id: 'SILVER',
    name: 'Silver Shop',
    margin: 25,
    highlight: 'Growth Partner',
    badge: 'High Growth',
    features: ['Up to 25% markup on wholesale', 'Curate up to 150 active items', 'Custom storefront theme branding'],
  },
  {
    id: 'GOLD',
    name: 'Gold Shop',
    margin: 30,
    highlight: 'Pro Merchant',
    badge: 'Best Value',
    features: ['Up to 30% markup on wholesale', 'Unlimited product curation', 'Homepage featured showcase', 'Priority order dispatch'],
  },
  {
    id: 'PLATINUM',
    name: 'Platinum Shop',
    margin: 35,
    highlight: 'Elite Enterprise',
    badge: 'Maximum Profit',
    features: ['Up to 35% markup on wholesale', 'Unlimited curation + API access', 'Verified Platinum Seal & Medal', 'Instant settlement priority'],
  },
];

export default function ResellerRegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [tier, setTier] = useState<ShopTierType>('BRONZE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    handle: '',
    email: '',
    password: '',
    walletAddress: '',
    description: '',
    logo: 'preset:store_apex',
  });

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

  const validateStep2 = () => {
    if (!formData.name.trim()) {
      setError('Please enter a display name for your shop.');
      return false;
    }
    if (!formData.handle.trim()) {
      setError('Please choose a URL handle/slug for your shop.');
      return false;
    }
    setError(null);
    return true;
  };

  const validateStep3 = () => {
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please provide a valid business/contact email.');
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleNextFromStep1 = () => {
    setError(null);
    setCurrentStep(2);
  };

  const handleNextFromStep2 = () => {
    if (validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2() || !validateStep3()) return;

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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* Clean Top Navigation Bar (NO tier banner on this dedicated page) */}
      <header className="bg-white border-b border-slate-200 py-3.5 px-4 sm:px-8 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 relative overflow-hidden rounded-xl">
              <Image src="/logo.png" alt="Adera Logo" fill className="object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-slate-900 leading-none group-hover:text-emerald-700 transition-colors">
                Adera <span className="text-emerald-600">Store</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mt-0.5">
                Reseller Registration
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 px-3 py-2 rounded-xl transition-colors hidden sm:inline-block"
            >
              Back to Store
            </Link>
            <Link
              href="/reseller/login"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-4 py-2 rounded-xl transition-colors shadow-2xs"
            >
              Already Registered? Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Strip */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white py-10 px-4 sm:px-6 text-center relative overflow-hidden border-b border-slate-800">
        <div className="max-w-3xl mx-auto space-y-2.5 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Official Reseller Program</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Register Your Branded Reseller Store
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Source from wholesale products, set your margins, receive automated payouts, and fund humanitarian causes with every sale.
          </p>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 w-full space-y-8">
        
        {/* 3-STEP TAB PROGRESSION HEADER */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
          <div className="grid grid-cols-3 gap-2">
            
            {/* Step 1 Tab */}
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className={`p-3 rounded-xl transition-all flex items-center justify-center sm:justify-start gap-3 text-left ${
                currentStep === 1
                  ? 'bg-emerald-50 border-2 border-emerald-500 text-emerald-950 shadow-xs'
                  : currentStep > 1
                  ? 'bg-slate-50 border border-emerald-200 text-slate-700 hover:bg-slate-100'
                  : 'bg-transparent text-slate-400'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                currentStep === 1
                  ? 'bg-emerald-600 text-white'
                  : currentStep > 1
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-200 text-slate-500'
              }`}>
                {currentStep > 1 ? <Check className="w-4 h-4 stroke-[3]" /> : '1'}
              </div>
              <div className="hidden sm:block">
                <span className="text-xs font-black block leading-none">Step 1</span>
                <span className="text-[11px] font-semibold text-slate-500">Select Plan Tier</span>
              </div>
            </button>

            {/* Step 2 Tab */}
            <button
              type="button"
              onClick={() => {
                if (currentStep > 2 || validateStep2()) setCurrentStep(2);
              }}
              className={`p-3 rounded-xl transition-all flex items-center justify-center sm:justify-start gap-3 text-left ${
                currentStep === 2
                  ? 'bg-emerald-50 border-2 border-emerald-500 text-emerald-950 shadow-xs'
                  : currentStep > 2
                  ? 'bg-slate-50 border border-emerald-200 text-slate-700 hover:bg-slate-100'
                  : 'bg-transparent text-slate-400'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                currentStep === 2
                  ? 'bg-emerald-600 text-white'
                  : currentStep > 2
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-200 text-slate-500'
              }`}>
                {currentStep > 2 ? <Check className="w-4 h-4 stroke-[3]" /> : '2'}
              </div>
              <div className="hidden sm:block">
                <span className="text-xs font-black block leading-none">Step 2</span>
                <span className="text-[11px] font-semibold text-slate-500">Store Details & Logo</span>
              </div>
            </button>

            {/* Step 3 Tab */}
            <button
              type="button"
              onClick={() => {
                if (validateStep2()) setCurrentStep(3);
              }}
              className={`p-3 rounded-xl transition-all flex items-center justify-center sm:justify-start gap-3 text-left ${
                currentStep === 3
                  ? 'bg-emerald-50 border-2 border-emerald-500 text-emerald-950 shadow-xs'
                  : 'bg-transparent text-slate-400'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                currentStep === 3
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 text-slate-500'
              }`}>
                3
              </div>
              <div className="hidden sm:block">
                <span className="text-xs font-black block leading-none">Step 3</span>
                <span className="text-[11px] font-semibold text-slate-500">Account & Payout</span>
              </div>
            </button>

          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* ======================================================================= */}
          {/* STEP TAB 1: SELECT SHOP TIER PLAN */}
          {/* ======================================================================= */}
          {currentStep === 1 && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 animate-fade-in">
              <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-600" />
                    <span>Select Your Shop Tier Level</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Your tier level unlocks your maximum price markup and curated product capacity.
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 self-start sm:self-center">
                  Zero Upfront Costs
                </span>
              </div>

              {/* 4 Tier Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {TIERS.map((t) => {
                  const isSelected = tier === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => setTier(t.id)}
                      className={`cursor-pointer rounded-2xl border-2 p-5 transition-all flex flex-col justify-between space-y-4 relative ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/40 shadow-md ring-2 ring-emerald-600/20'
                          : 'border-slate-200 bg-slate-50/60 hover:border-slate-300 hover:bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <TierMedal tier={t.id} size="md" />
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                              {t.badge}
                            </span>
                            {isSelected && (
                              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            )}
                          </div>
                        </div>

                        <h3 className="font-black text-slate-900 text-base">{t.name}</h3>
                        <div className="text-2xl font-black text-emerald-700 font-mono mt-1">
                          +{t.margin}% <span className="text-xs text-slate-500 font-sans font-medium">Max Profit Markup</span>
                        </div>
                        <p className="text-xs font-semibold text-slate-600 mt-1">{t.highlight}</p>
                      </div>

                      <ul className="space-y-2 pt-3 border-t border-slate-200/80 text-xs text-slate-600">
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

              {/* Step 1 Action Button */}
              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleNextFromStep1}
                  className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
                >
                  <span>Continue to Store Setup (Step 2)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ======================================================================= */}
          {/* STEP TAB 2: STORE IDENTITY & LOGO */}
          {/* ======================================================================= */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <Store className="w-5 h-5 text-emerald-600" />
                      <span>Configure Store Identity & URL</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Name your shop and choose your unique public storefront address.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                    Selected Tier: {tier}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Shop Display Name */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Shop Display Name *
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g. Apex Gear & Tech"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  {/* Shop URL Slug */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Shop URL Address Slug *
                    </label>
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:border-emerald-500 focus-within:bg-white">
                      <span className="px-3 text-xs text-slate-400 font-mono font-bold select-none bg-slate-100/70 py-3 border-r border-slate-200">
                        /shop/
                      </span>
                      <input
                        required
                        type="text"
                        value={formData.handle}
                        onChange={(e) => setFormData({ ...formData, handle: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '') })}
                        placeholder="apex-gear"
                        className="w-full py-3 px-3 bg-transparent text-xs font-mono font-bold text-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Shop Tagline / Description */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Shop Description / Bio (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="e.g. Premium curated electronics, outdoor essentials, and humanitarian impact gear."
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 resize-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Logo / Image Picker Component */}
              <ProfileImagePicker
                value={formData.logo}
                onChange={(newLogo) => setFormData({ ...formData, logo: newLogo })}
                shopName={formData.name || 'Your Shop'}
                tier={tier}
              />

              {/* Step 2 Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back: Change Tier</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextFromStep2}
                  className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer hover:scale-[1.01]"
                >
                  <span>Continue to Account & Payout (Step 3)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ======================================================================= */}
          {/* STEP TAB 3: ACCOUNT & PAYOUT METHOD */}
          {/* ======================================================================= */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="pb-4 border-b border-slate-100">
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-emerald-600" />
                    <span>Account Credentials & Payout Method</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Set up your merchant login credentials and specify your profit distribution destination.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Owner Email */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Merchant / Contact Email *
                    </label>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="merchant@yourdomain.com"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Account Password *
                    </label>
                    <input
                      required
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="At least 6 characters"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  {/* Payout Method (Explicitly avoiding "crypto wallet address") */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
                      Payout Method (Account / Address for Profit Distributions)
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Specify where you want your shop sales profits and markups disbursed (USDC, USDT, Bank routing, or settlement address).
                    </p>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.walletAddress}
                        onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                        placeholder="e.g. USDC (ERC20/SPL), USDT, Bank account routing, or payout address"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Final Review Card */}
                <div className="p-5 bg-gradient-to-br from-emerald-50/70 via-white to-slate-50 rounded-2xl border border-emerald-200 space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                    Storefront Ready to Launch
                  </span>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <StoreAvatar
                        name={formData.name || 'Your Shop'}
                        avatar={formData.logo}
                        tier={tier}
                        size="md"
                      />
                      <div>
                        <h4 className="text-sm font-black text-slate-900">
                          {formData.name || 'Your Store Name'}
                        </h4>
                        <p className="text-xs font-mono text-emerald-700 font-bold">
                          adera.store/shop/{formData.handle || 'your-handle'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-bold text-slate-700 shrink-0">
                      <div className="text-right">
                        <span className="block text-[11px] text-slate-400 uppercase">Tier Level</span>
                        <span className="text-emerald-700 font-black">{tier} (+{TIERS.find(t => t.id === tier)?.margin}% Margin)</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Step 3 Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back: Store Details</span>
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Your Store...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Complete Registration & Open Store Studio</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </form>

      </main>
    </div>
  );
}
