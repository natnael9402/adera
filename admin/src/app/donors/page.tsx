'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Heart, Pencil, Trash2, Plus, X, Save, Award, AlertCircle, Upload, Image as ImageIcon, Check, RefreshCw, Crown, Shield, ExternalLink, HelpCircle, Loader2, ShieldCheck, Eye, FileCheck, CheckCircle2, Clock, Copy } from 'lucide-react';
import AdminShell from '@/components/AdminShell';
import DonorAvatar, { THEME_AVATAR_PRESETS } from '@/components/DonorAvatar';

interface DonorRecord {
  id: number;
  name: string;
  amount: number;
  date: string;
  avatar?: string;
  title?: string;
  badge?: string;
}

export default function DonorsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [donors, setDonors] = useState<DonorRecord[]>([]);
  const [isEditing, setIsEditing] = useState<DonorRecord | null | boolean>(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    avatar: '',
    title: 'Emerald Patron',
    badge: '🏆 Top Contributor',
  });

  const [avatarMode, setAvatarMode] = useState<'preset' | 'upload' | 'url' | 'dynamic'>('dynamic');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Direct Donations & Payment Proof Verification State
  const [activeTab, setActiveTab] = useState<'DONATIONS' | 'LEADERBOARD'>('DONATIONS');
  const [directDonations, setDirectDonations] = useState<any[]>([]);
  const [donationsLoading, setDonationsLoading] = useState(false);
  const [donationFilter, setDonationFilter] = useState<string>('ALL');
  const [previewProof, setPreviewProof] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<number | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadDonors = () => {
    api.admin.donors.list().then(setDonors).catch(console.error);
  };

  const loadDirectDonations = () => {
    setDonationsLoading(true);
    api.admin.donations.listAll()
      .then((data: any) => {
        setDirectDonations(Array.isArray(data) ? data : data?.items || []);
      })
      .catch((err: any) => console.error('Failed to load direct donations:', err))
      .finally(() => setDonationsLoading(false));
  };

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user) {
      loadDonors();
      loadDirectDonations();
    }
  }, [user, loading, router]);

  const handleUpdateDonationStatus = async (id: number, status: string, reason?: string) => {
    setActionInProgress(id);
    setActionSuccess(null);
    try {
      await api.admin.donations.updateStatus(id, status, reason);
      setActionSuccess(`Donation marked as ${status}. Donor notified via in-app notification & activity log.`);
      loadDirectDonations();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      alert(`Action failed: ${err.message}`);
    } finally {
      setActionInProgress(null);
    }
  };

  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleCopyHash = (hash: string, id: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const pendingDonationsCount = directDonations.filter(d => d.status === 'PENDING_VERIFICATION').length;
  const confirmedDonationsCount = directDonations.filter(d => d.status === 'CONFIRMED').length;
  const totalDirectPledged = directDonations.reduce((sum, d) => sum + (d.amountUsd || 0), 0);

  const filteredDirectDonations = directDonations.filter(d => {
    const matchFilter = donationFilter === 'ALL' || d.status === donationFilter;
    const q = searchTerm.toLowerCase();
    const matchSearch = !q || 
      (d.donorName && d.donorName.toLowerCase().includes(q)) ||
      (d.donorEmail && d.donorEmail.toLowerCase().includes(q)) ||
      (d.cause?.title && d.cause.title.toLowerCase().includes(q)) ||
      (d.txHash && d.txHash.toLowerCase().includes(q));
    return matchFilter && matchSearch;
  });

  const handleOpenAdd = () => {
    setIsEditing(true);
    setFormData({
      name: '',
      amount: '',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      avatar: '',
      title: 'Emerald Patron',
      badge: '🏆 Top Contributor',
    });
    setAvatarMode('dynamic');
  };

  const startEdit = (donor: DonorRecord) => {
    setIsEditing(donor);
    const hasPreset = donor.avatar?.startsWith('preset:');
    const hasCustomUrl = donor.avatar && !hasPreset;
    
    setFormData({
      name: donor.name,
      amount: donor.amount.toString(),
      date: donor.date,
      avatar: donor.avatar || '',
      title: donor.title || 'Emerald Patron',
      badge: donor.badge || '',
    });

    if (hasPreset) {
      setAvatarMode('preset');
    } else if (hasCustomUrl) {
      setAvatarMode('url');
    } else {
      setAvatarMode('dynamic');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size < 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert('Image file size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          setFormData((prev) => ({ ...prev, avatar: data.url }));
          setAvatarMode('upload');
          return;
        }
      }

      // Fallback to local Base64 data URL
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target?.result as string;
        setFormData((prev) => ({ ...prev, avatar: base64Url }));
        setAvatarMode('upload');
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('File upload error:', err);
      // Base64 fallback
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target?.result as string;
        setFormData((prev) => ({ ...prev, avatar: base64Url }));
        setAvatarMode('upload');
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.amount) {
      alert('Please fill out donor name and donation amount.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        amount: parseFloat(formData.amount),
        date: formData.date.trim(),
        avatar: formData.avatar.trim(),
        title: formData.title.trim(),
        badge: formData.badge.trim(),
      };

      if (isEditing && typeof isEditing === 'object' && (isEditing as DonorRecord).id) {
        await api.admin.donors.update((isEditing as DonorRecord).id, payload);
      } else {
        await api.admin.donors.create(payload);
      }

      setIsEditing(null);
      loadDonors();
    } catch (err) {
      console.error(err);
      alert('Failed to save donor record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to remove this donor entry from the leaderboard?')) return;
    try {
      await api.admin.donors.remove(id);
      loadDonors();
    } catch (err) {
      console.error(err);
      alert('Failed to delete donor');
    }
  };

  const filteredDonors = donors.filter((d) =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.title && d.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-rose-500 fill-rose-500/15 shrink-0" />
              <span>Donations & Donor Wall</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Verify payment proof screenshots, inspect transaction records, and manage public donor leaderboard profiles.
            </p>
          </div>

          {activeTab === 'LEADERBOARD' && (
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all shadow-md shadow-primary-600/20 text-xs hover-lift shrink-0 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Donor Profile</span>
            </button>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 gap-2">
          <button
            onClick={() => setActiveTab('DONATIONS')}
            className={`pb-3 px-4 font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors relative cursor-pointer ${
              activeTab === 'DONATIONS'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Direct Donations & Proofs</span>
            {pendingDonationsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white animate-pulse">
                {pendingDonationsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('LEADERBOARD')}
            className={`pb-3 px-4 font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors relative cursor-pointer ${
              activeTab === 'LEADERBOARD'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>Donor Wall Profiles</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-600">
              {donors.length}
            </span>
          </button>
        </div>

        {/* Success / Action Notification Banner */}
        {actionSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl flex items-center gap-3 text-xs font-bold animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* TAB 1: DIRECT DONATIONS & PAYMENT PROOFS */}
        {activeTab === 'DONATIONS' && (
          <div className="space-y-6">
            {/* Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Direct Gifts</div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{directDonations.length}</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/30">
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Pending Review</div>
                <div className="text-xl sm:text-2xl font-black text-amber-600 mt-1 flex items-center gap-2">
                  {pendingDonationsCount}
                  {pendingDonationsCount > 0 && (
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                  )}
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/30">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Verified & Confirmed</div>
                <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">{confirmedDonationsCount}</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Pledged USD</div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1 font-mono">
                  ${totalDirectPledged.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-xl">
                {[
                  { id: 'ALL', label: 'All Donations' },
                  { id: 'PENDING_VERIFICATION', label: `Pending (${pendingDonationsCount})` },
                  { id: 'CONFIRMED', label: 'Confirmed' },
                  { id: 'REJECTED', label: 'Rejected' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setDonationFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      donationFilter === f.id
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={loadDirectDonations}
                  disabled={donationsLoading}
                  title="Refresh list"
                  className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors shrink-0 cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${donationsLoading ? 'animate-spin' : ''}`} />
                </button>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search donor, email, tx, cause..."
                  className="w-full sm:w-64 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-primary-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Direct Donations Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full min-w-[850px] text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider">
                      <th className="px-5 py-3.5">Donor</th>
                      <th className="px-5 py-3.5">Cause</th>
                      <th className="px-5 py-3.5">Amount</th>
                      <th className="px-5 py-3.5">Payment Method & TX</th>
                      <th className="px-5 py-3.5">Proof Screenshot</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDirectDonations.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Donor */}
                        <td className="px-5 py-4">
                          <div className="font-extrabold text-slate-900 text-sm">
                            {d.isAnonymous ? 'Anonymous Donor' : (d.donorName || 'Supporter')}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {d.donorEmail || 'No email provided'}
                          </div>
                        </td>

                        {/* Cause */}
                        <td className="px-5 py-4">
                          <div className="font-bold text-slate-800 line-clamp-1 max-w-[200px]" title={d.cause?.title || 'General Fund'}>
                            {d.cause?.title || 'General Platform Fund'}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            ID #{d.causeId || 'N/A'}
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="px-5 py-4">
                          <div className="font-black text-slate-900 font-mono text-sm">
                            {d.amountCrypto ? `${d.amountCrypto} ${d.cryptoSymbol || 'CRYPTO'}` : `$${(d.amountUsd || 0).toFixed(2)}`}
                          </div>
                          {d.amountUsd && d.amountCrypto && (
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                              ≈ ${Number(d.amountUsd).toFixed(2)} USD
                            </div>
                          )}
                        </td>

                        {/* Method & TX */}
                        <td className="px-5 py-4">
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 font-mono text-[11px] font-bold text-slate-700">
                            <span>{d.paymentMethod || 'DIRECT_TRANSFER'}</span>
                          </div>
                          {d.txHash && (
                            <div className="flex items-center gap-1 mt-1 text-[11px] font-mono text-slate-500">
                              <span className="truncate max-w-[120px]">{d.txHash}</span>
                              <button
                                onClick={() => handleCopyHash(d.txHash, String(d.id))}
                                className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                                title="Copy TX Hash"
                              >
                                {copiedHash === String(d.id) ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          )}
                        </td>

                        {/* Proof Screenshot */}
                        <td className="px-5 py-4">
                          {d.paymentProof ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setPreviewProof(d.paymentProof)}
                                className="relative w-12 h-12 rounded-lg border border-slate-200 overflow-hidden bg-slate-100 group shrink-0 cursor-pointer"
                                title="Click to view full-size payment screenshot"
                              >
                                <img
                                  src={d.paymentProof}
                                  alt="Proof thumbnail"
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                  <Eye className="w-4 h-4" />
                                </div>
                              </button>
                              <button
                                onClick={() => setPreviewProof(d.paymentProof)}
                                className="text-[11px] font-bold text-primary-600 hover:text-primary-700 underline flex items-center gap-1 cursor-pointer"
                              >
                                <span>Inspect</span>
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">No proof attached</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          {d.status === 'PENDING_VERIFICATION' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3 h-3 animate-spin" />
                              <span>Pending Verification</span>
                            </span>
                          )}
                          {d.status === 'CONFIRMED' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Verified</span>
                            </span>
                          )}
                          {d.status === 'REJECTED' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                              <AlertCircle className="w-3 h-3" />
                              <span>Rejected</span>
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {d.status === 'PENDING_VERIFICATION' ? (
                              <>
                                <button
                                  onClick={() => handleUpdateDonationStatus(d.id, 'CONFIRMED')}
                                  disabled={actionInProgress === d.id}
                                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-lg text-[11px] transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                                  title="Approve donation and notify donor"
                                >
                                  {actionInProgress === d.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="w-3 h-3" />
                                  )}
                                  <span>Approve</span>
                                </button>
                                <button
                                  onClick={() => {
                                    const reason = prompt('Rejection reason (optional):');
                                    if (reason !== null) {
                                      handleUpdateDonationStatus(d.id, 'REJECTED', reason || undefined);
                                    }
                                  }}
                                  disabled={actionInProgress === d.id}
                                  className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 disabled:opacity-50 font-bold rounded-lg text-[11px] transition-colors border border-rose-200 cursor-pointer"
                                  title="Reject donation"
                                >
                                  <span>Reject</span>
                                </button>
                              </>
                            ) : (
                              <span className="text-[11px] text-slate-400 font-mono">
                                {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : ''}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredDirectDonations.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-16 text-center text-slate-500">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <FileCheck className="w-8 h-8 text-slate-400" />
                            <p className="font-bold text-slate-800 text-sm">No direct donations found</p>
                            <p className="text-xs text-slate-500">
                              {searchTerm ? 'Try adjusting your search criteria.' : 'When donors submit direct contributions or upload proof screenshots, they will appear here.'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DONOR WALL PROFILES & AVATAR STUDIO */}
        {activeTab === 'LEADERBOARD' && (
          <>
            {/* Inline Add / Edit Drawer with Live Avatar Studio */}
        {isEditing !== null && (
          <div className="bg-white p-4 sm:p-7 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xl space-y-4 sm:space-y-6 animate-fade-in-up">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    {typeof isEditing === 'object' ? `Modify Donor Profile: ${isEditing.name}` : 'Add New Contributor to Leaderboard'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Customize donor details, contribution records, and profile illustration.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsEditing(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              
              {/* TOP: AVATAR CUSTOMIZER STUDIO */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  {/* Live Avatar Preview Card */}
                  <div className="flex items-center gap-4">
                    <DonorAvatar 
                      name={formData.name || 'Anonymous Donor'} 
                      avatar={formData.avatar} 
                      size="xl" 
                      rank={1}
                      showRankBadge={true}
                    />
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Avatar Preview</div>
                      <div className="text-base font-extrabold text-slate-900 truncate max-w-[200px]">
                        {formData.name || 'Donor Name'}
                      </div>
                      <div className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mt-1">
                        <span>{formData.title || 'Donor Tier'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Mode Selector Buttons */}
                  <div className="flex flex-wrap gap-1.5 bg-white p-1.5 rounded-xl border border-slate-200 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarMode('dynamic');
                        setFormData((prev) => ({ ...prev, avatar: '' }));
                      }}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        avatarMode === 'dynamic' ? 'bg-primary-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Dynamic Theme
                    </button>
                    <button
                      type="button"
                      onClick={() => setAvatarMode('preset')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        avatarMode === 'preset' ? 'bg-primary-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Pick Vector Preset
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarMode('upload');
                        fileInputRef.current?.click();
                      }}
                      className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                        avatarMode === 'upload' ? 'bg-primary-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAvatarMode('url')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        avatarMode === 'url' ? 'bg-primary-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Preset Illustration Selector Carousel */}
                {avatarMode === 'preset' && (
                  <div className="pt-2 border-t border-slate-200">
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Select Signature Adera Theme Illustration:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
                      {THEME_AVATAR_PRESETS.map((preset) => {
                        const isSelected = formData.avatar === preset.id;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, avatar: preset.id }))}
                            className={`p-2 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all text-center ${
                              isSelected
                                ? 'border-primary-500 bg-white shadow-sm ring-2 ring-primary-500/20'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
                              <DonorAvatar name={preset.name} avatar={preset.id} size="sm" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-800 truncate w-full">
                              {preset.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Image URL Input */}
                {avatarMode === 'url' && (
                  <div className="pt-2 border-t border-slate-200">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Paste Direct Photo / Avatar URL:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={formData.avatar.startsWith('preset:') ? '' : formData.avatar}
                        onChange={(e) => setFormData((prev) => ({ ...prev, avatar: e.target.value }))}
                        placeholder="https://example.com/avatar.jpg"
                        className="flex-1 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-primary-500"
                      />
                      {formData.avatar && (
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, avatar: '' }))}
                          className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* File Upload Banner */}
                {avatarMode === 'upload' && (
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-slate-600">
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 text-primary-600 animate-spin" />
                          <span>Uploading image...</span>
                        </>
                      ) : formData.avatar ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span className="font-semibold text-emerald-800">Custom photo uploaded & ready!</span>
                        </>
                      ) : (
                        <span>Choose an image from your computer (PNG, JPG, SVG, WebP)</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors shrink-0"
                    >
                      {uploading ? 'Processing...' : 'Browse File...'}
                    </button>
                  </div>
                )}

              </div>

              {/* BOTTOM: FORM INPUT FIELDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                
                {/* Donor Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Donor / Entity Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Satoshi Nakamoto or Dragonfly"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:bg-white text-xs font-semibold"
                  />
                </div>

                {/* Contribution */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Contribution Amount (USDC) *
                  </label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="e.g. 75000"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:bg-white text-xs font-mono font-bold"
                  />
                </div>

                {/* Date Display */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Display Date
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    placeholder="e.g. Aug 19"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:bg-white text-xs font-medium"
                  />
                </div>

                {/* Title / Tier */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Donor Tier / Recognition Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Diamond Patron / Angel Donor"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:bg-white text-xs font-medium"
                  />
                </div>

                {/* Badge Tag */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Special Highlight Badge (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="e.g. 🏆 Top Contributor • 🌟 Founding Philanthropist"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:bg-white text-xs font-medium"
                  />
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(null)}
                  className="py-2.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="py-2.5 px-6 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-primary-600/20 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Donor...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Contributor Profile</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* Data Table with Search & Filter */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 overflow-hidden shadow-sm space-y-0">
          
          {/* Table Toolbar */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Active Donors ({donors.length})
              </span>
            </div>

            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search donors by name or tier..."
                className="w-full sm:w-64 pl-3.5 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[650px] text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider w-20">Rank</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Donor Profile</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Recognition Tier</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right">Contribution</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right">Date</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredDonors.map((d, index) => (
                  <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Rank */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-black font-mono ${
                        index === 0 
                          ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs' 
                          : index === 1 
                          ? 'bg-slate-200 text-slate-800 border border-slate-300' 
                          : index === 2 
                          ? 'bg-amber-50 text-amber-950 border border-amber-200' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        #{index + 1}
                      </span>
                    </td>

                    {/* Donor Profile (Picture + Name) */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3.5">
                        <DonorAvatar
                          name={d.name}
                          avatar={d.avatar}
                          rank={index + 1}
                          size="md"
                        />
                        <div>
                          <div className="font-extrabold text-slate-900 text-sm">
                            {d.name}
                          </div>
                          {d.badge && (
                            <span className="inline-block text-[10px] font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-200 mt-0.5">
                              {d.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Recognition Tier */}
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {d.title || 'Emerald Contributor'}
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5 font-mono font-bold text-primary-700 text-sm">
                        <Image 
                          src="/crypto/usdc.svg" 
                          alt="USDC" 
                          width={18} 
                          height={18} 
                          className="w-4 h-4 object-contain"
                          style={{ width: "auto", height: "auto" }}
                        />
                        <span>{new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(d.amount)} USDC</span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-right text-slate-500 font-medium font-mono">
                      {d.date}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => startEdit(d)}
                          title="Modify Donor Profile & Picture"
                          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition-all shadow-xs"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(d.id)}
                          title="Delete Donor"
                          className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl border border-rose-200 transition-all shadow-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}

                {filteredDonors.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <AlertCircle className="w-8 h-8 text-slate-400" />
                        <p className="font-bold text-slate-800 text-sm">No donor records found</p>
                        <p className="text-xs text-slate-500">
                          {searchTerm ? 'Try adjusting your search criteria.' : 'Add your first contributor profile to populate the leaderboard.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </>
    )}

    {/* Full-Screen Proof Lightbox Modal */}
    {previewProof && (
      <div 
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        onClick={() => setPreviewProof(null)}
      >
        <div 
          className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-primary-600" />
              <h3 className="font-bold text-sm text-slate-900">Proof of Payment Screenshot</h3>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={previewProof}
                target="_blank"
                rel="noreferrer"
                download
                className="text-xs font-bold text-primary-600 hover:text-primary-700 px-3 py-1.5 bg-primary-50 rounded-lg flex items-center gap-1"
              >
                <span>Open Original</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setPreviewProof(null)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>
          <div className="p-4 bg-slate-950 flex items-center justify-center overflow-auto max-h-[calc(90vh-120px)]">
            <img
              src={previewProof}
              alt="Proof of Payment"
              className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
            />
          </div>
          <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Verified cryptographic proof image stored in Docker volume</span>
            <button
              onClick={() => setPreviewProof(null)}
              className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}

      </div>
    </AdminShell>
  );
}
