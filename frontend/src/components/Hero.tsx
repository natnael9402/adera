"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Lock, Heart } from 'lucide-react';
import { motion } from "framer-motion";
import DonorWall from "./DonorWall";
import { useDonate } from "@/context/DonateContext";

export default function Hero() {
  const { openDonateModal } = useDonate();

  return (
    <section className="relative min-h-[88vh] flex items-center justify-center pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pt-36 lg:pb-24 bg-white">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Headline, Description, CTAs, Accepted Channels */}
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6"
          >
            {/* Top Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Verified Giving Platform
              </span>
              <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-slate-300" />
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 100% Direct Funding
              </span>
            </div>

            {/* Main Hero Headline: Crisp Solid Typography */}
            <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.12] max-w-2xl">
              Direct Giving. <br />
              <span className="text-emerald-700">Verified Impact.</span>
            </h1>

            {/* Clear, Authoritative Subtext */}
            <p className="text-base sm:text-lg text-slate-600 max-w-xl font-normal leading-relaxed">
              Donate directly to verified humanitarian causes with card, PayPal, or crypto. 100% of your donation goes directly to the project.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 w-full sm:w-auto pt-1">
              <Link
                href="/donate"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm sm:text-base font-bold text-white bg-slate-950 hover:bg-slate-800 active:scale-[0.98] rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <Heart className="w-4 h-4 text-emerald-400" />
                <span>Donate Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              <Link
                href="/causes/new"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm sm:text-base font-bold text-slate-800 bg-white hover:bg-slate-50 active:scale-[0.98] border border-slate-200 rounded-xl transition-all shadow-xs"
              >
                <ShieldCheck className="w-4 h-4 text-slate-600" />
                <span>Start a Cause</span>
              </Link>
            </div>

            {/* Accepted Channels Strip */}
            <div className="w-full max-w-xl bg-slate-50/80 rounded-xl p-3 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-600" />
                  Accepted Payment Methods
                </span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded">
                  0% Deductions
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700">
                  <img src="/payments/visa.svg" alt="Visa" className="h-3.5 object-contain" />
                  <span className="text-[11px]">Visa</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700">
                  <img src="/payments/mastercard.svg" alt="MasterCard" className="h-3.5 object-contain" />
                  <span className="text-[11px]">Mastercard</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700">
                  <img src="/payments/paypal.svg" alt="PayPal" className="h-3.5 object-contain" />
                  <span className="text-[11px]">PayPal</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700">
                  <img src="/payments/applepay.svg" alt="Apple Pay" className="h-3.5 object-contain" />
                  <span className="text-[11px]">Apple Pay</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200/80 text-xs font-bold text-emerald-900">
                  <img src="/crypto/btc.svg" alt="Crypto" className="h-3 w-3 object-contain" />
                  <span className="text-[11px]">Crypto</span>
                </div>
              </div>
            </div>

          </motion.div>

          {/* Right Column: Donor Wall Card */}
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 w-full max-w-lg mx-auto lg:ml-auto lg:mr-0"
          >
            <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-sm">
              <DonorWall limit={5} minimal />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
