"use client";

import { useEffect, useState } from "react";
import { Heart, TrendingUp, ChevronRight, ArrowRight, ShieldCheck } from 'lucide-react';
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";
import { useDonate } from "@/context/DonateContext";

interface Post {
  id: number;
  title: string;
  description: string;
  image?: string;
  goal: number;
  raised?: number;
  donationsCount?: number;
  category: string;
  urgency: string;
  beneficiary?: string;
  location?: string;
  author?: { name: string };
  createdAt: string;
}

const fallbackImages = [
  "/causes/cause_water_1786200462466.jpg",
  "/causes/cause_school_1786200448807.jpg",
  "/causes/cause_clinic_1786200473696.jpg",
  "/causes/cause_farming_1786200495727.jpg",
  "/causes/cause_orphanage_1786200527864.jpg",
  "/causes/cause_women_1786200616826.jpg",
];

const urgencyStyles: Record<string, string> = {
  Urgent: "bg-rose-50 text-rose-700 border-rose-200",
  Critical: "bg-rose-100 text-rose-800 border-rose-300 font-extrabold",
  Featured: "bg-amber-50 text-amber-800 border-amber-200",
  "Almost There": "bg-emerald-50 text-emerald-800 border-emerald-200",
  New: "bg-blue-50 text-blue-800 border-blue-200",
};

export default function FeaturedCauses() {
  const { openDonateModal } = useDonate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.posts.list().then(setPosts).catch(console.error).finally(() => setLoading(false));
  }, []);

  const displayPosts = posts.slice(0, 6);

  return (
    <section className="py-20 relative overflow-hidden bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Causes</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Featured Causes
            </h2>
            <p className="text-slate-500 mt-2 text-sm sm:text-base max-w-xl font-normal">
              Urgent and verified community projects you can support today.
            </p>
          </div>
          <Link 
            href="/causes" 
            className="inline-flex items-center gap-1 text-slate-900 hover:text-emerald-700 font-bold text-sm mt-4 md:mt-0 transition-colors group"
          >
            <span>View All Causes</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse h-96">
                <div className="w-full h-48 bg-slate-100 rounded-xl mb-4" />
                <div className="h-6 bg-slate-100 rounded w-3/4 mb-2" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : displayPosts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500 text-sm">No active causes currently listed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayPosts.map((cause, index) => {
              const raised = cause.raised !== undefined ? cause.raised : (cause.goal || 10000) * 0.35;
              const pct = Math.min(Math.round((raised / (cause.goal || 10000)) * 100), 100);
              const img = cause.image || fallbackImages[index % fallbackImages.length];
              const urgencyStyle = urgencyStyles[cause.urgency] || "bg-slate-100 text-slate-700 border-slate-200";

              return (
                <div 
                  key={cause.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col group"
                >
                  <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                    <Image 
                      src={img} 
                      alt={cause.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-102"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-white/95 text-slate-900 border border-slate-200/80 shadow-2xs">
                        {cause.category}
                      </span>
                      {cause.urgency && (
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${urgencyStyle}`}>
                          {cause.urgency}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                        {cause.title}
                      </h3>
                      <p className="text-slate-500 text-xs sm:text-sm mt-1 line-clamp-2 leading-relaxed">
                        {cause.description}
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-900 font-mono">${Math.round(raised).toLocaleString()} <span className="text-slate-500 font-normal">({pct}%)</span></span>
                        <span className="text-slate-500 font-mono font-normal">of ${(cause.goal || 0).toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                        <div className="h-full rounded-full bg-emerald-600 transition-all duration-300" style={{ width: `${pct}%` }} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                      <button 
                        type="button"
                        onClick={() => openDonateModal(cause)}
                        className="flex-1 py-2.5 px-4 bg-slate-950 hover:bg-slate-800 active:scale-[0.98] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Heart className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Donate</span>
                      </button>

                      <Link 
                        href={`/causes/${cause.id}`}
                        className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl transition-colors shrink-0 border border-slate-200/80"
                        title="View Full Story"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
