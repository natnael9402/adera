"use client";

import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Globe2, Clock, CheckCircle2, ArrowRight, Lock, Zap, Activity, Layers, Check } from 'lucide-react';

const features = [
  { 
    icon: ShieldCheck, 
    title: "Smart Contract Escrow", 
    description: "Donations are protected by multi-sig smart contracts and disbursed exclusively when milestone proofs are verified." 
  },
  { 
    icon: Globe2, 
    title: "Multi-Chain Native", 
    description: "Direct zero-slippage settlement across Bitcoin, Ethereum, Solana, Polygon, and major USD stablecoins." 
  },
  { 
    icon: Clock, 
    title: "Real-Time Proof of Impact", 
    description: "Every satoshi and wei is tracked on public block explorers from the moment it leaves your wallet." 
  },
  { 
    icon: Zap, 
    title: "Zero Intermediary Deductions", 
    description: "Decentralized architecture eliminates bureaucratic fees, ensuring up to 98% of donor capital directly reaches beneficiaries." 
  },
];

const impactStats = [
  { label: "Total Donated", val: "₿ 1,842+", sub: "$124M+ USD", logo: "/crypto/btc.svg" },
  { label: "Audit Rating", val: "100%", sub: "Formally Verified", icon: ShieldCheck },
  { label: "Active Donors", val: "52,400+", sub: "142 Countries", logo: "/crypto/sol.svg" },
  { label: "Settlement Speed", val: "< 3.2s", sub: "Instant Settlement", icon: Activity },
];

export default function WhyAdera() {
  return (
    <section id="about" className="py-24 sm:py-28 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Visual Protocol Card with Green Accents */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="bg-white rounded-3xl border border-slate-200 border-t-4 border-t-primary-500 shadow-sm p-6 sm:p-8 space-y-6">
              
              {/* Protocol Header */}
              <div className="flex items-center justify-between pb-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center shadow-md shadow-primary-600/20">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Adera Protocol Standard
                    </h3>
                    <p className="text-xs text-primary-700 font-mono font-medium">
                      v2.4.0 • Mainnet Active
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 text-primary-700 border border-primary-200 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                  Live Audited
                </span>
              </div>

              {/* 2x2 Impact Stats Grid */}
              <div className="grid grid-cols-2 gap-3.5">
                {impactStats.map((item) => (
                  <div 
                    key={item.label}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary-300 hover:bg-primary-50/20 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-primary-700 transition-colors">
                        {item.label}
                      </span>
                      {item.logo ? (
                        <Image 
                          src={item.logo} 
                          alt={item.label} 
                          width={18} 
                          height={18} 
                          className="w-4.5 h-4.5 object-contain"
                          style={{ width: "auto", height: "auto" }}
                        />
                      ) : item.icon ? (
                        <item.icon className="w-4 h-4 text-primary-600" />
                      ) : null}
                    </div>
                    <p className="text-xl font-black text-slate-900 group-hover:text-primary-700 font-sans tracking-tight transition-colors">
                      {item.val}
                    </p>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      {item.sub}
                    </p>
                  </div>
                ))}
              </div>

              {/* Supported Assets Dark Strip */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                    Supported Settlement Assets
                  </span>
                  <span className="text-primary-400 font-mono text-[11px] font-bold bg-primary-950/60 border border-primary-500/30 px-2 py-0.5 rounded">
                    0% Intermediary Fee
                  </span>
                </div>
                
                <div className="flex items-center gap-2 pt-1">
                  {[
                    { name: "BTC", logo: "/crypto/btc.svg" },
                    { name: "ETH", logo: "/crypto/eth.svg" },
                    { name: "SOL", logo: "/crypto/sol.svg" },
                    { name: "USDC", logo: "/crypto/usdc.svg" },
                    { name: "USDT", logo: "/crypto/usdt.svg" },
                    { name: "POL", logo: "/crypto/matic.svg" },
                  ].map((coin) => (
                    <div 
                      key={coin.name}
                      className="flex-1 flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 border border-white/10 hover:border-primary-500/50 hover:bg-primary-950/40 transition-all"
                      title={coin.name}
                    >
                      <Image 
                        src={coin.logo} 
                        alt={coin.name} 
                        width={20} 
                        height={20} 
                        className="w-5 h-5 object-contain mb-1"
                        style={{ width: "auto", height: "auto" }}
                      />
                      <span className="text-[10px] font-bold text-slate-300 font-mono">
                        {coin.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trust Footer */}
              <div className="flex items-center gap-2 text-xs text-slate-600 pt-1">
                <CheckCircle2 className="w-4 h-4 text-primary-600 shrink-0" />
                <span>100% transparent impact records • Verified milestones & field audits</span>
              </div>

            </div>
          </div>

          {/* Right Column: Copy & Green Feature Cards */}
          <div className="lg:col-span-7 space-y-8 order-1 lg:order-2">
            
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary-50 text-primary-700 text-xs font-bold uppercase tracking-wider border border-primary-200">
                <ShieldCheck className="w-3.5 h-3.5 text-primary-600" />
                Next-Generation Philanthropy
              </span>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                The <span className="text-primary-600">Adera Difference</span>
              </h2>
              
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
                Traditional charities lose up to 30% of donations to administrative bloat, foreign exchange fees, and opaque reporting. Adera replaces friction with trustless cryptographic transparency.
              </p>
            </div>

            {/* 4 Feature Cards with Primary Green Icons */}
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
              {features.map((feature) => (
                <div 
                  key={feature.title} 
                  className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-primary-500 transition-all duration-200 hover:shadow-sm flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-11 h-11 rounded-xl bg-primary-50 border border-primary-200 flex items-center justify-center mb-3.5 text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                      <feature.icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-900 group-hover:text-primary-700 transition-colors mb-1.5 text-base">
                      {feature.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Section */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link 
                href="/causes" 
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-primary-600/20 hover-lift"
              >
                Explore Causes
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 px-2">
                <Check className="w-4 h-4 text-primary-600 shrink-0" />
                <span>Direct on-chain transparent giving</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
