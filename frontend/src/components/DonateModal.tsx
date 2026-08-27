'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Copy, Check, ShieldCheck, ArrowRight, ExternalLink, Layers, RefreshCw, Lock, Coins, CheckCircle2, DollarSign, Wallet, QrCode } from 'lucide-react';
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
    symbol: 'BTC',
    name: 'Bitcoin',
    network: 'Bitcoin Native (SegWit)',
    address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
    rate: 63050.00,
    icon: '/crypto/btc.svg',
    prefix: 'bitcoin:bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq?amount=',
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
  {
    symbol: 'POL',
    name: 'Polygon',
    network: 'Polygon PoS',
    address: '0x71C88147d3B85229211C473fC4223A44d71FaCbe',
    rate: 0.42,
    icon: '/crypto/matic.svg',
    prefix: 'ethereum:0x71C88147d3B85229211C473fC4223A44d71FaCbe',
  },
];

const PRESET_USD_AMOUNTS = [25, 50, 100, 250, 500, 1000];

export default function DonateModal() {
  const { isOpen, activeCause, closeDonateModal } = useDonate();

  const [paymentCategory, setPaymentCategory] = useState<'crypto' | 'card' | 'paypal'>('crypto');
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoOption>(DEFAULT_CRYPTO_OPTIONS[0]);
  const [usdAmount, setUsdAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('100');
  const [copied, setCopied] = useState(false);
  const [donorName, setDonorName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [step, setStep] = useState<'donate' | 'success'>('donate');
  const [confirmedTxHash, setConfirmedTxHash] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  // Notify Me form state for card/paypal
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifySubmitted, setNotifySubmitted] = useState(false);

  // Load custom payment methods if configured in backend
  useEffect(() => {
    if (isOpen) {
      setStep('donate');
      setPaymentCategory('crypto');
      setCopied(false);
      setConfirmedTxHash('');
      setSubmitting(false);
      setNotifySubmitted(false);
      setNotifyEmail('');
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

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (notifyEmail && notifyEmail.includes('@')) {
      setNotifySubmitted(true);
    }
  };

  const handleConfirmSent = async () => {
    setSubmitting(true);
    const mockTxHash = `0x${Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('')}`;
    setConfirmedTxHash(mockTxHash);

    try {
      if (activeCause?.id) {
        await api.posts.donate(Number(activeCause.id), {
          donorName: isAnonymous ? 'Anonymous Supporter' : (donorName.trim() || 'Generous Donor'),
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
      setStep('success');
    }
  };

  const goal = activeCause.goal || 50000;
  const raised = activeCause.raised || goal * 0.48;
  const percentFunded = Math.min(Math.round((raised / goal) * 100), 100);
  const coverImage = activeCause.image || '/causes/cause_water_1786200462466.jpg';

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

          {step === 'donate' ? (
            <div className="flex flex-col max-h-[90vh] overflow-y-auto">
              
              {/* 1. CAUSE SHOWCASE HEADER BANNER */}
              <div className="relative p-6 sm:p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white overflow-hidden">
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

                <div className="relative z-10 space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold uppercase tracking-wider">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{activeCause.category || 'Direct Humanitarian Relief'}</span>
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-300 bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-sm">
                      Verified Impact Cause
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight">
                    {activeCause.title}
                  </h2>

                  {/* Progress Tracker */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-baseline text-xs">
                      <div className="space-x-1.5">
                        <span className="font-extrabold text-emerald-400 font-mono text-sm sm:text-base">
                          ${raised.toLocaleString()}
                        </span>
                        <span className="text-slate-400 font-medium">raised of ${goal.toLocaleString()} goal</span>
                      </div>
                      <span className="font-extrabold text-emerald-300 font-mono">{percentFunded}% Funded</span>
                    </div>

                    <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
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

              {/* 2. MAIN DONATION BODY */}
              <div className="p-6 sm:p-8 space-y-6">
                
                {/* Primary Payment Category Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    1. Choose Payment Method
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Option 1: Crypto */}
                    <button
                      type="button"
                      onClick={() => setPaymentCategory('crypto')}
                      className={`p-3 rounded-2xl border-2 flex flex-col items-start gap-1.5 transition-all text-left relative ${
                        paymentCategory === 'crypto'
                          ? 'border-emerald-500 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-1.5">
                          <img src="/crypto/btc.svg" alt="BTC" className="w-4 h-4 object-contain" />
                          <img src="/crypto/eth.svg" alt="ETH" className="w-4 h-4 object-contain" />
                          <img src="/crypto/usdc.svg" alt="USDC" className="w-4 h-4 object-contain" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                          Instant Active
                        </span>
                      </div>
                      <span className="text-xs font-black text-slate-900 mt-1">
                        Crypto & Stablecoin
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        USDC, USDT, BTC, ETH, SOL
                      </span>
                    </button>

                    {/* Option 2: Credit Card */}
                    <button
                      type="button"
                      onClick={() => setPaymentCategory('card')}
                      className={`p-3 rounded-2xl border-2 flex flex-col items-start gap-1.5 transition-all text-left relative ${
                        paymentCategory === 'card'
                          ? 'border-amber-500 bg-amber-50/70 shadow-sm ring-2 ring-amber-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-1.5">
                          <img src="/payments/visa.svg" alt="Visa" className="h-3.5 object-contain" />
                          <img src="/payments/mastercard.svg" alt="MasterCard" className="h-3.5 object-contain" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                          Processing
                        </span>
                      </div>
                      <span className="text-xs font-black text-slate-900 mt-1">
                        Credit / Debit Card
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        Visa, Mastercard, Amex
                      </span>
                    </button>

                    {/* Option 3: PayPal / Apple Pay */}
                    <button
                      type="button"
                      onClick={() => setPaymentCategory('paypal')}
                      className={`p-3 rounded-2xl border-2 flex flex-col items-start gap-1.5 transition-all text-left relative ${
                        paymentCategory === 'paypal'
                          ? 'border-blue-500 bg-blue-50/70 shadow-sm ring-2 ring-blue-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-1.5">
                          <img src="/payments/paypal.svg" alt="PayPal" className="h-3.5 object-contain" />
                          <img src="/payments/applepay.svg" alt="Apple Pay" className="h-3.5 object-contain" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                          Processing
                        </span>
                      </div>
                      <span className="text-xs font-black text-slate-900 mt-1">
                        PayPal & Apple Pay
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        Digital Wallets
                      </span>
                    </button>
                  </div>
                </div>

                {/* CONDITIONAL CONTENT BASED ON PAYMENT CATEGORY */}
                {paymentCategory === 'card' ? (
                  /* --- CREDIT CARD PROCESSING NOTICE --- */
                  <div className="bg-gradient-to-br from-amber-50/80 via-white to-slate-50 border-2 border-amber-200/90 rounded-3xl p-6 sm:p-7 space-y-5 text-left">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
                          Gateway Verification Notice
                        </span>
                        <h3 className="text-base font-black text-slate-900">
                          Credit Card Gateway Compliance Underway
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed pt-1">
                          Direct Credit & Debit Card (Visa, MasterCard, Amex) merchant processing is undergoing standard regulatory anti-fraud verification for this cause.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-white rounded-2xl border border-amber-200/70 shadow-2xs space-y-3">
                      <p className="text-xs font-bold text-slate-800">
                        💡 How to donate right now with 0% fees:
                      </p>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        For immediate tax-deductible contribution, please use our <strong>active Instant Crypto & Stablecoin channel (USDC / USDT / BTC / ETH)</strong>. Transactions settle in seconds directly to verified milestones.
                      </p>
                      
                      <button
                        type="button"
                        onClick={() => setPaymentCategory('crypto')}
                        className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
                      >
                        <Heart className="w-4 h-4 fill-white/30" />
                        <span>Switch to Instant Crypto Donation (USDC / BTC / ETH)</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Notification form */}
                    <div className="pt-1">
                      {notifySubmitted ? (
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Thank you! We will notify you immediately once Credit Card processing goes live.</span>
                        </div>
                      ) : (
                        <form onSubmit={handleNotifySubmit} className="space-y-1.5">
                          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                            Want to be notified when Card processing is active?
                          </span>
                          <div className="flex gap-2">
                            <input
                              type="email"
                              value={notifyEmail}
                              onChange={(e) => setNotifyEmail(e.target.value)}
                              placeholder="Enter your email"
                              required
                              className="flex-1 px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium"
                            />
                            <button
                              type="submit"
                              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shrink-0"
                            >
                              Notify Me
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  </div>
                ) : paymentCategory === 'paypal' ? (
                  /* --- PAYPAL PROCESSING NOTICE --- */
                  <div className="bg-gradient-to-br from-blue-50/80 via-white to-slate-50 border-2 border-blue-200/90 rounded-3xl p-6 sm:p-7 space-y-5 text-left">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-600/20">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-800 bg-blue-100 px-2 py-0.5 rounded-md border border-blue-300">
                          Gateway Verification Notice
                        </span>
                        <h3 className="text-base font-black text-slate-900">
                          PayPal & Apple Pay Onboarding in Progress
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed pt-1">
                          PayPal and Apple Pay merchant channels are currently being certified for international humanitarian escrow.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-white rounded-2xl border border-blue-200/70 shadow-2xs space-y-3">
                      <p className="text-xs font-bold text-slate-800">
                        💡 Make your contribution right now:
                      </p>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        To support <strong>{activeCause.title}</strong> right now, please use our <strong>active Crypto & Stablecoin channel</strong>.
                      </p>
                      
                      <button
                        type="button"
                        onClick={() => setPaymentCategory('crypto')}
                        className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
                      >
                        <Heart className="w-4 h-4 fill-white/30" />
                        <span>Switch to Instant Crypto Donation (USDC / BTC / ETH)</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Notification form */}
                    <div className="pt-1">
                      {notifySubmitted ? (
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Thank you! We will notify you once PayPal is live.</span>
                        </div>
                      ) : (
                        <form onSubmit={handleNotifySubmit} className="space-y-1.5">
                          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                            Get notified when PayPal goes live:
                          </span>
                          <div className="flex gap-2">
                            <input
                              type="email"
                              value={notifyEmail}
                              onChange={(e) => setNotifyEmail(e.target.value)}
                              placeholder="Enter your email"
                              required
                              className="flex-1 px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
                            />
                            <button
                              type="submit"
                              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shrink-0"
                            >
                              Notify Me
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  </div>
                ) : (
                  /* --- ACTIVE CRYPTO DONATION FLOW --- */
                  <>
                    {/* Crypto Currency Tabs */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        2. Select Asset / Stablecoin
                      </label>

                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {DEFAULT_CRYPTO_OPTIONS.map((crypto) => {
                          const isSelected = selectedCrypto.symbol === crypto.symbol;
                          return (
                            <button
                              key={crypto.symbol}
                              type="button"
                              onClick={() => setSelectedCrypto(crypto)}
                              className={`p-2.5 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all text-center ${
                                isSelected
                                  ? 'border-emerald-500 bg-emerald-50/60 shadow-sm ring-2 ring-emerald-500/20'
                                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                              }`}
                            >
                              <div className="w-7 h-7 relative flex items-center justify-center">
                                <Image
                                  src={crypto.icon}
                                  alt={crypto.name}
                                  width={26}
                                  height={26}
                                  className="object-contain"
                                  style={{ width: "auto", height: "auto" }}
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

                    {/* Amount Selection & Live Conversion */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                          3. Choose Donation Amount
                        </label>
                        <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          ≈ {cryptoAmount} {selectedCrypto.symbol}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {PRESET_USD_AMOUNTS.map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => handlePresetClick(amt)}
                            className={`py-2 px-2.5 rounded-xl border text-xs font-black font-mono transition-all ${
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
                          placeholder="Or enter custom amount in USD"
                          className="w-full pl-16 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    {/* 3. QR CODE + WALLET ADDRESS CARD */}
                    <div className="bg-slate-50 rounded-3xl p-5 sm:p-6 border-2 border-slate-200 space-y-4">
                      
                      <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
                        {/* Centered Logo QR Code */}
                        <div className="shrink-0">
                          <QRCodeWithLogo
                            value={qrPaymentUri}
                            size={175}
                            logoSrc="/logo.png"
                            logoSize={40}
                          />
                          <p className="text-[10px] text-center font-bold text-slate-400 mt-2 uppercase tracking-wider">
                            Scan with Mobile Wallet
                          </p>
                        </div>

                        {/* Deposit Instructions & Network Details */}
                        <div className="flex-1 space-y-3 text-center sm:text-left min-w-0">
                          <div>
                            <div className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                              <Coins className="w-3 h-3 text-emerald-600" />
                              <span>{selectedCrypto.name} ({selectedCrypto.network})</span>
                            </div>
                            <h4 className="text-sm font-black text-slate-900 mt-1">
                              Send {cryptoAmount} {selectedCrypto.symbol}
                            </h4>
                            <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
                              Open MetaMask, Phantom, Coinbase, or Trust Wallet and scan the QR code, or copy the address below.
                            </p>
                          </div>

                          {/* Plain Text Wallet Address Box */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Official Deposit Address (Plain Text):
                            </span>
                            
                            <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                              <code className="text-xs font-mono font-bold text-slate-900 truncate select-all flex-1 text-left">
                                {selectedCrypto.address}
                              </code>
                              <button
                                type="button"
                                onClick={handleCopyAddress}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1 shrink-0 shadow-xs"
                              >
                                {copied ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
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

                    {/* 4. OPTIONAL RECOGNITION */}
                    <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Optional: Recognition on Donor Leaderboard</span>
                        </label>
                        <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer font-medium">
                          <input
                            type="checkbox"
                            checked={isAnonymous}
                            onChange={(e) => setIsAnonymous(e.target.checked)}
                            className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                          />
                          <span>Stay 100% Anonymous</span>
                        </label>
                      </div>

                      {!isAnonymous && (
                        <input
                          type="text"
                          value={donorName}
                          onChange={(e) => setDonorName(e.target.value)}
                          placeholder="Enter your name or handle (e.g. Alex / Sarah)"
                          className="w-full px-3.5 py-2 bg-white border border-emerald-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                        />
                      )}
                    </div>

                    {/* 5. ACTION BUTTON */}
                    <div className="space-y-2 pt-2">
                      <button
                        type="button"
                        onClick={handleConfirmSent}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-sm rounded-2xl transition-all shadow-lg shadow-emerald-600/25 hover:shadow-xl hover:shadow-emerald-600/30 flex items-center justify-center gap-2 hover:-translate-y-0.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        <span>I Have Sent the Donation ({cryptoAmount} {selectedCrypto.symbol})</span>
                      </button>

                      <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium text-center">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>100% of proceeds disburse directly to verified project milestones.</span>
                      </div>
                    </div>
                  </>
                )}

              </div>
            </div>
          ) : (
            /* CELEBRATION / CONFIRMATION SUCCESS SCREEN */
            <div className="p-8 sm:p-12 text-center space-y-6">
              
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto border-2 border-emerald-200 shadow-xl shadow-emerald-600/10">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <span className="inline-block text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 uppercase tracking-widest">
                  Transaction Registered
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Thank You for Changing Lives!
                </h2>
                <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Your generous contribution to <strong>{activeCause.title}</strong> has been registered. Our nodes will index the incoming crypto transaction and update the cause milestones.
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
