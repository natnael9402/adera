'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Store, Award, Check, ArrowRight, ShieldCheck, DollarSign, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import ShopTierBanner from '@/components/ShopTierBanner';
import TierMedal, { ShopTierType } from '@/components/TierMedal';
import StoreAvatar, { STORE_AVATAR_PRESETS } from '@/components/StoreAvatar';
import ProfileImagePicker from '@/components/ProfileImagePicker';

const TIERS: {
  id: ShopTierType;
  name: string;
  margin: number;
  highlight: string;
  features: string[];
}[] = [
  {
    id: 'BRONZE',
    name: 'Bronze Shop',
    margin: 20,
    highlight: 'Starter Reseller',
    features: ['Up to 20% markup on wholesale', 'Curate up to 50 active items', 'Standard escrow payouts'],
  },
  {
    id: 'SILVER',
    name: 'Silver Shop',
    margin: 25,
    highlight: 'Growth Partner',
    features: ['Up to 25% markup on wholesale', 'Curate up to 150 active items', 'Custom storefront theme'],
  },
  {
    id: 'GOLD',
    name: 'Gold Shop',
    margin: 30,
    highlight: 'Pro Merchant',
    features: ['Up to 30% markup on wholesale', 'Unlimited product curation', 'Homepage featured showcase', 'Priority order dispatch'],
  },
  {
    id: 'PLATINUM',
    name: 'Platinum Shop',
    margin: 35,
    highlight: 'Elite Enterprise',
    features: ['Up to 35% markup on wholesale', 'Unlimited curation + API access', 'Verified Platinum Seal & Badge', 'Instant smart contract settlement'],
  },
];

export default function ResellerRegisterPage() {
  const router = useRouter();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      <ShopTierBanner />

      {/* Main Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-4 sm:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 relative">
              <Image src="/logo.png" alt="Adera Logo" fill className="object-contain" />
            </div>
            <span className="text-lg font-black tracking-tight text-slate-900">
              Adera <span className="text-emerald-700 text-xs font-bold uppercase border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 rounded">Reseller Hub</span>
            </span>
          </Link>

          <Link
            href="/reseller/login"
            className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-colors"
          >
            Existing Shop? Sign In
          </Link>
        </div>
      </header>

      {/* Hero Registration Strip */}
      <div className="bg-slate-900 text-white py-10 px-4 sm:px-6 text-center relative overflow-hidden border-b border-slate-800">
        <div className="max-w-3xl mx-auto space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Launch Your Decentralized Reseller Store</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Register Your Shop & Start Earning
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Source from 3,900+ wholesale products. Set your own prices, keep up to 35% profit margin, and fund global humanitarian causes.
          </p>
        </div>
      </div>

      {/* Form & Tier Selection Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 w-full space-y-8">
        
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* 1. CHOOSE SHOP TIER */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <span>1. Select Your Shop Tier Level</span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Max Profit Limits
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your shop tier determines the maximum price markup you can apply to wholesale products.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {TIERS.map((t) => {
                const isSelected = tier === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setTier(t.id)}
                    className={`cursor-pointer rounded-2xl border-2 p-4 transition-all flex flex-col justify-between space-y-3 relative ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/30 shadow-md ring-2 ring-emerald-600/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <TierMedal tier={t.id} size="md" />
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <h3 className="font-extrabold text-slate-900 text-sm mt-2">{t.name}</h3>
                      <div className="text-lg font-black text-emerald-700 font-mono mt-0.5">
                        +{t.margin}% <span className="text-[10px] text-slate-500 font-sans font-medium">Max Margin</span>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-600 mt-1">{t.highlight}</p>
                    </div>

                    <ul className="space-y-1.5 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                      {t.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. CHOOSE OR UPLOAD SHOP BRAND LOGO */}
          <ProfileImagePicker
            value={formData.logo}
            onChange={(newLogo) => setFormData({ ...formData, logo: newLogo })}
            shopName={formData.name || 'Your Shop'}
            tier={tier}
          />

          {/* 3. SHOP DETAILS FORM */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <h2 className="text-base font-black text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Store className="w-4 h-4 text-emerald-600" />
              <span>3. Configure Shop Profile & Credentials</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Shop Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Shop Display Name *
                </label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Apex Tech & Compute"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Shop Handle / URL */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Shop URL Slug / Handle *
                </label>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:border-emerald-500 focus-within:bg-white">
                  <span className="px-3 text-xs text-slate-400 font-mono font-bold select-none">/shop/</span>
                  <input
                    required
                    type="text"
                    value={formData.handle}
                    onChange={(e) => setFormData({ ...formData, handle: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '') })}
                    placeholder="apex-tech"
                    className="w-full py-2.5 pr-3 bg-transparent text-xs font-mono font-bold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Business / Contact Email *
                </label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="reseller@apextech.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Password *
                </label>
                <input
                  required
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Payout Wallet */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Crypto Payout Wallet Address (USDC / ETH / SOL)
                </label>
                <input
                  type="text"
                  value={formData.walletAddress}
                  onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                  placeholder="0x... or Solana Address for automated profit distributions"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Shop Description */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Shop Bio / Tagline (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Briefly describe the focus of your shop..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

            </div>

            {/* Live Storefront Preview Card */}
            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <StoreAvatar
                  name={formData.name || 'Your Shop'}
                  avatar={formData.logo}
                  tier={tier}
                  size="md"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span>{formData.name || 'Your Shop Display Name'}</span>
                    <span className="text-[10px] font-mono text-emerald-700 bg-white px-1.5 py-0.5 rounded border border-emerald-200 font-bold">
                      +{TIERS.find((t) => t.id === tier)?.margin}% Margin
                    </span>
                  </div>
                  <code className="text-[11px] font-mono text-slate-500">
                    adera.store/shop/{formData.handle || 'your-shop'}
                  </code>
                </div>
              </div>

              <span className="text-[11px] text-emerald-800 font-bold bg-white px-3 py-1.5 rounded-xl border border-emerald-200 shrink-0">
                Tier: {tier} Level
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-extrabold text-sm rounded-2xl transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registering Shop...</span>
                </>
              ) : (
                <>
                  <Store className="w-4 h-4" />
                  <span>Complete Registration & Open Reseller Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </div>

        </form>

      </main>
    </div>
  );
}
