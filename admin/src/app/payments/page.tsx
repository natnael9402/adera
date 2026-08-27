'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { 
  Wallet, Plus, Trash2, Copy, 
  Check, AlertCircle, ShieldCheck, ExternalLink 
} from 'lucide-react';
import Navbar from '@/components/Navbar';

interface PaymentMethod {
  id: number;
  network: string;
  symbol: string;
  address: string;
}

const LOGO_MAP: Record<string, string> = {
  BTC: '/crypto/btc.svg',
  ETH: '/crypto/eth.svg',
  SOL: '/crypto/sol.svg',
  USDC: '/crypto/usdc.svg',
  USDT: '/crypto/usdt.svg',
  MATIC: '/crypto/matic.svg',
  POL: '/crypto/matic.svg',
};

export default function PaymentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user) loadPaymentMethods();
  }, [user, loading, router]);

  const loadPaymentMethods = () => {
    api.paymentMethods.list().then(setPaymentMethods).catch(console.error);
  };

  const removePaymentMethod = async (id: number) => {
    if (!confirm('Are you sure you want to remove this crypto wallet address?')) return;
    setDeletingId(id);
    try {
      await api.paymentMethods.remove(id);
      setPaymentMethods((p) => p.filter((pm) => pm.id !== id));
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  };

  const copyAddress = (id: number, address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Wallet className="w-8 h-8 text-primary-600" />
              Payment Channels & Settlement Wallets
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Configure multi-channel payment acceptance (Credit Card, PayPal) and manage active multi-chain deposit addresses.
            </p>
          </div>

          <Link
            href="/payments/new"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all shadow-md shadow-primary-600/20 text-xs hover-lift"
          >
            <Plus className="w-4 h-4" />
            <span>Add Crypto Wallet</span>
          </Link>
        </div>

        {/* Traditional Payment Gateway Integration Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Credit Card Gateway */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center p-2 shrink-0">
              <Image src="/payments/credit-card.svg" alt="Card" width={28} height={28} className="object-contain" />
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900">Credit / Debit Cards (Visa & Mastercard)</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  Compliance In Progress
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Merchant gateway onboarding and 3DS compliance certification underway. Donors choosing card will see status notices and 1-click fallback to zero-fee crypto.
              </p>
            </div>
          </div>

          {/* Card 2: PayPal & Digital Wallets */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center p-2 shrink-0">
              <Image src="/payments/paypal.svg" alt="PayPal" width={28} height={28} className="object-contain" />
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900">PayPal & Apple Pay</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  Gateway Integration In Progress
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                International humanitarian merchant account setup in review. Modal directs donors seamlessly to instant crypto settlement.
              </p>
            </div>
          </div>
        </div>

        {/* Security Info Card */}
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm flex items-center gap-3 text-xs text-emerald-900 font-medium">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            Active Settlement Wallets: All crypto deposit addresses below are live in the foundation donation modal and merchandise store checkout.
          </span>
        </div>

        {/* Wallets Table */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">Asset & Network</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">Symbol</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">Deposit Address</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paymentMethods.map((method) => {
                  const upperSym = (method.symbol || '').toUpperCase();
                  const logoSrc = LOGO_MAP[upperSym] || '/crypto/usdc.svg';

                  return (
                    <tr key={method.id} className="hover:bg-slate-50 transition-colors">
                      
                      {/* Asset & Network */}
                      <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center p-1.5 shrink-0">
                          <Image 
                            src={logoSrc} 
                            alt={method.network} 
                            width={22} 
                            height={22} 
                            className="w-5 h-5 object-contain"
                            style={{ width: "auto", height: "auto" }}
                          />
                        </div>
                        <div>
                          <span className="block text-slate-900 font-bold">{method.network}</span>
                          <span className="text-[10px] text-slate-400 font-mono">Treasury Target</span>
                        </div>
                      </td>

                      {/* Symbol */}
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-primary-50 border border-primary-200 text-primary-700 text-xs font-mono font-bold rounded-lg">
                          {method.symbol}
                        </span>
                      </td>

                      {/* Deposit Address with 1-Click Copy */}
                      <td className="px-6 py-4 font-mono text-xs">
                        <div className="flex items-center gap-2 max-w-md">
                          <span className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-800 truncate select-all flex-1">
                            {method.address}
                          </span>
                          <button
                            onClick={() => copyAddress(method.id, method.address)}
                            title="Copy address"
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 border border-slate-200 transition-colors"
                          >
                            {copiedId === method.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedId === method.id ? "Copied" : "Copy"}</span>
                          </button>
                        </div>
                      </td>

                      {/* Delete */}
                      <td className="px-6 py-4 text-right">
                        <button
                          disabled={deletingId === method.id}
                          onClick={() => removePaymentMethod(method.id)}
                          title="Remove Wallet"
                          className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl border border-rose-200 transition-all shadow-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>

                    </tr>
                  );
                })}

                {paymentMethods.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <AlertCircle className="w-8 h-8 text-slate-400" />
                        <p className="font-bold text-slate-800 text-sm">No settlement addresses configured</p>
                        <p className="text-xs text-slate-500">Add crypto addresses to start receiving payments.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
