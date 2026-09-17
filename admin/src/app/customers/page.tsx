'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import AdminShell from '@/components/AdminShell';
import { 
  UserCheck, Search, RefreshCw, ShoppingBag, 
  Mail, MapPin, ShieldCheck, Clock, CheckCircle2, 
  ExternalLink, ArrowRight, Package, Activity, Phone 
} from 'lucide-react';

export default function AdminCustomersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [customers, setCustomers] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Customer 360 Modal
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [customerDetail, setCustomerDetail] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'activities' | 'emails'>('orders');

  const fetchCustomers = () => {
    setIsLoading(true);
    api.admin.customers.list({
      search: searchQuery,
      limit: 50,
    })
      .then((res: any) => {
        setCustomers(res.items || []);
        setTotalCount(res.total || 0);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user) fetchCustomers();
  }, [user, loading, router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers();
  };

  const handleOpenCustomer360 = async (id: number) => {
    setSelectedCustomerId(id);
    setDetailLoading(true);
    setActiveSubTab('orders');
    try {
      const data = await api.admin.customers.get(id);
      setCustomerDetail(data);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalSpentAll = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
  const totalOrdersAll = customers.reduce((sum, c) => sum + (c.totalOrders || 0), 0);

  return (
    <AdminShell>
      

      <div className="max-w-7xl mx-auto space-y-5 sm:space-y-8">
        
        {/* Top Header */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-4 sm:p-6 lg:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0">
                <UserCheck className="w-4 h-4" />
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                Buyers & Customer 360 CRM
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Complete customer directory, lifetime order history, activity tracking, and direct email audit records.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchCustomers()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-all border border-slate-200 active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Directory</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1 sm:space-y-2">
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block truncate">Registered Accounts</span>
            <p className="text-xl sm:text-3xl font-black text-slate-900 font-mono">{totalCount}</p>
            <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">Active customer profiles</p>
          </div>

          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1 sm:space-y-2">
            <span className="text-[10px] sm:text-xs font-bold text-emerald-700 uppercase tracking-wider block truncate">Cumulative Spend</span>
            <p className="text-xl sm:text-3xl font-black text-emerald-700 font-mono truncate">${totalSpentAll.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">All customer orders</p>
          </div>

          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1 sm:space-y-2">
            <span className="text-[10px] sm:text-xs font-bold text-blue-700 uppercase tracking-wider block truncate">Total Orders</span>
            <p className="text-xl sm:text-3xl font-black text-blue-700 font-mono">{totalOrdersAll}</p>
            <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">Completed purchases</p>
          </div>

          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1 sm:space-y-2">
            <span className="text-[10px] sm:text-xs font-bold text-purple-700 uppercase tracking-wider block truncate">Avg Order Value</span>
            <p className="text-xl sm:text-3xl font-black text-purple-700 font-mono">${totalOrdersAll > 0 ? (totalSpentAll / totalOrdersAll).toFixed(2) : '0.00'}</p>
            <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">Per transaction</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-96">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, email, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:bg-white"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              Search
            </button>
          </form>
        </div>

        {/* Customer Directory Table */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="text-center py-16 space-y-2">
              <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500">Loading buyer directory...</p>
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <UserCheck className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No Customers Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No buyers found matching &ldquo;{searchQuery}&rdquo;.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full min-w-[700px] text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-5">Customer Profile</th>
                    <th className="py-3.5 px-4">Role / Verification</th>
                    <th className="py-3.5 px-4">Orders Placed</th>
                    <th className="py-3.5 px-4">Lifetime Spend</th>
                    <th className="py-3.5 px-4">Last Active</th>
                    <th className="py-3.5 px-4">Registered</th>
                    <th className="py-3.5 px-5 text-right">360 View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                      
                      {/* Name & Contact */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 text-white flex items-center justify-center text-xs font-mono font-bold uppercase shrink-0">
                            {c.name?.[0] || 'U'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block truncate max-w-[180px]">
                              {c.name}
                            </span>
                            <span className="text-[11px] text-slate-500 truncate max-w-[180px] block">
                              {c.email} {c.phone && `• ${c.phone}`}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role & Verification */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {c.role}
                          </span>
                          {c.verified && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-0.5">
                              <ShieldCheck className="w-2.5 h-2.5" />
                              <span>Verified</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Orders */}
                      <td className="py-4 px-4">
                        <span className="font-bold text-slate-900 font-mono">
                          {c.totalOrders} {c.totalOrders === 1 ? 'order' : 'orders'}
                        </span>
                      </td>

                      {/* Spend */}
                      <td className="py-4 px-4">
                        <span className="font-black text-emerald-700 font-mono">
                          ${c.totalSpent.toFixed(2)}
                        </span>
                      </td>

                      {/* Last Active */}
                      <td className="py-4 px-4 font-mono text-[11px] text-slate-500">
                        {c.lastLoginAt ? new Date(c.lastLoginAt).toLocaleDateString() : 'Never'}
                      </td>

                      {/* Registered */}
                      <td className="py-4 px-4 font-mono text-[11px] text-slate-400">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => handleOpenCustomer360(c.id)}
                          className="px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 font-bold rounded-xl text-xs transition-colors"
                        >
                          Customer 360 &rarr;
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Customer Full 360 CRM Drawer / Modal */}
      {selectedCustomerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-fade-in-up">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 max-w-3xl w-full p-4 sm:p-7 shadow-2xl space-y-4 sm:space-y-6 max-h-[92vh] flex flex-col relative">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 text-white flex items-center justify-center font-mono font-bold text-xl uppercase shrink-0">
                  {customerDetail?.customer?.name?.[0] || 'C'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900">
                      {customerDetail?.customer?.name || 'Customer Profile'}
                    </h3>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 uppercase">
                      {customerDetail?.customer?.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {customerDetail?.customer?.email} {customerDetail?.customer?.phone && `• ${customerDetail?.customer?.phone}`}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedCustomerId(null);
                  setCustomerDetail(null);
                }}
                className="text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-sm shrink-0"
              >
                ✕
              </button>
            </div>

            {detailLoading ? (
              <div className="py-16 text-center space-y-2">
                <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-500">Loading Customer 360 data...</p>
              </div>
            ) : customerDetail && (
              <div className="space-y-5 overflow-y-auto flex-1 pr-1">
                
                {/* Stats Strip */}
                <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Orders</span>
                    <span className="text-lg font-black text-slate-900 font-mono">{customerDetail.customer.totalOrders}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Lifetime Value</span>
                    <span className="text-lg font-black text-emerald-700 font-mono">${customerDetail.customer.totalSpent.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Member Since</span>
                    <span className="text-xs font-bold text-slate-700 font-mono mt-1 block">
                      {new Date(customerDetail.customer.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Sub-tab Navigation */}
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
                  <button
                    onClick={() => setActiveSubTab('orders')}
                    className={`px-3 py-1.5 rounded-xl transition-all ${
                      activeSubTab === 'orders'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    📦 Orders ({customerDetail.orders?.length || 0})
                  </button>

                  <button
                    onClick={() => setActiveSubTab('activities')}
                    className={`px-3 py-1.5 rounded-xl transition-all ${
                      activeSubTab === 'activities'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    ⚡ Activities ({customerDetail.activities?.length || 0})
                  </button>

                  <button
                    onClick={() => setActiveSubTab('emails')}
                    className={`px-3 py-1.5 rounded-xl transition-all ${
                      activeSubTab === 'emails'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    ✉️ Sent Emails ({customerDetail.emails?.length || 0})
                  </button>
                </div>

                {/* SUB TAB 1: ORDERS */}
                {activeSubTab === 'orders' && (
                  <div className="space-y-3">
                    {customerDetail.orders?.length === 0 ? (
                      <p className="text-xs text-slate-400 py-6 text-center">No orders placed by this customer yet.</p>
                    ) : (
                      customerDetail.orders.map((o: any) => (
                        <div key={o.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold font-mono text-slate-900">#{o.orderNumber}</span>
                              <span className="text-[10px] font-black uppercase px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {o.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {new Date(o.createdAt).toLocaleDateString()} • Tracking: <span className="font-mono">{o.trackingNumber}</span>
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="font-black text-slate-900 font-mono block">${o.totalAmount.toFixed(2)}</span>
                            <span className="text-[10px] text-emerald-600 font-mono">{o.cryptoAmount} {o.cryptoSymbol}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* SUB TAB 2: ACTIVITIES */}
                {activeSubTab === 'activities' && (
                  <div className="space-y-2">
                    {customerDetail.activities?.length === 0 ? (
                      <p className="text-xs text-slate-400 py-6 text-center">No recent activities recorded.</p>
                    ) : (
                      customerDetail.activities.map((a: any) => (
                        <div key={a.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-800 block">{a.summary}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {a.ipAddress && `IP: ${a.ipAddress} • `}{new Date(a.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-600 uppercase font-mono px-2 py-0.5 bg-white rounded border border-slate-200">
                            {a.type}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* SUB TAB 3: EMAILS */}
                {activeSubTab === 'emails' && (
                  <div className="space-y-2">
                    {customerDetail.emails?.length === 0 ? (
                      <p className="text-xs text-slate-400 py-6 text-center">No emails dispatched to this address.</p>
                    ) : (
                      customerDetail.emails.map((m: any) => (
                        <div key={m.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-800 block">{m.subject}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {m.template} • {new Date(m.sentAt).toLocaleString()}
                            </span>
                          </div>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${m.status === 'SENT' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                            {m.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}

              </div>
            )}

          </div>
        </div>
      )}

    </AdminShell>
  );
}
