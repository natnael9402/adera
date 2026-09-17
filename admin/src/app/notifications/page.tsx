'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import AdminShell from '@/components/AdminShell';
import { 
  Bell, Send, Users, CheckCircle2, ShieldCheck, 
  Sparkles, Mail, ShoppingBag, Heart, AlertCircle, 
  Trash2, RefreshCw, ExternalLink, Filter, Search, Check
} from 'lucide-react';

export default function AdminNotificationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('ANNOUNCEMENT');
  const [targetAudience, setTargetAudience] = useState<'ALL' | 'DONORS' | 'BUYERS' | 'ADMIN'>('ALL');
  const [specificEmail, setSpecificEmail] = useState('');
  const [link, setLink] = useState('');

  const fetchNotifications = () => {
    setIsLoading(true);
    api.admin.notifications.list({ limit: 50 })
      .then((res: any) => {
        setNotifications(res.items || []);
        setTotal(res.total || 0);
        setUnreadCount(res.unreadCount || 0);
      })
      .catch((err: any) => console.error('Failed to fetch notifications:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user) fetchNotifications();
  }, [user, loading, router]);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setErrorMsg('Please provide both a title and message.');
      return;
    }

    setIsSending(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await api.admin.notifications.broadcast({
        title: title.trim(),
        message: message.trim(),
        type,
        targetAudience,
        specificEmail: specificEmail.trim() || undefined,
        link: link.trim() || undefined,
      });

      setSuccessMsg('Notification dispatched successfully to in-app notification centers!');
      setTitle('');
      setMessage('');
      setSpecificEmail('');
      setLink('');
      fetchNotifications();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to dispatch notification');
    } finally {
      setIsSending(false);
    }
  };

  const getBadgeColor = (targetRole?: string) => {
    switch (targetRole) {
      case 'ALL':
        return 'bg-slate-900 text-white';
      case 'BUYER':
        return 'bg-blue-600 text-white';
      case 'USER':
        return 'bg-emerald-600 text-white';
      case 'ADMIN':
        return 'bg-purple-600 text-white';
      default:
        return 'bg-slate-700 text-white';
    }
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
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 font-sans">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Bell className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600 shrink-0" />
              <span>Notification Dispatch Console</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Broadcast high-priority system announcements, donation matching events, or targeted account alerts across all client apps.
            </p>
          </div>

          <button
            onClick={fetchNotifications}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Feed</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Notifications</span>
            <p className="text-xl sm:text-3xl font-black text-slate-900 font-mono">{total}</p>
            <p className="text-[10px] sm:text-xs text-slate-400">Recorded in PostgreSQL</p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block">Unread Across Users</span>
            <p className="text-xl sm:text-3xl font-black text-emerald-600 font-mono">{unreadCount}</p>
            <p className="text-[10px] sm:text-xs text-slate-400">Pending user views</p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block">Active Channels</span>
            <p className="text-xl sm:text-3xl font-black text-slate-900 font-mono">4</p>
            <p className="text-[10px] sm:text-xs text-slate-400">All, Donors, Buyers, Admin</p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block">Real-Time Sync</span>
            <p className="text-xl sm:text-3xl font-black text-emerald-600 font-mono">25s</p>
            <p className="text-[10px] sm:text-xs text-slate-400">Client pulse interval</p>
          </div>
        </div>

        {/* Compose Broadcast Drawer */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center border border-primary-200">
                <Send className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Compose System Broadcast
                </h3>
                <p className="text-xs text-slate-500">
                  Broadcasts appear instantly inside client navigation bars and modals.
                </p>
              </div>
            </div>
          </div>

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 font-bold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleBroadcast} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Target Audience
                </label>
                <select
                  value={targetAudience}
                  onChange={(e: any) => setTargetAudience(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:border-primary-500"
                >
                  <option value="ALL">All Users & Visitors (Global)</option>
                  <option value="DONORS">Donors & Supporters</option>
                  <option value="BUYERS">Store Buyers</option>
                  <option value="ADMIN">Internal Admin Only</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Notification Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:border-primary-500"
                >
                  <option value="ANNOUNCEMENT">Platform Announcement</option>
                  <option value="DONATION_VERIFIED">Donation Match / Verification</option>
                  <option value="ORDER_ACCEPTED">Store Promotion / Dispatch</option>
                  <option value="SECURITY">Security / System Notice</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Specific Email (Optional)
                </label>
                <input
                  type="email"
                  placeholder="Leave empty for group broadcast"
                  value={specificEmail}
                  onChange={(e) => setSpecificEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Notification Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Critical Water Well Funded! 💧"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Action Link URL (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. /causes or /donors"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Message Content <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Write the clear, concise announcement description for client inboxes..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary-500 resize-none leading-relaxed"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSending}
                className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-primary-600/20 flex items-center gap-2 cursor-pointer"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Broadcasting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Dispatch In-App Notification</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* Live Notification Log Table */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Notification History & Dispatch Log
            </h3>
            <span className="text-xs text-slate-400 font-mono font-bold">
              {notifications.length} of {total} shown
            </span>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[700px] text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Date / Time</th>
                  <th className="py-3 px-4">Target Audience</th>
                  <th className="py-3 px-4">Title & Details</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Link Target</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No notifications recorded yet. Broadcast your first announcement above!
                    </td>
                  </tr>
                ) : (
                  notifications.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {item.userEmail ? item.userEmail : item.targetRole || 'ALL'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 max-w-sm">
                        <p className="font-bold text-slate-900 truncate">{item.title}</p>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{item.message}</p>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[10px] text-slate-600 font-bold">
                        {item.type}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-primary-600 truncate max-w-[120px]">
                        {item.link || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${item.isRead ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-800'}`}>
                          {item.isRead ? 'Read' : 'Delivered'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AdminShell>
  );
}
