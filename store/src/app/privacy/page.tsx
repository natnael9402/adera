'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Lock, ArrowLeft, Eye, KeyRound } from 'lucide-react';

export default function PrivacyPage() {
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
                Privacy Policy
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
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Data Protection & Privacy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Privacy & Data Security Policy
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Last Updated: August 2026 • Your Security & Privacy Are Protected
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-8 text-sm text-slate-700 leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-mono font-bold">1</span>
              <span>Information We Collect</span>
            </h2>
            <p>
              We collect information you provide directly during account registration, including your business email, encrypted password credentials, store branding parameters, and settlement payout destination accounts.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-mono font-bold">2</span>
              <span>How Your Data Is Used</span>
            </h2>
            <p>
              Your information is exclusively utilized to maintain your storefront instance, process customer order fulfillment, authenticate administrative sessions, and disburse sales earnings. We never sell or monetize merchant or customer data.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-mono font-bold">3</span>
              <span>Encryption & Session Security</span>
            </h2>
            <p>
              All passwords undergo high-cost bcrypt salting. Communication between clients, API endpoints, and escrow nodes is encrypted via TLS 1.3. Payout methods and financial settlements are safeguarded by cryptographic access controls.
            </p>
          </section>

        </div>
      </main>
    </div>
  );
}
