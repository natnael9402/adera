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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Direct Transparent Philanthropy</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Featured Causes
            </h2>
            <p className="text-slate-500 mt-2 text-sm sm:text-base max-w-xl">
              Transparent, verified initiatives you can fund directly with Credit Card, PayPal, or Crypto.
            </p>
          </div>
          <Link 
            href="/causes" 
            className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-extrabold text-sm mt-4 md:mt-0 transition-colors group"
          >
            <span>View All Causes</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-3xl p-6 border border-slate-200 animate-pulse h-96">
                <div className="w-full h-48 bg-slate-100 rounded-2xl mb-4" />
                <div className="h-6 bg-slate-100 rounded w-3/4 mb-2" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : displayPosts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
            <p className="text-slate-500">No active causes currently listed.</p>
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
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group hover:-translate-y-1"
                >
                  <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                    <Image 
                      src={img} 
                      alt={cause.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute top-3.5 left-3.5 flex gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-white/90 text-slate-900 backdrop-blur-md shadow-xs border border-white/40">
                        {cause.category}
                      </span>
                      {cause.urgency && (
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border backdrop-blur-md ${urgencyStyle}`}>
                          {cause.urgency}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                        {cause.title}
                      </h3>
                      <p className="text-slate-500 text-xs sm:text-sm mt-1.5 line-clamp-2 leading-relaxed">
                        {cause.description}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-emerald-700 font-mono">${Math.round(raised).toLocaleString()} raised ({pct}%)</span>
                        <span className="text-slate-400 font-medium">of ${(cause.goal || 0).toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                        <div className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                      <button 
                        type="button"
                        onClick={() => openDonateModal(cause)}
                        className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-extrabold rounded-xl transition-all shadow-sm shadow-emerald-600/20 flex items-center justify-center gap-1.5"
                      >
                        <Heart className="w-3.5 h-3.5 fill-white/20" />
                        <span>Donate Now</span>
                      </button>

                      <Link 
                        href={`/causes/${cause.id}`}
                        className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors shrink-0"
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
