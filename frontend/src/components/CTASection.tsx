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
        <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 p-8 sm:p-12 lg:p-16 text-center">
          
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Direct Impact</span>
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Support a Cause Today
            </h2>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Your donation goes straight to verified projects with zero platform cuts.
            </p>

            {/* Supported Channels Strip */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 py-2">
              {supportedPayments.map((p) => (
                <div 
                  key={p.symbol}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 shadow-2xs"
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
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
              <button 
                type="button"
                onClick={() => openDonateModal()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Heart className="w-4 h-4 text-emerald-100" />
                <span>Donate Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                href="/causes/new"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-slate-200 hover:text-white text-sm font-bold rounded-xl border border-slate-800 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Start a Cause</span>
              </Link>
            </div>

            {/* 4 Guarantees */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-10 border-t border-slate-800/80">
              {guarantees.map((item) => (
                <div 
                  key={item.text}
                  className="flex items-center justify-center gap-2 text-xs font-medium text-slate-400 py-1"
                >
                  <item.icon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
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
