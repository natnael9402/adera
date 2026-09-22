"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, HeartHandshake, CheckCircle2 } from 'lucide-react';

export default function FeaturedCauses() {
  return (
    <section className="py-16 sm:py-20 relative overflow-hidden bg-slate-50/60 border-y border-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
        
        {/* Minimalist Verified Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>100% On-Chain Milestone Delivery</span>
        </div>

        {/* Minimalist Punchy Headline */}
        <div className="space-y-2">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Direct Philanthropic Initiatives
          </h2>
          <p className="text-slate-500 text-sm sm:text-base max-w-xl mx-auto font-normal leading-relaxed">
            Transparent community development projects with zero intermediary deductions. Every gift is verifiable on-chain.
          </p>
        </div>

        {/* Primary Gateway Button */}
        <div className="pt-2">
          <Link 
            href="/causes"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-slate-950 hover:bg-slate-800 active:scale-[0.98] text-white font-black text-sm sm:text-base rounded-2xl transition-all shadow-md group cursor-pointer"
          >
            <span>Explore All Causes</span>
            <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Minimalist Trust Features */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-4 text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Milestone Audited</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>0% Platform Spread</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cryptographic Proof</span>
          </div>
        </div>

      </div>
    </section>
  );
}
