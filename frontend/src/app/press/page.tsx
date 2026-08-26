'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Newspaper, Mail, DownloadCloud, FileText, ExternalLink, Calendar, ArrowRight, ShieldCheck } from 'lucide-react';

const pressReleases = [
  {
    date: "August 12, 2026",
    title: "Adera Foundation Surpasses $120M in Cryptographically Audited Humanitarian Giving",
    outlet: "Global Web3 Philanthropy Wire",
    summary: "Decentralized non-profit protocol completes milestone-gated water and medical infrastructure across 32 regional partners with zero intermediary cuts."
  },
  {
    date: "June 28, 2026",
    title: "Partnership Announcement: Scaling Clean Water Wells Across Eastern Africa with Multi-Sig Smart Escrow",
    outlet: "Decentralized Impact Gazette",
    summary: "New coalition with regional civil society organizations connects 50,000+ donors directly to verified field engineering contractors."
  },
  {
    date: "March 15, 2026",
    title: "Adera Releases Open-Source Smart Contract Audit Framework for Charitable DAOs",
    outlet: "Blockchain Security Review",
    summary: "The open protocol introduces automated validator consensus mechanisms that release grant tranches only upon multi-source proof of work."
  }
];

export default function PressPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-28 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
              <Newspaper className="w-3.5 h-3.5 text-emerald-600" />
              <span>Press & Media Center</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Adera in the <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">News</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
              Explore official press releases, media kits, executive statements, and coverage of our mission to revolutionize philanthropic transparency.
            </p>
          </div>

          {/* Hero Press Banner */}
          <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-white p-2">
            <Image
              src="/footer/press_hero.jpg"
              alt="Adera Foundation Press & Media"
              width={1200}
              height={500}
              className="rounded-2xl object-cover w-full h-[300px] sm:h-[420px]"
              priority
            />
          </div>

          {/* Press Releases & Media Kit Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Press Releases List */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  Official Announcements
                </h2>
                <span className="text-xs text-slate-500 font-medium">Archive 2026</span>
              </div>

              <div className="space-y-4">
                {pressReleases.map((pr, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all space-y-3 group cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-semibold text-emerald-700">{pr.outlet}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {pr.date}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                      {pr.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                      {pr.summary}
                    </p>

                    <div className="pt-2 flex items-center gap-1 text-xs font-bold text-emerald-700 group-hover:underline">
                      <span>Read Full Press Statement</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right: Media Kit & Inquiries */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Brand Kit Card */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold">
                  <DownloadCloud className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">Official Brand Assets</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Download high-resolution SVG and PNG logos, brand guidelines, typography palettes, and executive photos.
                  </p>
                </div>

                <ul className="space-y-2 text-xs font-medium text-slate-600 pt-1">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Vector Logos (SVG, PNG, EPS)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Adera Design System & Color Tokens
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    2026 Fact Sheet & Impact Summary
                  </li>
                </ul>

                <Link
                  href="/logo.png"
                  download
                  className="w-full py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl transition-colors border border-emerald-200 flex items-center justify-center gap-2"
                >
                  <DownloadCloud className="w-4 h-4" />
                  <span>Download Media Kit (ZIP)</span>
                </Link>
              </div>

              {/* Direct Media Contact */}
              <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-5">
                <div className="w-12 h-12 rounded-2xl bg-white/10 text-white border border-white/10 flex items-center justify-center font-bold">
                  <Mail className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">Press & Interview Inquiries</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Our communications team arranges executive commentary, panel appearances, and interview access for journalists.
                  </p>
                </div>

                <Link
                  href="/contact"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <span>Contact Press Relations</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
