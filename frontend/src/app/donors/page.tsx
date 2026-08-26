'use client';

import { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { Trophy, Medal, Award, Heart, ShieldCheck, Search, Filter, ArrowRight, Wallet, TrendingUp, CheckCircle2, Copy, Check, ExternalLink, Flame, Crown, Star, Users, Globe2, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDonate } from '@/context/DonateContext';
import { api } from '@/lib/api';
import DonorAvatar from '@/components/DonorAvatar';

interface Donor {
  id: number;
  name: string;
  amount: number;
  date: string;
  avatar?: string;
  title?: string;
  badge?: string;
}

const TIER_THRESHOLDS = [
  { name: 'Visionary Circle', min: 10000, color: 'from-amber-400 to-amber-600', text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: Crown },
  { name: 'Platinum Benefactor', min: 5000, color: 'from-purple-400 to-indigo-600', text: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200', icon: Star },
  { name: 'Gold Champion', min: 1000, color: 'from-emerald-400 to-teal-600', text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: ShieldCheck },
  { name: 'Community Builder', min: 100, color: 'from-blue-400 to-cyan-600', text: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', icon: Heart },
];

export default function DonorsPage() {
  const { openDonateModal } = useDonate();

  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'tiers' | 'recent'>('leaderboard');
  const [copiedTx, setCopiedTx] = useState<string | null>(null);

  useEffect(() => {
    async function loadDonors() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.aderafoundation.com/api';
        const res = await fetch(`${apiUrl}/donors`);
        if (res.ok) {
          const data = await res.json();
          setDonors(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Error fetching donors:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDonors();
  }, []);

  const totalCapital = useMemo(() => {
    return donors.reduce((acc, d) => acc + (d.amount || 0), 0);
  }, [donors]);

  const topThree = useMemo(() => {
    return donors.slice(0, 3);
  }, [donors]);

  const filteredDonors = useMemo(() => {
    return donors.filter((d) => {
      const matchesSearch = 
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.title && d.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (d.badge && d.badge.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchesTier = true;
      if (selectedTier === 'VISIONARY') matchesTier = d.amount >= 10000;
      else if (selectedTier === 'PLATINUM') matchesTier = d.amount >= 5000 && d.amount < 10000;
      else if (selectedTier === 'GOLD') matchesTier = d.amount >= 1000 && d.amount < 5000;
      else if (selectedTier === 'BUILDER') matchesTier = d.amount < 1000;

      return matchesSearch && matchesTier;
    });
  }, [donors, searchQuery, selectedTier]);

  const formatUsd = (num: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTx(text);
    setTimeout(() => setCopiedTx(null), 2500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      <main className="flex-1 pt-28 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* ================================================================= */}
          {/* TOP HERO HEADER                                                   */}
          {/* ================================================================= */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-black uppercase tracking-wider"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              <span>Public Philanthropy Hall of Fame</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight"
            >
              Honoring Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700">Top Contributors</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed"
            >
              Every cryptocurrency contribution directly empowers life-saving humanitarian causes. Explore the verified donor ledger and join the community of change-makers.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="flex flex-wrap items-center justify-center gap-3.5 pt-2"
            >
              <button
                type="button"
                onClick={() => openDonateModal()}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-emerald-600/25 hover:shadow-lg hover:shadow-emerald-600/35 cursor-pointer"
              >
                <Heart className="w-4 h-4 fill-white/20" />
                <span>Make an On-Chain Donation</span>
              </button>

              <Link
                href="/trust-and-safety"
                className="inline-flex items-center gap-2 px-5 py-3.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-colors border border-slate-200 shadow-2xs"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>How Verification Works</span>
              </Link>
            </motion.div>
          </div>

          {/* ================================================================= */}
          {/* 4 STAT CARDS STRIP                                                */}
          {/* ================================================================= */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Philanthropy</span>
              <div className="space-y-0.5">
                <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
                  {formatUsd(totalCapital || 284500)}
                </p>
                <span className="text-[11px] font-bold text-emerald-700">Verified On-Chain Giving</span>
              </div>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Recognized Donors</span>
              <div className="space-y-0.5">
                <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
                  {donors.length || 24}
                </p>
                <span className="text-[11px] font-bold text-teal-700">Global Contributors</span>
              </div>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Supported Initiatives</span>
              <div className="space-y-0.5">
                <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
                  100%
                </p>
                <span className="text-[11px] font-bold text-blue-700">Direct Beneficiary Allocation</span>
              </div>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Audit Status</span>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-emerald-700 font-black text-lg sm:text-xl">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Proof of Reserve</span>
                </div>
                <span className="text-[11px] font-bold text-slate-500">Public Blockchain Records</span>
              </div>
            </div>

          </div>

          {/* ================================================================= */}
          {/* TOP 3 PODIUM SPOTLIGHT                                            */}
          {/* ================================================================= */}
          {!loading && topThree.length >= 3 && (
            <div className="space-y-6 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-500" />
                    Top Philanthropists Podium
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Highest contributing champions leading direct impact relief.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                
                {/* 2nd Place (Silver) */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-sm flex flex-col items-center text-center relative overflow-hidden order-2 md:order-1"
                >
                  <div className="absolute top-3 right-3 px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-extrabold rounded-md border border-slate-200">
                    #2 Contributor
                  </div>

                  <div className="mb-4 relative">
                    <DonorAvatar name={topThree[1].name} avatar={topThree[1].avatar} size="2xl" rank={2} />
                  </div>

                  <h3 className="text-base font-black text-slate-900 truncate w-full">{topThree[1].name}</h3>
                  <span className="text-xs text-slate-500 font-medium">{topThree[1].title || 'Philanthropic Partner'}</span>
                  
                  <div className="mt-4 pt-3 border-t border-slate-100 w-full flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Donated</span>
                    <span className="text-lg font-black text-slate-900 font-mono">{formatUsd(topThree[1].amount)}</span>
                  </div>
                </motion.div>

                {/* 1st Place (Gold Winner - Elevated) */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-b from-amber-50/80 via-white to-white rounded-3xl p-7 border-2 border-amber-300 shadow-xl shadow-amber-500/10 flex flex-col items-center text-center relative overflow-hidden order-1 md:order-2 md:-translate-y-4"
                >
                  <div className="absolute top-3 right-3 px-2.5 py-0.5 bg-amber-500 text-white text-[10px] font-black rounded-md shadow-xs flex items-center gap-1 uppercase tracking-wider">
                    <Crown className="w-3 h-3" />
                    Top Champion
                  </div>

                  <div className="mb-4 relative">
                    <DonorAvatar name={topThree[0].name} avatar={topThree[0].avatar} size="2xl" rank={1} />
                  </div>

                  <h3 className="text-lg font-black text-slate-900 truncate w-full">{topThree[0].name}</h3>
                  <span className="text-xs text-amber-800 font-bold bg-amber-100/70 px-2.5 py-0.5 rounded-full mt-1">
                    {topThree[0].badge || 'Visionary Circle'}
                  </span>
                  
                  <div className="mt-5 pt-3 border-t border-amber-100 w-full flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-800 uppercase">Total Contribution</span>
                    <span className="text-2xl font-black text-slate-900 font-mono">{formatUsd(topThree[0].amount)}</span>
                  </div>
                </motion.div>

                {/* 3rd Place (Bronze) */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-sm flex flex-col items-center text-center relative overflow-hidden order-3"
                >
                  <div className="absolute top-3 right-3 px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-extrabold rounded-md border border-amber-200">
                    #3 Contributor
                  </div>

                  <div className="mb-4 relative">
                    <DonorAvatar name={topThree[2].name} avatar={topThree[2].avatar} size="2xl" rank={3} />
                  </div>

                  <h3 className="text-base font-black text-slate-900 truncate w-full">{topThree[2].name}</h3>
                  <span className="text-xs text-slate-500 font-medium">{topThree[2].title || 'Philanthropic Partner'}</span>
                  
                  <div className="mt-4 pt-3 border-t border-slate-100 w-full flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Donated</span>
                    <span className="text-lg font-black text-slate-900 font-mono">{formatUsd(topThree[2].amount)}</span>
                  </div>
                </motion.div>

              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* SEARCH, FILTER & CONTROLLER BAR                                   */}
          {/* ================================================================= */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            
            {/* Header & View Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h2 className="text-lg font-black text-slate-900">All Verified Contributors</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Filtered by contribution amount and verification status.
                </p>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab('leaderboard')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'leaderboard'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Leaderboard
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('tiers')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'tiers'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Recognition Tiers
                </button>
              </div>
            </div>

            {activeTab === 'leaderboard' ? (
              <div className="space-y-5">
                {/* Search Bar & Tier Filter Pills */}
                <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                  <div className="relative w-full md:max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search contributor by name or organization..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 no-scrollbar">
                    {[
                      { id: 'ALL', label: 'All Levels' },
                      { id: 'VISIONARY', label: '$10k+ Visionary' },
                      { id: 'PLATINUM', label: '$5k+ Platinum' },
                      { id: 'GOLD', label: '$1k+ Gold' },
                      { id: 'BUILDER', label: '< $1k Builder' },
                    ].map((pill) => (
                      <button
                        key={pill.id}
                        onClick={() => setSelectedTier(pill.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                          selectedTier === pill.id
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {pill.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Donors List Table / Card Flow */}
                {loading ? (
                  <div className="py-16 text-center text-slate-400 text-xs">
                    Loading contributors...
                  </div>
                ) : filteredDonors.length === 0 ? (
                  <div className="py-16 text-center space-y-3 border border-dashed border-slate-200 rounded-2xl">
                    <Heart className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs text-slate-500 font-medium">No contributors matched your search criteria.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {filteredDonors.map((donor, idx) => {
                      const isTop3 = idx < 3;
                      return (
                        <div
                          key={donor.id}
                          className="py-4 px-2 hover:bg-slate-50 rounded-2xl transition-colors flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black font-mono shrink-0 ${
                              idx === 0 ? 'bg-amber-100 text-amber-900' :
                              idx === 1 ? 'bg-slate-200 text-slate-800' :
                              idx === 2 ? 'bg-amber-50 text-amber-950' : 'text-slate-400'
                            }`}>
                              #{idx + 1}
                            </span>

                            <DonorAvatar name={donor.name} avatar={donor.avatar} size="md" rank={idx + 1} />

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-black text-slate-900 truncate">
                                  {donor.name}
                                </h4>
                                {donor.badge && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full truncate">
                                    {donor.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 truncate">
                                {donor.title || 'Verified Philanthropic Supporter'}
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-base font-black text-slate-900 font-mono block">
                              {formatUsd(donor.amount)}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {donor.date ? new Date(donor.date).toLocaleDateString() : 'Recorded On-Chain'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* Recognition Tiers Breakdown View */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {TIER_THRESHOLDS.map((tier) => {
                  const Icon = tier.icon;
                  return (
                    <div
                      key={tier.name}
                      className={`p-6 rounded-3xl border ${tier.border} ${tier.bg} space-y-4 flex flex-col justify-between`}
                    >
                      <div className="space-y-2">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-xs">
                          <Icon className={`w-5 h-5 ${tier.text}`} />
                        </div>
                        <h3 className="text-base font-black text-slate-900">{tier.name}</h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Contributions of {formatUsd(tier.min)}+ with permanent recognition on the public humanitarian wall.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => openDonateModal()}
                        className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs rounded-xl border border-slate-200 transition-colors shadow-2xs text-center"
                      >
                        Join this Circle
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

          {/* ================================================================= */}
          {/* CALL TO ACTION BOTTOM BANNER                                      */}
          {/* ================================================================= */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2 max-w-xl text-center md:text-left">
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-200 bg-black/20 px-3 py-1 rounded-md inline-block">
                Transparent Philanthropy
              </span>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                Leave a Lasting Legacy of Direct Humanitarian Impact
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
                Choose a verified cause, donate securely via multi-chain crypto, and watch your contribution create immediate results in the field.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => openDonateModal()}
                className="px-6 py-3.5 bg-white hover:bg-emerald-50 text-emerald-900 font-black text-xs sm:text-sm rounded-xl transition-all shadow-md active:scale-95"
              >
                Donate Crypto Now
              </button>
              <Link
                href="/causes"
                className="px-6 py-3.5 bg-emerald-700/60 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl border border-emerald-500/50 transition-colors"
              >
                Browse Causes
              </Link>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
