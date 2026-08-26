'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { api } from '@/lib/api';
import { User, Wallet, Hexagon, LogOut, Shield, ExternalLink, Heart, CheckCircle2, Clock, ArrowRight, ShieldCheck, PlusCircle, MessageSquare, TrendingUp, AlertCircle, Copy, Check, Image as ImageIcon, Send, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCauseForUpdate, setSelectedCauseForUpdate] = useState<any | null>(null);
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateContent, setUpdateContent] = useState('');
  const [updateImage, setUpdateImage] = useState('');
  const [postingUpdate, setPostingUpdate] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    if (user) {
      api.posts.myCampaigns()
        .then((data) => setCampaigns(Array.isArray(data) ? data : []))
        .catch((err) => console.error('Error fetching my campaigns:', err))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handlePostUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCauseForUpdate || !updateTitle.trim() || !updateContent.trim()) return;

    setPostingUpdate(true);
    try {
      await api.posts.addUpdate(selectedCauseForUpdate.id, {
        title: updateTitle.trim(),
        content: updateContent.trim(),
        image: updateImage.trim() || undefined,
      });

      showToast('Impact milestone update posted successfully!');
      setSelectedCauseForUpdate(null);
      setUpdateTitle('');
      setUpdateContent('');
      setUpdateImage('');

      // Refresh list
      const refreshed = await api.posts.myCampaigns();
      setCampaigns(Array.isArray(refreshed) ? refreshed : []);
    } catch (err: any) {
      alert(err.message || 'Failed to post update.');
    } finally {
      setPostingUpdate(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
        <Navbar />
        <div className="pt-32 pb-20 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-500 font-medium mt-4">Loading Campaign Studio...</span>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    router.push('/login?redirect=/dashboard');
    return null;
  }

  const totalRaised = campaigns.reduce((acc, c) => acc + (c.raised || 0), 0);
  const totalDonationsCount = campaigns.reduce((acc, c) => acc + (c.donationsCount || 0), 0);
  const activeCampaignsCount = campaigns.filter((c) => c.activationStatus === 'ACTIVE' || c.status === 'APPROVED').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-fade-in-up text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      <main className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Top Welcome Header */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-emerald-600/20 uppercase">
                {user.name?.[0] || 'C'}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {user.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Campaign Organizer
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/causes/new"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/20 active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Launch New Cause</span>
              </Link>

              <button 
                onClick={() => { logout(); router.push('/'); }} 
                className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl transition-colors text-xs"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>

          {/* 3 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Raised</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
                  ${totalRaised.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <span className="text-[11px] font-bold text-emerald-700">Direct Crypto Donations</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Supporters & Donors</span>
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 border border-teal-200 flex items-center justify-center">
                  <Heart className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
                  {totalDonationsCount}
                </p>
                <span className="text-[11px] font-bold text-teal-700">Verified Transactions</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Campaigns Listed</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
                  {activeCampaignsCount} <span className="text-xs text-slate-400 font-normal">/ {campaigns.length} total</span>
                </p>
                <span className="text-[11px] font-bold text-blue-700">Anti-Spam Verified</span>
              </div>
            </div>

          </div>

          {/* My Campaigns List */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900">My Fundraising Campaigns</h2>
                <p className="text-xs text-slate-500">
                  Track live funds, post milestone updates, and monitor donor contributions.
                </p>
              </div>

              <Link
                href="/causes/new"
                className="text-xs font-extrabold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>+ New Cause</span>
              </Link>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Loading campaigns...
              </div>
            ) : campaigns.length === 0 ? (
              <div className="py-16 text-center space-y-4 border-2 border-dashed border-slate-200 rounded-3xl">
                <Heart className="w-12 h-12 text-slate-300 mx-auto" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">No campaigns listed yet</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Create your first humanitarian fundraising initiative with multi-chain crypto routing.
                  </p>
                </div>
                <Link
                  href="/causes/new"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Start Your First Campaign</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {campaigns.map((c) => {
                  const raised = c.raised || 0;
                  const goal = c.goal || 10000;
                  const pct = Math.min(Math.round((raised / goal) * 100), 100);
                  const isLive = c.activationStatus === 'ACTIVE' || c.status === 'APPROVED';

                  return (
                    <div
                      key={c.id}
                      className="p-5 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5 bg-slate-50/50"
                    >
                      <div className="flex items-start gap-4 min-w-0 flex-1">
                        <div className="w-16 h-16 rounded-xl overflow-hidden relative shrink-0 bg-slate-200 border border-slate-300">
                          <Image
                            src={c.image || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=300'}
                            alt={c.title}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                              {c.category}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              isLive 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}>
                              {isLive ? '🟢 Live & Accepting Donations' : '⏳ Pending $15 Staking Deposit'}
                            </span>
                          </div>

                          <h3 className="text-sm font-black text-slate-900 truncate">
                            {c.title}
                          </h3>

                          {/* Progress Meter */}
                          <div className="space-y-1 pt-1 max-w-md">
                            <div className="flex justify-between text-[11px] font-bold">
                              <span className="text-emerald-700 font-mono">${raised.toLocaleString()} raised ({pct}%)</span>
                              <span className="text-slate-400">Target: ${goal.toLocaleString()}</span>
                            </div>
                            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setSelectedCauseForUpdate(c)}
                          className="px-3.5 py-2 bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
                        >
                          <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Post Impact Evidence</span>
                        </button>

                        <Link
                          href={`/causes/${c.id}`}
                          className="p-2 bg-white hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition-colors"
                          title="View Public Campaign"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* MODAL: POST IMPACT EVIDENCE & MILESTONE UPDATE                             */}
          {/* ========================================================================= */}
          {selectedCauseForUpdate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5 animate-fade-in-up">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Transparency Milestone
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-1">
                    Post Evidence for &ldquo;{selectedCauseForUpdate.title}&rdquo;
                  </h3>
                  <p className="text-xs text-slate-500">
                    Share photos, receipts, or field updates demonstrating how donor funds are being deployed.
                  </p>
                </div>

                <form onSubmit={handlePostUpdate} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Update Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={updateTitle}
                      onChange={(e) => setUpdateTitle(e.target.value)}
                      placeholder="e.g., Water Filtration Units Delivered & Installed"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Evidence Photo URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={updateImage}
                      onChange={(e) => setUpdateImage(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Field Report & Beneficiary Details *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={updateContent}
                      onChange={(e) => setUpdateContent(e.target.value)}
                      placeholder="Describe what was accomplished, number of people helped, and next steps..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedCauseForUpdate(null)}
                      className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={postingUpdate}
                      className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {postingUpdate ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      <span>Publish Evidence</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
