"use client";

import { Trophy, Medal, Award, TrendingUp, Loader2, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from "react";
import Link from "next/link";
import DonorAvatar from "./DonorAvatar";

interface Donor {
  id: number;
  name: string;
  amount: number;
  date: string;
  avatar?: string;
  title?: string;
  badge?: string;
}

interface DonorWallProps {
  limit?: number;
  minimal?: boolean;
}

export default function DonorWall({ limit, minimal = false }: DonorWallProps) {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDonors() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
        const res = await fetch(`${apiUrl}/donors`);
        if (!res.ok) throw new Error("Failed to fetch donors");
        let data = await res.json();
        if (limit) data = data.slice(0, limit);
        setDonors(data);
      } catch (err) {
        console.error("Error fetching donors:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDonors();
  }, [limit]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(amount);
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-4 h-4 text-amber-500 fill-amber-500/20" />;
    if (index === 1) return <Medal className="w-4 h-4 text-slate-400 fill-slate-400/20" />;
    if (index === 2) return <Medal className="w-4 h-4 text-amber-700 fill-amber-700/20" />;
    return <Award className="w-3.5 h-3.5 text-emerald-600" />;
  };

  const getRankStyle = (index: number) => {
    if (index === 0) return "bg-gradient-to-r from-amber-500/10 via-amber-50/50 to-transparent border-amber-200 shadow-sm shadow-amber-500/5";
    if (index === 1) return "bg-gradient-to-r from-slate-200/40 via-slate-50/50 to-transparent border-slate-200";
    if (index === 2) return "bg-gradient-to-r from-amber-700/10 via-amber-50/30 to-transparent border-amber-200/80";
    return "bg-white border-slate-100 hover:border-emerald-200 hover:bg-slate-50/40";
  };

  return (
    <section className={`relative overflow-hidden ${minimal ? 'py-2' : 'py-16 sm:py-20'}`}>
      {!minimal && (
        <>
          <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-emerald-400/10 rounded-full blur-[100px] pointer-events-none -z-10" />
          <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-teal-400/10 rounded-full blur-[100px] pointer-events-none -z-10" />
        </>
      )}

      <div className={`mx-auto relative z-10 ${minimal ? 'w-full' : 'max-w-4xl px-4 sm:px-6 lg:px-8'}`}>
        {!minimal && (
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Top Contributors</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-3 tracking-tight">
              Donor Leaderboard
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
              Honoring the visionary changemakers and philanthropists funding life-changing humanitarian initiatives.
            </p>
          </div>
        )}

        <div className={`bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200 ${minimal ? 'p-4 sm:p-5' : 'p-6 md:p-8 shadow-xl shadow-slate-200/50'}`}>
          {minimal && (
            <div className="flex items-center justify-between mb-3.5 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-none">
                    Top Contributors
                  </h3>
                  <span className="text-[10px] font-medium text-emerald-600 flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Verified Philanthropy
                  </span>
                </div>
              </div>
              <Link 
                href="/donors" 
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline px-2.5 py-1 rounded-lg hover:bg-emerald-50 transition-colors"
              >
                View All →
              </Link>
            </div>
          )}

          {!minimal && (
            <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider px-4">
              <div className="col-span-1 text-center">Rank</div>
              <div className="col-span-6">Contributor Profile</div>
              <div className="col-span-2 text-right">Date</div>
              <div className="col-span-3 text-right">Total Donated</div>
            </div>
          )}

          <div className="mt-3 flex flex-col gap-2.5">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-7 h-7 text-emerald-600 animate-spin" />
              </div>
            ) : donors.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs font-medium">No donors found.</div>
            ) : (
              donors.map((donor, idx) => (
                <div 
                  key={donor.id}
                  className={`grid grid-cols-12 gap-3 sm:gap-4 items-center p-3 sm:p-3.5 rounded-2xl border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${getRankStyle(idx)}`}
                >
                  {/* Rank Icon / Number */}
                  <div className={`${minimal ? 'col-span-2' : 'col-span-2 md:col-span-1'} flex justify-center`}>
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-black text-xs font-mono ${
                      idx === 0 
                        ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                        : idx === 1 
                        ? 'bg-slate-200 text-slate-800 border border-slate-300' 
                        : idx === 2 
                        ? 'bg-amber-50 text-amber-950 border border-amber-200' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {idx < 3 ? getRankIcon(idx) : `#${idx + 1}`}
                    </div>
                  </div>

                  {/* Contributor Profile Picture & Name */}
                  <div className={`${minimal ? 'col-span-6' : 'col-span-6'} flex items-center gap-2.5 sm:gap-3.5 min-w-0`}>
                    <DonorAvatar
                      name={donor.name}
                      avatar={donor.avatar}
                      rank={idx + 1}
                      size={minimal ? 'sm' : 'md'}
                    />
                    <div className="min-w-0 flex-1">
                      <div className={`font-black truncate ${idx < 3 ? 'text-slate-900 text-sm sm:text-base' : 'text-slate-800 text-xs sm:text-sm'}`}>
                        {donor.name}
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                        {donor.title && (
                          <span className="text-[10px] text-slate-500 font-semibold truncate max-w-[140px]">
                            {donor.title}
                          </span>
                        )}
                        {donor.badge && (
                          <span className="inline-block text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 leading-none">
                            {donor.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Date Display */}
                  {!minimal && (
                    <div className="hidden md:block col-span-2 text-right text-xs text-slate-500 font-medium font-mono">
                      {donor.date}
                    </div>
                  )}

                  {/* Amount Badge */}
                  <div className={`${minimal ? 'col-span-4' : 'col-span-4 md:col-span-3'} flex justify-end`}>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 rounded-xl bg-slate-900 text-white font-mono font-black text-xs sm:text-sm shadow-xs whitespace-nowrap">
                      <span className="text-emerald-400 font-bold">$</span>
                      <span>{formatCurrency(donor.amount)}</span>
                      <span className="text-[10px] text-slate-400 font-medium">USDC</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {!minimal && donors.length > 0 && !limit && (
            <div className="mt-8 text-center text-slate-400 text-xs font-semibold">
              Showing all verified platform contributors.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
