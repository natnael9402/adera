'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { 
  Users, ShoppingBag, Heart, Shield, ShieldCheck, CheckCircle2, 
  Clock, Search, AlertCircle, ArrowUpRight, DollarSign,
  Package, FileText, UserCheck, ExternalLink, Filter
} from 'lucide-react';
import AdminShell from '@/components/AdminShell';

interface PlatformUser {
  id: string;
  userId?: number;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string;
  verified?: boolean;
  source: 'SHOP' | 'FOUNDATION' | 'DONOR';
  role: string;
  badge: string;
  totalOrders?: number;
  totalSpent?: number;
  causesCount?: number;
  totalRaised?: number;
  totalDonated?: number;
  createdAt: string;
}

interface UsersResponse {
  summary: {
    total: number;
    shopBuyers: number;
    foundationMembers: number;
    donors: number;
    totalSpentShop: number;
    totalDonatedFoundation: number;
  };
  items: PlatformUser[];
}

export default function UsersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [data, setData] = useState<UsersResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'ALL' | 'SHOP' | 'FOUNDATION' | 'DONOR'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = () => {
    setIsLoading(true);
    api.admin.users.list({ type: activeTab, search: searchQuery })
      .then((res: any) => {
        if (res && res.items) {
          setData(res);
        } else if (Array.isArray(res)) {
          setData({
            summary: {
              total: res.length,
              shopBuyers: res.filter((r: any) => r.source === 'SHOP' || r.role === 'BUYER').length,
              foundationMembers: res.filter((r: any) => r.source === 'FOUNDATION' && r.role !== 'DONOR').length,
              donors: res.filter((r: any) => r.source === 'DONOR' || r.role === 'DONOR').length,
              totalSpentShop: 0,
              totalDonatedFoundation: 0,
            },
            items: res,
          });
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user) fetchUsers();
  }, [user, loading, router, activeTab]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const users = data?.items || [];
  const summary = data?.summary || {
    total: 0,
    shopBuyers: 0,
    foundationMembers: 0,
    donors: 0,
    totalSpentShop: 0,
    totalDonatedFoundation: 0,
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch = 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.badge && u.badge.toLowerCase().includes(searchQuery.toLowerCase()));
      
      if (!matchSearch) return false;
      if (activeTab === 'ALL') return true;
      if (activeTab === 'SHOP') return u.source === 'SHOP' || u.role === 'BUYER';
      if (activeTab === 'FOUNDATION') return u.source === 'FOUNDATION' && u.role !== 'DONOR';
      if (activeTab === 'DONOR') return u.source === 'DONOR' || u.role === 'DONOR';
      return true;
    });
  }, [users, searchQuery, activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AdminShell>
      

      <div className="max-w-7xl mx-auto space-y-5 sm:space-y-8">
        
        {/* Page Header */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-4 sm:p-6 lg:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Directory & Community
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Users className="w-6 h-6 sm:w-7 sm:h-7 text-primary-600 shrink-0" />
              <span>Users & Donors</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Consolidated directory of store buyers, foundation members, cause organizers, and donors.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/customers"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Buyers CRM</span>
            </Link>

            <Link
              href="/donors"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm"
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Donors</span>
            </Link>
          </div>
        </div>

        {/* 4 Metric Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1 sm:space-y-2">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider truncate">Total Community</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-3xl font-black text-slate-900 font-mono">{summary.total}</p>
            <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">All registered users & donors</p>
          </div>

          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1 sm:space-y-2">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] sm:text-xs font-bold text-emerald-700 uppercase tracking-wider truncate">Shop Buyers</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-3xl font-black text-slate-900 font-mono">{summary.shopBuyers}</p>
            <p className="text-[10px] sm:text-[11px] text-emerald-600 font-medium font-mono truncate">${summary.totalSpentShop.toFixed(2)} purchases</p>
          </div>

          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1 sm:space-y-2">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] sm:text-xs font-bold text-rose-700 uppercase tracking-wider truncate">Donors</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center shrink-0">
                <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-3xl font-black text-slate-900 font-mono">{summary.donors}</p>
            <p className="text-[10px] sm:text-[11px] text-rose-600 font-medium font-mono truncate">${summary.totalDonatedFoundation.toLocaleString()} donated</p>
          </div>

          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1 sm:space-y-2">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] sm:text-xs font-bold text-purple-700 uppercase tracking-wider truncate">Foundation</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-3xl font-black text-slate-900 font-mono">{summary.foundationMembers}</p>
            <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">Members & organizers</p>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
            {[
              { id: 'ALL', label: `All Users (${summary.total})` },
              { id: 'SHOP', label: `Shop Buyers (${summary.shopBuyers})` },
              { id: 'FOUNDATION', label: `Foundation (${summary.foundationMembers})` },
              { id: 'DONOR', label: `Donors (${summary.donors})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Search name, email, badge..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:bg-white"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs shrink-0 cursor-pointer"
            >
              Filter
            </button>
          </form>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="text-center py-16 space-y-2">
              <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500">Loading user directory...</p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full min-w-[680px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">User / Supporter</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">Email Address</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">Platform Source</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">Role / Badge</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">Activity & Impact</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600 text-right">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredUsers.map((u) => {
                    const isShop = u.source === 'SHOP';
                    const isDonor = u.source === 'DONOR';
                    const isFoundation = u.source === 'FOUNDATION';

                    return (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        
                        {/* Name + Avatar */}
                        <td className="px-6 py-4 font-bold text-slate-900">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black uppercase shrink-0 border ${
                              isDonor
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : isShop
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-purple-50 text-purple-700 border-purple-200'
                            }`}>
                              {u.name?.[0] || 'U'}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 block truncate">{u.name}</span>
                              {u.phone && <span className="text-[10px] text-slate-400 font-normal">{u.phone}</span>}
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-6 py-4 text-slate-600 font-mono">
                          {u.email}
                        </td>

                        {/* Source Tag */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full border ${
                            isDonor
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : isShop
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-purple-50 text-purple-700 border-purple-200'
                          }`}>
                            {isDonor ? 'Foundation Donor' : isShop ? 'Shop Buyer' : 'Foundation User'}
                          </span>
                        </td>

                        {/* Badge / Role */}
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-800">
                            {u.badge}
                          </span>
                        </td>

                        {/* Activity / Financial Impact */}
                        <td className="px-6 py-4">
                          {isDonor ? (
                            <span className="font-mono font-bold text-rose-700">
                              ${(u.totalDonated || 0).toLocaleString()} donated
                            </span>
                          ) : isShop ? (
                            <span className="font-mono text-emerald-700 font-bold">
                              ${(u.totalSpent || 0).toFixed(2)} ({u.totalOrders || 0} orders)
                            </span>
                          ) : (u.causesCount && u.causesCount > 0) ? (
                            <span className="font-mono text-purple-700 font-bold">
                              {u.causesCount} causes (${(u.totalRaised || 0).toLocaleString()} raised)
                            </span>
                          ) : (
                            <span className="text-slate-400">
                              Verified supporter
                            </span>
                          )}
                        </td>

                        {/* Joined Date */}
                        <td className="px-6 py-4 text-right text-slate-500 font-mono">
                          {new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>

                      </tr>
                    );
                  })}

                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <AlertCircle className="w-8 h-8 text-slate-400" />
                          <p className="font-bold text-slate-800 text-sm">No users or donors found</p>
                          <p className="text-xs text-slate-500">Try changing your search query or category filter.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </AdminShell>
  );
}
