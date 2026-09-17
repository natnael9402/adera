'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { api } from '@/lib/api';
import { 
  Heart, 
  PlusCircle, 
  ExternalLink, 
  Copy, 
  Check, 
  CheckCircle2, 
  ImageIcon, 
  Send, 
  Loader2, 
  LogOut, 
  Coins, 
  ArrowUpRight, 
  Activity, 
  Layers, 
  Search, 
  X,
  Compass,
  FileCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function getExplorerUrl(txHash: string, cryptoSymbol?: string) {
  if (!txHash) return '#';
  const sym = (cryptoSymbol || '').toUpperCase();
  if (sym.includes('SOL')) return `https://solscan.io/tx/${txHash}`;
  if (sym.includes('BTC')) return `https://mempool.space/tx/${txHash}`;
  if (sym.includes('TRX') || sym.includes('TRC')) return `https://tronscan.org/#/transaction/${txHash}`;
  if (sym.includes('BNB') || sym.includes('BSC')) return `https://bscscan.com/tx/${txHash}`;
  if (sym.includes('MATIC') || sym.includes('POLYGON')) return `https://polygonscan.com/tx/${txHash}`;
  return `https://etherscan.io/tx/${txHash}`;
}

export default function DashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'donations' | 'campaigns' | 'impact'>('donations');
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Milestone Update Modal State
  const [selectedCauseForUpdate, setSelectedCauseForUpdate] = useState<any | null>(null);
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateContent, setUpdateContent] = useState('');
  const [updateImage, setUpdateImage] = useState('');
  const [postingUpdate, setPostingUpdate] = useState(false);

  // Search & Copy UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedTx, setCopiedTx] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.allSettled([
        api.posts.myCampaigns(),
        api.posts.myDonations(),
      ])
        .then(([campaignsRes, donationsRes]) => {
          const userCampaigns = campaignsRes.status === 'fulfilled' && Array.isArray(campaignsRes.value) ? campaignsRes.value : [];
          const userDonations = donationsRes.status === 'fulfilled' && Array.isArray(donationsRes.value) ? donationsRes.value : [];
          
          setCampaigns(userCampaigns);
          setDonations(userDonations);

          // Default tab intelligently based on activity
          if (userDonations.length > 0 && userCampaigns.length === 0) {
            setActiveTab('donations');
          } else if (userCampaigns.length > 0 && userDonations.length === 0) {
            setActiveTab('campaigns');
          }
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const copyToClipboard = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedTx(text);
      showToast(`${label} copied to clipboard`);
      setTimeout(() => setCopiedTx(null), 2500);
    }
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

      showToast('Milestone evidence published successfully');
      setSelectedCauseForUpdate(null);
      setUpdateTitle('');
      setUpdateContent('');
      setUpdateImage('');

      // Refresh campaigns
      const refreshed = await api.posts.myCampaigns();
      setCampaigns(Array.isArray(refreshed) ? refreshed : []);
    } catch (err: any) {
      alert(err.message || 'Failed to post update.');
    } finally {
      setPostingUpdate(false);
    }
  };

  // Donor Metrics
  const totalDonated = useMemo(() => {
    return donations.reduce((acc, d) => acc + (parseFloat(d.amountUsd) || 0), 0);
  }, [donations]);

  const uniqueCausesSupported = useMemo(() => {
    const ids = new Set(donations.map((d) => d.causeId).filter(Boolean));
    return ids.size;
  }, [donations]);

  // Creator Metrics
  const totalRaised = useMemo(() => {
    return campaigns.reduce((acc, c) => acc + (c.raised || 0), 0);
  }, [campaigns]);

  const totalBackersCount = useMemo(() => {
    return campaigns.reduce((acc, c) => acc + (c.donationsCount || 0), 0);
  }, [campaigns]);

  const activeCampaignsCount = useMemo(() => {
    return campaigns.filter((c) => c.activationStatus === 'ACTIVE' || c.status === 'APPROVED').length;
  }, [campaigns]);

  // Combined Impact Milestone stream
  const impactMilestones = useMemo(() => {
    const list: any[] = [];
    
    // From user campaigns
    campaigns.forEach((c) => {
      if (Array.isArray(c.updates)) {
        c.updates.forEach((u: any) => {
          list.push({ ...u, causeTitle: c.title, causeId: c.id, role: 'Organizer' });
        });
      }
    });

    // From supported causes
    donations.forEach((d) => {
      if (d.cause && Array.isArray(d.cause.updates)) {
        d.cause.updates.forEach((u: any) => {
          // Avoid duplicate updates if user is both creator and donor
          if (!list.some((item) => item.id === u.id && item.causeId === d.cause.id)) {
            list.push({ ...u, causeTitle: d.cause.title, causeId: d.cause.id, role: 'Backer' });
          }
        });
      }
    });

    return list.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
  }, [campaigns, donations]);

  // Filtered lists
  const filteredDonations = useMemo(() => {
    if (!searchQuery.trim()) return donations;
    const q = searchQuery.toLowerCase();
    return donations.filter((d) => 
      (d.cause?.title || '').toLowerCase().includes(q) ||
      (d.cryptoSymbol || '').toLowerCase().includes(q) ||
      (d.txHash || '').toLowerCase().includes(q)
    );
  }, [donations, searchQuery]);

  const filteredCampaigns = useMemo(() => {
    if (!searchQuery.trim()) return campaigns;
    const q = searchQuery.toLowerCase();
    return campaigns.filter((c) => 
      (c.title || '').toLowerCase().includes(q) ||
      (c.category || '').toLowerCase().includes(q)
    );
  }, [campaigns, searchQuery]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
        <Navbar />
        <div className="pt-36 pb-24 flex flex-col items-center justify-center">
          <div className="w-9 h-9 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-500 font-medium mt-4 tracking-wide">Loading workspace...</span>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    router.push('/login?redirect=/dashboard');
    return null;
  }

  const isOrganizer = campaigns.length > 0;
  const isDonor = donations.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-emerald-500/20 selection:text-emerald-900">
      <Navbar />

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-800 flex items-center gap-2.5 text-xs font-semibold"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* ========================================================================= */}
          {/* TOP USER PROFILE & ACTION BAR                                             */}
          {/* ========================================================================= */}
          <section className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Profile details */}
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-slate-900 text-white font-black text-lg sm:text-xl flex items-center justify-center shrink-0 uppercase tracking-tight shadow-xs">
                  {user.name?.[0] || 'U'}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight truncate">
                      {user.name}
                    </h1>
                    
                    {/* Dynamic Role Badges */}
                    {isDonor && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200/60 uppercase tracking-wider">
                        Verified Donor
                      </span>
                    )}
                    {isOrganizer && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 uppercase tracking-wider">
                        Cause Creator
                      </span>
                    )}
                    {!isDonor && !isOrganizer && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wider">
                        Member
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5 truncate">{user.email}</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                <Link
                  href="/causes/new"
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs active:scale-98"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Launch Cause</span>
                </Link>

                <Link
                  href="/causes"
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors active:scale-98"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Explore</span>
                </Link>

                <button 
                  onClick={() => { logout(); router.push('/'); }} 
                  className="p-2 border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-xl transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

            </div>
          </section>

          {/* ========================================================================= */}
          {/* ADAPTIVE STATS METRIC GRID                                                */}
          {/* ========================================================================= */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {activeTab === 'donations' ? (
              <>
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Contributed</span>
                  <div>
                    <p className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
                      ${totalDonated.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <span className="text-[11px] font-medium text-emerald-600">On-Chain Verified</span>
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Causes Backed</span>
                  <div>
                    <p className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
                      {uniqueCausesSupported}
                    </p>
                    <span className="text-[11px] font-medium text-teal-600">Direct Humanitarian Aid</span>
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Donations Made</span>
                  <div>
                    <p className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
                      {donations.length}
                    </p>
                    <span className="text-[11px] font-medium text-blue-600">Immutable Records</span>
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Impact Milestones</span>
                  <div>
                    <p className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
                      {impactMilestones.length}
                    </p>
                    <span className="text-[11px] font-medium text-indigo-600">Evidence Updates</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Raised</span>
                  <div>
                    <p className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
                      ${totalRaised.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <span className="text-[11px] font-medium text-emerald-600">Direct Crypto Funding</span>
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Backers</span>
                  <div>
                    <p className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
                      {totalBackersCount}
                    </p>
                    <span className="text-[11px] font-medium text-teal-600">Unique Contributors</span>
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Causes</span>
                  <div>
                    <p className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
                      {activeCampaignsCount} <span className="text-xs text-slate-400 font-normal">/ {campaigns.length}</span>
                    </p>
                    <span className="text-[11px] font-medium text-blue-600">Live Campaigns</span>
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Published Evidence</span>
                  <div>
                    <p className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
                      {campaigns.reduce((acc, c) => acc + (Array.isArray(c.updates) ? c.updates.length : 0), 0)}
                    </p>
                    <span className="text-[11px] font-medium text-indigo-600">Milestone Reports</span>
                  </div>
                </div>
              </>
            )}
          </section>

          {/* ========================================================================= */}
          {/* TAB SWITCHER & SEARCH BAR                                                 */}
          {/* ========================================================================= */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            
            {/* Pill Tabs */}
            <div className="inline-flex p-1 bg-slate-200/70 rounded-xl text-xs font-bold self-start w-full sm:w-auto overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('donations')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
                  activeTab === 'donations'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Coins className="w-3.5 h-3.5 text-emerald-600" />
                <span>My Donations</span>
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-700">
                  {donations.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('campaigns')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
                  activeTab === 'campaigns'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-teal-600" />
                <span>My Causes</span>
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-700">
                  {campaigns.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('impact')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
                  activeTab === 'impact'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-indigo-600" />
                <span>Impact Stream</span>
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-700">
                  {impactMilestones.length}
                </span>
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter entries..."
                className="w-full pl-8 pr-7 py-2 bg-white border border-slate-200/80 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>

          {/* ========================================================================= */}
          {/* TAB CONTENT: MY DONATIONS (DONOR VIEW)                                     */}
          {/* ========================================================================= */}
          {activeTab === 'donations' && (
            <div className="space-y-3">
              {loading ? (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400 text-xs">
                  Loading donation records...
                </div>
              ) : filteredDonations.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-10 sm:p-14 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto">
                    <Heart className="w-6 h-6" />
                  </div>
                  <div className="max-w-sm mx-auto">
                    <h3 className="text-base font-bold text-slate-900">No donations recorded</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Contribute directly to active causes using crypto with full on-chain transparency.
                    </p>
                  </div>
                  <div>
                    <Link
                      href="/causes"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Browse Causes</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredDonations.map((d) => {
                    const cause = d.cause;
                    const dateStr = d.createdAt 
                      ? new Date(d.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : 'Recent';
                    const explorerUrl = getExplorerUrl(d.txHash, d.cryptoSymbol);
                    const isCopied = copiedTx === d.txHash;

                    return (
                      <div
                        key={d.id}
                        className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 hover:border-slate-300 transition-all shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                      >
                        {/* Cause & Donation Summary */}
                        <div className="flex items-start gap-3.5 min-w-0 flex-1">
                          {cause?.image ? (
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden relative shrink-0 bg-slate-100 border border-slate-200">
                              <Image
                                src={cause.image}
                                alt={cause.title || 'Cause'}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-400">
                              <Heart className="w-5 h-5 text-slate-400" />
                            </div>
                          )}

                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              {cause ? (
                                <Link 
                                  href={`/causes/${cause.id}`}
                                  className="text-sm font-bold text-slate-900 hover:text-emerald-600 transition-colors truncate"
                                >
                                  {cause.title}
                                </Link>
                              ) : (
                                <span className="text-sm font-bold text-slate-900">Direct Platform Donation</span>
                              )}

                              {cause?.category && (
                                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                  {cause.category}
                                </span>
                              )}

                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 inline-flex items-center gap-1">
                                <Check className="w-2.5 h-2.5" />
                                Confirmed
                              </span>
                            </div>

                            {/* Message / Donor memo if provided */}
                            {d.message && (
                              <p className="text-xs text-slate-600 italic bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 max-w-xl">
                                &ldquo;{d.message}&rdquo;
                              </p>
                            )}

                            {/* Blockchain Transaction Hash Pill */}
                            <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[11px]">
                              <span className="text-slate-400 font-medium">{dateStr}</span>
                              <span className="text-slate-300">•</span>
                              
                              <div className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md font-mono text-[11px] text-slate-600">
                                <span>Tx: {d.txHash ? `${d.txHash.slice(0, 8)}...${d.txHash.slice(-6)}` : 'Verified on-chain'}</span>
                                {d.txHash && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => copyToClipboard(d.txHash, 'Transaction hash')}
                                      className="p-0.5 hover:text-slate-900 transition-colors"
                                      title="Copy Tx Hash"
                                    >
                                      {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                                    </button>
                                    <a
                                      href={explorerUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="p-0.5 hover:text-emerald-600 transition-colors"
                                      title="Open Block Explorer"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Amount & Cause Link */}
                        <div className="flex lg:flex-col items-end justify-between lg:justify-center shrink-0 border-t lg:border-t-0 pt-2.5 lg:pt-0 border-slate-100 gap-1.5">
                          <div className="text-right">
                            <p className="text-base sm:text-lg font-black text-slate-900 font-mono tracking-tight">
                              ${parseFloat(d.amountUsd || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <span className="text-[11px] font-bold text-slate-500 font-mono">
                              {d.cryptoAmount} {d.cryptoSymbol}
                            </span>
                          </div>

                          {cause?.id && (
                            <Link
                              href={`/causes/${cause.id}`}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
                            >
                              <span>View Cause</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB CONTENT: MY CAUSES (CREATOR VIEW)                                     */}
          {/* ========================================================================= */}
          {activeTab === 'campaigns' && (
            <div className="space-y-3">
              {loading ? (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400 text-xs">
                  Loading created campaigns...
                </div>
              ) : filteredCampaigns.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-10 sm:p-14 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center mx-auto">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div className="max-w-sm mx-auto">
                    <h3 className="text-base font-bold text-slate-900">No campaigns created yet</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Start a verified fundraising campaign with direct crypto routing and transparency reports.
                    </p>
                  </div>
                  <div>
                    <Link
                      href="/causes/new"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Start a Campaign</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredCampaigns.map((c) => {
                    const raised = c.raised || 0;
                    const goal = c.goal || 10000;
                    const pct = Math.min(Math.round((raised / goal) * 100), 100);
                    const isLive = c.activationStatus === 'ACTIVE' || c.status === 'APPROVED';

                    return (
                      <div
                        key={c.id}
                        className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 hover:border-slate-300 transition-all shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                      >
                        {/* Campaign Main Info */}
                        <div className="flex items-start gap-3.5 min-w-0 flex-1">
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden relative shrink-0 bg-slate-100 border border-slate-200">
                            <Image
                              src={c.image || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=300'}
                              alt={c.title}
                              fill
                              className="object-cover"
                            />
                          </div>

                          <div className="min-w-0 flex-1 space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                {c.category}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                isLive 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' 
                                  : 'bg-amber-50 text-amber-800 border-amber-200/60'
                              }`}>
                                {isLive ? '🟢 Live & Accepting Donations' : '⏳ Pending $15 Staking Deposit'}
                              </span>
                            </div>

                            <h3 className="text-sm font-bold text-slate-900 truncate">
                              {c.title}
                            </h3>

                            {/* Progress bar */}
                            <div className="space-y-1 max-w-md">
                              <div className="flex justify-between text-[11px] font-mono">
                                <span className="font-bold text-slate-800">
                                  ${raised.toLocaleString()} <span className="text-slate-400 font-normal">raised ({pct}%)</span>
                                </span>
                                <span className="text-slate-400">Target: ${goal.toLocaleString()}</span>
                              </div>
                              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                          <button
                            type="button"
                            onClick={() => setSelectedCauseForUpdate(c)}
                            className="px-3 py-2 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
                          >
                            <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Post Evidence</span>
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
          )}

          {/* ========================================================================= */}
          {/* TAB CONTENT: IMPACT STREAM (TRANSPARENCY UPDATES)                         */}
          {/* ========================================================================= */}
          {activeTab === 'impact' && (
            <div className="space-y-3">
              {impactMilestones.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-10 sm:p-14 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center mx-auto">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <div className="max-w-sm mx-auto">
                    <h3 className="text-base font-bold text-slate-900">No milestone reports published</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      When campaigns post evidence updates, beneficiary receipts, and photos, they appear here.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {impactMilestones.map((m, idx) => {
                    const dateFormatted = m.date 
                      ? new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : 'Recent';

                    return (
                      <div 
                        key={m.id || idx}
                        className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/60 uppercase">
                              {m.role === 'Organizer' ? 'Your Campaign' : 'Backed Cause'}
                            </span>
                            <Link
                              href={`/causes/${m.causeId}`}
                              className="text-xs font-bold text-slate-700 hover:text-emerald-600 transition-colors"
                            >
                              {m.causeTitle}
                            </Link>
                          </div>
                          <span className="text-[11px] font-medium text-slate-400">{dateFormatted}</span>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{m.title}</h4>
                          <p className="text-xs text-slate-600 mt-1 whitespace-pre-line leading-relaxed">
                            {m.content}
                          </p>
                        </div>

                        {m.image && (
                          <div className="w-full max-w-md h-48 rounded-xl overflow-hidden relative border border-slate-200 mt-2">
                            <Image
                              src={m.image}
                              alt={m.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODAL: POST IMPACT EVIDENCE & MILESTONE UPDATE                             */}
          {/* ========================================================================= */}
          {selectedCauseForUpdate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs">
              <div className="bg-white rounded-2xl p-5 sm:p-7 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4 animate-fade-in-up max-h-[90vh] overflow-y-auto">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                      Transparency Milestone
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      Post Evidence for &ldquo;{selectedCauseForUpdate.title}&rdquo;
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedCauseForUpdate(null)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handlePostUpdate} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Update Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={updateTitle}
                      onChange={(e) => setUpdateTitle(e.target.value)}
                      placeholder="e.g., Medical supplies delivered to clinic"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
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
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
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
                      placeholder="Describe what was accomplished with the funds received, delivery receipts, or next steps..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedCauseForUpdate(null)}
                      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={postingUpdate}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {postingUpdate ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
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
