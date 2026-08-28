'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Heart, Copy, Check, ShieldCheck, ArrowRight, ArrowLeft,
  Lock, Coins, CheckCircle2, DollarSign, Wallet, 
  QrCode, User, Mail, Eye, EyeOff, Loader2, Sparkles, LogOut, AlertCircle
} from 'lucide-react';
import { useDonate } from '@/context/DonateContext';
import QRCodeWithLogo from './QRCodeWithLogo';
import { api } from '@/lib/api';

interface CryptoOption {
  symbol: string;
  name: string;
  network: string;
  address: string;
  rate: number; // USD rate per 1 unit
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

export default function DonateModal() {
  const { isOpen, activeCause, closeDonateModal } = useDonate();

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

  // Check authenticated state on mount or when modal opens
  useEffect(() => {
    if (isOpen) {
      setCopied(false);
      setConfirmedTxHash('');
      setSubmitting(false);
      setAuthError(null);

      // Check if user is already logged in
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        if (storedUser && storedToken) {
          const parsed = JSON.parse(storedUser);
          setCurrentUser(parsed);
          setDonorName(parsed.name || '');
          setCurrentStep(2); // Automatically jump to Payment & Amount if logged in!
        } else {
          setCurrentUser(null);
          setCurrentStep(1); // Start at Step 1 (Account Creation)
        }
      } catch (e) {
        setCurrentUser(null);
        setCurrentStep(1);
      }
    }
  }, [isOpen]);

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

