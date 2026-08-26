'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldCheck, UserCheck, AlertTriangle, Scale, Lock, Cpu, CheckCircle2, ArrowRight, FileCheck2 } from 'lucide-react';

const pillars = [
  { 
    icon: UserCheck, 
    title: "Verified Organizers & Field Partners", 
    desc: "Every campaign coordinator undergoes thorough institutional KYC, identity validation, and background audits before their cause is listed.",
    color: "bg-emerald-50 text-emerald-600 border-emerald-200"
  },
  { 
    icon: Lock, 
    title: "Multi-Signature Smart Vaults", 
    desc: "Donated crypto is held in decentralized multi-sig contracts. No single individual has unilateral access to campaign treasuries.",
    color: "bg-blue-50 text-blue-600 border-blue-200"
  },
  { 
    icon: Cpu, 
    title: "24/7 AI-Driven Fraud Monitoring", 
    desc: "Automated heuristic systems monitor blockchain addresses, transaction spikes, and field progress reports to flag anomalies in real-time.",
    color: "bg-purple-50 text-purple-600 border-purple-200"
  },
  { 
    icon: Scale, 
    title: "Regulatory Compliance & Auditability", 
    desc: "Strict adherence to international charitable contribution standards, AML compliance, and third-party smart contract audits.",
    color: "bg-amber-50 text-amber-600 border-amber-200"
  }
];

export default function TrustAndSafety() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-28 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Institutional Grade Security</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Trust & <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">Safety</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
              We uphold the highest security standards in Web3 philanthropy. Your contributions are safeguarded with multi-sig escrow, automated fraud detection, and verifiable smart contracts.
            </p>
          </div>

          {/* 4 Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {pillars.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all flex flex-col sm:flex-row items-start gap-6 group"
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold shrink-0 border ${pillar.color} group-hover:scale-105 transition-transform`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {pillar.title}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      {pillar.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Security Standards & Guarantees */}
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-900">
                Adera Foundation Security Guarantees
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Protecting both donors and beneficiaries across all supported networks.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Non-Custodial Design</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Adera Foundation never holds private keys to recipient wallets. Funds flow directly through auditable multi-sig smart contracts.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Independent Audits</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Smart contracts undergo rigorous peer reviews and static code analysis from top blockchain security audit firms.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Milestone Verification</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Field funds are released in tranches only upon submission of verified on-the-ground proof and validator consensus.
                </p>
              </div>
            </div>
          </div>

          {/* Security Contact Banner */}
          <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 text-center sm:text-left">
              <h3 className="text-xl sm:text-2xl font-bold">Have a Security Question or Bug Bounty Report?</h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-lg">
                Our dedicated security team responds to inquiries and vulnerability disclosures within 24 hours.
              </p>
            </div>
            <Link
              href="/contact"
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/20 shrink-0"
            >
              Contact Security Team →
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
