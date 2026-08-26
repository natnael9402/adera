'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { 
  FileText, Check, X, Plus, Clock, 
  AlertCircle, Search, Filter, ArrowUpRight, CheckCircle2,
  SlidersHorizontal, TrendingUp, PenTool, DollarSign,
  Layers, ShieldCheck, Heart, Save, Loader2, ExternalLink,
  Wand2, Edit3, BookOpen, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import AiStoryWriterModal from '@/components/AiStoryWriterModal';

interface Post {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  activationStatus?: string;
  activationDepositFee?: number;
  activationTxHash?: string;
  paymentProofImage?: string;
  paymentMethodSymbol?: string;
  goal: number;
  raised?: number;
  urgency?: string;
  image?: string;
  beneficiary?: string;
  location?: string;
  author?: { name: string; email?: string };
  createdAt: string;
}

export default function PostsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Proof Viewer Modal State
  const [proofModalPost, setProofModalPost] = useState<Post | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  // Funds, Story & Slider Adjuster Modal State
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editGoal, setEditGoal] = useState<number>(10000);
  const [editRaised, setEditRaised] = useState<number>(3500);
  const [editUrgency, setEditUrgency] = useState<string>('Featured');
  const [editCategory, setEditCategory] = useState<string>('Humanitarian');
  const [editStatus, setEditStatus] = useState<string>('APPROVED');
  const [savingChanges, setSavingChanges] = useState(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showAiModal, setShowAiModal] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'funds' | 'story'>('funds');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user) loadPosts();
  }, [user, loading, router]);

  const loadPosts = () => {
    api.admin.posts.list().then(setPosts).catch(console.error);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const pendingReviewCount = useMemo(() => {
    return posts.filter(
      (p) => p.activationStatus === 'PENDING_REVIEW' || (p.status === 'PENDING' && Boolean(p.paymentProofImage))
    ).length;
  }, [posts]);

  const openSliderModal = (post: Post, defaultTab: 'funds' | 'story' = 'funds') => {
    setSelectedPost(post);
    setEditTitle(post.title || '');
    setEditDescription(post.description || '');
    setEditGoal(post.goal || 10000);
    setEditRaised(post.raised !== undefined ? post.raised : (post.goal || 10000) * 0.45);
    setEditUrgency(post.urgency || 'Featured');
    setEditCategory(post.category || 'Humanitarian');
    setEditStatus(post.status || 'APPROVED');
    setActiveModalTab(defaultTab);
  };

  const closeSliderModal = () => {
    setSelectedPost(null);
  };

  const handleSaveFunds = async () => {
    if (!selectedPost) return;
    setSavingChanges(true);
    try {
      await api.admin.posts.update(selectedPost.id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        goal: editGoal,
        raised: editRaised,
        urgency: editUrgency,
        category: editCategory,
        status: editStatus,
        activationStatus: editStatus === 'APPROVED' ? 'ACTIVE' : 'PAUSED',
      });

      showToast(`Updated "${editTitle || selectedPost.title}" successfully!`);
      
      // Update local state
      setPosts((prev) =>
        prev.map((p) =>
          p.id === selectedPost.id
            ? {
                ...p,
                title: editTitle.trim(),
                description: editDescription.trim(),
                goal: editGoal,
                raised: editRaised,
                urgency: editUrgency,
                category: editCategory,
                status: editStatus,
              }
            : p
        )
      );
      closeSliderModal();
    } catch (err: any) {
      alert(err.message || 'Failed to update cause.');
    } finally {
      setSavingChanges(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    setActionLoading(id);
    try {
      await api.admin.posts.updateStatus(id, status);
      const newActivation = status === 'APPROVED' ? 'ACTIVE' : 'REJECTED';
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, status, activationStatus: newActivation } : p)));
      showToast(`Cause #${id} marked as ${status}`);
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchesSearch = 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.author?.name && p.author.name.toLowerCase().includes(searchQuery.toLowerCase()));
      
      let matchesStatus = true;
      if (statusFilter === 'ALL') {
        matchesStatus = true;
      } else if (statusFilter === 'PENDING_REVIEW') {
        matchesStatus = p.activationStatus === 'PENDING_REVIEW' || (p.status === 'PENDING' && Boolean(p.paymentProofImage));
      } else {
        matchesStatus = p.status === statusFilter;
      }

      return matchesSearch && matchesStatus;
    });
  }, [posts, searchQuery, statusFilter]);

  // Percentage calculations for modal preview
  const currentPercent = editGoal > 0 ? Math.round((editRaised / editGoal) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      {/* Floating Success Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-fade-in-up text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <FileText className="w-8 h-8 text-primary-600" />
              Manage Causes & Content
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Adjust live campaign goals, manipulate gathered funds with real-time sliders, and synthesize structured impact narratives.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/posts/new"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all shadow-md shadow-primary-600/20 text-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Cause</span>
            </Link>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Search */}
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search causes by title, author, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:bg-white"
            />
          </div>

          {/* Status Pills Filter */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar">
            {[
              { id: 'ALL', label: 'All Causes' },
              { id: 'PENDING_REVIEW', label: `🔔 Needs Review (${pendingReviewCount})` },
              { id: 'APPROVED', label: 'Approved' },
              { id: 'PENDING', label: 'Pending' },
              { id: 'REJECTED', label: 'Rejected' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === st.id
                    ? st.id === 'PENDING_REVIEW' && pendingReviewCount > 0
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-900 text-white shadow-xs'
                    : st.id === 'PENDING_REVIEW' && pendingReviewCount > 0
                    ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Data Table Card */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">Cause Details</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">$5 Payment Proof</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">Live Progress & Funds</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">Category & Urgency</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredPosts.map((post) => {
                  const goal = post.goal || 10000;
                  const raised = post.raised !== undefined ? post.raised : goal * 0.45;
                  const pct = Math.min(Math.round((raised / goal) * 100), 100);
                  const safeImg = post.image && (post.image.startsWith('http') || post.image.startsWith('/')) 
                    ? post.image 
                    : '/causes/cause_water_1786200462466.jpg';

                  const hasProof = Boolean(post.paymentProofImage);
                  const isPendingReview = post.activationStatus === 'PENDING_REVIEW' || (post.status === 'PENDING' && hasProof);

                  return (
                    <tr key={post.id} className={`transition-colors ${isPendingReview ? 'bg-amber-50/30 hover:bg-amber-50/60' : 'hover:bg-slate-50/80'}`}>
                      
                      {/* Title & Author */}
                      <td className="px-6 py-4 max-w-xs">
                        <Link href={`/posts/${post.id}`} className="flex items-center gap-3 group">
                          <div className="w-11 h-11 rounded-xl overflow-hidden relative shrink-0 bg-slate-100 border border-slate-200 group-hover:scale-105 transition-transform">
                            <Image src={safeImg} alt={post.title} fill className="object-cover" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                              {post.title}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">
                              By {post.author?.name || 'Adera Foundation'} • ID: #{post.id}
                            </p>
                          </div>
                        </Link>
                      </td>

                      {/* $5 Payment Proof Column */}
                      <td className="px-6 py-4">
                        {post.paymentProofImage ? (
                          <div 
                            onClick={() => { setProofModalPost(post); setIsZoomed(false); }}
                            className="flex items-center gap-2.5 group cursor-pointer"
                            title="Click to view full payment receipt screenshot"
                          >
                            <div className="w-11 h-11 rounded-xl overflow-hidden relative shrink-0 border-2 border-emerald-300 bg-slate-900/5 group-hover:ring-2 group-hover:ring-emerald-500 transition-all shadow-xs">
                              <img src={post.paymentProofImage} alt="Payment Proof" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Eye className="w-4 h-4 text-white" />
                              </div>
                            </div>
                            <div className="min-w-0">
                              <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 rounded block">
                                $5.00 {post.paymentMethodSymbol || 'BTC'}
                              </span>
                              <span className="text-[9px] text-slate-500 font-mono block truncate max-w-[105px] mt-0.5">
                                {post.activationTxHash && post.activationTxHash !== 'PROOF_IMAGE_ATTACHED'
                                  ? `${post.activationTxHash.slice(0, 10)}...`
                                  : 'Receipt Attached'}
                              </span>
                            </div>
                          </div>
                        ) : post.activationStatus === 'ACTIVE' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            $5 Verified
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium italic">
                            No Proof
                          </span>
                        )}
                      </td>

                      {/* Live Funds Progress Meter */}
                      <td className="px-6 py-4 min-w-[200px]">
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-baseline text-[11px] font-bold">
                            <span className="text-emerald-700 font-mono">
                              ${raised.toLocaleString()}
                            </span>
                            <span className="text-slate-400 font-normal">
                              Goal: ${goal.toLocaleString()} ({pct}%)
                            </span>
                          </div>
                          
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
                            <div 
                              className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full transition-all duration-300" 
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Category & Urgency */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold rounded">
                            {post.category}
                          </span>
                          <span className="text-[10px] text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            {post.urgency || 'Featured'}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold rounded-full border ${
                              post.status === 'APPROVED'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : post.status === 'REJECTED'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : isPendingReview
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {post.status === 'APPROVED' && <Check className="w-3 h-3" />}
                            {post.status === 'REJECTED' && <X className="w-3 h-3" />}
                            {post.status === 'PENDING' && <Clock className="w-3 h-3 text-amber-600" />}
                            {post.status}
                          </span>

                          {isPendingReview && (
                            <span className="block text-[9px] font-black text-amber-700 uppercase tracking-tight">
                              Needs Verification
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          
                          {/* If has payment proof, show dedicated inspect proof button */}
                          {post.paymentProofImage && (
                            <button
                              type="button"
                              onClick={() => { setProofModalPost(post); setIsZoomed(false); }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl font-extrabold text-xs transition-all shadow-2xs cursor-pointer"
                              title="Inspect $5 Payment Proof Receipt"
                            >
                              <Eye className="w-3.5 h-3.5 text-amber-700" />
                              <span>View Proof</span>
                            </button>
                          )}

                          {/* Quick Moderation Button */}
                          {post.status === 'PENDING' ? (
                            <button
                              disabled={actionLoading === post.id}
                              onClick={() => updateStatus(post.id, 'APPROVED')}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer"
                              title="Approve & Go Live"
                            >
                              Approve
                            </button>
                          ) : (
                            <button
                              onClick={() => updateStatus(post.id, post.status === 'APPROVED' ? 'REJECTED' : 'APPROVED')}
                              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                              title={`Switch to ${post.status === 'APPROVED' ? 'Rejected' : 'Approved'}`}
                            >
                              {post.status === 'APPROVED' ? <X className="w-3.5 h-3.5 text-rose-500" /> : <Check className="w-3.5 h-3.5 text-emerald-600" />}
                            </button>
                          )}

                          {/* Dedicated Studio Page Button */}
                          <Link
                            href={`/posts/${post.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-extrabold text-xs transition-all shadow-xs"
                            title="Open Full Cause Studio"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Manage</span>
                          </Link>

                          <a
                            href={`${process.env.NEXT_PUBLIC_APP_URL || 'https://aderafoundation.com'}/causes/${post.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700"
                            title="View on Public Portal"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>

                    </tr>
                  );
                })}

                {filteredPosts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <AlertCircle className="w-8 h-8 text-slate-400" />
                        <p className="font-bold text-slate-800 text-sm">No causes found</p>
                        <p className="text-xs text-slate-500">Try adjusting your search query or filters.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* UNIFIED FUNDS SLIDER & DEEPSEEK STORY CONTROLLER MODAL                    */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {selectedPost && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-sm overflow-y-auto font-sans">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-slate-200 shadow-2xl space-y-6 my-auto max-h-[92vh] flex flex-col"
              >
                
                {/* Modal Header */}
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 shrink-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                        ⚡ Campaign Controller
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                        <FileText className="w-3 h-3 text-slate-600" /> Description Editor
                      </span>
                    </div>
                    <h2 className="text-xl font-black text-slate-900 mt-1">
                      Edit Campaign Funds & Story
                    </h2>
                    <p className="text-xs text-slate-500 truncate max-w-md">
                      Cause #{selectedPost.id}: &ldquo;{selectedPost.title}&rdquo;
                    </p>
                  </div>

                  <button
                    onClick={closeSliderModal}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveModalTab('funds')}
                    className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                      activeModalTab === 'funds'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Funds & Real-Time Slider</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveModalTab('story')}
                    className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                      activeModalTab === 'story'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <PenTool className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Story Narrative & Studio</span>
                  </button>
                </div>

                {/* Tab 1: Funds & Slider Controller */}
                {activeModalTab === 'funds' && (
                  <div className="overflow-y-auto space-y-5 pr-1 flex-1">
                    {/* Live Real-Time Public Preview Card */}
                    <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl shadow-inner space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                          Public Portal Live Preview
                        </span>
                        <span className="font-mono font-extrabold text-emerald-400 text-sm">
                          {currentPercent}% Funded
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
                            ${editRaised.toLocaleString()}
                          </span>
                          <span className="text-xs text-slate-300 font-medium ml-1.5">raised</span>
                        </div>
                        <span className="text-xs text-slate-300 font-mono">
                          Target: ${editGoal.toLocaleString()} USD
                        </span>
                      </div>

                      {/* Progress Bar Preview */}
                      <div className="h-3 bg-slate-700 rounded-full overflow-hidden p-0.5 border border-slate-600">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 rounded-full transition-all duration-150"
                          style={{ width: `${Math.min(currentPercent, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* 1. Target Goal Controller */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        1. Target Funding Goal ($ USD)
                      </label>
                      <div className="relative">
                        <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="number"
                          min={100}
                          step={500}
                          value={editGoal}
                          onChange={(e) => setEditGoal(Math.max(100, parseFloat(e.target.value) || 0))}
                          className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                        />
                      </div>

                      {/* Goal Quick Presets */}
                      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
                        {[5000, 10000, 25000, 50000, 100000].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setEditGoal(preset)}
                            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                              editGoal === preset 
                                ? 'bg-slate-900 text-white' 
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            ${preset / 1000}k Goal
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 2. Amount Gathered / Raised Manipulator SLIDER */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          2. Gathered Up to Now ($ USD & Slider)
                        </label>
                        <span className="text-xs font-black text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          ${editRaised.toLocaleString()} ({currentPercent}%)
                        </span>
                      </div>

                      {/* The Interactive Range Slider */}
                      <div className="space-y-1">
                        <input
                          type="range"
                          min={0}
                          max={editGoal * 1.25} // Allow stretch goals up to 125%!
                          step={Math.max(10, Math.round(editGoal / 100))}
                          value={editRaised}
                          onChange={(e) => setEditRaised(parseFloat(e.target.value) || 0)}
                          className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 font-bold font-mono">
                          <span>$0 (0%)</span>
                          <span>50% (${Math.round(editGoal * 0.5).toLocaleString()})</span>
                          <span>100% (${editGoal.toLocaleString()})</span>
                          <span>125% Stretch</span>
                        </div>
                      </div>

                      {/* Manual Numeric Input */}
                      <div className="relative pt-1">
                        <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="number"
                          min={0}
                          value={editRaised}
                          onChange={(e) => setEditRaised(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                          placeholder="Or enter exact gathered USD amount..."
                        />
                      </div>

                      {/* Quick Ratio Preset Clickers */}
                      <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 pt-1">
                        {[
                          { label: '0%', ratio: 0 },
                          { label: '25%', ratio: 0.25 },
                          { label: '50%', ratio: 0.50 },
                          { label: '75%', ratio: 0.75 },
                          { label: '90%', ratio: 0.90 },
                          { label: '100%', ratio: 1.0 },
                          { label: '120%', ratio: 1.2 },
                        ].map((p) => (
                          <button
                            key={p.label}
                            type="button"
                            onClick={() => setEditRaised(Math.round(editGoal * p.ratio))}
                            className={`py-1.5 px-2 rounded-lg text-xs font-black transition-all ${
                              Math.round(editGoal * p.ratio) === editRaised
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 3. Urgency & Category Adjusters */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Urgency Label
                        </label>
                        <select
                          value={editUrgency}
                          onChange={(e) => setEditUrgency(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                        >
                          <option value="Featured">Featured</option>
                          <option value="Urgent">Urgent</option>
                          <option value="Critical">Critical</option>
                          <option value="Almost There">Almost There</option>
                          <option value="New">New</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Status Approval
                        </label>
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                        >
                          <option value="APPROVED">🟢 APPROVED (Live & Visible)</option>
                          <option value="PENDING">⏳ PENDING (Awaiting Review)</option>
                          <option value="REJECTED">🔴 REJECTED (Archived)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: Story & DeepSeek AI Narrative */}
                {activeModalTab === 'story' && (
                  <div className="overflow-y-auto space-y-4 pr-1 flex-1">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Campaign Title
                      </label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                          Story Narrative & Mission Breakdown
                        </label>

                        <button
                          type="button"
                          onClick={() => setShowAiModal(true)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-800 font-bold text-xs rounded-lg hover:bg-slate-200 active:scale-95 cursor-pointer border border-slate-200"
                        >
                          <FileText className="w-3.5 h-3.5 text-slate-600" />
                          <span>Auto-Draft</span>
                        </button>
                      </div>

                      <textarea
                        rows={9}
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Detail the geographic scope, beneficiary communities, milestone deliverables, and budget allocation..."
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:border-slate-800 font-normal leading-relaxed resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* Footer Buttons */}
                <div className="flex gap-3 pt-4 border-t border-slate-100 shrink-0">
                  <button
                    type="button"
                    onClick={closeSliderModal}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveFunds}
                    disabled={savingChanges}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl transition-all shadow-md shadow-emerald-600/25 flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
                  >
                    {savingChanges ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>Save & Publish Live</span>
                  </button>
                </div>

              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* $5 Payment Proof Inspection Lightbox Modal */}
        <AnimatePresence>
          {proofModalPost && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8"
              >
                
                {/* Modal Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center text-lg shadow-2xs">
                      📸
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                        <span>$5 Verification Proof Review</span>
                        <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          #{proofModalPost.id}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 truncate max-w-md">
                        {proofModalPost.title}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setProofModalPost(null)}
                    className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                  
                  {/* Submitter & Verification Info Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Submitter</span>
                      <span className="text-xs font-bold text-slate-900 truncate block mt-0.5">
                        {proofModalPost.author?.name || 'Organizer'}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Organizer Email</span>
                      <span className="text-xs font-bold text-slate-900 truncate block mt-0.5">
                        {proofModalPost.author?.email || 'N/A'}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Anti-Spam Fee</span>
                      <span className="text-xs font-black text-emerald-700 block mt-0.5">
                        $5.00 USD ({proofModalPost.paymentMethodSymbol || 'BTC'})
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Status</span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md inline-block mt-0.5 ${
                        proofModalPost.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {proofModalPost.activationStatus || proofModalPost.status}
                      </span>
                    </div>
                  </div>

                  {/* Transaction Hash if present */}
                  {proofModalPost.activationTxHash && proofModalPost.activationTxHash !== 'PROOF_IMAGE_ATTACHED' && (
                    <div className="p-3.5 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        On-Chain Transaction Hash (TXID)
                      </span>
                      <span className="font-mono text-xs text-emerald-400 select-all break-all block">
                        {proofModalPost.activationTxHash}
                      </span>
                    </div>
                  )}

                  {/* Image Preview / Zoom Box */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Uploaded Transfer Receipt / Screenshot</span>
                      {proofModalPost.paymentProofImage && (
                        <button
                          type="button"
                          onClick={() => setIsZoomed(!isZoomed)}
                          className="text-xs text-emerald-700 hover:underline font-bold cursor-pointer"
                        >
                          {isZoomed ? 'Fit to box' : 'View Full Resolution'}
                        </button>
                      )}
                    </div>

                    <div className={`relative rounded-2xl overflow-hidden border border-slate-300 bg-slate-900/5 flex items-center justify-center ${
                      isZoomed ? 'min-h-[400px] overflow-auto' : 'max-h-[380px]'
                    }`}>
                      {proofModalPost.paymentProofImage ? (
                        <img
                          src={proofModalPost.paymentProofImage}
                          alt="Proof Screenshot"
                          className={`rounded-xl object-contain ${isZoomed ? 'w-auto max-w-none' : 'max-h-[360px] w-auto'}`}
                        />
                      ) : (
                        <div className="p-8 text-center text-slate-400">
                          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                          <span className="text-xs font-bold">No receipt image attached to this cause</span>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* Modal Actions Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setProofModalPost(null)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Close Preview
                  </button>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <button
                      type="button"
                      disabled={actionLoading === proofModalPost.id}
                      onClick={async () => {
                        await updateStatus(proofModalPost.id, 'REJECTED');
                        setProofModalPost((prev) => prev ? { ...prev, status: 'REJECTED', activationStatus: 'REJECTED' } : null);
                      }}
                      className="flex-1 sm:flex-none px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject Deposit</span>
                    </button>

                    <button
                      type="button"
                      disabled={actionLoading === proofModalPost.id}
                      onClick={async () => {
                        await updateStatus(proofModalPost.id, 'APPROVED');
                        setProofModalPost((prev) => prev ? { ...prev, status: 'APPROVED', activationStatus: 'ACTIVE' } : null);
                      }}
                      className="flex-1 sm:flex-none px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Activate Live</span>
                    </button>
                  </div>
                </div>

              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* DeepSeek AI Storyteller Assistant Modal */}
        <AiStoryWriterModal
          isOpen={showAiModal}
          onClose={() => setShowAiModal(false)}
          onApply={(text) => {
            setEditDescription(text);
            setActiveModalTab('story');
          }}
          initialTitle={editTitle || selectedPost?.title || ''}
          initialCategory={editCategory || selectedPost?.category || 'Clean Water'}
          initialGoal={editGoal || selectedPost?.goal || 25000}
        />

      </main>
    </div>
  );
}
