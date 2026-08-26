'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { FileText, Users, Clock, CheckCircle2, XCircle, Plus, ChevronRight, Heart, ShoppingBag, Wallet, ArrowUpRight, ShieldCheck, Activity, Layers, Package } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user) api.admin.stats().then(setStats).catch(console.error);
  }, [user, loading, router]);

  if (loading || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    { 
      label: 'Total Causes', 
      value: stats.totalPosts || 0, 
      subtext: 'Submitted proposals',
      icon: FileText, 
      color: 'bg-blue-50 text-blue-700 border-blue-200' 
    },
    { 
      label: 'Pending Review', 
      value: stats.pendingPosts || 0, 
      subtext: 'Requires admin action',
      icon: Clock, 
      color: 'bg-amber-50 text-amber-700 border-amber-200' 
    },
    { 
      label: 'Approved Causes', 
      value: stats.approvedPosts || 0, 
      subtext: 'Active on public portal',
      icon: CheckCircle2, 
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200' 
    },
    { 
      label: 'Rejected', 
      value: stats.rejectedPosts || 0, 
      subtext: 'Archived causes',
      icon: XCircle, 
      color: 'bg-rose-50 text-rose-700 border-rose-200' 
    },
    { 
      label: 'Registered Users', 
      value: stats.totalUsers || 0, 
      subtext: 'Verified donors & creators',
      icon: Users, 
      color: 'bg-slate-100 text-slate-800 border-slate-200' 
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full space-y-10">
        
        {/* Top Header & Fast Actions */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Overview and management controls for campaigns, products, donors, users, and settlement wallets.
            </p>
          </div>

          {/* Quick Action Button Group */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/posts/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-primary-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Create Cause</span>
            </Link>

            <Link
              href="/products/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all shadow-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add Product</span>
            </Link>

            <Link
              href="/payments/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-all border border-slate-200"
            >
              <Wallet className="w-4 h-4 text-primary-600" />
              <span>Add Wallet</span>
            </Link>
          </div>
        </div>

        {/* 5-Column Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div 
                key={card.label} 
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:border-slate-300 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {card.label}
                  </span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${card.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div>
                  <p className="text-3xl font-black text-slate-900 tracking-tight font-mono">
                    {card.value}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                    {card.subtext}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Core Administrative Portals */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary-600" />
              Management Modules
            </h2>
            <span className="text-xs font-mono font-semibold text-slate-500">6 Sub-Modules Active</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* 1. Causes & Posts */}
            <Link 
              href="/posts" 
              className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-primary-500 hover:shadow-md transition-all flex flex-col justify-between group space-y-6"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 bg-primary-50 border border-primary-200 text-primary-700 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-700 transition-colors">
                    Causes & Submissions
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">
                    Review and approve submitted philanthropic initiatives. Set goal targets, verify documentation, and deploy to the public portal.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs font-bold text-primary-700">
                <span>Manage All Causes</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* 2. Store Products */}
            <Link 
              href="/products" 
              className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-primary-500 hover:shadow-md transition-all flex flex-col justify-between group space-y-6"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-700 transition-colors">
                    Store Merchandise
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">
                    Manage direct-impact merchandise, update product inventory, edit crypto price conversions, and monitor sales proceeds.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs font-bold text-primary-700">
                <span>Manage Store Catalog</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* 3. Donor Leaderboard */}
            <Link 
              href="/donors" 
              className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-primary-500 hover:shadow-md transition-all flex flex-col justify-between group space-y-6"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Heart className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-700 transition-colors">
                    Donor Leaderboard
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">
                    Recognize philanthropic contributors. Add, update, and manage top on-chain donors displayed on the platform homepage.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs font-bold text-primary-700">
                <span>View Leaderboard</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* 4. Registered Users */}
            <Link 
              href="/users" 
              className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-primary-500 hover:shadow-md transition-all flex flex-col justify-between group space-y-6"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 bg-purple-50 border border-purple-200 text-purple-700 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-700 transition-colors">
                    User Accounts
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">
                    Monitor registered donor profiles, view KYC verification flags, audit platform roles, and manage permissions.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs font-bold text-primary-700">
                <span>Audit User Accounts</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* 5. Crypto Payment Methods */}
            <Link 
              href="/payments" 
              className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-primary-500 hover:shadow-md transition-all flex flex-col justify-between group space-y-6"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-700 transition-colors">
                    Settlement Wallets
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">
                    Configure multi-chain escrow wallet addresses for receiving Bitcoin, Ethereum, Solana, USDC, and Polygon deposits.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs font-bold text-primary-700">
                <span>Manage Payment Wallets</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* 6. Shipment & Order Logistics */}
            <a 
              href="http://localhost:3003/track" 
              target="_blank"
              rel="noreferrer"
              className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-primary-500 hover:shadow-md transition-all flex flex-col justify-between group space-y-6"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 bg-teal-50 border border-teal-200 text-teal-700 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-700 transition-colors">
                      Shipment & Order Logistics
                    </h3>
                    <ArrowUpRight className="w-4 h-4 text-slate-400" />
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">
                    Track customer package numbers, courier fulfillment status, and order receipts across the store.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs font-bold text-primary-700">
                <span>View Order Tracker</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>

          </div>
        </div>

      </main>
    </div>
  );
}
