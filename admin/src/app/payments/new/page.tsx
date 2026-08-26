'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Wallet, ArrowLeft, Save, ShieldCheck } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function NewPaymentPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    network: 'Bitcoin Mainnet',
    symbol: 'BTC',
    address: ''
  });
  const [submitting, setSubmitting] = useState(false);

  if (!loading && !user) {
    router.push('/login');
    return null;
  }

  const presets = [
    { network: 'Bitcoin Mainnet', symbol: 'BTC' },
    { network: 'Ethereum (ERC-20)', symbol: 'ETH' },
    { network: 'Solana Mainnet', symbol: 'SOL' },
    { network: 'USD Coin (ERC-20/SPL)', symbol: 'USDC' },
    { network: 'Tether (TRC-20/ERC-20)', symbol: 'USDT' },
    { network: 'Polygon PoS', symbol: 'POL' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.paymentMethods.create(formData);
      router.push('/payments');
    } catch (error) {
      console.error(error);
      alert('Failed to add payment method');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 w-full space-y-6">
        
        <div className="flex items-center justify-between">
          <Link 
            href="/payments" 
            className="inline-flex items-center text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl transition-colors shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Payment Wallets
          </Link>

          <span className="text-xs font-bold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-md border border-primary-200">
            Treasury Configuration
          </span>
        </div>

        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          
          <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
            <div className="w-12 h-12 bg-primary-50 border border-primary-200 rounded-2xl flex items-center justify-center text-primary-700">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Add Crypto Settlement Address
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Register a new treasury or multi-sig address for receiving donations and store settlements.
              </p>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Select Preset Network
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.symbol}
                  type="button"
                  onClick={() => setFormData({ ...formData, network: preset.network, symbol: preset.symbol })}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                    formData.symbol === preset.symbol
                      ? 'bg-primary-50 border-primary-500 text-primary-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="block text-slate-900">{preset.symbol}</span>
                  <span className="text-[10px] text-slate-500 font-normal">{preset.network}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Blockchain Network <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Solana Mainnet, Polygon PoS"
                  value={formData.network}
                  onChange={(e) => setFormData({ ...formData, network: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Asset Ticker / Symbol <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. BTC, ETH, SOL"
                  value={formData.symbol}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:bg-white transition-all uppercase font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Wallet / Treasury Deposit Address <span className="text-rose-500">*</span>
              </label>
              <input
                required
                type="text"
                placeholder="e.g. 0x71C88147d3B85229211C473fC4223A44d71FaCbe"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:bg-white transition-all font-mono"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-md shadow-primary-600/20 hover-lift flex items-center justify-center gap-2 text-sm"
              >
                <Save className="w-4 h-4" />
                <span>{submitting ? 'Saving Address...' : 'Save Wallet Address'}</span>
              </button>
            </div>
          </form>

        </div>
      </main>
    </div>
  );
}
