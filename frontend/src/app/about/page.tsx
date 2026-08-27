'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Target, Leaf, TrendingUp, ShieldCheck, Globe2, Heart, Users, CheckCircle2, ArrowRight } from 'lucide-react';

const values = [
  {
    icon: Target,
    title: "Radical Transparency",
    desc: "Every single donation is publicly verifiable with transparent ledger auditing and zero hidden balance sheets.",
    color: "bg-emerald-50 text-emerald-600 border-emerald-200"
  },
  {
    icon: Leaf,
    title: "Sustainable Community Impact",
    desc: "We fund long-term self-sustaining initiatives — clean water wells, solar clinics, and schools — rather than short-lived stopgaps.",
    color: "bg-teal-50 text-teal-600 border-teal-200"
  },
  {
    icon: ShieldCheck,
    title: "Zero Intermediary Deductions",
    desc: "100% of donated funds go straight to verified project vaults without administrative cuts or broker fees.",
    color: "bg-blue-50 text-blue-600 border-blue-200"
  },
  {
    icon: Users,
    title: "Grassroots Empowerment",
    desc: "We work hand-in-hand with trusted local coordinators on the ground who understand the immediate needs of their communities.",
    color: "bg-purple-50 text-purple-600 border-purple-200"
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-28 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Our Mission & Principles</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Rebuilding Trust in <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">Global Giving</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
              Adera Foundation was founded on a simple premise: donors deserve total transparency, and beneficiaries deserve 100% of the funds intended for them.
            </p>
          </div>

          {/* Hero Image & Mission Story */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-white p-2">
                <Image
                  src="/footer/about_hero.jpg"
                  alt="About Adera Foundation"
                  width={650}
                  height={650}
                  className="rounded-2xl object-cover w-full h-auto"
                  priority
                />
              </div>
            </div>

            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
                <Target className="w-4 h-4 text-emerald-600" />
                <span>The Story of Adera</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
                Eliminating Non-Profit Overhead with Direct Disbursements
              </h2>

              <div className="text-sm sm:text-base text-slate-600 leading-relaxed space-y-4 font-normal">
                <p>
                  For decades, international humanitarian giving has been plagued by opaque financial channels, exorbitant administrative overhead, and currency conversion losses.
                </p>
                <p>
                  Adera solves this by routing capital directly into verified milestone vaults via Credit Card, PayPal, and digital currencies. Funds are disbursed exclusively upon validated on-the-ground proof, ensuring complete accountability.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-2xl font-black text-slate-900 font-mono">$124.5M+</span>
                  <p className="text-xs text-slate-500 mt-0.5">Total Aid Raised (USD)</p>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-2xl font-black text-emerald-700 font-mono">18,500+</span>
                  <p className="text-xs text-slate-500 mt-0.5">Lives Impacted</p>
                </div>
              </div>
            </div>
          </div>

          {/* Core Values Grid */}
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Our Core Pillars
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                The governing principles behind everything we build.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((v, i) => {
                const Icon = v.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold border ${v.color} group-hover:scale-105 transition-transform`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {v.title}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {v.desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* CTA Banner */}
          <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 text-center sm:text-left">
              <h3 className="text-2xl sm:text-3xl font-black">Meet the Minds Behind the Mission</h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-lg">
                Explore our team of blockchain engineers, researchers, and global humanitarian directors.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/team"
                className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/20"
              >
                Meet Our Team →
              </Link>
              <Link
                href="/careers"
                className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors border border-slate-700"
              >
                Join Careers
              </Link>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
