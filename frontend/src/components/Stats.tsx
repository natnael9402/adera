"use client";

import Image from "next/image";
import { ShieldCheck, Users, Globe2, Layers, DollarSign, Heart } from "lucide-react";

const stats = [
  {
    icon: DollarSign,
    display: "$124.5M+",
    usdValue: "100% Direct",
    label: "Total Aid Delivered",
    detail: "Direct humanitarian impact",
  },
  {
    icon: Users,
    display: "52,400+",
    usdValue: "142 Countries",
    label: "Global Donors",
    detail: "Active contributors",
  },
  {
    icon: ShieldCheck,
    display: "18,500+",
    usdValue: "100% Verified",
    label: "Lives Impacted",
    detail: "Milestone-verified proofs",
  },
  {
    icon: Globe2,
    display: "32",
    usdValue: "6 Continents",
    label: "Countries Served",
    detail: "Global partner network",
  },
];

const acceptedPaymentChannels = [
  { name: "Visa", label: "Credit Card", logo: "/payments/visa.svg" },
  { name: "Mastercard", label: "Debit Card", logo: "/payments/mastercard.svg" },
  { name: "PayPal", label: "PayPal", logo: "/payments/paypal.svg" },
  { name: "Apple Pay", label: "Apple Pay", logo: "/payments/applepay.svg" },
  { name: "USDC", label: "Digital USD", logo: "/crypto/usdc.svg" },
  { name: "Crypto", label: "Multi-Chain", logo: "/crypto/btc.svg" },
];

export default function Stats() {
  return (
    <section className="bg-slate-50 border-t border-b border-slate-200 py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Stats Card with Primary Green Accent */}
        <div className="bg-white rounded-2xl border border-slate-200 border-t-4 border-t-emerald-600 shadow-sm overflow-hidden">
          
          {/* Top 4 Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            {stats.map((stat) => (
              <div 
                key={stat.label} 
                className="p-6 sm:p-8 lg:p-10 flex flex-col justify-between hover:bg-emerald-50/20 transition-colors group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <stat.icon className="w-5 h-5 text-emerald-600" />
                    </div>

                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold font-mono bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {stat.usdValue}
                    </span>
                  </div>

                  <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors tracking-tight font-sans">
                    {stat.display}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    {stat.label}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {stat.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Supported Payment Channels Bar */}
          <div className="bg-slate-900 text-white px-6 py-6 sm:px-8 border-t border-slate-800">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6">
              
              <div className="flex items-center gap-3 shrink-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <Layers className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    Accepted Payment Channels & Methods
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      0% Platform Fees
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Credit Card, PayPal, Apple Pay, and digital currency disbursements with zero deductions
                  </p>
                </div>
              </div>

              {/* Badges with Payment Logos */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full lg:w-auto">
                {acceptedPaymentChannels.map((channel) => (
                  <div
                    key={channel.name}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-emerald-950/60 border border-white/10 hover:border-emerald-500/50 rounded-xl transition-all"
                  >
                    <Image
                      src={channel.logo}
                      alt={channel.name}
                      width={20}
                      height={20}
                      className="w-5 h-5 object-contain"
                      style={{ width: "auto", height: "auto" }}
                    />
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs font-bold text-white tracking-wide">
                        {channel.name}
                      </span>
                      <span className="text-[11px] text-emerald-400 font-mono hidden sm:inline">
                        {channel.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
