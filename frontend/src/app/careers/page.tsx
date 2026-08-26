'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Rocket, Coffee, Globe, Heart, Briefcase, MapPin, Clock, ArrowRight, CheckCircle2, DollarSign, ShieldCheck } from 'lucide-react';

const perks = [
  {
    icon: Globe,
    title: "100% Remote & Autonomous",
    desc: "Work from anywhere in the world. We evaluate output and real impact, not hours spent in a cubicle.",
    color: "bg-emerald-50 text-emerald-600 border-emerald-200"
  },
  {
    icon: DollarSign,
    title: "Competitive USD / Crypto Comp",
    desc: "Receive payment in USD, BTC, ETH, or USDC with performance incentives and comprehensive benefits.",
    color: "bg-blue-50 text-blue-600 border-blue-200"
  },
  {
    icon: Rocket,
    title: "Continuous Learning & Conferences",
    desc: "$3,000 annual budget for Web3 research, engineering certifications, and international conferences.",
    color: "bg-purple-50 text-purple-600 border-purple-200"
  },
  {
    icon: Coffee,
    title: "Health, Wellness & Unlimited PTO",
    desc: "Premium international health coverage, mental health stipends, and flexible time-off policies.",
    color: "bg-amber-50 text-amber-600 border-amber-200"
  }
];

const openRoles = [
  {
    title: "Senior Smart Contract Engineer",
    team: "Protocol & Core Dev",
    location: "Remote (Global)",
    type: "Full-time",
    experience: "4+ years Solidity / Rust",
    desc: "Architect multi-sig vault escrow mechanisms, optimize gas fees across Layer 2s, and conduct protocol security audits."
  },
  {
    title: "Full-Stack Web3 Developer (Next.js / NestJS)",
    team: "Product & Engineering",
    location: "Remote (Global)",
    type: "Full-time",
    experience: "3+ years React / Node",
    desc: "Build intuitive donor interfaces, real-time transaction streams, and wallet connectivity tools."
  },
  {
    title: "Humanitarian Partnerships Director",
    team: "Operations & Alliances",
    location: "Remote / Hybrid (East Africa / Global)",
    type: "Full-time",
    experience: "5+ years NGO Leadership",
    desc: "Manage relationships with on-the-ground NGOs, audit field milestone reports, and onboard new humanitarian causes."
  },
  {
    title: "Community & Growth Strategist",
    team: "Marketing & Ecosystem",
    location: "Remote (Global)",
    type: "Full-time",
    experience: "2+ years Web3 Ecosystem",
    desc: "Lead global donor campaigns, steward Discord/Telegram community governance, and organize philanthropic hackathons."
  }
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-28 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
              <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
              <span>Join Adera Foundation</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Build the Future of <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                Transparent Philanthropy
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
              We are on a mission to modernize global humanitarian giving with decentralized trust. Join an ambitious remote-first team making measurable differences every single day.
            </p>
          </div>

          {/* Hero Image & Culture Narrative */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
                <Heart className="w-4 h-4 text-emerald-600" />
                <span>Our Culture & Philosophy</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
                Work on Technology that Directly Changes Human Lives
              </h2>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                At Adera, your code and strategic contributions directly fund clean water wells, emergency medical supplies, and education for thousands of underprivileged individuals worldwide.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  "100% remote-first culture with asynchronous collaboration",
                  "High ownership, zero micromanagement, and radical candor",
                  "Direct interaction with field directors and beneficiary communities"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-white p-2">
                <Image
                  src="/footer/careers_hero.jpg"
                  alt="Adera Foundation Careers"
                  width={650}
                  height={650}
                  className="rounded-2xl object-cover w-full h-auto"
                />
              </div>
            </div>
          </div>

          {/* Perks & Benefits Grid */}
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Perks & Benefits
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                We believe in supporting team members holistically so they can do their best work.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {perks.map((perk, i) => {
                const Icon = perk.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold border ${perk.color} group-hover:scale-105 transition-transform`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {perk.title}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {perk.desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Open Roles Listing */}
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Current Open Opportunities</h2>
                <p className="text-xs text-slate-500 mt-0.5">Showing 4 active openings across engineering and operations.</p>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 self-start sm:self-auto">
                4 Open Roles
              </span>
            </div>

            <div className="space-y-4">
              {openRoles.map((role, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-slate-50 hover:bg-emerald-50/40 border border-slate-200 hover:border-emerald-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {role.title}
                      </h3>
                      <span className="px-2.5 py-0.5 bg-white border border-slate-200 text-slate-700 text-[10px] font-bold rounded-md">
                        {role.team}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                      {role.desc}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {role.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {role.type}
                      </span>
                      <span>Requirements: {role.experience}</span>
                    </div>
                  </div>

                  <Link
                    href="/contact"
                    className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs shrink-0 flex items-center justify-center gap-2"
                  >
                    <span>Apply for Role</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
