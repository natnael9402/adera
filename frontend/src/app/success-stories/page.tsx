'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, ArrowUpRight, CheckCircle2, Heart, Globe2, Users, ShieldCheck, Layers, ArrowRight } from 'lucide-react';

const stories = [
  {
    title: "Clean Water Deep Wells in Rural Oromia",
    category: "Clean Water",
    impact: "12,000+ Villagers Supplied",
    raised: "$48,500 USDC",
    timeframe: "Completed in 4 weeks",
    image: "/causes/cause_water_1786200462466.jpg",
    quote: "For decades women and children walked 4 miles daily for muddy water. The solar-powered pump now supplies pure drinking water directly to our village square.",
    organizer: "Oromia Water Aid Alliance",
    txHash: "0x892a...f419"
  },
  {
    title: "High-Speed Digital Labs for Secondary Schools",
    category: "Education",
    impact: "1,450 Students Enrolled",
    raised: "0.85 BTC ($55,000 USD)",
    timeframe: "Completed in 6 weeks",
    image: "/causes/cause_school_1786200448807.jpg",
    quote: "Our students now have access to modern coding curricula and STEM research tools that were once completely out of reach.",
    organizer: "Addis Tech Initiative",
    txHash: "0x3e11...90ab"
  },
  {
    title: "Mobile Emergency Clinic & Vaccine Transport",
    category: "Healthcare",
    impact: "8,200 Pediatric Patients",
    raised: "14.2 ETH ($49,800 USD)",
    timeframe: "Completed in 3 weeks",
    image: "/causes/cause_clinic_1786200473696.jpg",
    quote: "The solar-refrigerated mobile unit enabled us to deliver vital immunizations to nomadic pastoralist families across three remote districts.",
    organizer: "Horn of Africa Health Corps",
    txHash: "0x77ab...c821"
  },
  {
    title: "Drought-Resilient Community Irrigation Systems",
    category: "Environment",
    impact: "420 Farming Families",
    raised: "$38,000 USDT",
    timeframe: "Completed in 5 weeks",
    image: "/causes/cause_farming_1786200495727.jpg",
    quote: "Drip irrigation gave us reliable year-round crop yields even during peak drought seasons, transforming local food security.",
    organizer: "Adera Sustainable Agriculture",
    txHash: "0x12bb...d45e"
  }
];

export default function SuccessStories() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-28 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Real Communities, Verified Results</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Verified <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">Success Stories</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
              Discover the transformative impact made possible through global crypto donors. Every campaign featured here has completed all on-chain milestone verifications.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
            <div className="text-center p-3">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">18,500+</span>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Lives Directly Impacted</p>
            </div>
            <div className="text-center p-3 border-l border-slate-100">
              <span className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono">100%</span>
              <p className="text-xs text-slate-500 font-medium mt-0.5">On-Chain Verified Proof</p>
            </div>
            <div className="text-center p-3 border-l border-slate-100">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">32</span>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Active Field Regions</p>
            </div>
            <div className="text-center p-3 border-l border-slate-100">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">0%</span>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Intermediary Platform Cut</p>
            </div>
          </div>

          {/* Stories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {stories.map((story, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-64 w-full bg-slate-100">
                    <Image
                      src={story.image}
                      alt={story.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3.5 left-3.5">
                      <span className="px-3 py-1 bg-white/95 backdrop-blur-md rounded-full text-xs font-bold text-slate-800 shadow-sm border border-slate-200/60">
                        {story.category}
                      </span>
                    </div>
                    <div className="absolute top-3.5 right-3.5">
                      <span className="px-3 py-1 bg-emerald-600 text-white rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                      </span>
                    </div>
                  </div>

                  <div className="p-6 sm:p-8 space-y-4">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="w-4 h-4 fill-current" />
                      ))}
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {story.title}
                    </h3>

                    <blockquote className="text-xs sm:text-sm text-slate-600 italic leading-relaxed border-l-2 border-emerald-500 pl-3">
                      &ldquo;{story.quote}&rdquo;
                    </blockquote>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Direct Impact</span>
                        <span className="text-xs font-bold text-slate-800">{story.impact}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Capital Deployed</span>
                        <span className="text-xs font-bold text-emerald-700 font-mono">{story.raised}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Partner: <strong className="text-slate-800 font-semibold">{story.organizer}</strong></span>
                  <span className="font-mono font-bold text-emerald-700">{story.timeframe}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA Banner */}
          <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 text-center sm:text-left">
              <h3 className="text-2xl sm:text-3xl font-black">Want to Create the Next Success Story?</h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-lg">
                Choose a cause close to your heart or start a verified fundraiser for your local community today.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/causes"
                className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-md"
              >
                Donate to Active Causes
              </Link>
              <Link
                href="/causes/new"
                className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors border border-slate-700"
              >
                Submit Campaign
              </Link>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
