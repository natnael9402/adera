'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Store, Lock, Mail, ArrowRight, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api';
import ShopTierBanner from '@/components/ShopTierBanner';
import TierMedal from '@/components/TierMedal';

export default function ResellerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.resellers.login({
        email: email.trim(),
        password,
      });

      if (res.token) {
        localStorage.setItem('reseller_token', res.token);
        localStorage.setItem('reseller_shop', JSON.stringify(res.shop));
        router.push('/reseller/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
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
            href="/reseller/register"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-4 py-2 rounded-xl transition-colors"
          >
            New Reseller? Register Shop
          </Link>
        </div>
      </header>

      {/* Login Card */}
      <main className="max-w-md mx-auto px-4 py-12 sm:py-16 flex-1 w-full flex flex-col justify-center">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mx-auto shadow-xs">
              <Store className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">Reseller Shop Sign In</h1>
            <p className="text-xs text-slate-500">
              Access your inventory, custom pricing matrix, and payout metrics.
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Shop Account Email
              </label>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 focus-within:border-emerald-500 focus-within:bg-white">
                <Mail className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="reseller@example.com"
                  className="w-full py-2.5 bg-transparent text-xs font-semibold text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Password
              </label>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 focus-within:border-emerald-500 focus-within:bg-white">
                <Lock className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full py-2.5 bg-transparent text-xs font-semibold text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Open Reseller Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Reseller Accounts */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
              Quick Demo Accounts:
            </p>
            <div className="grid grid-cols-3 gap-2 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => {
                  setEmail('reseller.apex@adera.io');
                  setPassword('Panda232323@');
                }}
                className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-800 transition-all flex flex-col items-center gap-1 text-center"
              >
                <TierMedal tier="PLATINUM" size="xs" />
                <span>Platinum (+35%)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('reseller.horizon@adera.io');
                  setPassword('Panda232323@');
                }}
                className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-800 transition-all flex flex-col items-center gap-1 text-center"
              >
                <TierMedal tier="GOLD" size="xs" />
                <span>Gold (+30%)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('reseller.nordic@adera.io');
                  setPassword('Panda232323@');
                }}
                className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-800 transition-all flex flex-col items-center gap-1 text-center"
              >
                <TierMedal tier="SILVER" size="xs" />
                <span>Silver (+25%)</span>
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
