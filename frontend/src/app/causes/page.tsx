'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { Heart, Hexagon, Search, TrendingUp, ShieldCheck, Copy, Check, SlidersHorizontal, X, Layers, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useDonate } from '@/context/DonateContext';

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

export default function CausesPage() {
  const { openDonateModal } = useDonate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest'>('newest');

  useEffect(() => {
    api.posts.list()
      .then(setPosts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', 'Education', 'Healthcare', 'Clean Water', 'Disaster Relief', 'Environment', 'Empowerment'];

  const filtered = useMemo(() => {
    let result = posts.filter((p) => {
      const q = search.toLowerCase();
      const matchesSearch = p.title.toLowerCase().includes(q) || 
                            p.description.toLowerCase().includes(q) || 
                            p.category.toLowerCase().includes(q);
      const matchesCategory = activeCategory === 'All' || 
                              p.category.toLowerCase() === activeCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    });

    if (sortBy === 'highest') {
      result.sort((a, b) => b.goal - a.goal);
    } else if (sortBy === 'lowest') {
      result.sort((a, b) => a.goal - b.goal);
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [posts, search, activeCategory, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 pt-28 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-slate-200">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Verified Impact & Real-Time Tracking</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                Verified Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">Causes</span>
              </h1>
              <p className="text-base text-slate-600 font-normal leading-relaxed">
                Donate directly to humanitarian and community initiatives worldwide using Credit Card, PayPal, or Crypto. Every dollar is tracked transparently with verified milestone proof.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/causes/new"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-emerald-600/20 hover:-translate-y-0.5"
              >
                <Heart className="w-4 h-4" />
                <span>Submit a Cause</span>
              </Link>
            </div>
          </div>

          {/* Search, Filter & Category Bar */}
          <div className="space-y-4 mb-10">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              {/* Search Bar */}
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search causes by title, keyword, or category..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-xs"
                />
                {search && (
                  <button 
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="px-3.5 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-500 shadow-xs cursor-pointer"
                >
                  <option value="newest">Latest Added</option>
                  <option value="highest">Highest Target</option>
                  <option value="lowest">Lowest Target</option>
                </select>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              {categories.map((cat) => {
                const isActive = activeCategory.toLowerCase() === cat.toLowerCase();
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-300 hover:text-emerald-700'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Causes Content */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs animate-pulse">
                  <div className="h-56 bg-slate-200" />
                  <div className="p-6 space-y-4">
                    <div className="w-24 h-4 bg-slate-200 rounded" />
                    <div className="w-3/4 h-6 bg-slate-200 rounded" />
                    <div className="w-full h-12 bg-slate-100 rounded" />
                    <div className="w-full h-8 bg-slate-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs space-y-4 my-8">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto">
                <Hexagon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">No matching causes found</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                We couldn&apos;t find causes matching your current filters. Try changing search keywords or category filters.
              </p>
              <button
                onClick={() => { setSearch(''); setActiveCategory('All'); }}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((cause, idx) => {
                const img = cause.image && (cause.image.startsWith('http') || cause.image.startsWith('/')) ? cause.image : fallbackImages[idx % fallbackImages.length];
                const raisedUsd = cause.raised !== undefined ? cause.raised : (cause.goal * 0.45);
                const pct = Math.min(Math.round((raisedUsd / cause.goal) * 100), 100);
                const urgencyBadge = urgencyStyles[cause.urgency] || "bg-slate-100 text-slate-700 border-slate-200";

                return (
                  <motion.div
                    key={cause.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: idx * 0.04 }}
                    className="group bg-white rounded-3xl overflow-hidden border border-slate-200/90 hover:border-emerald-300 flex flex-col shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    {/* Cause Image */}
                    <Link href={`/causes/${cause.id}`} className="relative h-60 w-full bg-slate-100 block overflow-hidden">
                      <Image
                        src={img}
                        alt={cause.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                      
                      <div className="absolute top-3.5 left-3.5">
                        <span className="px-3 py-1 bg-white/95 backdrop-blur-md rounded-full text-xs font-bold text-slate-800 shadow-sm border border-slate-200/60">
                          {cause.category}
                        </span>
                      </div>

                      <div className="absolute top-3.5 right-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border backdrop-blur-md shadow-xs ${urgencyBadge}`}>
                          {cause.urgency}
                        </span>
                      </div>
                    </Link>

                    {/* Card Body */}
                    <div className="p-6 flex flex-col flex-1 justify-between space-y-5">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Verified Cause #{cause.id}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            100% Direct Aid
                          </span>
                        </div>

                        <Link href={`/causes/${cause.id}`} className="block group-hover:text-emerald-700 transition-colors">
                          <h3 className="text-lg font-bold text-slate-900 leading-snug line-clamp-2">
                            {cause.title}
                          </h3>
                        </Link>

                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mt-2">
                          {cause.description}
                        </p>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2 pt-2">
                        <div className="flex justify-between items-baseline text-xs font-mono">
                          <span className="font-extrabold text-emerald-700 text-sm">
                            ${raisedUsd.toLocaleString()}
                          </span>
                          <span className="text-slate-400 font-medium font-sans">
                            Goal: ${cause.goal.toLocaleString()}
                          </span>
                        </div>

                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                          <div 
                            style={{ width: `${pct}%` }} 
                            className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full"
                          />
                        </div>

                        <div className="flex justify-between items-center text-[11px] font-bold text-slate-400">
                          <span className="text-emerald-700">{pct}% Funded</span>
                          <span>Instant Receipt</span>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                        <div className="flex items-center">
                          <div className="w-7 h-7 relative rounded-full overflow-hidden border border-slate-200 bg-slate-50 p-1 flex items-center justify-center shrink-0 shadow-2xs">
                            <Image src="/logo.png" alt="Adera Logo" width={20} height={20} className="object-contain" />
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openDonateModal(cause)}
                            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl transition-colors border border-emerald-200 flex items-center gap-1.5 shadow-2xs hover:scale-105 active:scale-95"
                          >
                            <Heart className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600/10" />
                            <span>Donate</span>
                          </button>
                          
                          <Link
                            href={`/causes/${cause.id}`}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                            title="View Details"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
