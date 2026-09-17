'use client';

import React from 'react';
import Image from 'next/image';
import { Star, ShieldCheck } from 'lucide-react';

const CAUSES = [
  {
    title: "Clean Water Borehole",
    category: "Clean Water",
    image: "/causes/cause_water_1786200462466.jpg",
    pct: 82,
    raised: "$49,200"
  },
  {
    title: "Rural Primary School",
    category: "Education",
    image: "/causes/cause_school_1786200448807.jpg",
    pct: 76,
    raised: "$38,250"
  }
];

export default function AuthImpactSidebar() {
  return (
    <div className="bg-slate-950 text-white p-6 sm:p-8 lg:p-10 flex flex-col justify-between h-full border-t lg:border-t-0 lg:border-l border-slate-800 space-y-6">
      
      {/* 1. TOP: RATING & PROFIT FOR CHARITY MESSAGE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-white font-mono">4.9</span>
            <div className="flex items-center gap-0.5 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
          </div>
          <span className="text-[11px] font-bold text-slate-400">
            14,800+ Verified Reviews
          </span>
        </div>

        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
            100% of Profits Fund Verified Causes
          </h2>
          <p className="text-xs text-slate-400 font-normal">
            Every product purchase directly builds water wells, schools, and medical facilities.
          </p>
        </div>
      </div>

      {/* 2. CAUSES SHOWCASE: IMAGES BIGGER THAN TITLE - PURE UI, NO LINKS */}
      <div className="space-y-4 flex-1 flex flex-col justify-center">
        {CAUSES.map((cause) => (
          <div 
            key={cause.title}
            className="group rounded-2xl overflow-hidden bg-slate-900 border border-slate-800/80 p-2.5 space-y-2.5"
          >
            {/* BIG PROMINENT IMAGE - DOMINANT OVER TITLE */}
            <div className="relative h-36 sm:h-40 w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
              <Image
                src={cause.image}
                alt={cause.title}
                fill
                sizes="(max-width: 1024px) 100vw, 450px"
                className="object-cover"
              />
              
              <div className="absolute top-2.5 left-2.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-slate-950/90 backdrop-blur-md px-2 py-0.5 rounded border border-slate-800">
                  {cause.category}
                </span>
              </div>

              <div className="absolute bottom-2.5 right-2.5">
                <span className="text-[11px] font-mono font-bold text-white bg-slate-950/90 backdrop-blur-md px-2 py-0.5 rounded border border-slate-800">
                  {cause.pct}% Funded
                </span>
              </div>
            </div>

            {/* MINIMAL SUBORDINATE TITLE & PROGRESS BAR */}
            <div className="px-1 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200">
                  {cause.title}
                </span>
                <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                  {cause.raised} raised
                </span>
              </div>

              <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="h-full bg-emerald-500 rounded-full" 
                  style={{ width: `${cause.pct}%` }} 
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. BOTTOM: TRUST PILL */}
      <div className="pt-2 border-t border-slate-800/70 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Direct On-Chain Allocation</span>
        </div>
        <span className="font-mono text-[10px] text-slate-500 uppercase">
          0% Admin Skim
        </span>
      </div>

    </div>
  );
}
