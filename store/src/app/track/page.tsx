'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Search, Truck, CheckCircle2, Clock, Package, ShieldCheck, Layers, Copy, Check, ArrowRight, ExternalLink, AlertCircle, Loader2, MapPin } from 'lucide-react';
import { api } from '@/lib/api';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const queryId = searchParams.get('id') || '';

  const [identifier, setIdentifier] = useState(queryId);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchTracking = async (searchId: string) => {
    if (!searchId.trim()) return;
    setLoading(true);
    setError('');

    try {
      const data = await api.orders.track(searchId.trim());
      setOrder(data);
    } catch (err: any) {
      setError(err.message || 'No shipment found matching this number. Please verify and try again.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queryId) {
      setIdentifier(queryId);
      fetchTracking(queryId);
    }
  }, [queryId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracking(identifier);
  };

  const copyTracking = () => {
    if (!order?.trackingNumber) return;
    navigator.clipboard.writeText(order.trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 relative overflow-visible group-hover:scale-105 transition-transform">
                <Image 
                  src="/logo.png" 
                  alt="Adera Foundation Logo" 
                  fill 
                  sizes="40px" 
                  className="object-contain" 
                  priority 
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-xl font-bold text-slate-900 tracking-tight">Adera</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded uppercase tracking-wider">Store</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest leading-tight mt-0.5">
                  Shipment Tracking
                </span>
              </div>
            </Link>

            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl border border-slate-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Catalog
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 flex-1 w-full space-y-10">
        
        {/* Search Bar Banner */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
            <Truck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Real-Time Courier & On-Chain Tracking</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Track Your Order & Impact
          </h1>

          <p className="text-sm text-slate-600">
            Enter your <strong>Tracking Number</strong> (e.g. <code className="text-emerald-700 font-mono">ADR-TRK-XXXXXXXX</code>) or <strong>Order ID</strong> (e.g. <code className="text-emerald-700 font-mono">ADR-XXXXXX</code>) to view live logistics status and immutable escrow proofs.
          </p>

          <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mx-auto pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter Tracking # or Order ID"
                className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 shrink-0 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Tracking...</span>
                </>
              ) : (
                <>
                  <span>Track</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error State */}
        {error && (
          <div className="max-w-xl mx-auto flex items-center gap-3 text-xs font-semibold text-rose-800 bg-rose-50 p-4 rounded-2xl border border-rose-200 animate-fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Tracking Details View */}
        {order && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-lg space-y-8 animate-fade-in-up">
            
            {/* Header Status Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    Order #{order.orderNumber}
                  </h2>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 uppercase tracking-wider">
                    {order.status || 'CONFIRMED'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Placed on {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                </p>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div className="text-right">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Tracking Code</div>
                  <div className="text-xs font-black font-mono text-slate-900">{order.trackingNumber}</div>
                </div>
                <button
                  onClick={copyTracking}
                  className="p-2 bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 text-xs transition-colors"
                  title="Copy Tracking Number"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Stepper Progress Bar */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Shipment Journey & On-Chain Milestones
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {[
                  { title: "Order Placed", desc: "Registered on platform", done: true, current: false },
                  { title: "Payment Settled", desc: `${order.cryptoAmount} ${order.cryptoSymbol}`, done: true, current: false },
                  { title: "In Transit", desc: order.carrier || "Courier Dispatch", done: true, current: true },
                  { title: "Delivered", desc: order.estimatedDelivery || "3-5 Business Days", done: false, current: false },
                ].map((step, idx) => (
                  <div 
                    key={idx} 
                    className={`p-4 rounded-2xl border transition-all ${
                      step.current 
                        ? 'bg-emerald-50/50 border-emerald-500 shadow-sm' 
                        : step.done 
                          ? 'bg-slate-50 border-slate-200' 
                          : 'bg-slate-50/40 border-dashed border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs font-mono ${
                        step.done ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {step.done ? "✓" : idx + 1}
                      </span>
                      {step.current && (
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest bg-emerald-100 px-2 py-0.5 rounded">
                          Active
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">{step.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Courier & Blockchain Proof Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Courier Logistics */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>Courier Details</span>
                </div>
                <div className="text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Carrier:</span>
                    <span className="font-bold text-slate-900">{order.carrier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Shipping Speed:</span>
                    <span className="font-bold text-slate-900 uppercase font-mono text-[11px]">
                      {order.shippingOption === 'express' ? 'Priority Express' : 'Standard Insured'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Estimated Delivery:</span>
                    <span className="font-bold text-emerald-700">{order.estimatedDelivery}</span>
                  </div>
                </div>
              </div>

              {/* Immutable On-Chain Receipt */}
              <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-300">
                  <span className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span>On-Chain Escrow</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                    Verified
                  </span>
                </div>
                <div className="text-xs font-mono space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Settled:</span>
                    <span className="font-bold text-emerald-400">{order.cryptoAmount} {order.cryptoSymbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Escrow Target:</span>
                    <span className="font-bold text-white truncate max-w-[180px]">{order.causeTitle}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-800">
                    <span className="text-slate-400">Tx Hash:</span>
                    <span className="text-slate-300 truncate max-w-[180px] text-[11px]">{order.txHash}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Itemized Goods */}
            {Array.isArray(order.items) && order.items.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Items in Package ({order.items.length})
                </h4>
                <div className="divide-y divide-slate-100 border-y border-slate-100 text-xs">
                  {order.items.map((item: any, i: number) => (
                    <div key={i} className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-slate-900">x{item.quantity || 1}</span>
                        <span className="font-medium text-slate-700">{item.name}</span>
                      </div>
                      <span className="font-bold font-mono text-slate-900">${(Number(item.price) * Number(item.quantity || 1)).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-sm font-bold pt-1 text-slate-900">
                  <span>Total Order Value:</span>
                  <span className="font-mono text-emerald-700">${Number(order.totalAmount).toFixed(2)} USD</span>
                </div>
              </div>
            )}

            {/* Assistance Card */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="text-slate-500">
                Have questions regarding your shipment or on-chain escrow proof?
              </div>
              <a
                href="http://localhost:3005/contact"
                className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-800 shrink-0"
              >
                <span>Contact Logistics Support</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  );
}
