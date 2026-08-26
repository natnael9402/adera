'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { CheckCircle2, HeartHandshake, ShieldCheck, Zap, Wallet, Layers, Search, ArrowRight, Lock, HelpCircle } from 'lucide-react';

const steps = [
  {
    step: "01",
    title: "Discover Verified Causes",
    description: "Browse curated, on-chain verified campaigns across healthcare, education, clean water, and disaster relief. Review milestone targets and local community partners.",
    icon: Search,
    color: "bg-emerald-50 text-emerald-600 border-emerald-200"
  },
  {
    step: "02",
    title: "Direct Non-Custodial Transfer",
    description: "Send BTC, ETH, SOL, or stablecoins (USDC/USDT) directly to the cause's multi-sig smart contract address with instant transaction confirmation.",
    icon: Wallet,
    color: "bg-blue-50 text-blue-600 border-blue-200"
  },
  {
    step: "03",
    title: "Milestone-Gated Smart Escrow",
    description: "Funds are released in tranche allocations only when validators verify that field objectives (such as supply delivery or construction milestones) are achieved.",
    icon: Lock,
    color: "bg-purple-50 text-purple-600 border-purple-200"
  },
  {
    step: "04",
    title: "Immutable Proof of Impact",
    description: "Receive cryptographic transaction hashes, real-time photographic impact reports, and permanent recognition on the public donor leaderboard.",
    icon: ShieldCheck,
    color: "bg-amber-50 text-amber-600 border-amber-200"
  }
];

const faqs = [
  {
    q: "Are donations tax-deductible?",
    a: "Depending on your jurisdiction, crypto donations to verified 501(c)(3) equivalent NGO partners generate verifiable cryptographic receipts suitable for capital gains tax deductions."
  },
  {
    q: "What cryptocurrencies are accepted?",
    a: "Adera supports Bitcoin (BTC), Ethereum (ETH), Solana (SOL), Polygon (POL), and USD Stablecoins (USDC and USDT)."
  },
  {
    q: "Does Adera take a cut from donations?",
    a: "No. Adera charges 0% platform intermediary fees on standard donations. 100% of donated capital directly reaches the cause smart contracts."
  }
];

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-28 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              <span>Frictionless Web3 Protocol</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              How Adera <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">Works</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
              We leverage smart contracts to eliminate intermediaries, reduce administrative waste to zero, and bring absolute transparency to global philanthropy.
            </p>
          </div>

          {/* Hero Diagram & Steps */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left: Illustration */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-white p-2">
                <Image
                  src="/footer/how_it_works.jpg"
                  alt="How Adera protocol works"
                  width={600}
                  height={600}
                  className="rounded-2xl object-cover w-full h-auto"
                />
              </div>
            </div>

            {/* Right: 4-Step Process */}
            <div className="lg:col-span-7 space-y-4">
              {steps.map((s, idx) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-4 p-5 sm:p-6 bg-white rounded-3xl border border-slate-200 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all group"
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 border ${s.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-emerald-600">STEP {s.step}</span>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {s.title}
                        </h3>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                        {s.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

          </div>

          {/* Comparison Table: Traditional vs Adera */}
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Why Blockchain Philanthropy Wins
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                A comparison between traditional legacy charities and Adera’s smart contract protocol.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-4 px-4">Feature</th>
                    <th className="py-4 px-4 text-slate-500">Traditional Non-Profits</th>
                    <th className="py-4 px-4 text-emerald-700 bg-emerald-50/50 rounded-t-xl font-black">Adera Foundation Protocol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  <tr>
                    <td className="py-4 px-4 font-bold text-slate-900">Platform Fees</td>
                    <td className="py-4 px-4 text-slate-500">15% - 30% Overhead</td>
                    <td className="py-4 px-4 text-emerald-700 bg-emerald-50/50 font-bold">0% Intermediary Fee</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-bold text-slate-900">Settlement Speed</td>
                    <td className="py-4 px-4 text-slate-500">Days to Weeks</td>
                    <td className="py-4 px-4 text-emerald-700 bg-emerald-50/50 font-bold">Instant (Seconds)</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-bold text-slate-900">Fund Tracing</td>
                    <td className="py-4 px-4 text-slate-500">Opaque Annual PDFs</td>
                    <td className="py-4 px-4 text-emerald-700 bg-emerald-50/50 font-bold">100% Real-Time On-Chain</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-bold text-slate-900">Milestone Escrow</td>
                    <td className="py-4 px-4 text-slate-500">Rare / Discretionary</td>
                    <td className="py-4 px-4 text-emerald-700 bg-emerald-50/50 rounded-b-xl font-bold">Automated Smart Contracts</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQs Accordion */}
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <HelpCircle className="w-6 h-6 text-emerald-600" />
              <h2 className="text-xl font-bold text-slate-900">Frequently Asked Questions</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {faqs.map((f, i) => (
                <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <h4 className="text-sm font-bold text-slate-900">{f.q}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Banner */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <h3 className="text-2xl sm:text-3xl font-black">Ready to Make an Impact?</h3>
              <p className="text-sm text-emerald-100 max-w-lg">
                Explore verified causes and donate crypto in seconds with full on-chain receipts.
              </p>
            </div>
            <Link
              href="/causes"
              className="px-8 py-4 bg-white text-emerald-900 font-extrabold text-sm rounded-xl hover:bg-emerald-50 transition-all shadow-md shrink-0"
            >
              Explore All Causes →
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
