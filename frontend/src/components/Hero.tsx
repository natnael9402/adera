"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Lock, Heart } from 'lucide-react';
import { motion } from "framer-motion";
import DonorWall from "./DonorWall";
import { useDonate } from "@/context/DonateContext";

export default function Hero() {
  const { openDonateModal } = useDonate();

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pt-36 lg:pb-24">
      {/* Background Ambience & Subtle Mesh */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] pointer-events-none -z-10">
        <div className="absolute top-0 left-10 w-72 sm:w-96 h-72 sm:h-96 bg-emerald-400/15 rounded-full blur-3xl" />
        <div className="absolute top-20 right-10 w-72 sm:w-96 h-72 sm:h-96 bg-teal-400/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      {/* Decorative Dot Matrix Background */}
      <div 
        className="absolute inset-0 opacity-[0.45] pointer-events-none -z-10"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(15, 23, 42, 0.08) 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Headline, Description, CTAs, Accepted Channels */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 sm:space-y-7"
          >
            {/* Top Pill / Badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/90 border border-emerald-200/80 shadow-xs backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Transparent Global Philanthropy
              </span>
              <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-slate-300" />
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Real-World Milestones
              </span>
            </div>

            {/* Main Hero Headline */}
            <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.12] max-w-2xl">
              Transform Lives With{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600">
                Direct Giving
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg text-slate-600 max-w-xl font-normal leading-relaxed">
              Support verified humanitarian causes using <strong>Credit Card, PayPal, and Crypto</strong>. Direct, audited disbursements with 100% transparent milestone tracking.
            </p>

            {/* Action Buttons: Instant Giving & Campaign Launch */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3.5 w-full sm:w-auto pt-1">
              <button
                type="button"
                onClick={() => openDonateModal()}
                className="group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 text-sm sm:text-base font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl transition-all shadow-md shadow-emerald-600/25 hover:shadow-lg hover:shadow-emerald-600/35 hover:-translate-y-0.5 cursor-pointer"
              >
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:scale-110 fill-white/30" />
                <span>Donate Now</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" />
              </button>
              
              <Link
                href="/causes/new"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm sm:text-base font-bold text-slate-700 bg-white hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 rounded-xl transition-all shadow-xs hover:-translate-y-0.5"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Start a Campaign</span>
              </Link>
            </div>

            {/* Accepted Payment Channels Ribbon */}
            <div className="w-full max-w-xl bg-white/80 backdrop-blur-md rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  Accepted Payment Channels
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Zero Platform Fees
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                  <img src="/payments/visa.svg" alt="Visa" className="h-4 object-contain" />
                  <span className="text-[11px] font-bold text-slate-800">Visa</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                  <img src="/payments/mastercard.svg" alt="MasterCard" className="h-4 object-contain" />
                  <span className="text-[11px] font-bold text-slate-800">Mastercard</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                  <img src="/payments/paypal.svg" alt="PayPal" className="h-4 object-contain" />
                  <span className="text-[11px] font-bold text-slate-800">PayPal</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                  <img src="/payments/applepay.svg" alt="Apple Pay" className="h-4 object-contain" />
                  <span className="text-[11px] font-bold text-slate-800">Apple Pay</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900">
                  <img src="/crypto/btc.svg" alt="Crypto" className="h-3.5 w-3.5 object-contain" />
                  <span className="text-[11px]">Crypto Native</span>
                </div>
              </div>
            </div>

          </motion.div>

          {/* Right Column: Donor Wall Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 w-full max-w-lg mx-auto lg:ml-auto lg:mr-0"
          >
            <div className="relative">
              {/* Subtle back decorative glow */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-blue-500/20 rounded-[2rem] blur-xl opacity-60 group-hover:opacity-100 transition-opacity" />
              
              {/* Outer Card Wrapper */}
              <div className="relative bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-1.5 sm:p-2 shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
                <DonorWall limit={5} minimal />
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
