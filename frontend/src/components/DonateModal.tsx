'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Heart, Copy, Check, ShieldCheck, ArrowRight, ArrowLeft,
  Lock, Coins, CheckCircle2, DollarSign, Wallet, 
  QrCode, User, Mail, Eye, EyeOff, Loader2, Sparkles, LogOut, AlertCircle,
  ChevronDown, Search, CreditCard, RefreshCw, UploadCloud, Trash2, FileCheck
} from 'lucide-react';
import { useDonate, CauseDonationTarget } from '@/context/DonateContext';
import { useAuth } from '@/context/AuthContext';
import QRCodeWithLogo from './QRCodeWithLogo';
import { api } from '@/lib/api';
import { shrinkImage } from '@/lib/imageShrinker';

interface CryptoOption {
  symbol: string;
  name: string;
  network: string;
  address: string;
  rate: number;
  icon: string;
  prefix: string;
}

const DEFAULT_CRYPTO_OPTIONS: CryptoOption[] = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    network: 'Bitcoin Native (SegWit)',
    address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
    rate: 63050.00,
    icon: '/crypto/btc.svg',
    prefix: 'bitcoin:bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq?amount=',
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    network: 'Multi-Chain (ERC20 / SPL)',
    address: '0x71C88147d3B85229211C473fC4223A44d71FaCbe',
    rate: 1.00,
    icon: '/crypto/usdc.svg',
    prefix: 'ethereum:0x71C88147d3B85229211C473fC4223A44d71FaCbe',
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    network: 'Ethereum Mainnet (ERC-20)',
    address: '0x71C88147d3B85229211C473fC4223A44d71FaCbe',
    rate: 1885.00,
    icon: '/crypto/eth.svg',
    prefix: 'ethereum:0x71C88147d3B85229211C473fC4223A44d71FaCbe?value=',
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    network: 'Solana Mainnet (SPL)',
    address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    rate: 142.50,
    icon: '/crypto/sol.svg',
    prefix: 'solana:7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU?amount=',
  },
  {
    symbol: 'USDT',
    name: 'Tether',
    network: 'Tether (ERC-20 / TRC-20)',
    address: '0x71C88147d3B85229211C473fC4223A44d71FaCbe',
    rate: 1.00,
    icon: '/crypto/usdt.svg',
    prefix: 'ethereum:0x71C88147d3B85229211C473fC4223A44d71FaCbe',
  },
];

const PRESET_USD_AMOUNTS = [25, 50, 100, 250, 500, 1000];

const FALLBACK_CAUSES: CauseDonationTarget[] = [
  {
    id: 33,
    title: 'Solar Water Filtration Well in Dire Dawa',
    category: 'Clean Water',
    goal: 18000,
    raised: 14760,
    image: '/causes/cause_water_1786200462466.jpg',
    description: 'Providing sustainable solar-powered deep borehole water access to drought-affected rural communities.',
    urgency: 'Critical',
  },
  {
    id: 19,
    title: 'Build a Rural School in Tigray',
    category: 'Education',
    goal: 50000,
    raised: 38250,
    image: '/causes/cause_school_1786200448807.jpg',
    description: 'Constructing modern classrooms, libraries, and clean sanitation for 600 elementary students.',
    urgency: 'Urgent',
  },
  {
    id: 22,
    title: 'Mobile Medical Clinic in Amhara',
    category: 'Healthcare',
    goal: 25000,
    raised: 19500,
    image: '/causes/cause_clinic_1786200473696.jpg',
    description: 'Equipping an all-terrain mobile clinic to provide emergency triage, vaccinations, and prenatal care.',
    urgency: 'Featured',
  },
  {
    id: 32,
    title: 'Sustainable Agriculture Tools',
    category: 'Empowerment',
    goal: 25000,
    raised: 17500,
    image: '/causes/cause_farming_1786200495727.jpg',
    description: 'Empowering smallholder farming families with drip irrigation kits, climate-resilient seeds, and training.',
    urgency: 'Almost There',
  },
  {
    id: 28,
    title: 'Emergency Food Supplies for Somali Region',
    category: 'Disaster Relief',
    goal: 60000,
    raised: 42000,
    image: '/causes/cause_disaster_food.jpg',
    description: 'Delivering life-saving nutrition packs and clean drinking water to famine-vulnerable pastoralist households.',
    urgency: 'Urgent',
  },
  {
    id: 31,
    title: "Women's Skill Training Workshop",
    category: 'Empowerment',
    goal: 12000,
    raised: 8900,
    image: '/causes/cause_women_1786200616826.jpg',
    description: 'Vocational training, micro-grant seeding, and textile machinery for female-led rural cooperatives.',
    urgency: 'New',
  },
  {
    id: 30,
    title: 'Solar Panels for Rural Clinics',
    category: 'Environment',
    goal: 22000,
    raised: 16800,
    image: '/causes/cause_env_solar.jpg',
    description: 'Installing solar power battery banks for continuous refrigeration of critical vaccines and medicines.',
    urgency: 'Featured',
  },
  {
    id: 25,
    title: 'Clean Water Well for Somali Region',
    category: 'Clean Water',
    goal: 15000,
    raised: 11250,
    image: '/causes/cause_water_pump.jpg',
    description: 'Drilling community water points serving over 4,000 residents and livestock herds.',
    urgency: 'Urgent',
  },
];

