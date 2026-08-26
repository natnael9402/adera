'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import QRCodeWithLogo from '@/components/QRCodeWithLogo';
import ImageUploadGuide from '@/components/ImageUploadGuide';
import { 
  Heart, Hexagon, ArrowLeft, PenTool,
  CheckCircle2, AlertCircle, Loader2, DollarSign, 
  Layers, Flame, FileText, ArrowRight, ShieldCheck, 
  Coins, Copy, Check, X, ExternalLink, Globe, Wallet,
  Bitcoin, MapPin, Users, Info, RefreshCw, Send, CheckCheck, Eye,
  Clock, Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  { id: 'Clean Water', name: 'Clean Water & Sanitation', icon: '💧' },
  { id: 'Education', name: 'Education & Digital Labs', icon: '📚' },
  { id: 'Healthcare', name: 'Healthcare & Maternal Aid', icon: '🏥' },
  { id: 'Emergency Relief', name: 'Emergency & Food Relief', icon: '🚨' },
  { id: 'Agriculture', name: 'Sustainable Farming & Food', icon: '🌱' },
  { id: 'Women Empowerment', name: 'Women & Youth Empowerment', icon: '✨' },
];

const PRESET_COVERS = [
  { label: 'Clean Water Well', url: '/causes/cause_water_1786200462466.jpg' },
  { label: 'School Lab', url: '/causes/cause_school_1786200448807.jpg' },
  { label: 'Maternal Clinic', url: '/causes/cause_clinic_1786200473696.jpg' },
  { label: 'Farming Co-op', url: '/causes/cause_farming_1786200495727.jpg' },
  { label: 'Orphanage Center', url: '/causes/cause_orphanage_1786200527864.jpg' },
  { label: 'Women Enterprise', url: '/causes/cause_women_1786200616826.jpg' },
];

const CRYPTO_PAYMENT_OPTIONS = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    network: 'Bitcoin Native (SegWit)',
    address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
    amountCrypto: '0.000075',
    amountUsd: 5,
    icon: '/crypto/btc.svg',
    iconColor: 'text-amber-500 bg-amber-50 border-amber-200',
    uriPrefix: 'bitcoin:bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq?amount=0.000075',
    memo: 'Bitcoin Native SegWit $5 verification deposit',
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    network: 'Multi-Chain (ERC-20 / SPL)',
    address: '0x71C88147d3B85229211C473fC4223A44d71FaCbe',
    amountCrypto: '5.00',
    amountUsd: 5,
    icon: '/crypto/usdc.svg',
    iconColor: 'text-blue-500 bg-blue-50 border-blue-200',
    uriPrefix: 'ethereum:0x71C88147d3B85229211C473fC4223A44d71FaCbe',
    memo: 'USD Coin instant verification deposit',
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    network: 'TRC-20 / ERC-20',
    address: '0x71C88147d3B85229211C473fC4223A44d71FaCbe',
    amountCrypto: '5.00',
    amountUsd: 5,
    icon: '/crypto/usdt.svg',
    iconColor: 'text-emerald-500 bg-emerald-50 border-emerald-200',
    uriPrefix: 'ethereum:0x71C88147d3B85229211C473fC4223A44d71FaCbe',
    memo: 'Tether stablecoin verification deposit',
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    network: 'Ethereum Mainnet',
    address: '0x71C88147d3B85229211C473fC4223A44d71FaCbe',
    amountCrypto: '0.0026',
    amountUsd: 5,
    icon: '/crypto/eth.svg',
    iconColor: 'text-indigo-500 bg-indigo-50 border-indigo-200',
    uriPrefix: 'ethereum:0x71C88147d3B85229211C473fC4223A44d71FaCbe?value=0.0026',
    memo: 'Ethereum verification deposit',
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    network: 'Solana Mainnet',
    address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    amountCrypto: '0.035',
    amountUsd: 5,
    icon: '/crypto/sol.svg',
    iconColor: 'text-purple-500 bg-purple-50 border-purple-200',
    uriPrefix: 'solana:7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU?amount=0.035',
    memo: 'Solana sub-second confirmation deposit',
  },
];

