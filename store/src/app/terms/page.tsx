'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, FileText, ArrowLeft, CheckCircle2, Lock, Scale } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-4 sm:px-8 sticky top-0 z-30 shadow-2xs">
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
                Merchant Terms
              </span>
            </div>
          </Link>

          <Link
            href="/reseller/register"
            className="text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Registration</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 flex-1 w-full space-y-8">
        <div className="space-y-3 text-center sm:text-left border-b border-slate-200 pb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5 text-emerald-600" />
            <span>Legal & Merchant Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Adera Store Terms of Service
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Last Updated: August 2026 • Effective for all Merchant Partners & Resellers
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-8 text-sm text-slate-700 leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-mono font-bold">1</span>
              <span>Merchant Account & Verification</span>
            </h2>
            <p>
              By registering a reseller storefront on Adera Store, you agree to provide accurate and truthful business contact details. Each reseller is granted a unique store URL slug and dashboard to curate wholesale products, set permitted markup margins, and manage customer communications.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-mono font-bold">2</span>
              <span>Pricing Margins & Tier Limits</span>
            </h2>
            <p>
              Wholesale base costs are established by Adera Verified Suppliers. Resellers may configure custom retail prices up to the maximum markup margin defined by their selected tier level (Bronze: up to 20%, Silver: up to 25%, Gold: up to 30%, Platinum: up to 35%). Exceeding tier thresholds is automatically capped by smart validation.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-mono font-bold">3</span>
              <span>Order Fulfillment & Escrow Disbursements</span>
            </h2>
            <p>
              Customer orders placed on your storefront are processed through Adera&apos;s automated escrow protocol. Wholesale fulfillment, international shipping, and tracking updates are handled automatically. Sales profit margins are credited to your merchant balance and disbursed to your configured payout method.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-mono font-bold">4</span>
              <span>Humanitarian Impact Guarantee</span>
            </h2>
            <p>
              A portion of platform operating profits is allocated directly to verified humanitarian causes. Resellers and customers receive transparent receipt logs and cryptographic milestone proof of aid delivery.
            </p>
          </section>

        </div>
      </main>
    </div>
  );
}