export default function DonateModal() {
  const { isOpen, activeCause, closeDonateModal, setActiveCause } = useDonate();
  const { user: authUser, token: authToken, logout: authLogout } = useAuth();

  // Causes List & Dropdown State
  const [allCauses, setAllCauses] = useState<CauseDonationTarget[]>(FALLBACK_CAUSES);
  const [showCauseDropdown, setShowCauseDropdown] = useState(false);
  const [causeSearch, setCauseSearch] = useState('');

  // Wizard Step: 1 (Account), 2 (Payment Method & Amount), 3 (QR & Send), 4 (Success)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [direction, setDirection] = useState(1);

  // Payment Selection State
  const [selectedMethod, setSelectedMethod] = useState<'crypto' | 'card' | 'paypal'>('crypto');
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoOption>(DEFAULT_CRYPTO_OPTIONS[0]);
  const [usdAmount, setUsdAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('100');
  const [copied, setCopied] = useState(false);
  const [donorName, setDonorName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [confirmedTxHash, setConfirmedTxHash] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  // Authenticated User State
  const [currentUser, setCurrentUser] = useState<{ id?: number; name?: string; email?: string } | null>(null);
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Payment Proof State (Canvas-shrunk WebP)
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [proofOriginalSize, setProofOriginalSize] = useState<number | null>(null);
  const [proofShrunkSize, setProofShrunkSize] = useState<number | null>(null);
  const [isShrinking, setIsShrinking] = useState(false);
  const [uploadProofError, setUploadProofError] = useState<string | null>(null);
  const [uploadedProofUrl, setUploadedProofUrl] = useState<string | null>(null);

  const handleProofSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadProofError(null);
    setIsShrinking(true);
    setProofOriginalSize(file.size);

    try {
      const shrunk = await shrinkImage(file, 1280, 0.82);
      setProofFile(shrunk.file);
      setProofShrunkSize(shrunk.shrunkSize);
      setProofPreview(shrunk.dataUrl);
    } catch (err: any) {
      console.error('Failed to compress proof image:', err);
      setProofFile(file);
      setProofShrunkSize(file.size);
      const reader = new FileReader();
      reader.onload = () => {
        setProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsShrinking(false);
    }
  };

  const removeProof = () => {
    setProofFile(null);
    setProofPreview(null);
    setProofOriginalSize(null);
    setProofShrunkSize(null);
    setUploadedProofUrl(null);
    setUploadProofError(null);
  };

  // Fetch all causes on mount
  useEffect(() => {
    let mounted = true;
    api.posts.list()
      .then((posts: any[]) => {
        if (!mounted) return;
        if (Array.isArray(posts) && posts.length > 0) {
          const fallbackImgs = [
            "/causes/cause_water_1786200462466.jpg",
            "/causes/cause_school_1786200448807.jpg",
            "/causes/cause_clinic_1786200473696.jpg",
            "/causes/cause_farming_1786200495727.jpg",
            "/causes/cause_disaster_food.jpg",
            "/causes/cause_women_1786200616826.jpg",
          ];
          const mapped: CauseDonationTarget[] = posts.map((p, idx) => ({
            id: p.id,
            title: p.title,
            category: p.category || 'Humanitarian Relief',
            goal: p.goal || 25000,
            raised: p.raised || 0,
            image: p.image || fallbackImgs[idx % fallbackImgs.length],
            description: p.description,
            urgency: p.urgency,
          }));
          setAllCauses(mapped);
        }
      })
      .catch((err) => {
        console.warn('Using curated fallback causes for modal:', err);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Check authenticated state on mount or when modal opens
  useEffect(() => {
    if (isOpen) {
      setCopied(false);
      setConfirmedTxHash('');
      setSubmitting(false);
      setAuthError(null);
      setShowCauseDropdown(false);
      setCauseSearch('');
      removeProof();

      // Check if user is already signed up / logged in
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      let active = authUser;

      if (!active && storedUser) {
        try {
          active = JSON.parse(storedUser);
        } catch (e) {}
      }

      if (active || storedToken || authToken) {
        setCurrentUser(active);
        setDonorName(active?.name || '');
        setCurrentStep(2); // ALREADY SIGNED UP: Instantly jump straight to Amount & Payment!
      } else {
        setCurrentUser(null);
        setCurrentStep(1); // Only show for non-signed-up visitors
      }
    }
  }, [isOpen, authUser, authToken]);

  const filteredCauses = useMemo(() => {
    if (!causeSearch.trim()) return allCauses;
    const q = causeSearch.toLowerCase();
    return allCauses.filter(c => 
      c.title.toLowerCase().includes(q) || 
      (c.category && c.category.toLowerCase().includes(q))
    );
  }, [allCauses, causeSearch]);

  if (!isOpen || !activeCause) return null;

  // Calculate live crypto amount
  const cryptoAmount = (usdAmount / selectedCrypto.rate).toFixed(
    selectedCrypto.symbol === 'BTC' ? 6 : selectedCrypto.symbol === 'ETH' || selectedCrypto.symbol === 'SOL' ? 4 : 2
  );

  // Formatted QR payment string
  const qrPaymentUri = selectedCrypto.symbol === 'BTC'
    ? `bitcoin:${selectedCrypto.address}?amount=${cryptoAmount}`
    : selectedCrypto.symbol === 'ETH'
    ? `ethereum:${selectedCrypto.address}?value=${cryptoAmount}`
    : selectedCrypto.symbol === 'SOL'
    ? `solana:${selectedCrypto.address}?amount=${cryptoAmount}`
    : selectedCrypto.address;

  const goToStep = (step: 1 | 2 | 3 | 4) => {
    setDirection(step > currentStep ? 1 : -1);
    setAuthError(null);
    setCurrentStep(step);
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(selectedCrypto.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePresetSelect = (amount: number) => {
    setUsdAmount(amount);
    setCustomAmount(amount.toString());
  };

  const handleCustomAmountChange = (val: string) => {
    setCustomAmount(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed > 0) {
      setUsdAmount(parsed);
    }
  };

  // Instant In-Modal Authentication & Account Creation (Step 1)
  const handleQuickAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!authEmail || !authEmail.includes('@')) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    if (authPassword.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }

    setAuthLoading(true);
    try {
      let res;
      if (authMode === 'login') {
        res = await api.auth.login({
          email: authEmail.trim(),
          password: authPassword,
        });
      } else {
        res = await api.auth.quickDonorAuth({
          email: authEmail.trim(),
          name: authName.trim() || authEmail.split('@')[0],
          password: authPassword,
        });
      }

      if (res.token && res.user) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        setCurrentUser(res.user);
        setDonorName(res.user.name || '');
        setIsAnonymous(false);
        goToStep(2);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAnonymousContinue = () => {
    setIsAnonymous(true);
    setDonorName('Anonymous Donor');
    goToStep(2);
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    authLogout();
    setCurrentUser(null);
    goToStep(1);
  };

  // Step 2 Submission (Proceed to QR Code)
  const handleProceedToQR = () => {
    if (usdAmount <= 0) {
      alert('Please select or enter a valid donation amount.');
      return;
    }
    goToStep(3);
  };

  // Step 3 Submission (Confirm Payment Sent)
  const handleConfirmSent = async () => {
    setSubmitting(true);
    const mockTxHash = `0x${Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('')}`;
    setConfirmedTxHash(mockTxHash);

    let proofUrl: string | undefined = undefined;
    if (proofFile) {
      try {
        const uploadRes = await api.upload.proof(proofFile);
        proofUrl = uploadRes.url;
        setUploadedProofUrl(uploadRes.url);
      } catch (err: any) {
        console.error('Proof upload error, proceeding with donation recording:', err);
      }
    }

    try {
      if (activeCause?.id) {
        await api.posts.donate(Number(activeCause.id), {
          donorName: isAnonymous ? 'Anonymous Supporter' : (donorName.trim() || currentUser?.name || 'Generous Donor'),
          donorEmail: currentUser?.email,
          amountUsd: usdAmount,
          cryptoAmount,
          cryptoSymbol: selectedCrypto.symbol,
          txHash: mockTxHash,
          isAnonymous,
          paymentProof: proofUrl,
        });
      }
    } catch (err) {
      console.error('Error recording donation:', err);
    } finally {
      setSubmitting(false);
      goToStep(4);
    }
  };

  const goal = activeCause.goal || 50000;
  const raised = activeCause.raised || goal * 0.48;
  const percentFunded = Math.min(Math.round((raised / goal) * 100), 100);
  const coverImage = activeCause.image || '/causes/cause_water_1786200462466.jpg';

  const stepVariants: any = {
    enter: (dir: number) => ({
      x: dir > 0 ? 25 : -25,
      opacity: 0,
      scale: 0.99,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.25,
        ease: 'easeOut',
      },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -25 : 25,
      opacity: 0,
      scale: 0.99,
      transition: {
        duration: 0.18,
        ease: 'easeIn',
      },
    }),
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 overflow-y-auto font-sans">
        
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeDonateModal}
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-md transition-opacity"
        />

        {/* Modal Container: Fixed Max Height, Internal Scroll, Never Cut Off */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl sm:rounded-[32px] border border-slate-200 shadow-2xl overflow-hidden my-auto z-10 flex flex-col max-h-[94vh] sm:max-h-[90vh]"
        >

          {currentStep < 4 ? (
            <>
              {/* ========================================================= */}
              {/* 1. PINNED HEADER: CAUSE DROPDOWN & CLOSE BUTTON */}
              {/* ========================================================= */}
              <div className="relative bg-slate-950 text-white p-3.5 sm:p-5 border-b border-slate-800 shrink-0 z-30">
                
                {/* Ambient background photo overlay */}
                <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
                  <Image
                    src={coverImage}
                    alt={activeCause.title}
                    fill
                    className="object-cover"
                    sizes="600px"
                  />
                  <div className="absolute inset-0 bg-slate-950/85" />
                </div>

                <div className="relative z-10 space-y-2.5">
                  
                  {/* Top Row: Cause Selector Button & Close Button */}
                  <div className="flex items-center justify-between gap-2.5">
                    
                    {/* CAUSE SWITCHER DROPDOWN TRIGGER */}
                    <div className="relative flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => setShowCauseDropdown(!showCauseDropdown)}
                        className="w-full sm:w-auto inline-flex items-center justify-between sm:justify-start gap-2.5 px-3 py-1.5 sm:py-2 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-700/90 text-white transition-all shadow-sm group cursor-pointer active:scale-[0.99]"
                      >
                        <div className="w-7 h-7 rounded-xl overflow-hidden relative shrink-0 border border-slate-700 bg-slate-800">
                          <Image src={coverImage} alt={activeCause.title} fill className="object-cover" sizes="28px" />
                        </div>
                        <div className="flex flex-col text-left min-w-0 pr-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] uppercase font-mono font-bold text-emerald-400 leading-none">
                              {activeCause.category || 'Cause'}
                            </span>
                            <span className="text-[9px] text-slate-400 font-semibold">• Change</span>
                          </div>
                          <span className="text-xs sm:text-sm font-black text-white truncate max-w-[190px] sm:max-w-[320px] md:max-w-[380px]">
                            {activeCause.title}
                          </span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-transform shrink-0 ${showCauseDropdown ? 'rotate-180 text-emerald-400' : ''}`} />
                      </button>

                      {/* DROPDOWN MENU */}
                      <AnimatePresence>
                        {showCauseDropdown && (
                          <>
                            {/* Backdrop click outside */}
                            <div 
                              className="fixed inset-0 z-40" 
                              onClick={() => setShowCauseDropdown(false)} 
                            />

                            <motion.div
                              initial={{ opacity: 0, y: 6, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 6, scale: 0.98 }}
                              transition={{ duration: 0.15 }}
                              className="absolute top-full left-0 mt-2 w-full sm:w-[420px] max-w-[92vw] bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-80"
                            >
                              {/* Search Bar */}
                              <div className="p-2.5 border-b border-slate-800 flex items-center gap-2 bg-slate-900/80">
                                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <input
                                  type="text"
                                  value={causeSearch}
                                  onChange={(e) => setCauseSearch(e.target.value)}
                                  placeholder="Search causes by title or category..."
                                  className="w-full bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none font-medium"
                                  autoFocus
                                />
                                {causeSearch && (
                                  <button 
                                    type="button" 
                                    onClick={() => setCauseSearch('')} 
                                    className="text-slate-400 hover:text-white text-xs px-1 cursor-pointer"
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>

                              {/* Cause Items List */}
                              <div className="overflow-y-auto divide-y divide-slate-800/60 p-1.5 space-y-1">
                                {filteredCauses.map((c) => {
                                  const isSelected = String(c.id) === String(activeCause.id);
                                  const cGoal = c.goal || 50000;
                                  const cRaised = c.raised || 0;
                                  const cPct = Math.min(Math.round((cRaised / cGoal) * 100), 100);
                                  return (
                                    <button
                                      key={c.id}
                                      type="button"
                                      onClick={() => {
                                        setActiveCause(c);
                                        setShowCauseDropdown(false);
                                        setCauseSearch('');
                                      }}
                                      className={`w-full text-left p-2 rounded-xl transition-all flex items-center gap-2.5 cursor-pointer ${
                                        isSelected
                                          ? 'bg-emerald-950/60 border border-emerald-500/40 text-white'
                                          : 'hover:bg-slate-900 text-slate-300'
                                      }`}
                                    >
                                      <div className="w-10 h-10 rounded-lg overflow-hidden relative shrink-0 bg-slate-900 border border-slate-800">
                                        <Image
                                          src={c.image || '/causes/cause_water_1786200462466.jpg'}
                                          alt={c.title}
                                          fill
                                          className="object-cover"
                                          sizes="40px"
                                        />
                                      </div>
                                      <div className="flex-1 min-w-0 space-y-0.5">
                                        <div className="flex items-center justify-between gap-1">
                                          <span className="text-[9px] font-mono font-bold uppercase text-emerald-400">
                                            {c.category || 'Humanitarian'}
                                          </span>
                                          <span className="text-[10px] font-mono text-slate-400">
                                            {cPct}% Funded
                                          </span>
                                        </div>
                                        <p className="text-xs font-bold text-white truncate">
                                          {c.title}
                                        </p>
                                      </div>
                                      {isSelected && (
                                        <Check className="w-4 h-4 text-emerald-400 shrink-0 stroke-[3]" />
                                      )}
                                    </button>
                                  );
                                })}
                                {filteredCauses.length === 0 && (
                                  <div className="p-4 text-center text-xs text-slate-500">
                                    No causes found matching &quot;{causeSearch}&quot;
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Close Button */}
                    <button
                      onClick={closeDonateModal}
                      className="w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all shrink-0 cursor-pointer"
                      title="Close"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Progress Tracker */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-baseline text-xs font-mono">
                      <div className="space-x-1.5">
                        <span className="font-extrabold text-emerald-400 text-sm">
                          ${raised.toLocaleString()}
                        </span>
                        <span className="text-slate-400 text-[11px]">raised of ${goal.toLocaleString()}</span>
                      </div>
                      <span className="font-extrabold text-slate-300 text-[11px]">{percentFunded}% Funded</span>
                    </div>

                    <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentFunded}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full rounded-full bg-emerald-500"
                      />
                    </div>
                  </div>

                </div>
              </div>

              {/* ========================================================= */}
              {/* 2. PINNED STEP INDICATOR */}
              {/* ========================================================= */}
              <div className="px-4 sm:px-6 py-2 sm:py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0 z-20">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">
                    {currentUser ? `Step 0${currentStep - 1} of 02:` : `Step 0${currentStep} of 03:`}
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    {currentStep === 1 && 'Donor Identification'}
                    {currentStep === 2 && 'Payment & Amount'}
                    {currentStep === 3 && 'Verification & Transfer'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {(currentUser ? [2, 3] : [1, 2, 3]).map((stepIdx) => (
                    <div
                      key={stepIdx}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        currentStep === stepIdx
                          ? 'w-6 bg-emerald-600'
                          : currentStep > stepIdx
                          ? 'w-2 bg-emerald-400'
                          : 'w-2 bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* ========================================================= */}
              {/* 3. SCROLLABLE STEP BODY */}
              {/* ========================================================= */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <AnimatePresence custom={direction} mode="wait">
                  
                  {/* ========================================================= */}
                  {/* STEP 1: DONOR ACCOUNT CREATION & SIGN IN */}
                  {/* ========================================================= */}
                  {currentStep === 1 && (
                    <motion.div
                      key="step-1"
                      custom={direction}
                      variants={stepVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="space-y-4 max-w-lg mx-auto"
                    >
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>Direct On-Chain Allocation</span>
                        </div>
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">
                          Donor Information
                        </h3>
                        <p className="text-xs text-slate-500">
                          Provide your details for verified tax receipts and milestone proofs, or proceed anonymously.
                        </p>
                      </div>

                      {/* Minimal Segment Switcher */}
                      <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                        <button
                          type="button"
                          onClick={() => { setAuthMode('register'); setAuthError(null); }}
                          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                            authMode === 'register'
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          New Donor
                        </button>
                        <button
                          type="button"
                          onClick={() => { setAuthMode('login'); setAuthError(null); }}
                          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                            authMode === 'login'
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          Sign In
                        </button>
                      </div>

                      {authError && (
                        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                          <span>{authError}</span>
                        </div>
                      )}

                      <form onSubmit={handleQuickAuth} className="space-y-3">
                        {authMode === 'register' && (
                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                              Your Name
                            </label>
                            <input
                              type="text"
                              value={authName}
                              onChange={(e) => setAuthName(e.target.value)}
                              placeholder="e.g. Alex Johnson"
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600 transition-colors"
                            />
                          </div>
                        )}

                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                            Email Address *
                          </label>
                          <input
                            required
                            type="email"
                            value={authEmail}
                            onChange={(e) => setAuthEmail(e.target.value)}
                            placeholder="donor@example.com"
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600 transition-colors"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                              Password *
                            </label>
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="text-[11px] text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
                            >
                              {showPassword ? 'Hide' : 'Show'}
                            </button>
                          </div>
                          <input
                            required
                            type={showPassword ? 'text' : 'password'}
                            value={authPassword}
                            onChange={(e) => setAuthPassword(e.target.value)}
                            placeholder="At least 6 characters"
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600 transition-colors"
                          />
                        </div>

                        <div className="pt-1 space-y-2.5">
                          <button
                            type="submit"
                            disabled={authLoading}
                            className="w-full py-3 bg-slate-950 hover:bg-slate-800 active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                          >
                            {authLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Verifying...</span>
                              </>
                            ) : (
                              <>
                                <span>{authMode === 'register' ? 'Continue to Payment' : 'Sign In & Continue'}</span>
                                <ArrowRight className="w-4 h-4" />
                              </>
                            )}
                          </button>

                          <div className="text-center pt-1 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={handleAnonymousContinue}
                              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-1 cursor-pointer py-1"
                            >
                              <span>Skip & donate anonymously (no account needed)</span>
                              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                            </button>
                          </div>
                        </div>
                      </form>
                    </motion.div>
                  )}

                  {/* ========================================================= */}
                  {/* STEP 2: PAYMENT METHOD & AMOUNT SELECTION */}
                  {/* ========================================================= */}
                  {currentStep === 2 && (
                    <motion.div
                      key="step-2"
                      custom={direction}
                      variants={stepVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="space-y-4 max-w-xl mx-auto"
                    >
                      {/* Authenticated User Status Bar: Compact 1-line */}
                      {currentUser && (
                        <div className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-5 h-5 rounded-full bg-emerald-700 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                              {currentUser.name?.[0]?.toUpperCase() || 'D'}
                            </div>
                            <span className="font-bold text-slate-800 truncate">
                              {currentUser.name || 'Donor'}
                            </span>
                            <span className="text-[11px] text-slate-400 truncate hidden sm:inline">
                              • {currentUser.email}
                            </span>
                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded shrink-0">
                              Verified
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={handleSignOut}
                            className="text-[11px] font-bold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1 shrink-0 ml-2 cursor-pointer"
                          >
                            <LogOut className="w-3 h-3" />
                            <span>Switch</span>
                          </button>
                        </div>
                      )}

                      {/* 1. Payment Methods: Compact, No Overlaps */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                          1. Payment Channel
                        </label>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          
                          {/* Option 1: Crypto (Active) */}
                          <div
                            onClick={() => setSelectedMethod('crypto')}
                            className="p-3 rounded-2xl border-2 border-emerald-600 bg-emerald-50/60 shadow-2xs flex items-center justify-between cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="flex -space-x-1.5">
                                <div className="w-5 h-5 rounded-full bg-amber-500 text-white font-black text-[9px] flex items-center justify-center border border-white">₿</div>
                                <div className="w-5 h-5 rounded-full bg-blue-500 text-white font-black text-[9px] flex items-center justify-center border border-white">$</div>
                                <div className="w-5 h-5 rounded-full bg-indigo-500 text-white font-black text-[9px] flex items-center justify-center border border-white">Ξ</div>
                              </div>
                              <div>
                                <div className="text-xs font-black text-slate-900 leading-tight">Instant Crypto</div>
                                <div className="text-[10px] text-emerald-800 font-semibold font-mono">0% Fee • On-Chain</div>
                              </div>
                            </div>
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white shrink-0">
                              Active
                            </span>
                          </div>

                          {/* Option 2: Credit Card (Coming Soon) */}
                          <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50/60 opacity-60 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-slate-400 shrink-0" />
                              <div>
                                <div className="text-xs font-bold text-slate-600 leading-tight">Credit Card</div>
                                <div className="text-[10px] text-slate-400">Visa / Mastercard</div>
                              </div>
                            </div>
                            <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-200 text-slate-600">
                              Soon
                            </span>
                          </div>

                          {/* Option 3: PayPal / Apple Pay (Coming Soon) */}
                          <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50/60 opacity-60 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Wallet className="w-4 h-4 text-slate-400 shrink-0" />
                              <div>
                                <div className="text-xs font-bold text-slate-600 leading-tight">Digital Wallets</div>
                                <div className="text-[10px] text-slate-400">Apple / PayPal</div>
                              </div>
                            </div>
                            <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-200 text-slate-600">
                              Soon
                            </span>
                          </div>

                        </div>
                      </div>

                      {/* 2. Asset Selection: 5-Col Grid Fits Perfectly Everywhere */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                          2. Supported Currency / Asset
                        </label>

                        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                          {DEFAULT_CRYPTO_OPTIONS.map((crypto) => {
                            const isSelected = selectedCrypto.symbol === crypto.symbol;
                            return (
                              <button
                                key={crypto.symbol}
                                type="button"
                                onClick={() => setSelectedCrypto(crypto)}
                                className={`p-2 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all text-center cursor-pointer ${
                                  isSelected
                                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20 shadow-xs'
                                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                                }`}
                              >
                                <div className="w-6 h-6 relative flex items-center justify-center">
                                  <Image
                                    src={crypto.icon}
                                    alt={crypto.name}
                                    width={22}
                                    height={22}
                                    className="object-contain"
                                    style={{ width: 'auto', height: 'auto' }}
                                  />
                                </div>
                                <span className="text-xs font-black font-mono leading-none">
                                  {crypto.symbol}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* 3. Donation Amount & Converter */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                            3. Donation Amount
                          </label>
                          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                            ≈ {cryptoAmount} {selectedCrypto.symbol}
                          </span>
                        </div>

                        {/* Presets: 6 buttons */}
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                          {PRESET_USD_AMOUNTS.map((amt) => (
                            <button
                              key={amt}
                              type="button"
                              onClick={() => handlePresetSelect(amt)}
                              className={`py-2 text-xs font-black font-mono rounded-xl transition-all cursor-pointer ${
                                usdAmount === amt && customAmount === String(amt)
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                              }`}
                            >
                              ${amt}
                            </button>
                          ))}
                        </div>

                        {/* Custom Input */}
                        <div className="relative">
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 font-mono">
                            $ USD
                          </div>
                          <input
                            type="number"
                            min="1"
                            value={customAmount}
                            onChange={(e) => handleCustomAmountChange(e.target.value)}
                            placeholder="Enter custom amount in USD"
                            className="w-full pl-18 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      {/* Public Recognition Checkbox */}
                      <div className="flex items-center justify-between bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
                        <span className="text-xs font-bold text-slate-700">
                          Public Recognition
                        </span>
                        <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer font-medium">
                          <input
                            type="checkbox"
                            checked={isAnonymous}
                            onChange={(e) => setIsAnonymous(e.target.checked)}
                            className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                          />
                          <span>Hide name on leaderboard</span>
                        </label>
                      </div>

                      {/* Step 2 Action Buttons */}
                      <div className="pt-2 flex items-center justify-between gap-3">
                        {!currentUser && (
                          <button
                            type="button"
                            onClick={() => goToStep(1)}
                            className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={handleProceedToQR}
                          className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <span>Proceed to QR Code & Address</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>

                    </motion.div>
                  )}

                  {/* ========================================================= */}
                  {/* STEP 3: DEDICATED QR CODE & WALLET TRANSFER SCREEN */}
                  {/* ========================================================= */}
                  {currentStep === 3 && (
                    <motion.div
                      key="step-3"
                      custom={direction}
                      variants={stepVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="space-y-4 max-w-xl mx-auto"
                    >
                      {/* Top Payment Target Notice */}
                      <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                            Transfer Target
                          </span>
                          <h4 className="text-xs sm:text-sm font-black text-slate-900 mt-1">
                            Send exactly <span className="text-emerald-700 font-mono">{cryptoAmount} {selectedCrypto.symbol}</span> (${usdAmount} USD)
                          </h4>
                        </div>
                        <div className="w-7 h-7 relative flex items-center justify-center shrink-0">
                          <Image src={selectedCrypto.icon} alt={selectedCrypto.name} width={24} height={24} className="object-contain" />
                        </div>
                      </div>

                      {/* Main QR Code & Address Box */}
                      <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-4 text-center sm:text-left">
                        <div className="flex flex-col sm:flex-row items-center gap-5">
                          
                          {/* Centered QR Code with Logo */}
                          <div className="shrink-0 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs">
                            <QRCodeWithLogo
                              value={qrPaymentUri}
                              size={160}
                              logoSrc="/logo.png"
                              logoSize={36}
                            />
                            <p className="text-[9px] text-center font-extrabold text-slate-400 mt-1.5 uppercase tracking-wider">
                              Scan with Wallet
                            </p>
                          </div>

                          {/* Instructions & Deposit Address */}
                          <div className="flex-1 space-y-3 min-w-0 w-full">
                            <div>
                              <span className="text-xs font-bold text-slate-500 block">
                                Network: <strong className="text-slate-800">{selectedCrypto.network}</strong>
                              </span>
                              <p className="text-[11px] text-slate-600 leading-relaxed mt-1">
                                Open MetaMask, Phantom, Coinbase, or Trust Wallet and scan the QR code or send funds to the address below.
                              </p>
                            </div>

                            {/* Plain Text Address Box */}
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Official Deposit Address:
                              </span>
                              <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
                                <code className="text-xs font-mono font-bold text-slate-900 truncate select-all flex-1 text-left">
                                  {selectedCrypto.address}
                                </code>
                                <button
                                  type="button"
                                  onClick={handleCopyAddress}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1 shrink-0 shadow-xs cursor-pointer"
                                >
                                  {copied ? (
                                    <>
                                      <Check className="w-3 h-3 stroke-[3]" />
                                      <span>Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>

                          </div>
                        </div>
                      </div>

                      {/* Proof of Payment Screenshot Dropzone */}
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                            <UploadCloud className="w-3.5 h-3.5 text-emerald-600" />
                            Proof of Payment Screenshot (Optional)
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            Auto-shrunk WebP (≤1280px)
                          </span>
                        </div>

                        {!proofPreview ? (
                          <label className="block border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-4 text-center cursor-pointer transition-colors bg-white hover:bg-emerald-50/20 group">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleProofSelected}
                              disabled={isShrinking || submitting}
                            />
                            {isShrinking ? (
                              <div className="flex flex-col items-center justify-center py-2 space-y-2">
                                <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
                                <p className="text-xs font-bold text-slate-700">Compressing screenshot to WebP...</p>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center py-2 space-y-1.5">
                                <div className="w-9 h-9 rounded-full bg-slate-100 group-hover:bg-emerald-100 text-slate-500 group-hover:text-emerald-700 flex items-center justify-center transition-colors">
                                  <UploadCloud className="w-4 h-4" />
                                </div>
                                <p className="text-xs font-bold text-slate-800">
                                  Attach transaction receipt screenshot
                                </p>
                                <p className="text-[10px] text-slate-400">
                                  Drag & drop or tap to select • PNG, JPG, WebP
                                </p>
                              </div>
                            )}
                          </label>
                        ) : (
                          <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-12 h-12 rounded-lg border border-slate-200 overflow-hidden shrink-0 relative bg-slate-100">
                                <img
                                  src={proofPreview}
                                  alt="Payment Proof Preview"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-slate-900 truncate">
                                    {proofFile?.name || 'payment_proof.webp'}
                                  </span>
                                  <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200">
                                    Compressed
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                  {proofOriginalSize && proofShrunkSize ? (
                                    <>
                                      {Math.round(proofOriginalSize / 1024)}KB → <strong className="text-emerald-700">{Math.round(proofShrunkSize / 1024)}KB</strong> ({Math.round((1 - proofShrunkSize / proofOriginalSize) * 100)}% saved)
                                    </>
                                  ) : (
                                    'Ready for verification'
                                  )}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={removeProof}
                              disabled={submitting}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                              title="Remove screenshot"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Step 3 Action Buttons */}
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => goToStep(2)}
                            className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                          >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Amount</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleConfirmSent}
                            disabled={submitting}
                            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                          >
                            {submitting ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Recording Gift...</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-4 h-4" />
                                <span>I Have Sent The Donation 🚀</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-medium text-center">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>100% of proceeds disburse directly to verified project milestones.</span>
                        </div>
                      </div>

                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </>
          ) : (
            /* ========================================================= */
            /* STEP 4: SUCCESS CELEBRATION & RECEIPT CONFIRMATION */
            /* ========================================================= */
            <div className="p-6 sm:p-10 text-center space-y-5 overflow-y-auto">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto border-2 border-emerald-200 shadow-xl shadow-emerald-600/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1.5">
                <span className="inline-block text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 uppercase tracking-widest">
                  Gift Registered Successfully
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Thank You for Changing Lives!
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Your contribution to <strong>{activeCause.title}</strong> has been registered. Our nodes will index the transaction and disburse funds to verified milestones.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 max-w-md mx-auto text-xs space-y-2 text-left">
                <div className="flex justify-between text-slate-500">
                  <span>Selected Cause:</span>
                  <span className="font-bold text-slate-900 truncate max-w-[200px]">{activeCause.title}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Pledged Value:</span>
                  <span className="font-bold text-emerald-700 font-mono">${usdAmount} USD ({cryptoAmount} {selectedCrypto.symbol})</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Contributor:</span>
                  <span className="font-bold text-slate-900">{isAnonymous || !donorName ? 'Anonymous Supporter' : donorName}</span>
                </div>
                {currentUser?.email && (
                  <div className="flex justify-between text-slate-500">
                    <span>Verified Account:</span>
                    <span className="font-bold text-slate-900 font-mono">{currentUser.email}</span>
                  </div>
                )}
                {confirmedTxHash && (
                  <div className="pt-2 border-t border-slate-200/80">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">On-Chain Receipt Hash:</span>
                    <div className="flex items-center gap-1.5 bg-white px-2 py-1.5 rounded-lg border border-slate-200 font-mono text-[10px] text-slate-700">
                      <span className="truncate flex-1">{confirmedTxHash}</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    </div>
                  </div>
                )}
                {(uploadedProofUrl || proofPreview) && (
                  <div className="pt-2 border-t border-slate-200/80">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Payment Proof Status:</span>
                    <div className="flex items-center gap-2 bg-white px-2.5 py-2 rounded-xl border border-slate-200">
                      <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-xs font-bold text-slate-800 flex-1 truncate">Screenshot Submitted</span>
                      <span className="text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                        Escrow Node Validating
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2 max-w-md mx-auto">
                <Link
                  href="/donors"
                  onClick={closeDonateModal}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>View Donor Leaderboard</span>
                </Link>
                <button
                  type="button"
                  onClick={closeDonateModal}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors border border-slate-200 cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
