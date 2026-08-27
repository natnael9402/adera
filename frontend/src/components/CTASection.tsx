"use client";

import { Heart, ArrowRight, ShieldCheck, Zap, Lock, CheckCircle2 } from 'lucide-react';
import Image from "next/image";
import Link from "next/link";
import { useDonate } from "@/context/DonateContext";

const supportedPayments = [
  { name: "Visa", symbol: "Visa", logo: "/payments/visa.svg" },
  { name: "Mastercard", symbol: "Mastercard", logo: "/payments/mastercard.svg" },
  { name: "PayPal", symbol: "PayPal", logo: "/payments/paypal.svg" },
  { name: "Apple Pay", symbol: "Apple Pay", logo: "/payments/applepay.svg" },
  { name: "Bitcoin", symbol: "BTC", logo: "/crypto/btc.svg" },
  { name: "Ethereum", symbol: "ETH", logo: "/crypto/eth.svg" },
  { name: "USD Coin", symbol: "USDC", logo: "/crypto/usdc.svg" },
];

const guarantees = [
  { icon: Lock, text: "Milestone-Gated Escrow" },
  { icon: Zap, text: "0% Platform Deductions" },
  { icon: ShieldCheck, text: "100% Verified Impact" },
  { icon: CheckCircle2, text: "Instant Direct Receipts" },
];

export default function CTASection() {
  const { openDonateModal } = useDonate();

  return (
    <section id="help-now" className="py-20 lg:py-24 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 p-8 sm:p-12 lg:p-16 text-center">
          
          {/* Subtle Background Glow */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Universal & Transparent Giving</span>
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Empower Real Change Across Communities Worldwide
            </h2>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Whether you give via <strong>Credit Card, PayPal, Apple Pay, or Crypto</strong>, every contribution bypasses bureaucratic red tape to directly fund rural classrooms, mobile clinics, and clean water wells.
            </p>

            {/* Supported Channels Strip */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 py-2">
              {supportedPayments.map((p) => (
                <div 
                  key={p.symbol}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700 text-xs font-bold text-slate-200 shadow-2xs"
                >
                  <Image 
                    src={p.logo} 
                    alt={p.name} 
                    width={22} 
                    height={14} 
                    className="h-3.5 w-auto object-contain"
                    style={{ width: "auto", height: "auto" }}
                  />
                  <span className="text-[11px]">{p.symbol}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button 
                type="button"
                onClick={() => openDonateModal()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-base font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all hover-lift cursor-pointer"
              >
                <Heart className="w-5 h-5 fill-white/30" />
                <span>Donate Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link 
                href="#how-it-works" 
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/15 text-white text-base font-bold rounded-xl border border-white/20 transition-all"
              >
                How It Works
              </Link>
            </div>

            {/* 4 Guarantees */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-10 border-t border-slate-800">
              {guarantees.map((item) => (
                <div 
                  key={item.text}
                  className="flex items-center justify-center gap-2 text-xs font-medium text-slate-400 py-1"
                >
                  <item.icon className="w-3.5 h-3.5 text-primary-400 shrink-0" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
