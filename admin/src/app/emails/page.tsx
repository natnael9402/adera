'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import AdminShell from '@/components/AdminShell';
import { 
  Mail, Search, RefreshCw, CheckCircle2, 
  AlertCircle, Eye, Send, ArrowRight, ShieldCheck, 
  ExternalLink, Layers, Inbox, Clock,
  PenSquare, Sparkles, User, Tag, Check, X
} from 'lucide-react';

const TEMPLATE_FILTERS = [
  { id: 'ALL', label: 'All Templates' },
  { id: 'ADMIN_CUSTOM', label: '✍️ Direct Admin Emails' },
  { id: 'ORDER_RECEIPT', label: '🛒 Order Receipts' },
  { id: 'VERIFICATION_CODE', label: '🔐 Verification Codes' },
  { id: 'NEWSLETTER', label: '✨ Newsletter Welcomes' },
  { id: 'CONTACT_INQUIRY', label: '📩 Contact Inquiries' },
  { id: 'CONTACT_AUTOREPLY', label: '💬 Contact Auto-replies' },
  { id: 'ADMIN_ORDER_ALERT', label: '🔔 Admin Alerts' },
];

const PRESETS = [
  {
    id: 'CUSTOM',
    label: 'Blank / Custom',
    category: 'DIRECT_MESSAGE',
    subject: '',
    message: '',
  },
  {
    id: 'DONOR_THANKS',
    label: 'Donor Appreciation',
    category: 'DONOR_OUTREACH',
    subject: 'Heartfelt Gratitude from Adera Foundation & Impact Update',
    message: `Thank you immensely for your generous financial contribution to our humanitarian programs in Ethiopia.\n\nYour philanthropic leadership is making an indelible difference on the ground. We are pleased to report that 100% of your allocated funds are escrowed and directed toward vital community resources, including medical access and educational materials.\n\nIf you would like a customized impact summary or tax receipt certificate, simply reply directly to this communication.\n\nWith profound gratitude,\nThe Adera Foundation Executive Office`,
  },
  {
    id: 'ORDER_UPDATE',
    label: 'Order Assistance',
    category: 'ORDER_UPDATE',
    subject: 'Important Update Regarding Your Adera Impact Goods Order',
    message: `Thank you for shopping with purpose on the Adera Impact Storefront.\n\nWe are writing to provide an update regarding your recent order. Our fulfillment team is coordinating courier logistics to ensure your package arrives in pristine condition.\n\nYou can track live transit milestones at any time using our order tracking portal.\n\nPlease don't hesitate to reach out if you have any questions or require address adjustments before dispatch.\n\nWarm regards,\nAdera Fulfillment Team`,
  },
  {
    id: 'COMMUNITY_UPDATE',
    label: 'Community Announcement',
    category: 'ANNOUNCEMENT',
    subject: 'Adera Foundation Official Update: Community Milestones',
    message: `Dear valued member of the Adera community,\n\nWe are excited to share key updates regarding our on-chain humanitarian network and fair trade storefront initiatives.\n\nThrough our collective efforts, we continue to expand access to transparent giving, empowering local artisans and remote schools with essential technology and supplies.\n\nThank you for being an indispensable part of this mission. Explore our newly verified causes or connect with our support coordinators for further engagement.\n\nSincerely,\nAdera Operations Team`,
  },
  {
    id: 'ACCOUNT_NOTICE',
    label: 'Account Verification Help',
    category: 'ACCOUNT_NOTICE',
    subject: 'Assistance with Your Adera Foundation Account',
    message: `We noticed you recently registered or requested assistance on the Adera platform.\n\nOur administrative desk is available to assist you with account verification, profile preferences, or donation questions.\n\nIf you need a new verification token or assistance accessing platform features, please reply directly to this email.\n\nBest regards,\nAdera Foundation Member Support`,
  },
];