  const handlePresetClick = (amount: number) => {
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
      const res = await api.auth.quickDonorAuth({
        email: authEmail.trim(),
        name: authName.trim() || authEmail.split('@')[0],
        password: authPassword,
      });

      if (res.token && res.user) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        setCurrentUser(res.user);
        setDonorName(res.user.name || '');
        goToStep(2); // Seamlessly proceed to Step 2!
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
      x: dir > 0 ? 35 : -35,
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -35 : 35,
      opacity: 0,
      scale: 0.98,
      transition: {
        duration: 0.2,
        ease: 'easeIn',
      },
    }),
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto font-sans">
        
        {/* Backdrop Blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeDonateModal}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl sm:rounded-[32px] border border-slate-200 shadow-2xl overflow-hidden my-auto z-10"
        >
          
          {/* Close Button */}
          <button
            onClick={closeDonateModal}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-900/40 hover:bg-slate-900/70 text-white backdrop-blur-md flex items-center justify-center transition-all hover:scale-105"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {currentStep < 4 ? (
            <div className="flex flex-col max-h-[90vh] overflow-y-auto">
              
              {/* 1. CAUSE SHOWCASE HEADER BANNER */}
              <div className="relative p-6 sm:p-7 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white overflow-hidden">
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <Image
                    src={coverImage}
                    alt={activeCause.title}
                    fill
                    className="object-cover"
                    sizes="600px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
                </div>

                <div className="relative z-10 space-y-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{activeCause.category || 'Humanitarian Relief'}</span>
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-300 bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-sm">
                      Verified Milestone Escrow
                    </span>
                  </div>

                  <h2 className="text-lg sm:text-xl font-black tracking-tight text-white leading-snug line-clamp-1">
                    {activeCause.title}
                  </h2>

                  {/* Progress Tracker */}
                  <div className="space-y-1 pt-0.5">
                    <div className="flex justify-between items-baseline text-xs">
                      <div className="space-x-1.5">
                        <span className="font-extrabold text-emerald-400 font-mono text-sm">
                          ${raised.toLocaleString()}
                        </span>
                        <span className="text-slate-400 font-medium text-[11px]">raised of ${goal.toLocaleString()}</span>
                      </div>
                      <span className="font-extrabold text-emerald-300 font-mono text-[11px]">{percentFunded}% Funded</span>
                    </div>

                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentFunded}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SLIM PROGRESS STEP INDICATOR */}
              <div className="px-6 sm:px-8 pt-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black text-emerald-600 uppercase tracking-wider">
                    Step 0{currentStep} of 03:
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    {currentStep === 1 && 'Donor Account'}
                    {currentStep === 2 && 'Payment Method & Amount'}
                    {currentStep === 3 && 'Transfer & QR Payment'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {[1, 2, 3].map((stepIdx) => (
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

              {/* STEP CONTAINER */}
              <div className="p-6 sm:p-8">
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
                      className="space-y-5"
                    >
                      <div className="text-center sm:text-left space-y-1">
                        <h3 className="text-lg font-black text-slate-900">
                          Create Your Donor Account
                        </h3>
                        <p className="text-xs text-slate-500">
                          Takes 5 seconds. Required for cryptographically verified tax receipts and tracking your impact.
                        </p>
                      </div>

                      {/* Mode Toggle */}
                      <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => { setAuthMode('register'); setAuthError(null); }}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                            authMode === 'register'
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          ⚡ Quick Sign Up
                        </button>
                        <button
                          type="button"
                          onClick={() => { setAuthMode('login'); setAuthError(null); }}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                            authMode === 'login'
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          Sign In
                        </button>
                      </div>

                      {authError && (
                        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                          <span>{authError}</span>
                        </div>
                      )}

                      <form onSubmit={handleQuickAuth} className="space-y-3.5">
                        {authMode === 'register' && (
                          <div>
                            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                              Your Full Name
                            </label>
                            <input
                              autoFocus
                              type="text"
                              value={authName}
                              onChange={(e) => setAuthName(e.target.value)}
                              placeholder="e.g. Sarah Jenkins"
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                        )}

                        <div>
                          <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                            Email Address *
                          </label>
                          <input
                            required
                            type="email"
                            value={authEmail}
                            onChange={(e) => setAuthEmail(e.target.value)}
                            placeholder="donor@example.com"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                              Password *
                            </label>
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="text-[11px] text-slate-400 hover:text-slate-600 font-semibold"
                            >
                              {showPassword ? 'Hide' : 'Show'}
                            </button>
                          </div>

                          <div className="relative">
                            <input
                              required
                              type={showPassword ? 'text' : 'password'}
                              value={authPassword}
                              onChange={(e) => setAuthPassword(e.target.value)}
                              placeholder="At least 6 characters"
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                        </div>

                        <div className="pt-2">
                          <button
                            type="submit"
                            disabled={authLoading}
                            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                          >
                            {authLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Authenticating Account...</span>
                              </>
                            ) : (
                              <>
                                <span>{authMode === 'register' ? 'Create Account & Continue' : 'Sign In & Continue'}</span>
                                <ArrowRight className="w-4 h-4" />
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}

                  {/* ========================================================= */}
                  {/* STEP 2: PAYMENT METHOD & DONATION AMOUNT */}
                  {/* ========================================================= */}
                  {currentStep === 2 && (
                    <motion.div
                      key="step-2"
                      custom={direction}
                      variants={stepVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="space-y-6"
                    >
                      {/* Authenticated User Status Bar */}
                      {currentUser && (
                        <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-xs uppercase">
                              {currentUser.name?.[0] || 'D'}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-slate-900 block leading-tight">
                                {currentUser.name}
                              </span>
                              <span className="text-[10px] text-slate-500 font-medium">
                                {currentUser.email} • Verified Donor
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleSignOut}
                            className="text-[11px] font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1"
                          >
                            <LogOut className="w-3 h-3" />
                            <span>Switch</span>
                          </button>
                        </div>
                      )}

                      {/* 1. Payment Methods Selection */}
                      <div className="space-y-2.5">
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                          1. Select Payment Channel
                        </label>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          
                          {/* Option 1: Bitcoin & Supported Crypto (ENABLED & ACTIVE) */}
                          <div
                            onClick={() => setSelectedMethod('crypto')}
                            className="p-3.5 rounded-2xl border-2 border-emerald-500 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-500/20 cursor-pointer flex flex-col justify-between space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <img src="/crypto/btc.svg" alt="BTC" className="w-5 h-5 object-contain" />
                                <img src="/crypto/usdc.svg" alt="USDC" className="w-4 h-4 object-contain" />
                                <img src="/crypto/eth.svg" alt="ETH" className="w-4 h-4 object-contain" />
                              </div>
                              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                                Active • Supported
                              </span>
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-slate-900">
                                Bitcoin & Crypto
                              </h4>
                              <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                                BTC, USDC, USDT, ETH, SOL
                              </p>
                            </div>
                          </div>

                          {/* Option 2: Credit Card (DISABLED - COMING SOON) */}
                          <div className="p-3.5 rounded-2xl border-2 border-slate-200 bg-slate-50/80 opacity-60 cursor-not-allowed flex flex-col justify-between space-y-2 relative">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1 grayscale opacity-80">
                                <img src="/payments/visa.svg" alt="Visa" className="h-3.5 object-contain" />
                                <img src="/payments/mastercard.svg" alt="MasterCard" className="h-3.5 object-contain" />
                              </div>
                              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 flex items-center gap-1">
                                <Lock className="w-2.5 h-2.5" />
                                <span>Coming Soon</span>
                              </span>
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-slate-700">
                                Credit / Debit Card
                              </h4>
                              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                                Visa, Mastercard, Amex
                              </p>
                            </div>
                          </div>

                          {/* Option 3: PayPal / Apple Pay (DISABLED - COMING SOON) */}
                          <div className="p-3.5 rounded-2xl border-2 border-slate-200 bg-slate-50/80 opacity-60 cursor-not-allowed flex flex-col justify-between space-y-2 relative">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1 grayscale opacity-80">
                                <img src="/payments/paypal.svg" alt="PayPal" className="h-3.5 object-contain" />
                                <img src="/payments/applepay.svg" alt="Apple Pay" className="h-3.5 object-contain" />
                              </div>
                              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 flex items-center gap-1">
                                <Lock className="w-2.5 h-2.5" />
                                <span>Coming Soon</span>
                              </span>
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-slate-700">
                                PayPal & Apple Pay
                              </h4>
                              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                                Digital Wallets
                              </p>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* 2. Asset & Network Selection */}
                      <div className="space-y-2">
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                          2. Supported Currency / Asset
                        </label>

                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                          {DEFAULT_CRYPTO_OPTIONS.map((crypto) => {
                            const isSelected = selectedCrypto.symbol === crypto.symbol;
                            return (
                              <button
                                key={crypto.symbol}
                                type="button"
                                onClick={() => setSelectedCrypto(crypto)}
                                className={`p-2.5 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer ${
                                  isSelected
                                    ? 'border-emerald-500 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-500/20'
                                    : 'border-slate-200 bg-white hover:border-slate-300'
                                }`}
                              >
                                <div className="w-7 h-7 relative flex items-center justify-center">
                                  <Image
                                    src={crypto.icon}
                                    alt={crypto.name}
                                    width={26}
                                    height={26}
                                    className="object-contain"
                                    style={{ width: 'auto', height: 'auto' }}
                                  />
                                </div>
                                <span className={`text-xs font-black font-mono ${isSelected ? 'text-emerald-950' : 'text-slate-800'}`}>
                                  {crypto.symbol}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* 3. Amount Selection & Conversion */}
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                            3. Donation Amount
                          </label>
                          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                            ≈ {cryptoAmount} {selectedCrypto.symbol}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                          {PRESET_USD_AMOUNTS.map((amt) => (
                            <button
                              key={amt}
                              type="button"
                              onClick={() => handlePresetClick(amt)}
                              className={`py-2 px-2 rounded-xl border text-xs font-black font-mono transition-all cursor-pointer ${
                                usdAmount === amt
                                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              ${amt}
                            </button>
                          ))}
                        </div>

                        <div className="relative pt-1">
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs pt-1">
                            $ USD
                          </div>
                          <input
                            type="number"
                            min="1"
                            value={customAmount}
                            onChange={(e) => handleCustomAmountChange(e.target.value)}
                            placeholder="Custom amount in USD"
                            className="w-full pl-16 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      {/* Anonymous Checkbox */}
                      <div className="pt-1 flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <span className="text-xs font-bold text-slate-700">
                          Public Recognition
                        </span>
                        <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer font-medium">
                          <input
                            type="checkbox"
                            checked={isAnonymous}
                            onChange={(e) => setIsAnonymous(e.target.checked)}
                            className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                          />
                          <span>Hide name on leaderboard</span>
                        </label>
                      </div>

                      {/* Step 2 Action Button */}
                      <div className="pt-2 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => goToStep(1)}
                          className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>Back</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleProceedToQR}
                          className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
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
                      className="space-y-6"
                    >
                      {/* Top Payment Target Notice */}
                      <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                            Transfer Target
                          </span>
                          <h4 className="text-sm font-black text-slate-900 mt-1">
                            Send exactly <span className="text-emerald-700 font-mono">{cryptoAmount} {selectedCrypto.symbol}</span> (${usdAmount} USD)
                          </h4>
                        </div>
                        <div className="w-8 h-8 relative flex items-center justify-center shrink-0">
                          <Image src={selectedCrypto.icon} alt={selectedCrypto.name} width={28} height={28} className="object-contain" />
                        </div>
                      </div>

                      {/* Main QR Code & Address Box */}
                      <div className="bg-slate-50 rounded-3xl p-6 border-2 border-slate-200 space-y-5 text-center sm:text-left">
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                          
                          {/* Centered QR Code with Logo */}
                          <div className="shrink-0 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
                            <QRCodeWithLogo
                              value={qrPaymentUri}
                              size={180}
                              logoSrc="/logo.png"
                              logoSize={42}
                            />
                            <p className="text-[10px] text-center font-extrabold text-slate-400 mt-2 uppercase tracking-wider">
                              Scan with Wallet
                            </p>
                          </div>

                          {/* Instructions & Deposit Address */}
                          <div className="flex-1 space-y-3.5 min-w-0">
                            <div>
                              <span className="text-xs font-bold text-slate-500 block">
                                Network: <strong className="text-slate-800">{selectedCrypto.network}</strong>
                              </span>
                              <p className="text-xs text-slate-600 leading-relaxed mt-1">
                                Open MetaMask, Phantom, Coinbase, or Trust Wallet and scan the QR code or send funds to the address below.
                              </p>
                            </div>

                            {/* Plain Text Address Box */}
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Official Deposit Address:
                              </span>
                              <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                                <code className="text-xs font-mono font-bold text-slate-900 truncate select-all flex-1 text-left">
                                  {selectedCrypto.address}
                                </code>
                                <button
                                  type="button"
                                  onClick={handleCopyAddress}
                                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1 shrink-0 shadow-xs cursor-pointer"
                                >
                                  {copied ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                                      <span>Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5" />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>

                          </div>
                        </div>
                      </div>

                      {/* Step 3 Action Buttons */}
                      <div className="space-y-2.5 pt-1">
                        <div className="flex items-center justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => goToStep(2)}
                            className="px-5 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Change Amount</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleConfirmSent}
                            disabled={submitting}
                            className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black text-xs sm:text-sm rounded-2xl transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                          >
                            {submitting ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Verifying & Recording Gift...</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-5 h-5" />
                                <span>I Have Sent The Donation 🚀</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium text-center">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>100% of proceeds disburse directly to verified project milestones.</span>
                        </div>
                      </div>

                    </motion.div>
                  )}

                </AnimatePresence>
              </div>

            </div>
          ) : (
            /* ========================================================= */
            /* STEP 4: SUCCESS CELEBRATION & RECEIPT CONFIRMATION */
            /* ========================================================= */
            <div className="p-8 sm:p-12 text-center space-y-6">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto border-2 border-emerald-200 shadow-xl shadow-emerald-600/10">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <span className="inline-block text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 uppercase tracking-widest">
                  Gift Registered Successfully
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Thank You for Changing Lives!
                </h2>
                <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Your generous contribution to <strong>{activeCause.title}</strong> has been registered. Our nodes will index the incoming transaction and disburse funds to verified milestones.
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
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2 max-w-md mx-auto">
                <Link
                  href="/donors"
                  onClick={closeDonateModal}
                  className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>View Donor Leaderboard</span>
                </Link>
                <button
                  type="button"
                  onClick={closeDonateModal}
                  className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors border border-slate-200"
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
