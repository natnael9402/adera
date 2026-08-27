"use client";

import Image from "next/image";
import Link from "next/link";
import { 
  Wallet, 
  ShieldCheck, 
  BarChart3, 
  ArrowRight, 
  FileCheck2, 
  SearchCheck,
  Coins
} from "lucide-react";

const steps = [
  {
    number: "01",
    badge: "Step 01",
    icon: Wallet,
    title: "Select Cause & Payment Method",
    description: "Choose a verified initiative and give via your preferred method — Credit Card, PayPal, Apple Pay, or Instant Crypto.",
    actionTitle: "Universal Multi-Payment Support",
    tokens: [
      { name: "Visa", logo: "/payments/visa.svg" },
      { name: "Mastercard", logo: "/payments/mastercard.svg" },
      { name: "PayPal", logo: "/payments/paypal.svg" },
      { name: "Crypto", logo: "/crypto/btc.svg" },
    ],
  },
  {
    number: "02",
    badge: "Step 02",
    icon: ShieldCheck,
    title: "Transparent Milestone Escrow",
    description: "Donations are allocated directly into verified project escrows and disbursed only when verified field milestones are achieved.",
    actionTitle: "Accountability Guarantee",
    meta: "100% Milestone-Gated Disbursements",
    metaIcon: FileCheck2,
  },
  {
    number: "03",
    badge: "Step 03",
    icon: BarChart3,
    title: "Track Real-Time Verified Impact",
    description: "Receive instant confirmation receipts. Follow real-time photo proofs, financial accounting, and community field reports.",
    actionTitle: "Live Verification",
    meta: "Transparent Impact Audit Trail",
    metaIcon: SearchCheck,
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 sm:py-28 bg-white border-t border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Green Accent */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16 sm:mb-20">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-primary-50 text-primary-700 text-xs font-bold uppercase tracking-wider border border-primary-200">
            <Coins className="w-3.5 h-3.5 text-primary-600" />
            Simple 3-Step Process
          </span>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            How <span className="text-primary-600">Adera</span> Works
          </h2>
          
          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Giving should be effortless and completely transparent. Experience direct, milestone-verified philanthropy from payment to community impact.
          </p>
        </div>

        {/* 3 Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div 
              key={step.number}
              className="bg-slate-50 border border-slate-200 hover:border-primary-500 rounded-2xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-200 hover:shadow-md group"
            >
              <div>
                {/* Step Top Bar */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200/80">
                  <div className="w-12 h-12 rounded-xl bg-primary-600 text-white flex items-center justify-center shadow-md shadow-primary-600/20 group-hover:scale-105 transition-transform">
                    <step.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-3xl font-black text-slate-300 group-hover:text-primary-500 transition-colors font-mono">
                    {step.number}
                  </span>
                </div>

                <span className="inline-block text-xs font-bold uppercase tracking-wider text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded border border-primary-200 mb-3">
                  {step.badge}
                </span>

                <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary-700 transition-colors mb-3 leading-snug">
                  {step.title}
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Step Footer Details */}
              <div className="mt-8 pt-5 border-t border-slate-200/80">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                  {step.actionTitle}
                </p>

                {step.tokens ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    {step.tokens.map((t) => (
                      <div 
                        key={t.name}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-primary-300 text-xs font-bold text-slate-800 transition-colors"
                      >
                        <Image 
                          src={t.logo} 
                          alt={t.name} 
                          width={16} 
                          height={16} 
                          className="w-4 h-4 object-contain"
                          style={{ width: "auto", height: "auto" }}
                        />
                        <span className="font-mono text-[11px]">{t.name}</span>
                      </div>
                    ))}
                  </div>
                ) : step.meta ? (
                  <div className="flex items-center gap-2 text-xs font-semibold text-primary-800 bg-primary-50 border border-primary-200 px-3 py-2 rounded-lg">
                    {step.metaIcon && <step.metaIcon className="w-4 h-4 text-primary-600 shrink-0" />}
                    <span className="truncate">{step.meta}</span>
                  </div>
                ) : null}
              </div>

            </div>
          ))}
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-900 border border-slate-800 text-white px-8 py-7 rounded-2xl max-w-4xl mx-auto w-full shadow-md">
            <div className="text-left">
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary-500" />
                Ready to make a measurable difference?
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Browse actively verified initiatives with transparent on-chain delivery.
              </p>
            </div>
            
            <Link 
              href="/causes" 
              className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-7 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary-600/25 shrink-0"
            >
              Start Donating Now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
