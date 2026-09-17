'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import AdminShell from '@/components/AdminShell';
import { 
  Package, 
  Users, 
  FileText, 
  Heart, 
  DollarSign, 
  ArrowUpRight, 
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Clock
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [usersData, setUsersData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'ALL' | 'BUYERS' | 'DONORS'>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [statsRes, ordersRes, usersRes] = await Promise.all([
        api.admin.stats().catch(() => null),
        api.admin.orders.list({ limit: 6 }).catch(() => ({ items: [] })),
        api.admin.users.list({ limit: 20 }).catch(() => null),
      ]);
      if (statsRes) setStats(statsRes);
      if (ordersRes) setRecentOrders(ordersRes.items || []);
      if (usersRes) setUsersData(usersRes);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const list = usersData?.items || [];
    return list.filter((u: any) => {
      if (activeTab === 'ALL') return true;
      if (activeTab === 'BUYERS') return u.source === 'SHOP' || u.role === 'BUYER';
      if (activeTab === 'DONORS') return u.source === 'DONOR' || u.role === 'DONOR';
      return true;
    }).slice(0, 6);
  }, [usersData, activeTab]);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user) loadData();
  }, [user, loading, router]);

  if (loading || !stats) {
    return (
      <AdminShell>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminShell>
    );
  }

  const metricCards = [
    {
      title: 'Gross Volume (USD)',
      value: `$${(stats.totalRevenueUsd || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtext: 'Escrow & direct donations',
      icon: DollarSign,
      iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      href: '/orders',
    },
    {
      title: 'Store Orders',
      value: stats.totalOrders || 0,
      subtext: `${stats.inTransitOrders || 0} in transit • ${stats.deliveredOrders || 0} delivered`,
      icon: Package,
      iconColor: 'text-blue-600 bg-blue-50 border-blue-100',
      href: '/orders',
    },
    {
      title: 'Active Causes',
      value: stats.approvedPosts || 0,
      subtext: `${stats.pendingPosts || 0} pending review`,
      icon: FileText,
      iconColor: 'text-rose-600 bg-rose-50 border-rose-100',
      href: '/posts',
      badge: stats.pendingPosts > 0 ? `${stats.pendingPosts} review` : undefined,
    },
    {
      title: 'Community Supporters',
      value: usersData?.summary?.total || stats.totalUsers || 0,
      subtext: `${usersData?.summary?.shopBuyers || 0} buyers • ${usersData?.summary?.donors || 0} donors`,
      icon: Users,
      iconColor: 'text-purple-600 bg-purple-50 border-purple-100',
      href: '/users',
    },
  ];

  return (
    <AdminShell>
      <div className="max-w-7xl mx-auto space-y-6 font-sans">
        
        {/* Clean Header Bar */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Overview
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {metricCards.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.title}
                href={c.href}
                className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-sm transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-600 transition-colors truncate">
                    {c.title}
                  </span>
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl border flex items-center justify-center shrink-0 ${c.iconColor}`}>
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                </div>

                <div>
                  <div className="flex items-baseline justify-between gap-1">
                    <p className="text-lg sm:text-2xl lg:text-3xl font-black font-mono text-slate-900 tracking-tight truncate">
                      {c.value}
                    </p>
                    {c.badge && (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                        {c.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5 sm:mt-1 truncate">
                    {c.subtext}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* 2-Column Split: Orders Table & Community Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          
          {/* Recent Orders (2 Columns) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  Recent Store Orders
                </h2>
                <p className="text-[11px] text-slate-400">Latest customer purchases & crypto settlement</p>
              </div>

              <Link 
                href="/orders" 
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 hover:underline"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="flex-1 overflow-x-auto custom-scrollbar">
              <table className="w-full min-w-[500px] text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-5">Order #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-5 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentOrders.slice(0, 6).map((ord) => {
                    const isDelivered = ord.status === 'DELIVERED';
                    const isInTransit = ord.status === 'IN_TRANSIT';
                    return (
                      <tr key={ord.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-5">
                          <Link href="/orders" className="font-mono font-bold text-slate-900 hover:text-emerald-600 transition-colors">
                            #{ord.orderNumber}
                          </Link>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900 truncate max-w-[150px]">
                            {ord.customerName}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate max-w-[150px]">
                            {ord.customerEmail}
                          </p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-slate-900 block">
                            ${(ord.totalAmount || 0).toFixed(2)}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-600 font-bold">
                            {ord.cryptoAmount} {ord.cryptoSymbol}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${
                            isDelivered
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isInTransit
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {ord.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right text-slate-400 font-mono text-[11px]">
                          {new Date(ord.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}

                  {recentOrders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        No orders recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Community Supporter Feed (1 Column) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  Supporters & Donors
                </h2>
                <p className="text-[11px] text-slate-400">Platform community members</p>
              </div>

              <Link 
                href="/users" 
                className="text-xs font-bold text-primary-700 hover:underline inline-flex items-center gap-1"
              >
                <span>Directory</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {[
                { id: 'ALL', label: 'All' },
                { id: 'BUYERS', label: 'Buyers' },
                { id: 'DONORS', label: 'Donors' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeTab === t.id
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* User List */}
            <div className="space-y-2.5 flex-1">
              {filteredUsers.map((u: any) => {
                const isDonor = u.source === 'DONOR' || u.role === 'DONOR';
                const isShop = u.source === 'SHOP' || u.role === 'BUYER';
                return (
                  <div
                    key={u.id}
                    className="p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-colors flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black uppercase text-xs shrink-0 border ${
                        isDonor
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : isShop
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-purple-50 text-purple-700 border-purple-200'
                      }`}>
                        {u.name?.[0] || 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">
                          {u.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">
                          {u.email}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-slate-900 block text-xs">
                        {isDonor
                          ? `$${(u.totalDonated || 0).toLocaleString()}`
                          : isShop
                          ? `$${(u.totalSpent || 0).toFixed(2)}`
                          : u.badge || 'Member'}
                      </span>
                      <span className={`text-[9px] font-bold uppercase ${
                        isDonor ? 'text-rose-600' : isShop ? 'text-emerald-600' : 'text-slate-400'
                      }`}>
                        {isDonor ? 'Donor' : isShop ? 'Buyer' : 'User'}
                      </span>
                    </div>
                  </div>
                );
              })}

              {filteredUsers.length === 0 && (
                <p className="text-xs text-slate-400 py-6 text-center">
                  No supporters found.
                </p>
              )}
            </div>
          </div>

        </div>

      </div>
    </AdminShell>
  );
}