function AdminEmailsContent() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  // Email Preview Modal
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);

  // Direct Compose Email State
  const searchParams = useSearchParams();
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeTab, setComposeTab] = useState<'write' | 'preview'>('write');
  const [composeForm, setComposeForm] = useState({
    recipient: '',
    recipientName: '',
    category: 'DIRECT_MESSAGE',
    subject: '',
    message: '',
  });
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  // Check URL query parameters (e.g. /emails?compose=true&to=user@example.com&name=John)
  useEffect(() => {
    const shouldCompose = searchParams.get('compose') === 'true';
    const toParam = searchParams.get('to');
    const nameParam = searchParams.get('name');
    const subjectParam = searchParams.get('subject');
    const categoryParam = searchParams.get('category');

    if (shouldCompose || toParam) {
      setIsComposeOpen(true);
      setComposeForm((prev) => ({
        ...prev,
        recipient: toParam || prev.recipient,
        recipientName: nameParam || prev.recipientName,
        subject: subjectParam || prev.subject,
        category: categoryParam || prev.category,
      }));
    }
  }, [searchParams]);

  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    if (preset.id === 'CUSTOM') {
      setComposeForm((prev) => ({
        ...prev,
        category: 'DIRECT_MESSAGE',
      }));
      return;
    }
    setComposeForm((prev) => ({
      ...prev,
      category: preset.category,
      subject: preset.subject,
      message: preset.message,
    }));
  };

  const handleSendDirectEmail = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSendError(null);
    setSendSuccess(null);

    if (!composeForm.recipient.trim() || !composeForm.recipient.includes('@')) {
      setSendError('Please enter a valid recipient email address.');
      return;
    }
    if (!composeForm.subject.trim()) {
      setSendError('Please enter an email subject line.');
      return;
    }
    if (!composeForm.message.trim() || composeForm.message.trim().length < 5) {
      setSendError('Please enter message content of at least 5 characters.');
      return;
    }

    setIsSending(true);
    try {
      const res = await api.admin.emails.sendDirect({
        recipient: composeForm.recipient.trim(),
        recipientName: composeForm.recipientName.trim() || undefined,
        subject: composeForm.subject.trim(),
        message: composeForm.message.trim(),
        category: composeForm.category,
      });

      setSendSuccess(res.message || 'Email successfully dispatched!');
      fetchEmailLogs();
      api.admin.stats().then(setStats).catch(console.error);

      setTimeout(() => {
        setIsComposeOpen(false);
        setSendSuccess(null);
        setComposeForm({
          recipient: '',
          recipientName: '',
          category: 'DIRECT_MESSAGE',
          subject: '',
          message: '',
        });
        setComposeTab('write');
      }, 2000);
    } catch (err: any) {
      setSendError(err.message || 'Failed to dispatch email. Please check your SMTP configuration.');
    } finally {
      setIsSending(false);
    }
  };

  // Generate live preview HTML for compose modal
  const livePreviewHtml = useMemo(() => {
    const displayName = composeForm.recipientName.trim() || composeForm.recipient.trim().split('@')[0] || 'Community Member';
    const rawParagraphs = composeForm.message
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);

    const formattedParagraphs = (rawParagraphs.length > 0 ? rawParagraphs : ['Your message paragraphs will appear formatted here...'])
      .map((para) => {
        let content = para.replace(/\n/g, '<br />');
        content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
        content = content.replace(
          /\[(.*?)\]\((https?:\/\/[^\s]+)\)/g,
          '<a href="$2" style="color: #059669; text-decoration: underline; font-weight: 600;" target="_blank">$1</a>',
        );
        return `<p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.75; color: #334155;">${content}</p>`;
      })
      .join('');

    const categoryBadges: Record<string, { label: string; bg: string; text: string; border: string }> = {
      ANNOUNCEMENT: { label: 'Official Announcement', bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
      DONOR_OUTREACH: { label: 'Donor Relations', bg: '#fdf2f8', text: '#be185d', border: '#fbcfe8' },
      ORDER_UPDATE: { label: 'Store Order Care', bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' },
      ACCOUNT_NOTICE: { label: 'Account Notice', bg: '#fefce8', text: '#a16207', border: '#fef08a' },
      DIRECT_MESSAGE: { label: 'Direct Communication', bg: '#f8fafc', text: '#475569', border: '#e2e8f0' },
    };

    const badge = categoryBadges[composeForm.category] || categoryBadges.DIRECT_MESSAGE;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #1e293b; }
    .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.04); }
    .header { background: linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%); padding: 26px 30px; text-align: center; color: #ffffff; }
    .title { font-size: 22px; font-weight: 900; letter-spacing: -0.5px; }
    .body { padding: 32px 30px; }
    .footer { padding: 20px 30px; background-color: #f1f5f9; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #64748b; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="title">Adera <span style="font-size: 12px; padding: 2px 6px; background: rgba(255,255,255,0.2); border-radius: 4px; vertical-align: middle;">Foundation</span></div>
      <div style="font-size: 11px; color: #a7f3d0; margin-top: 3px;">Blockchain-Powered Philanthropy</div>
    </div>
    <div class="body">
      <div style="margin-bottom: 20px;">
        <span style="display: inline-block; padding: 3px 12px; background-color: ${badge.bg}; color: ${badge.text}; font-size: 10px; font-weight: 700; border-radius: 9999px; border: 1px solid ${badge.border}; text-transform: uppercase;">
          ${badge.label}
        </span>
        <h2 style="margin: 12px 0 4px 0; font-size: 20px; font-weight: 900; color: #0f172a;">
          ${composeForm.subject || '(No subject specified)'}
        </h2>
        <p style="margin: 0; font-size: 12px; color: #64748b;">Direct communication from Adera Administration</p>
      </div>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <p style="margin: 0 0 14px 0; font-size: 14px; font-weight: 700; color: #0f172a;">
          Hello ${displayName},
        </p>
        ${formattedParagraphs}
      </div>
      <div style="padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #475569;">
        <strong>Adera Foundation Executive Team</strong><br>
        <span style="color: #94a3b8; font-size: 11px;">Official Direct Dispatch &bull; info@aderafoundation.com</span>
      </div>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Adera Foundation &bull; Global On-Chain Humanitarian Network
    </div>
  </div>
</body>
</html>
    `;
  }, [composeForm]);

  const fetchEmailLogs = () => {
    setIsLoading(true);
    api.admin.emails.list({
      template: selectedTemplate,
      search: searchQuery,
      limit: 50,
    })
      .then((res: any) => {
        setEmailLogs(res.items || []);
        setTotalCount(res.total || 0);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user) {
      fetchEmailLogs();
      api.admin.stats().then(setStats).catch(console.error);
    }
  }, [user, loading, router, selectedTemplate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEmailLogs();
  };

  const handleOpenPreview = async (item: any) => {
    setPreviewLoading(true);
    setResendStatus(null);
    try {
      const full = await api.admin.emails.get(item.id);
      setSelectedEmail(full);
    } catch (err: any) {
      console.error(err);
      setSelectedEmail(item);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleResend = async (id: number) => {
    setResendLoading(true);
    setResendStatus('Re-dispatching email via Hostinger SMTP...');

    try {
      const res = await api.admin.emails.resend(id);
      setResendStatus(res.message || 'Email re-dispatched successfully!');
      fetchEmailLogs();
      setTimeout(() => setResendStatus(null), 4000);
    } catch (err: any) {
      setResendStatus(`Failed to resend: ${err.message}`);
    } finally {
      setResendLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const emailStats = stats?.emailStats || { total: totalCount, sentToday: 0, successRate: '100.0%', failedTotal: 0 };

  return (
    <AdminShell>
      

      <div className="max-w-7xl mx-auto space-y-5 sm:space-y-8">
        
        {/* Top Header */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-4 sm:p-6 lg:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                Email Center
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Audit all system dispatches, verify SMTP deliverability via Hostinger, inspect rendered HTML templates, and re-send emails.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setIsComposeOpen(true);
                setSendSuccess(null);
                setSendError(null);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer"
            >
              <PenSquare className="w-3.5 h-3.5" />
              <span>Compose Email</span>
            </button>

            <button
              onClick={() => fetchEmailLogs()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-all border border-slate-200 active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Logs</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1 sm:space-y-2">
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block truncate">Total Dispatched</span>
            <p className="text-xl sm:text-3xl font-black text-slate-900 font-mono">{emailStats.total || totalCount}</p>
            <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">All outbound emails</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Dispatched Today</span>
            <p className="text-3xl font-black text-emerald-700 font-mono">{emailStats.sentToday || 0}</p>
            <p className="text-[11px] text-slate-500">Orders, receipts & codes</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Delivery Rate</span>
            <p className="text-3xl font-black text-blue-700 font-mono">{emailStats.successRate || '100%'}</p>
            <p className="text-[11px] text-slate-500">Hostinger SMTP health</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">Failed Attempts</span>
            <p className="text-3xl font-black text-rose-700 font-mono">{emailStats.failedTotal || 0}</p>
            <p className="text-[11px] text-slate-500">Bounces or timeouts</p>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
            {TEMPLATE_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedTemplate(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedTemplate === f.id
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
                placeholder="Search recipient or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:bg-white"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              Search
            </button>
          </form>

        </div>

        {/* Email Logs Table */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="text-center py-16 space-y-2">
              <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500">Loading email dispatch records...</p>
            </div>
          ) : emailLogs.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <Inbox className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No Email Logs Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No emails match your filter &ldquo;{selectedTemplate}&rdquo; {searchQuery && `and search "${searchQuery}"`}.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full min-w-[650px] text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-5">Recipient</th>
                    <th className="py-3.5 px-4">Subject</th>
                    <th className="py-3.5 px-4">Template</th>
                    <th className="py-3.5 px-4">Dispatched At</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {emailLogs.map((item) => {
                    const isSuccess = item.status === 'SENT';

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        
                        {/* Recipient */}
                        <td className="py-4 px-5">
                          <span className="font-bold text-slate-900 block truncate max-w-[180px]">
                            {item.recipientName || 'Verified Recipient'}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono truncate max-w-[180px] block">
                            {item.recipient}
                          </span>
                        </td>

                        {/* Subject */}
                        <td className="py-4 px-4">
                          <span className="font-medium text-slate-800 line-clamp-1 max-w-[280px]">
                            {item.subject}
                          </span>
                          {item.errorMessage && (
                            <span className="text-[10px] text-rose-600 block mt-0.5">
                              Err: {item.errorMessage}
                            </span>
                          )}
                        </td>

                        {/* Template */}
                        <td className="py-4 px-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase font-mono ${
                            item.template === 'ADMIN_CUSTOM'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {item.template === 'ADMIN_CUSTOM' ? '✍️ Direct Email' : item.template}
                          </span>
                        </td>

                        {/* Dispatched At */}
                        <td className="py-4 px-4 font-mono text-[11px] text-slate-500">
                          {new Date(item.sentAt).toLocaleDateString()} {new Date(item.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                            isSuccess
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {isSuccess ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <AlertCircle className="w-3 h-3 text-rose-600" />}
                            <span>{item.status}</span>
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 text-right space-x-2">
                          <button
                            onClick={() => handleOpenPreview(item)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors inline-flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5 text-primary-600" />
                            <span>Preview</span>
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

      {/* Interactive HTML Email Viewer Modal */}
      {selectedEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-5 max-h-[92vh] flex flex-col relative">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                    {selectedEmail.template}
                  </span>
                  <h3 className="text-base font-black text-slate-900 truncate max-w-md">
                    {selectedEmail.subject}
                  </h3>
                </div>
                <p className="text-xs text-slate-500">
                  Recipient: <strong className="text-slate-800">{selectedEmail.recipient}</strong> • Sent on {new Date(selectedEmail.sentAt).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => setSelectedEmail(null)}
                className="text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-sm shrink-0"
              >
                ✕
              </button>
            </div>

            {resendStatus && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium">
                {resendStatus}
              </div>
            )}

            {/* Rendered HTML Container */}
            <div className="flex-1 bg-slate-100 rounded-2xl p-3 border border-slate-200 overflow-hidden flex flex-col">
              <div className="bg-white rounded-xl flex-1 border border-slate-200 overflow-hidden shadow-xs">
                {selectedEmail.preview ? (
                  <iframe
                    title="Email Preview"
                    srcDoc={selectedEmail.preview}
                    className="w-full h-full min-h-[380px] border-0"
                    sandbox="allow-same-origin"
                  />
                ) : (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No rendered HTML preview available for this log entry.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="flex items-center justify-between gap-4 pt-1">
              <div className="text-xs text-slate-400 font-mono">
                Log ID: #{selectedEmail.id} • Status: {selectedEmail.status}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleResend(selectedEmail.id)}
                  disabled={resendLoading}
                  className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-primary-600/20 inline-flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{resendLoading ? 'Dispatching...' : 'Re-send Email to Recipient'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* COMPOSE DIRECT EMAIL MODAL */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-5 max-h-[92vh] flex flex-col relative">
            
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Direct Dispatch
                  </span>
                  <h3 className="text-lg font-black text-slate-900">
                    Compose & Dispatch Email
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Write directly to any community user, buyer, or donor with official Adera branding.
                </p>
              </div>

              <button
                onClick={() => setIsComposeOpen(false)}
                className="text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-sm shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Notifications */}
            {sendSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{sendSuccess}</span>
              </div>
            )}
            {sendError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{sendError}</span>
              </div>
            )}

            {/* Modal Tabs & Preset Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
                <button
                  type="button"
                  onClick={() => setComposeTab('write')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    composeTab === 'write' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Edit Message
                </button>
                <button
                  type="button"
                  onClick={() => setComposeTab('preview')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    composeTab === 'preview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Live Preview
                </button>
              </div>

              {/* Quick Fill Presets */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Presets:
                </span>
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg whitespace-nowrap transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Body */}
            {composeTab === 'write' ? (
              <form onSubmit={handleSendDirectEmail} id="compose-email-form" className="space-y-4 overflow-y-auto flex-1 pr-1">
                {/* To & Name Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-400" />
                      Recipient Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. donor@aderafoundation.com"
                      value={composeForm.recipient}
                      onChange={(e) => setComposeForm({ ...composeForm, recipient: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      Recipient Name <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mihira Kassa"
                      value={composeForm.recipientName}
                      onChange={(e) => setComposeForm({ ...composeForm, recipientName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Category & Subject Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-slate-400" />
                      Email Category
                    </label>
                    <select
                      value={composeForm.category}
                      onChange={(e) => setComposeForm({ ...composeForm, category: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                    >
                      <option value="DIRECT_MESSAGE">Direct Communication</option>
                      <option value="DONOR_OUTREACH">Donor Relations</option>
                      <option value="ORDER_UPDATE">Store Order Care</option>
                      <option value="ANNOUNCEMENT">Official Announcement</option>
                      <option value="ACCOUNT_NOTICE">Account Notice</option>
                    </select>
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      Subject Line <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Update regarding your recent contribution"
                      value={composeForm.subject}
                      onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Message Content */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      Message Body <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Supports **bold**, *italic*, [links](https://...), and blank line paragraphs
                    </span>
                  </div>
                  <textarea
                    required
                    rows={8}
                    placeholder="Write your email here. Separate paragraphs with an empty line..."
                    value={composeForm.message}
                    onChange={(e) => setComposeForm({ ...composeForm, message: e.target.value })}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white font-mono leading-relaxed resize-y"
                  />
                </div>
              </form>
            ) : (
              /* Live Rendered HTML Tab */
              <div className="flex-1 bg-slate-100 rounded-2xl p-3 border border-slate-200 overflow-hidden flex flex-col min-h-[360px]">
                <div className="bg-white rounded-xl flex-1 border border-slate-200 overflow-hidden shadow-xs">
                  <iframe
                    title="Direct Email Preview"
                    srcDoc={livePreviewHtml}
                    className="w-full h-full min-h-[350px] border-0"
                    sandbox="allow-same-origin"
                  />
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <div className="text-[11px] text-slate-400">
                Dispatched via verified Hostinger SMTP &bull; info@aderafoundation.com
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  disabled={isSending}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => handleSendDirectEmail()}
                  disabled={isSending}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/20 inline-flex items-center gap-2"
                >
                  {isSending ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Dispatching Email...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Email Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </AdminShell>
  );
}

export default function AdminEmailsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AdminEmailsContent />
    </Suspense>
  );
}

