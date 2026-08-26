'use client';

import { useEffect, useState, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { 
  ArrowLeft, Save, FileText, SlidersHorizontal, DollarSign, 
  ExternalLink, CheckCircle2, AlertCircle, Loader2, Plus, 
  Trash2, ShieldCheck, Heart, Layers, MapPin, Wallet, 
  Clock, Check, X, RefreshCw, Send, Eye
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import ImageUploadGuide from '@/components/ImageUploadGuide';
import AiStoryWriterModal from '@/components/AiStoryWriterModal';

interface Post {
  id: number;
  title: string;
  description: string;
  category: string;
  urgency: string;
  status: string;
  activationStatus?: string;
  activationDepositFee?: number;
  activationTxHash?: string;
  paymentProofImage?: string;
  paymentMethodSymbol?: string;
  goal: number;
  raised?: number;
  donationsCount?: number;
  image?: string;
  beneficiary?: string;
  location?: string;
  cryptoPayoutAddress?: string;
  cryptoPayoutSymbol?: string;
  author?: { id: number; name: string; email?: string };
  directDonations?: Array<{
    id: number;
    donorName: string;
    amountUsd: number;
    cryptoAmount?: string;
    cryptoSymbol?: string;
    createdAt: string;
    txHash?: string;
  }>;
  updates?: Array<{
    title: string;
    content: string;
    date: string;
    image?: string;
  }>;
  createdAt: string;
}

export default function EditCausePage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const causeId = Number(params?.id);

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [error, setError] = useState('');

  // Editable Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState<number>(10000);
  const [raised, setRaised] = useState<number>(0);
  const [category, setCategory] = useState('Clean Water');
  const [urgency, setUrgency] = useState('Featured');
  const [status, setStatus] = useState('APPROVED');
  const [activationStatus, setActivationStatus] = useState('ACTIVE');
  const [image, setImage] = useState('');
  const [beneficiary, setBeneficiary] = useState('');
  const [location, setLocation] = useState('');
  const [cryptoPayoutAddress, setCryptoPayoutAddress] = useState('');
  const [cryptoPayoutSymbol, setCryptoPayoutSymbol] = useState('USDC');

  // $5 Payment Proof States
  const [paymentProofImage, setPaymentProofImage] = useState('');
  const [paymentMethodSymbol, setPaymentMethodSymbol] = useState('BTC');
  const [activationTxHash, setActivationTxHash] = useState('');
  const [activationDepositFee, setActivationDepositFee] = useState<number>(5.0);
  const [isProofZoomed, setIsProofZoomed] = useState(false);

  // AI Modal State
  const [showAiModal, setShowAiModal] = useState(false);

  // New Update Form State
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateContent, setUpdateContent] = useState('');
  const [updateImage, setUpdateImage] = useState('');
  const [postingUpdate, setPostingUpdate] = useState(false);
  const [showAddUpdate, setShowAddUpdate] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
    if (user && causeId) loadCause();
  }, [user, authLoading, causeId, router]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadCause = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.admin.posts.get(causeId);
      setPost(data);
      setTitle(data.title || '');
      setDescription(data.description || '');
      setGoal(data.goal || 10000);
      setRaised(data.raised !== undefined ? data.raised : (data.goal || 10000) * 0.45);
      setCategory(data.category || 'Clean Water');
      setUrgency(data.urgency || 'Featured');
      setStatus(data.status || 'APPROVED');
      setActivationStatus(data.activationStatus || 'ACTIVE');
      setImage(data.image || '');
      setBeneficiary(data.beneficiary || '');
      setLocation(data.location || '');
      setCryptoPayoutAddress(data.cryptoPayoutAddress || '');
      setCryptoPayoutSymbol(data.cryptoPayoutSymbol || 'USDC');
      setPaymentProofImage(data.paymentProofImage || '');
      setPaymentMethodSymbol(data.paymentMethodSymbol || 'BTC');
      setActivationTxHash(data.activationTxHash || '');
      setActivationDepositFee(data.activationDepositFee !== undefined ? data.activationDepositFee : 5.0);
    } catch (err: any) {
      setError(err.message || 'Failed to load cause details');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProof = async () => {
    setSaving(true);
    try {
      await api.admin.posts.update(causeId, {
        status: 'APPROVED',
        activationStatus: 'ACTIVE',
      });
      setStatus('APPROVED');
      setActivationStatus('ACTIVE');
      showToast('Payment proof approved and cause published live!');
    } catch (err: any) {
      alert(err.message || 'Failed to approve proof');
    } finally {
      setSaving(false);
    }
  };

  const handleRejectProof = async () => {
    setSaving(true);
    try {
      await api.admin.posts.update(causeId, {
        status: 'REJECTED',
        activationStatus: 'REJECTED',
      });
      setStatus('REJECTED');
      setActivationStatus('REJECTED');
      showToast('Payment proof marked as rejected.');
    } catch (err: any) {
      alert(err.message || 'Failed to reject proof');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const updated = await api.admin.posts.update(causeId, {
        title: title.trim(),
        description: description.trim(),
        goal: Number(goal),
        raised: Number(raised),
        category,
        urgency,
        status,
        activationStatus,
        image,
        beneficiary: beneficiary.trim(),
        location: location.trim(),
        cryptoPayoutAddress: cryptoPayoutAddress.trim(),
        cryptoPayoutSymbol,
        paymentProofImage: paymentProofImage || undefined,
        paymentMethodSymbol,
        activationTxHash: activationTxHash || undefined,
        activationDepositFee: Number(activationDepositFee),
      });

      setPost((prev) => (prev ? { ...prev, ...updated } : updated));
      showToast('Cause metrics, funds, and content published live to public portal!');
    } catch (err: any) {
      setError(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handlePostUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateTitle.trim() || !updateContent.trim()) return;

    setPostingUpdate(true);
    try {
      await api.admin.posts.addUpdate(causeId, {
        title: updateTitle.trim(),
        content: updateContent.trim(),
        image: updateImage || undefined,
      });

      showToast('New proof-of-impact field update posted successfully!');
      setUpdateTitle('');
      setUpdateContent('');
      setUpdateImage('');
      setShowAddUpdate(false);
      loadCause(); // Reload updates
    } catch (err: any) {
      alert(err.message || 'Failed to post field update');
    } finally {
      setPostingUpdate(false);
    }
  };

  const currentPercent = goal > 0 ? Math.round((raised / goal) * 100) : 0;
  const safeImage = image && (image.startsWith('http') || image.startsWith('/')) ? image : '/causes/cause_water_1786200462466.jpg';

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500">Loading Cause Studio...</p>
        </div>
      </div>
    );
  }

  if (!post && !loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar />
        <div className="max-w-xl mx-auto py-20 text-center space-y-4 px-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Cause Not Found</h2>
          <p className="text-xs text-slate-500">The cause #{causeId} does not exist or was removed.</p>
          <Link href="/posts" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">
            <ArrowLeft className="w-4 h-4" /> Back to Causes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans pb-24">
      <Navbar />

      {/* Floating Success Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-fade-in-up text-xs font-bold">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Breadcrumbs & Action Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/posts"
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-900 transition-colors shrink-0"
              title="Back to Causes Directory"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400">Causes / Cause #{causeId}</span>
                <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md uppercase border ${
                  status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {status}
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-black text-slate-900 truncate">
                {title || post?.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <a
              href={`http://localhost:3005/causes/${causeId}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all border border-slate-200"
            >
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span>View Public Portal</span>
              <ExternalLink className="w-3 h-3 ml-0.5 text-slate-400" />
            </a>

            <button
              type="button"
              onClick={() => handleSaveAll()}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/20 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save & Publish Live</span>
            </button>
          </div>

        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex-1 w-full space-y-8">
        
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* HERO METRICS & LIVE PROGRESS VISUALIZER                                   */}
        {/* ========================================================================= */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700/80 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-800/80">
                ⚡ Real-Time On-Chain Progress
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
                Campaign Progress & Fund Allocator
              </h2>
              <p className="text-xs text-slate-400">
                Manipulate goal targets, gathered capital sliders, and real-time public telemetry.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-slate-800/80 border border-slate-700 px-4 py-2.5 rounded-2xl shrink-0">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Status</span>
                <span className="text-xs font-black text-emerald-400 font-mono">
                  {status} • {activationStatus}
                </span>
              </div>
              <div className="h-8 w-px bg-slate-700" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Supporters Count</span>
                <span className="text-xs font-black text-white font-mono">
                  {post?.directDonations?.length || (raised > 0 ? 1 : 0)} Verified Donors
                </span>
              </div>
            </div>
          </div>

          {/* Big Number Counters & Bar */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div>
                <span className="text-3xl sm:text-4xl font-black font-mono text-emerald-400">
                  ${raised.toLocaleString()}
                </span>
                <span className="text-xs text-slate-300 font-medium ml-2">USD gathered up to now</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-slate-300">
                  Goal: <strong className="text-white">${goal.toLocaleString()} USD</strong>
                </span>
                <span className="px-2 py-0.5 rounded-full font-black text-emerald-300 bg-emerald-900/60 border border-emerald-700 text-[11px]">
                  {currentPercent}% Funded
                </span>
              </div>
            </div>

            {/* Live Progress Bar */}
            <div className="h-4 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700 shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 rounded-full transition-all duration-200"
                style={{ width: `${Math.min(currentPercent, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MAIN TWO-COLUMN STUDIO LAYOUT                                            */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column (8 Cols): Funds Slider + DeepSeek AI Storyteller */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* 1. INTERACTIVE FUNDS & PROGRESS SLIDER CONTROLLER */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                    <SlidersHorizontal className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Funds & Progress Slider Studio</h3>
                    <p className="text-xs text-slate-500">Live manipulate target goals and amount gathered with one-click ratios.</p>
                  </div>
                </div>

                <span className="text-xs font-mono font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  {currentPercent}%
                </span>
              </div>

              {/* Target Goal Input & Increments */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Target Funding Goal ($ USD)
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min={100}
                    step={500}
                    value={goal}
                    onChange={(e) => setGoal(Math.max(100, parseFloat(e.target.value) || 0))}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                {/* Increments */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
                  {[5000, 10000, 25000, 50000, 100000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setGoal(preset)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                        goal === preset 
                          ? 'bg-slate-900 text-white shadow-xs' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      ${preset / 1000}k Goal
                    </button>
                  ))}
                </div>
              </div>

              {/* Gathered Amount Input & Range Slider */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Amount Gathered Up to Now ($ USD)
                  </label>
                  <span className="text-xs font-mono font-black text-emerald-700">
                    ${raised.toLocaleString()}
                  </span>
                </div>

                {/* Range Slider */}
                <div className="space-y-1.5">
                  <input
                    type="range"
                    min={0}
                    max={goal * 1.25} // Allow stretch goals up to 125%!
                    step={Math.max(10, Math.round(goal / 100))}
                    value={raised}
                    onChange={(e) => setRaised(parseFloat(e.target.value) || 0)}
                    className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold font-mono">
                    <span>$0 (0%)</span>
                    <span>50% (${Math.round(goal * 0.5).toLocaleString()})</span>
                    <span>100% (${goal.toLocaleString()})</span>
                    <span>125% Stretch</span>
                  </div>
                </div>

                {/* Direct Number Input */}
                <div className="relative pt-1">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min={0}
                    value={raised}
                    onChange={(e) => setRaised(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                {/* Quick Ratio Pills */}
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
                      onClick={() => setRaised(Math.round(goal * p.ratio))}
                      className={`py-2 px-2 rounded-xl text-xs font-black transition-all ${
                        Math.round(goal * p.ratio) === raised
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* 2. CAUSE DESCRIPTION & DRAFT ASSISTANT */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Campaign Description</h3>
                    <p className="text-xs text-slate-500">Edit the mission details, action strategy, and delivery milestones.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAiModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shrink-0 border border-slate-200"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-600" />
                  <span>Draft Assistant</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Cause Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Clean Water Infrastructure for 12 Rural Primary Schools"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Mission Narrative & Action Strategy
                </label>
                <textarea
                  rows={10}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail the geographic scope, beneficiary communities, milestone deliverables, and budget allocation..."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-purple-500 focus:bg-white leading-relaxed resize-none font-normal"
                />
                <div className="flex justify-between items-center text-[11px] text-slate-400 font-medium mt-1.5 px-1">
                  <span>Structured headings (🎯 The Mission, 🛠️ Direct Action, 💫 Impact) render automatically on public portal.</span>
                  <span>{description.split(/\s+/).filter(Boolean).length} words</span>
                </div>
              </div>
            </div>

            {/* 3. VERIFIED FIELD IMPACT UPDATES MANAGER */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Proof of Impact Field Updates</h3>
                    <p className="text-xs text-slate-500">Post geo-tagged and timestamped milestones to keep donors informed.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddUpdate(!showAddUpdate)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showAddUpdate ? 'Cancel' : 'Add Update'}</span>
                </button>
              </div>

              {/* Add New Update Form */}
              {showAddUpdate && (
                <form onSubmit={handlePostUpdate} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 animate-fade-in">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">New Field Update</h4>
                  
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Update Title (e.g., Phase 1 Borehole Drilled & Solar Pump Mounted)"
                      value={updateTitle}
                      onChange={(e) => setUpdateTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <textarea
                      required
                      rows={3}
                      placeholder="Provide verified details from the ground, contractor sign-offs, and community reception..."
                      value={updateContent}
                      onChange={(e) => setUpdateContent(e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 resize-none"
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Photo Image URL (Optional)"
                      value={updateImage}
                      onChange={(e) => setUpdateImage(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={postingUpdate}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    {postingUpdate ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Publish Field Update</span>
                  </button>
                </form>
              )}

              {/* Updates List */}
              {(!post?.updates || post.updates.length === 0) ? (
                <div className="py-8 text-center border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
                  No field updates posted yet. Click &quot;Add Update&quot; above to publish progress proof.
                </div>
              ) : (
                <div className="space-y-4">
                  {post.updates.map((upd, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-slate-900">{upd.title}</h4>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {upd.date ? new Date(upd.date).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{upd.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Column (4 Cols): Settings, Image, Category, Beneficiary, Moderation */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* $5 VERIFICATION & PAYMENT PROOF AUDIT CARD */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-xs">
                    📸
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      $5 Verification Proof
                    </h3>
                    <p className="text-[10px] text-slate-400">Anti-spam deposit proof from organizer</p>
                  </div>
                </div>

                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                  status === 'APPROVED'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : status === 'REJECTED'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : paymentProofImage
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  {activationStatus || status}
                </span>
              </div>

              {/* Payment Proof Receipt Image Preview */}
              {paymentProofImage ? (
                <div className="space-y-3">
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900/5 border border-slate-200 group">
                    <img
                      src={paymentProofImage}
                      alt="Submitted payment receipt"
                      className="w-full h-full object-contain"
                    />
                    <div 
                      onClick={() => setIsProofZoomed(!isProofZoomed)}
                      className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    >
                      <span className="px-3 py-1.5 bg-white text-slate-900 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{isProofZoomed ? 'Close Zoom' : 'Enlarge Proof'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Zoom Modal Overlay if toggled */}
                  {isProofZoomed && (
                    <div 
                      onClick={() => setIsProofZoomed(false)}
                      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
                    >
                      <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-3xl p-2 border border-slate-800 overflow-hidden shadow-2xl">
                        <img
                          src={paymentProofImage}
                          alt="Full resolution payment proof"
                          className="max-h-[85vh] w-auto rounded-2xl object-contain mx-auto"
                        />
                      </div>
                    </div>
                  )}

                  {/* Payment Details */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Fee Charge</span>
                      <span className="font-mono font-black text-emerald-700 text-xs mt-0.5 block">
                        $5.00 USD ({paymentMethodSymbol})
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Organizer</span>
                      <span className="font-bold text-slate-900 text-xs mt-0.5 truncate block">
                        {post?.author?.name || 'Organizer'}
                      </span>
                    </div>
                  </div>

                  {activationTxHash && activationTxHash !== 'PROOF_IMAGE_ATTACHED' && (
                    <div className="p-2.5 bg-slate-900 text-white rounded-xl space-y-0.5">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">TX Hash</span>
                      <span className="font-mono text-[10px] text-emerald-400 select-all break-all block">
                        {activationTxHash}
                      </span>
                    </div>
                  )}

                  {/* Approval Actions */}
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleRejectProof}
                      disabled={saving}
                      className="flex-1 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleApproveProof}
                      disabled={saving}
                      className="flex-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve & Go Live</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center space-y-2">
                  <span className="text-xs text-slate-500 block">No payment receipt screenshot uploaded.</span>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl cursor-pointer shadow-2xs">
                    <Plus className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Upload Proof Receipt</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const formData = new FormData();
                          formData.append('file', file);
                          try {
                            const res = await fetch('/api/upload', { method: 'POST', body: formData });
                            const d = await res.json();
                            if (d.url) setPaymentProofImage(d.url);
                          } catch (err) {
                            console.error(err);
                          }
                        }
                      }}
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Cover Image Picker & 16:9 Aspect Ratio Guide Box */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
              <ImageUploadGuide
                value={image}
                onChange={(url) => setImage(url)}
                label="Cause Cover Image (16:9 Aspect Ratio)"
              />
            </div>

            {/* Moderation & Categorization Settings */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">Campaign Settings</h3>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Clean Water">Clean Water & Sanitation</option>
                  <option value="Education">Education & School Labs</option>
                  <option value="Healthcare">Healthcare & Maternal Aid</option>
                  <option value="Emergency Relief">Emergency Food & Shelter</option>
                  <option value="Agriculture">Sustainable Farming & Tools</option>
                  <option value="Women Empowerment">Women & Youth Empowerment</option>
                  <option value="Environment">Environment & Solar Power</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Urgency Level
                </label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
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
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Approval Status
                </label>
                <select
                  value={status}
                  onChange={(e) => {
                    const val = e.target.value;
                    setStatus(val);
                    setActivationStatus(val === 'APPROVED' ? 'ACTIVE' : 'PAUSED');
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                >
                  <option value="APPROVED">🟢 APPROVED (Live & Visible)</option>
                  <option value="PENDING">⏳ PENDING (Awaiting Verification)</option>
                  <option value="REJECTED">🔴 REJECTED (Archived)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Direct Beneficiary Description
                </label>
                <input
                  type="text"
                  value={beneficiary}
                  onChange={(e) => setBeneficiary(e.target.value)}
                  placeholder="e.g., 3,400 rural schoolchildren in Tigray"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Location / Region
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Somali Region, Ethiopia"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleSaveAll()}
                  disabled={saving}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save & Publish Live</span>
                </button>
              </div>
            </div>

            {/* Direct On-Chain Donations History Feed */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  <span>Donations Feed ({post?.directDonations?.length || 0})</span>
                </h3>
              </div>

              {(!post?.directDonations || post.directDonations.length === 0) ? (
                <div className="py-6 text-center text-slate-400 text-xs font-medium">
                  No direct on-chain donations recorded yet.
                </div>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {post.directDonations.map((d) => (
                    <div key={d.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900 block truncate max-w-[140px]">{d.donorName}</span>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          {new Date(d.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-black text-emerald-700 block">${d.amountUsd.toLocaleString()}</span>
                        <span className="text-[9px] text-slate-400 font-mono block">{d.cryptoSymbol || 'USDC'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </main>

      {/* Description Draft Modal */}
      <AiStoryWriterModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        onApply={(generatedText) => {
          setDescription(generatedText);
          showToast('Description draft applied successfully!');
        }}
        initialTitle={title}
        initialCategory={category}
        initialGoal={goal}
        initialBeneficiary={beneficiary}
        initialLocation={location}
      />

    </div>
  );
}