export default function NewCausePage() {
  const { user, login } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [createdCause, setCreatedCause] = useState<any>(null);

  // Step 1: Vision & Story
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [goal, setGoal] = useState<number>(25000);
  const [urgency, setUrgency] = useState('Featured');

  // Step 2: Beneficiary & Payout Rails
  const [beneficiary, setBeneficiary] = useState('');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState('');
  const [cryptoPayoutAddress, setCryptoPayoutAddress] = useState('');
  const [cryptoPayoutSymbol, setCryptoPayoutSymbol] = useState('BTC');

  // Step 3: $5 Verification Deposit & Proof Upload
  const [selectedCrypto, setSelectedCrypto] = useState(CRYPTO_PAYMENT_OPTIONS[0]);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [paymentProofImage, setPaymentProofImage] = useState('');
  const [uploadingProof, setUploadingProof] = useState(false);
  const [proofError, setProofError] = useState('');
  const [isActivating, setIsActivating] = useState(false);

  // Guest Authentication state (if user is not signed in)
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPassword, setGuestPassword] = useState('');
  const [guestName, setGuestName] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [authLoading, setAuthLoading] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle Proof Image File Upload
  const handleProofUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setProofError('Please upload a valid image (PNG, JPG, WEBP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setProofError('Screenshot file size must be under 10 MB.');
      return;
    }

    setProofError('');
    setUploadingProof(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Upload failed');
      }

      const data = await res.json();
      if (data.url) {
        setPaymentProofImage(data.url);
      } else {
        throw new Error('No image URL returned');
      }
    } catch (err: any) {
      console.error('Proof upload error:', err);
      // Resilient fallback to local base64 reader so user is never stuck
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) setPaymentProofImage(e.target.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingProof(false);
    }
  };

  // Create Campaign (Transition from Step 2 to Step 3)
  const handleCreatePost = async () => {
    setError('');

    if (!title.trim() || !description.trim()) {
      setError('Please fill in the campaign title and description story.');
      return;
    }

    if (!user) {
      // Must authenticate first
      if (!guestEmail.trim() || !guestPassword.trim()) {
        setError('Please sign in or create an organizer account to finalize campaign creation.');
        return;
      }

      setAuthLoading(true);
      try {
        if (authMode === 'signup') {
          await api.auth.signup({
            email: guestEmail.trim(),
            name: guestName.trim() || 'Cause Organizer',
            password: guestPassword,
          });
        }
        await login(guestEmail.trim(), guestPassword);
      } catch (err: any) {
        setError(err.message || 'Authentication failed. Please check credentials.');
        setAuthLoading(false);
        return;
      } finally {
        setAuthLoading(false);
      }
    }

    setLoading(true);

    try {
      const newPost = await api.posts.create({
        title: title.trim(),
        description: description.trim(),
        category,
        goal: Number(goal),
        urgency,
        image: image || PRESET_COVERS[0].url,
        beneficiary: beneficiary.trim(),
        location: location.trim(),
        cryptoPayoutAddress: cryptoPayoutAddress.trim() || selectedCrypto.address,
        cryptoPayoutSymbol: cryptoPayoutSymbol || 'BTC',
      });

      setCreatedCause(newPost);
      setStep(3); // Move to $5 Verification Deposit & Proof Upload
    } catch (err: any) {
      setError(err.message || 'Failed to submit campaign for verification.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Payment Proof & Finalize Verification Request for Admin
  const handleActivateCampaign = async () => {
    if (!createdCause?.id) return;
    setError('');

    if (!paymentProofImage && !txHash.trim()) {
      setError('Please upload a screenshot of your $5 payment receipt or enter the transaction hash.');
      return;
    }

    setIsActivating(true);

    try {
      const res = await api.posts.activate(createdCause.id, {
        txHash: txHash.trim() || 'PROOF_IMAGE_ATTACHED',
        paymentProofImage: paymentProofImage || '',
        depositAmount: 5.0,
        cryptoSymbol: selectedCrypto.symbol,
      });

      setCreatedCause((prev: any) => ({
        ...prev,
        ...res,
        activationStatus: 'PENDING_REVIEW',
        status: 'PENDING',
        paymentProofImage: paymentProofImage || prev?.paymentProofImage,
      }));
      setStep(4); // Success Celebration & Request Dispatched View
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to submit payment verification request.');
    } finally {
      setIsActivating(false);
    }
  };

  const copyToClipboard = (text: string, type: 'address' | 'amount') => {
    navigator.clipboard.writeText(text);
    if (type === 'address') {
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } else {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
    }
  };

  const btcEquivalent = (goal / 95000).toFixed(3);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white relative overflow-hidden">
      <Navbar />

      {/* Ambient Radial Background Glows (Landing Page Style) */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] pointer-events-none -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-400/15 rounded-full blur-3xl" />
        <div className="absolute top-10 right-1/4 w-96 h-96 bg-amber-400/15 rounded-full blur-3xl" />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-24 flex-1 w-full space-y-8">
        
        {/* ========================================================================= */}
        {/* HERO HEADER                                                               */}
        {/* ========================================================================= */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-black shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>0% Platform Fees • Direct Blockchain Giving Protocol</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Launch a Verified <span className="text-emerald-700 underline decoration-emerald-300 underline-offset-4">Humanitarian Cause</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            Publish transparent milestone deliverables with Bitcoin (BTC) & multi-chain payouts, structured milestone plans, and on-chain verification.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* PROGRESS STEPPER                                                          */}
        {/* ========================================================================= */}
        <div className="max-w-2xl mx-auto bg-white border border-slate-200 p-2 rounded-2xl shadow-xs">
          <div className="grid grid-cols-4 gap-1 sm:gap-2">
            {[
              { num: 1, label: 'Vision & Story' },
              { num: 2, label: 'Payout Rails' },
              { num: 3, label: '$5 Deposit & Proof' },
              { num: 4, label: 'Admin Review' },
            ].map((s) => (
              <button
                key={s.num}
                type="button"
                disabled={s.num > step && !createdCause}
                onClick={() => {
                  if (s.num <= step) setStep(s.num as any);
                }}
                className={`py-2 px-1 sm:px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all ${
                  step === s.num
                    ? 'bg-slate-900 text-white shadow-xs'
                    : step > s.num
                    ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                    : 'text-slate-400 bg-transparent'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  step === s.num ? 'bg-emerald-500 text-slate-950' : step > s.num ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  {step > s.num ? <Check className="w-3 h-3" /> : s.num}
                </span>
                <span className="hidden sm:inline truncate">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Global Error Notice */}
        {error && (
          <div className="max-w-3xl mx-auto p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-700 flex items-center gap-2.5 animate-fade-in shadow-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MAIN STUDIO TWO-COLUMN WORKSPACE                                         */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (7 Cols): Step-by-Step Interactive Studio */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* --------------------------------------------------------------------- */}
            {/* STEP 1: CAMPAIGN VISION & SMART NARRATIVE STUDIO                      */}
            {/* --------------------------------------------------------------------- */}
            {step === 1 && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
                
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-emerald-400 shadow-2xs border border-slate-800">
                      <PenTool className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-slate-900">Step 1: Campaign Vision & Story</h2>
                      <p className="text-xs text-slate-500">Define your humanitarian goal and craft high-impact narrative.</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-400">1 of 3</span>
                </div>

                {/* Title Input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Campaign Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Solar Powered Water Well for 1,200 Harar Primary Students"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />
                </div>

                {/* Category Selector Pills */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Mission Category <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`p-3 rounded-xl border text-left flex items-center gap-2 transition-all ${
                          category === cat.id
                            ? 'bg-emerald-50/80 border-emerald-500 text-emerald-900 shadow-2xs'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className="text-base">{cat.icon}</span>
                        <span className="text-xs font-bold truncate">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target Funding Goal ($ USD & BTC) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Target Funding Goal ($ USD)
                    </label>
                    <span className="text-xs font-mono font-bold text-amber-700 flex items-center gap-1">
                      <Bitcoin className="w-3.5 h-3.5 text-amber-500" />
                      ≈ {btcEquivalent} BTC
                    </span>
                  </div>

                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min={100}
                      step={500}
                      value={goal}
                      onChange={(e) => setGoal(Math.max(100, parseFloat(e.target.value) || 0))}
                      className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>

                  {/* Quick Goal Presets */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
                    {[5000, 10000, 25000, 50000, 100000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setGoal(amt)}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                          goal === amt ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}
                      >
                        ${amt / 1000}k USD
                      </button>
                    ))}
                  </div>
                </div>

                {/* Campaign Story Textarea */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Campaign Story & Action Plan <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={8}
                    required
                    placeholder="Describe the background, immediate challenge, equipment/supplies needed, and target impact..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 leading-relaxed placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all resize-none font-normal"
                  />
                  <div className="flex justify-between items-center text-[10px] text-slate-400 px-1">
                    <span>Markdown supported. Headings (🎯 Mission, 🛠️ Action, 💫 Impact) are auto-formatted.</span>
                    <span>{description.split(/\s+/).filter(Boolean).length} words</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!title.trim() || !description.trim()) {
                        setError('Please provide both a title and description before proceeding.');
                        return;
                      }
                      setError('');
                      setStep(2);
                    }}
                    className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                  >
                    <span>Proceed to Beneficiary & Payout Setup</span>
                    <ArrowRight className="w-4 h-4 text-emerald-400" />
                  </button>
                </div>

              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* STEP 2: BENEFICIARY, COVER PHOTO & PAYOUT RAILS                       */}
            {/* --------------------------------------------------------------------- */}
            {step === 2 && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
                
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-slate-900">Step 2: Beneficiary & Payout Rails</h2>
                      <p className="text-xs text-slate-500">Specify community location, cover image, and Bitcoin/crypto payout wallet.</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-400">2 of 3</span>
                </div>

                {/* Beneficiary & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Direct Beneficiary
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 1,200 primary students & villagers"
                      value={beneficiary}
                      onChange={(e) => setBeneficiary(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Location / Region
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Harar District, Eastern Ethiopia"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Cover Image Upload & 16:9 Aspect Ratio Guide Box */}
                <ImageUploadGuide
                  value={image}
                  onChange={setImage}
                  label="Campaign Cover Image (16:9 Aspect Ratio)"
                />

                {/* Payout Crypto Rails Setup */}
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Campaign Target Payout Wallet (Disbursement)
                    </h3>
                  </div>

                  <p className="text-xs text-slate-500">
                    When funds are disbursed upon verified milestones, they will be sent directly to this address.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Payout Asset
                      </label>
                      <select
                        value={cryptoPayoutSymbol}
                        onChange={(e) => setCryptoPayoutSymbol(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-extrabold text-slate-900 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="BTC">Bitcoin (BTC)</option>
                        <option value="USDC">USD Coin (USDC)</option>
                        <option value="USDT">Tether (USDT)</option>
                        <option value="ETH">Ethereum (ETH)</option>
                        <option value="SOL">Solana (SOL)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Destination Wallet Address
                      </label>
                      <input
                        type="text"
                        placeholder={
                          cryptoPayoutSymbol === 'BTC'
                            ? 'bc1q... (Native SegWit/Taproot)'
                            : cryptoPayoutSymbol === 'SOL'
                            ? 'Solana address...'
                            : '0x... (EVM Address)'
                        }
                        value={cryptoPayoutAddress}
                        onChange={(e) => setCryptoPayoutAddress(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Organizer Authentication Block (if guest) */}
                {!user && (
                  <div className="p-5 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-950 uppercase tracking-wider">
                        Organizer Account Sign In / Register
                      </span>
                      <div className="flex gap-1 text-[11px] font-bold">
                        <button
                          type="button"
                          onClick={() => setAuthMode('signup')}
                          className={`px-2 py-0.5 rounded-md ${authMode === 'signup' ? 'bg-emerald-600 text-white' : 'text-emerald-800'}`}
                        >
                          New Organizer
                        </button>
                        <button
                          type="button"
                          onClick={() => setAuthMode('login')}
                          className={`px-2 py-0.5 rounded-md ${authMode === 'login' ? 'bg-emerald-600 text-white' : 'text-emerald-800'}`}
                        >
                          Sign In
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {authMode === 'signup' && (
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            placeholder="Your Name or Organization"
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl text-xs text-slate-900 focus:outline-none"
                          />
                        </div>
                      )}
                      <div>
                        <input
                          type="email"
                          placeholder="Organizer Email"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl text-xs text-slate-900 focus:outline-none"
                        />
                      </div>
                      <div>
                        <input
                          type="password"
                          placeholder="Password"
                          value={guestPassword}
                          onChange={(e) => setGuestPassword(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl text-xs text-slate-900 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
                  >
                    ← Back
                  </button>

                  <button
                    type="button"
                    onClick={handleCreatePost}
                    disabled={loading || authLoading}
                    className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {loading || authLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Submit Campaign & Staking Verification</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* STEP 3: $5 VERIFICATION DEPOSIT & PAYMENT PROOF UPLOAD                */}
            {/* --------------------------------------------------------------------- */}
            {step === 3 && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
                
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-2xs">
                      <Coins className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-slate-900">Step 3: $5 Verification Deposit & Proof</h2>
                      <p className="text-xs text-slate-500">Complete the $5 anti-spam charge and upload your payment screenshot for Admin approval.</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    ID #{createdCause?.id}
                  </span>
                </div>

                {/* Coin Selector Tabs */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Select Payment Cryptocurrency ($5.00 USD)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {CRYPTO_PAYMENT_OPTIONS.map((coin) => {
                      const isSelected = selectedCrypto.symbol === coin.symbol;
                      return (
                        <button
                          key={coin.symbol}
                          type="button"
                          onClick={() => setSelectedCrypto(coin)}
                          className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                            isSelected
                              ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-emerald-500/20'
                              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                          }`}
                        >
                          <div className="w-6 h-6 relative my-0.5">
                            <Image src={coin.icon} alt={coin.name} fill className="object-contain" />
                          </div>
                          <span className="block text-xs font-black">{coin.symbol}</span>
                          <span className={`block text-[10px] font-mono font-bold ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`}>
                            {coin.amountCrypto}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* QR Code & Payment Details Box (Dark Glass Theme) */}
                <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-6">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    
                    {/* QR Code with Centered Crypto Logo */}
                    <div className="bg-white p-3 rounded-2xl shadow-lg shrink-0 border border-white/20">
                      <QRCodeWithLogo
                        value={selectedCrypto.uriPrefix}
                        size={150}
                        logoSize={34}
                      />
                    </div>

                    <div className="space-y-3 min-w-0 flex-1 text-center sm:text-left">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800/80 inline-block">
                          {selectedCrypto.network}
                        </span>
                        <div className="flex items-baseline justify-center sm:justify-start gap-2 mt-1.5">
                          <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
                            {selectedCrypto.amountCrypto} {selectedCrypto.symbol}
                          </span>
                          <span className="text-xs text-slate-400 font-bold">($5.00 USD)</span>
                        </div>
                      </div>

                      {/* Deposit Address with Copy Action */}
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Recipient Address</span>
                        <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 px-3 py-2 rounded-xl">
                          <span className="font-mono text-xs text-slate-200 truncate flex-1 select-all text-left">
                            {selectedCrypto.address}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedCrypto.address, 'address')}
                            className="p-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all shrink-0 active:scale-95 cursor-pointer"
                            title="Copy Address"
                          >
                            {copiedAddress ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Copy Amount & Anti-Spam Notice */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>$5 charge protects the network from bot spam</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(selectedCrypto.amountCrypto, 'amount')}
                      className="text-emerald-400 hover:underline font-bold text-xs cursor-pointer flex items-center gap-1"
                    >
                      {copiedAmount ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Amount Copied!</span>
                        </>
                      ) : (
                        <span>Copy Exact Amount</span>
                      )}
                    </button>
                  </div>
                </div>

                {/* PROOF OF PAYMENT UPLOAD CARD */}
                <div className="p-5 bg-slate-50 border-2 border-dashed border-slate-300 rounded-3xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                        📸
                      </div>
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                          Proof of Payment (Screenshot / Receipt) <span className="text-rose-500">*</span>
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Upload a screenshot from your wallet (Coinbase, TrustWallet, Binance, Phantom, etc.) confirming the $5 transfer.
                        </p>
                      </div>
                    </div>

                    {paymentProofImage && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Proof Attached
                      </span>
                    )}
                  </div>

                  {proofError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{proofError}</span>
                    </div>
                  )}

                  {/* Upload Dropzone or Attached Preview */}
                  {paymentProofImage ? (
                    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 bg-white p-3 space-y-3">
                      <div className="relative w-full h-44 sm:h-52 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                        <img
                          src={paymentProofImage}
                          alt="Proof of payment"
                          className="w-full h-full object-contain bg-slate-900/5"
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs px-1">
                        <span className="font-bold text-slate-700 truncate max-w-xs">
                          {paymentProofImage.split('/').pop() || 'payment_proof_receipt.jpg'}
                        </span>
                        
                        <div className="flex items-center gap-2">
                          <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg cursor-pointer transition-colors text-xs flex items-center gap-1">
                            <RefreshCw className="w-3 h-3" />
                            <span>Change Proof</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleProofUpload(file);
                              }}
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => setPaymentProofImage('')}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                            title="Remove Proof"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <label className={`w-full py-8 px-4 rounded-2xl border border-slate-300 bg-white hover:bg-slate-100/60 flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-all ${
                      uploadingProof ? 'opacity-50 pointer-events-none' : ''
                    }`}>
                      {uploadingProof ? (
                        <div className="flex flex-col items-center gap-2 text-emerald-600">
                          <Loader2 className="w-8 h-8 animate-spin" />
                          <span className="text-xs font-bold">Uploading Receipt Screenshot...</span>
                        </div>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">
                              Click or Drag & Drop to Upload Transfer Screenshot
                            </span>
                            <span className="text-[11px] text-slate-400">
                              PNG, JPG, WEBP, HEIC up to 10 MB
                            </span>
                          </div>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingProof}
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleProofUpload(file);
                        }}
                      />
                    </label>
                  )}
                </div>

                {/* Optional TXID Input Field */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Transaction Hash / TXID <span className="text-slate-400 font-normal text-[10px]">(Optional if screenshot attached)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b"
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                {/* Submit Action Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleActivateCampaign}
                    disabled={isActivating || uploadingProof || (!paymentProofImage && !txHash.trim())}
                    className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm rounded-2xl transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {isActivating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting Proof & Requesting Activation...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-emerald-300" />
                        <span>Submit Payment Proof for Admin Approval</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* STEP 4: SUCCESS CONFIRMATION & ADMIN REVIEW NOTICE                    */}
            {/* --------------------------------------------------------------------- */}
            {step === 4 && (
              <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm text-center space-y-6 animate-fade-in">
                
                <div className="w-20 h-20 bg-emerald-50 border-2 border-emerald-200 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
                  <CheckCheck className="w-10 h-10 text-emerald-600" />
                </div>

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-black uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Request Dispatched to Admin Queue</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Campaign Created & Pending $5 Verification
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
                    Thank you! Your cause #{createdCause?.id} and \$5 payment receipt ({selectedCrypto.symbol}) have been delivered to our administrative console. Once our team verifies the proof, your campaign will be approved and published live.
                  </p>
                </div>

                {/* Submitted Proof Card */}
                {paymentProofImage && (
                  <div className="max-w-md mx-auto p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-4 text-left">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-300">
                      <img src={paymentProofImage} alt="Submitted receipt" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        Payment Proof Attached
                      </span>
                      <p className="text-xs font-bold text-slate-900 truncate mt-1">
                        {title || 'Campaign Submission'}
                      </p>
                      <span className="text-[11px] text-slate-400 font-mono block">
                        Deposit: $5.00 USD ({selectedCrypto.amountCrypto} {selectedCrypto.symbol})
                      </span>
                    </div>
                  </div>
                )}

                {/* Quick Navigation Links */}
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href={`/causes/${createdCause?.id || ''}`}
                    className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Preview Cause Page</span>
                  </Link>

                  <Link
                    href="/dashboard"
                    className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <span>Go to Organizer Dashboard</span>
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>

              </div>
            )}

          </div>

          {/* Right Column (5 Cols): Live Floating Interactive Preview Card */}
          <div className="lg:col-span-5 sticky top-28 space-y-4">
            
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                <span>Live Public Card Preview</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Auto-Syncing
              </span>
            </div>

            {/* Public Portal Style Preview Card */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-lg hover:shadow-xl transition-all">
              
              {/* Cover Image (16:9 Aspect Ratio Frame) */}
              <div className="relative aspect-[16/9] w-full bg-slate-100 overflow-hidden border-b border-slate-100">
                {image ? (
                  <img
                    src={image}
                    alt={title || 'Cause cover'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100 p-6 text-center gap-2">
                    <ImageIcon className="w-8 h-8 text-slate-300" />
                    <span className="text-xs font-bold text-slate-500">16:9 Cover Image Live Preview</span>
                    <span className="text-[10px] text-slate-400">Upload in Step 2 to preview</span>
                  </div>
                )}
                
                <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                  <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-slate-950/80 text-white backdrop-blur-md rounded-lg border border-white/20">
                    {category}
                  </span>
                  <span className="px-2.5 py-1 text-[10px] font-extrabold bg-amber-500 text-slate-950 rounded-lg shadow-xs">
                    {urgency}
                  </span>
                </div>

                <div className="absolute bottom-3 right-3 z-10 px-2.5 py-1 text-[10px] font-mono font-bold bg-white/90 text-slate-900 rounded-lg shadow-xs backdrop-blur-md">
                  ID: #{createdCause?.id || 'NEW'}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 line-clamp-2">
                    {title || 'Your Inspiring Campaign Title Here...'}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-3 mt-1.5 leading-relaxed">
                    {description || 'Provide a compelling humanitarian narrative explaining the direct impact, community need, and delivery milestones...'}
                  </p>
                </div>

                {/* Progress Bar & Numbers */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex justify-between items-baseline text-xs font-mono font-bold">
                    <span className="text-emerald-700">$0 USD gathered</span>
                    <span className="text-slate-400">Goal: ${goal.toLocaleString()}</span>
                  </div>

                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
                    <div className="h-full bg-emerald-500 w-[5%]" />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Bitcoin className="w-3 h-3 text-amber-500" />
                      <span>Accepts BTC, ETH, SOL, USDC</span>
                    </span>
                    <span className="font-bold text-slate-700">0% Funded</span>
                  </div>
                </div>

                {/* Beneficiary Badge */}
                {beneficiary && (
                  <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center gap-2 text-xs text-slate-600">
                    <Users className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">Beneficiary: <strong>{beneficiary}</strong></span>
                  </div>
                )}

              </div>

            </div>

            {/* Quick Assurance Box */}
            <div className="p-4 bg-emerald-950 text-white rounded-2xl space-y-2 shadow-xs">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-black">
                <ShieldCheck className="w-4 h-4" />
                <span>On-Chain Direct Giving Guarantee</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-normal">
                100% of donor contributions flow directly to verified payout wallets with zero platform intermediaries.
              </p>
            </div>

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
