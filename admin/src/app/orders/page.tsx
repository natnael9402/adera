'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import AdminShell from '@/components/AdminShell';
import { 
  Package, Search, Filter, Truck, CheckCircle2, 
  Clock, XCircle, ArrowUpRight, Copy, Check, 
  Mail, RefreshCw, Layers, ExternalLink, AlertCircle, ShoppingBag,
  Eye, FileCheck, X
} from 'lucide-react';

export default function AdminOrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [previewProofImage, setPreviewProofImage] = useState<string | null>(null);

  // Status edit modal state
  const [newStatus, setNewStatus] = useState('');
  const [newTracking, setNewTracking] = useState('');
  const [newCarrier, setNewCarrier] = useState('');
  const [newDelivery, setNewDelivery] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState<string | null>(null);
  const [resendMsg, setResendMsg] = useState<string | null>(null);
  const [copiedTracking, setCopiedTracking] = useState<string | null>(null);

  const fetchOrders = () => {
    setIsLoading(true);
    api.admin.orders.list({
      status: statusFilter,
      search: searchQuery,
      limit: 50,
    })
      .then((res: any) => {
        setOrders(res.items || []);
        setTotalCount(res.total || 0);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user) {
      fetchOrders();
      api.admin.stats().then(setStats).catch(console.error);
    }
  }, [user, loading, router, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleOpenOrder = (order: any) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setNewTracking(order.trackingNumber || '');
    setNewCarrier(order.carrier || '');
    setNewDelivery(order.estimatedDelivery || '');
    setUpdateMsg(null);
    setResendMsg(null);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setIsUpdating(true);
    setUpdateMsg(null);

    try {
      const updated = await api.admin.orders.updateStatus(selectedOrder.id, {
        status: newStatus,
        trackingNumber: newTracking,
        carrier: newCarrier,
        estimatedDelivery: newDelivery,
      });
      setSelectedOrder(updated);
      setUpdateMsg('Order status and shipment details updated successfully!');
      fetchOrders();
      setTimeout(() => setUpdateMsg(null), 3500);
    } catch (err: any) {
      setUpdateMsg(`Update failed: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResendEmail = async () => {
    if (!selectedOrder) return;
    setResendMsg('Dispatching confirmation email via Hostinger SMTP...');

    try {
      const res = await api.admin.orders.resendEmail(selectedOrder.id);
      setResendMsg(res.message || 'Email re-dispatched successfully!');
      setTimeout(() => setResendMsg(null), 4000);
    } catch (err: any) {
      setResendMsg(`Failed to resend: ${err.message}`);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTracking(key);
    setTimeout(() => setCopiedTracking(null), 2500);
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
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
                <Package className="w-4 h-4" />
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                Store Orders
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Track customer purchases, update courier delivery stages, and inspect on-chain settlement receipts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchOrders()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-all border border-slate-200 active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Orders</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Summary Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1 sm:space-y-2">
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block truncate">Total Store Orders</span>
              <p className="text-xl sm:text-3xl font-black text-slate-900 font-mono">{stats.totalOrders || 0}</p>
              <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">All registered shipments</p>
            </div>

            <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1 sm:space-y-2">
              <span className="text-[10px] sm:text-xs font-bold text-emerald-700 uppercase tracking-wider block truncate">Total Volume (USD)</span>
              <p className="text-xl sm:text-3xl font-black text-emerald-700 font-mono truncate">${(stats.totalRevenueUsd || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">100% routed to escrow</p>
            </div>

            <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1 sm:space-y-2">
              <span className="text-[10px] sm:text-xs font-bold text-blue-700 uppercase tracking-wider block truncate">In Transit</span>
              <p className="text-xl sm:text-3xl font-black text-blue-700 font-mono">{stats.inTransitOrders || 0}</p>
              <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">Courier dispatches active</p>
            </div>

            <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1 sm:space-y-2">
              <span className="text-[10px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider block truncate">Delivered</span>
              <p className="text-xl sm:text-3xl font-black text-slate-900 font-mono">{stats.deliveredOrders || 0}</p>
              <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">Completed door-to-door</p>
            </div>
          </div>
        )}

        {/* Filters & Search Toolbar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
            {['ALL', 'PENDING_VERIFICATION', 'CONFIRMED', 'PROCESSING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {st === 'ALL' ? 'All Orders' : st === 'PENDING_VERIFICATION' ? 'Pending Proof' : st.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search order #, customer, tracking..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:bg-white"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs shrink-0 cursor-pointer"
            >
              Search
            </button>
          </form>

        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="text-center py-16 space-y-2">
              <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500">Loading orders catalog...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No Orders Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No orders match your filter &ldquo;{statusFilter}&rdquo; {searchQuery && `and search "${searchQuery}"`}.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full min-w-[680px] text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-5">Order # / Date</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Merchandise</th>
                    <th className="py-3.5 px-4">Total Amount</th>
                    <th className="py-3.5 px-4">Courier / Tracking</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {orders.map((order) => {
                    const items: any[] = Array.isArray(order.items) ? order.items : [];
                    const isDelivered = order.status === 'DELIVERED';
                    const isInTransit = order.status === 'IN_TRANSIT';

                    return (
                      <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                        
                        {/* Order Number & Date */}
                        <td className="py-4 px-5">
                          <span className="font-bold text-slate-900 font-mono block">
                            #{order.orderNumber}
                          </span>
                          <span className="text-[11px] text-slate-400 block">
                            {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {order.paymentProof && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewProofImage(order.paymentProof);
                              }}
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-md mt-1 cursor-pointer"
                              title="Inspect Payment Proof Screenshot"
                            >
                              <Eye className="w-3 h-3 text-emerald-600" />
                              <span>View Proof</span>
                            </button>
                          )}
                        </td>

                        {/* Customer */}
                        <td className="py-4 px-4">
                          <span className="font-bold text-slate-900 block truncate max-w-[160px]">
                            {order.customerName}
                          </span>
                          <span className="text-[11px] text-slate-500 truncate max-w-[160px] block">
                            {order.customerEmail}
                          </span>
                        </td>

                        {/* Merchandise preview */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            {items[0]?.image && (
                              <img 
                                src={items[0].image} 
                                alt={items[0].name || 'item'} 
                                className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-50"
                              />
                            )}
                            <div className="min-w-0">
                              <span className="font-medium text-slate-800 truncate block max-w-[160px]">
                                {items[0]?.name || 'Item'}
                              </span>
                              {items.length > 1 && (
                                <span className="text-[10px] text-primary-700 font-bold">
                                  +{items.length - 1} more item{items.length > 2 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Total Amount */}
                        <td className="py-4 px-4">
                          <span className="font-bold text-slate-900 font-mono block">
                            ${order.totalAmount.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-emerald-600 font-mono font-bold">
                            {order.cryptoAmount} {order.cryptoSymbol}
                          </span>
                        </td>

                        {/* Tracking */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-700 font-bold">
                            <span>{order.trackingNumber}</span>
                            <button
                              onClick={() => handleCopy(order.trackingNumber, `trk-${order.id}`)}
                              className="text-slate-400 hover:text-slate-700 p-0.5"
                              title="Copy Tracking"
                            >
                              {copiedTracking === `trk-${order.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                          <span className="text-[10px] text-slate-400 block">{order.carrier}</span>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4">
                          <span className={`inline-block text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                            isDelivered
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isInTransit
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : order.status === 'PENDING_VERIFICATION'
                              ? 'bg-amber-50 text-amber-900 border-amber-300'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {order.status === 'PENDING_VERIFICATION' ? 'Pending Proof' : order.status}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="py-4 px-5 text-right">
                          <button
                            onClick={() => handleOpenOrder(order)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors"
                          >
                            Manage
                          </button>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Order Details & Management Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-fade-in-up">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 max-w-2xl w-full p-4 sm:p-7 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto relative">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-sm cursor-pointer"
            >
              ✕
            </button>

            {/* Modal Header */}
            <div className="space-y-1 pr-8">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900 font-mono">
                  Order #{selectedOrder.orderNumber}
                </h2>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {selectedOrder.status}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Created on {new Date(selectedOrder.createdAt).toLocaleString()}
              </p>
            </div>

            {updateMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium">
                {updateMsg}
              </div>
            )}

            {resendMsg && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 font-medium">
                {resendMsg}
              </div>
            )}

            {/* Customer & Delivery Box */}
            <div className="grid sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Customer Info</span>
                <p className="font-bold text-slate-900">{selectedOrder.customerName}</p>
                <p className="text-slate-600">{selectedOrder.customerEmail}</p>
                {selectedOrder.user && (
                  <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-100/60 px-1.5 py-0.2 rounded">
                    Registered Buyer #{selectedOrder.user.id}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Shipping Destination</span>
                <p className="text-slate-800 leading-snug">
                  {selectedOrder.shippingAddress?.address} {selectedOrder.shippingAddress?.apartment && `Apt ${selectedOrder.shippingAddress?.apartment}`}<br />
                  {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.stateProvince} {selectedOrder.shippingAddress?.zipCode}<br />
                  {selectedOrder.shippingAddress?.country}
                </p>
              </div>
            </div>

            {/* Merchandise Items List */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Order Items ({Array.isArray(selectedOrder.items) ? selectedOrder.items.length : 0})
              </h3>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl p-4 bg-white space-y-2">
                {Array.isArray(selectedOrder.items) && selectedOrder.items.map((item: any, idx: number) => (
                  <div key={idx} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      {item.image && (
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                        />
                      )}
                      <div>
                        <p className="font-bold text-slate-900">{item.name}</p>
                        <p className="text-[11px] text-slate-500">
                          Qty: {item.quantity || 1} • ${item.price?.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <span className="font-bold font-mono text-slate-900">
                      ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                    </span>
                  </div>
                ))}

                <div className="pt-3 flex justify-between text-sm font-bold border-t border-slate-200 text-slate-900">
                  <span>Total Settled:</span>
                  <span className="font-mono text-emerald-700">${selectedOrder.totalAmount.toFixed(2)} ({selectedOrder.cryptoAmount} {selectedOrder.cryptoSymbol})</span>
                </div>
              </div>
            </div>

            {/* Payment Proof Review Box */}
            {selectedOrder.paymentProof && (
              <div className="bg-amber-50/80 border-2 border-amber-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-900 flex items-center gap-1.5 uppercase tracking-wider">
                    <FileCheck className="w-4 h-4 text-amber-700" />
                    Buyer Payment Proof Screenshot
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    selectedOrder.status === 'PENDING_VERIFICATION' 
                      ? 'bg-amber-200 text-amber-900 border-amber-300' 
                      : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  }`}>
                    {selectedOrder.status === 'PENDING_VERIFICATION' ? 'Action: Verification Needed' : 'Verified by Admin'}
                  </span>
                </div>

                <div className="flex items-center gap-3.5 bg-white p-3 rounded-xl border border-amber-200">
                  <div 
                    onClick={() => setPreviewProofImage(selectedOrder.paymentProof)}
                    className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 shrink-0 relative bg-slate-100 cursor-pointer group hover:ring-2 hover:ring-primary-500 transition-all"
                  >
                    <img
                      src={selectedOrder.paymentProof}
                      alt="Order Payment Proof"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold">
                      <Eye className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-xs font-bold text-slate-900">
                      Payment Screenshot Document
                    </p>
                    <p className="text-[11px] text-slate-500 truncate font-mono">
                      {selectedOrder.paymentProof}
                    </p>
                    <button
                      type="button"
                      onClick={() => setPreviewProofImage(selectedOrder.paymentProof)}
                      className="text-xs font-bold text-primary-600 hover:text-primary-800 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Open Fullscreen Lightbox</span>
                    </button>
                  </div>

                  {selectedOrder.status === 'PENDING_VERIFICATION' && (
                    <button
                      type="button"
                      onClick={() => setNewStatus('CONFIRMED')}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shrink-0 shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve Payment</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Status & Logistics Management Form */}
            <form onSubmit={handleUpdateStatus} className="space-y-4 pt-2 border-t border-slate-200">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-primary-600" />
                Update Order & Courier Tracking
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Order Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:border-primary-500"
                  >
                    <option value="PENDING_VERIFICATION">PENDING_VERIFICATION (Proof Review)</option>
                    <option value="CONFIRMED">CONFIRMED (Payment Verified)</option>
                    <option value="PROCESSING">PROCESSING (Packaging)</option>
                    <option value="IN_TRANSIT">IN_TRANSIT (Courier Dispatched)</option>
                    <option value="DELIVERED">DELIVERED (Fulfilled)</option>
                    <option value="CANCELLED">CANCELLED (Refunded)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Courier Carrier
                  </label>
                  <input
                    type="text"
                    value={newCarrier}
                    onChange={(e) => setNewCarrier(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Tracking Number
                  </label>
                  <input
                    type="text"
                    value={newTracking}
                    onChange={(e) => setNewTracking(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Estimated Delivery Window
                  </label>
                  <input
                    type="text"
                    value={newDelivery}
                    onChange={(e) => setNewDelivery(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleResendEmail}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors inline-flex items-center justify-center gap-1.5 border border-slate-200 cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-primary-600" />
                  <span>Resend Confirmation Email</span>
                </button>

                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-primary-600/20 cursor-pointer text-center"
                >
                  {isUpdating ? 'Saving...' : 'Save Order Changes'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Proof Lightbox Modal */}
      {previewProofImage && (
        <div 
          onClick={() => setPreviewProofImage(null)}
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[92vh] bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden flex flex-col shadow-2xl w-full"
          >
            <div className="p-3 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between text-white text-xs">
              <span className="font-bold flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                Proof of Payment Screenshot
              </span>
              <button
                type="button"
                onClick={() => setPreviewProofImage(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 overflow-auto flex items-center justify-center bg-black/50 min-h-[300px]">
              <img
                src={previewProofImage}
                alt="Full Payment Proof"
                className="max-h-[78vh] w-auto max-w-full object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

    </AdminShell>
  );
}
