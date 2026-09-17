'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import AdminShell from '@/components/AdminShell';
import { 
  Activity, Search, Filter, RefreshCw, 
  ShoppingBag, Key, User, Mail, ShieldAlert, 
  CheckCircle2, Clock, Globe, Laptop, ChevronDown, ChevronUp, AlertCircle 
} from 'lucide-react';

const EVENT_FILTERS = [
  { id: 'ALL', label: 'All Activities' },
  { id: 'ORDER_PLACED', label: 'Orders Placed' },
  { id: 'BUYER_SIGNUP', label: 'Buyer Signups' },
  { id: 'BUYER_LOGIN', label: 'Buyer Logins' },
  { id: 'ORDER_STATUS_CHANGED', label: 'Status Changes' },
  { id: 'EMAIL_DISPATCHED', label: 'Emails Sent' },
  { id: 'EMAIL_FAILED', label: 'Failed Emails' },
  { id: 'USER_VERIFIED', label: 'Verified Accounts' },
];

export default function AdminActivitiesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [activities, setActivities] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedType, setSelectedType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [stats, setStats] = useState<any>(null);

  const fetchActivities = useCallback(() => {
    api.admin.activities.list({
      type: selectedType,
      search: searchQuery,
      limit: 60,
    })
      .then((res: any) => {
        setActivities(res.items || []);
        setTotalCount(res.total || 0);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [selectedType, searchQuery]);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user) {
      fetchActivities();
      api.admin.stats().then(setStats).catch(console.error);
    }
  }, [user, loading, router, fetchActivities]);

  // Auto refresh every 12 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchActivities();
    }, 12000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchActivities]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    fetchActivities();
  };

  const getEventIcon = (type: string) => {
    if (type.includes('ORDER')) return <ShoppingBag className="w-4 h-4 text-emerald-600" />;
    if (type.includes('LOGIN')) return <Key className="w-4 h-4 text-blue-600" />;
    if (type.includes('SIGNUP') || type.includes('USER')) return <User className="w-4 h-4 text-purple-600" />;
    if (type.includes('EMAIL')) return <Mail className="w-4 h-4 text-amber-600" />;
    return <Activity className="w-4 h-4 text-slate-600" />;
  };

  const getEventBadgeClass = (type: string, status: string) => {
    if (status === 'FAILED') return 'bg-rose-50 text-rose-700 border-rose-200';
    if (type.includes('ORDER')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (type.includes('LOGIN')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (type.includes('SIGNUP')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (type.includes('EMAIL')) return 'bg-amber-50 text-amber-800 border-amber-200';
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

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
        
        {/* Top Header */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-4 sm:p-6 lg:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0">
                <Activity className="w-4 h-4" />
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                Activity & Audit Log
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Audit logging for buyer logins, signups, orders, status transitions, and email events across the platform.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                autoRefresh
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              <span>{autoRefresh ? 'Auto (12s)' : 'Paused'}</span>
            </button>

            <button
              onClick={() => {
                setIsLoading(true);
                fetchActivities();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Feed</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Summary Cards */}
        {stats?.activityStats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
            <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1 sm:space-y-2">
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block truncate">Recorded Events</span>
              <p className="text-xl sm:text-3xl font-black text-slate-900 font-mono">{stats.activityStats.totalActivities || 0}</p>
              <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">All-time entries</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Events Today (24h)</span>
              <p className="text-3xl font-black text-emerald-700 font-mono">{stats.activityStats.todayActivities || 0}</p>
              <p className="text-[11px] text-slate-500">Active traffic & operations</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Buyer Signups</span>
              <p className="text-3xl font-black text-purple-700 font-mono">{stats.activityStats.buyerSignups || 0}</p>
              <p className="text-[11px] text-slate-500">New customer registrations</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Store Orders</span>
              <p className="text-3xl font-black text-blue-700 font-mono">{stats.activityStats.ordersPlaced || 0}</p>
              <p className="text-[11px] text-slate-500">Completed checkout events</p>
            </div>
          </div>
        )}

        {/* Filters Toolbar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
            {EVENT_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setSelectedType(f.id);
                  setIsLoading(true);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedType === f.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search actor, summary, IP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:bg-white"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              Filter
            </button>
          </form>

        </div>

        {/* Activity Stream Feed */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 lg:p-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Live Audit Log ({totalCount.toLocaleString()} events recorded)
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Latest 60 stream entries
            </span>
          </div>

          {isLoading ? (
            <div className="text-center py-16 space-y-2">
              <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500">Streaming activity log entries...</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-16 space-y-2">
              <Activity className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-800">No activity logs recorded yet</p>
              <p className="text-xs text-slate-500">Activities will show up here in real time as buyers interact with the store.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((item) => {
                const isExpanded = expandedId === item.id;
                const hasDetails = item.details && Object.keys(item.details).length > 0;

                return (
                  <div 
                    key={item.id}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all bg-slate-50/50 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                          {getEventIcon(item.type)}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${getEventBadgeClass(item.type, item.status)}`}>
                              {item.type.replace('_', ' ')}
                            </span>
                            <span className="text-xs font-bold text-slate-900">
                              {item.actorName}
                            </span>
                            {item.actorEmail && (
                              <span className="text-xs text-slate-500">
                                ({item.actorEmail})
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-800 font-medium mt-1">
                            {(item.summary || '').replace(/^[\p{Emoji}\p{Extended_Pictographic}\uFE0F\s]+/gu, '').trim()}
                          </p>
                        </div>
                      </div>

                      {/* Right: Timestamp & Meta */}
                      <div className="text-left sm:text-right text-[11px] text-slate-400 shrink-0 space-y-0.5">
                        <div className="font-mono font-medium text-slate-600">
                          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                        <div>
                          {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Metadata Strip */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                      <div className="flex items-center gap-3 flex-wrap">
                        {item.ipAddress && item.ipAddress !== '127.0.0.1' && item.ipAddress !== '::1' && (
                          <span className="inline-flex items-center gap-1 font-mono">
                            <Globe className="w-3 h-3 text-slate-400" />
                            <span>IP: {item.ipAddress}</span>
                          </span>
                        )}

                        {item.userAgent && (
                          <span className="hidden md:inline-flex items-center gap-1 text-slate-400 truncate max-w-[300px]">
                            <Laptop className="w-3 h-3" />
                            <span className="truncate">{item.userAgent}</span>
                          </span>
                        )}
                      </div>

                      {hasDetails && (
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : item.id)}
                          className="text-primary-700 font-bold hover:underline inline-flex items-center gap-1 text-xs"
                        >
                          <span>{isExpanded ? 'Hide Payload' : 'Inspect JSON Payload'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>

                    {/* Expandable JSON Inspector */}
                    {isExpanded && hasDetails && (
                      <div className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto border border-slate-800 animate-fade-in-up">
                        <pre>{JSON.stringify(item.details, null, 2)}</pre>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </AdminShell>
  );
}
