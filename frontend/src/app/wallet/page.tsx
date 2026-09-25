'use client';

import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Wallet,
  Heart,
  PlusCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  ArrowDownLeft,
  Check,
  Copy,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  Trash2,
  RefreshCw,
  Coins,
  CreditCard,
  Building,
  MapPin,
  Mail,
  User,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import QRCodeWithLogo from '@/components/QRCodeWithLogo';
import { useWallet, WalletTransaction } from '@/context/WalletContext';
import { useAuth } from '@/context/AuthContext';
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

const CRYPTO_OPTIONS: CryptoOption[] = [
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

type WalletTab = 'funds' | 'transactions';
type PaymentMethodType = 'crypto' | 'card' | 'paypal';

function PhilanthropicWalletView() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const { balance, transactions, deposit } = useWallet();
  const { user } = useAuth();

  const initialTab = (searchParams.get('tab') as WalletTab) || 'funds';
  const [activeTab, setActiveTab] = useState<WalletTab>(initialTab);

  // Add Funds State
  const [depositAmount, setDepositAmount] = useState<number>(100);
  const [depositCustom, setDepositCustom] = useState<string>('100');
  const [depositCrypto, setDepositCrypto] = useState<CryptoOption>(CRYPTO_OPTIONS[1]);
  const [depositCopied, setDepositCopied] = useState(false);
  const [depositMethod, setDepositMethod] = useState<PaymentMethodType>('crypto');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Billing Address State
  const [billingAddress, setBillingAddress] = useState({
    fullName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    country: 'United States',
    zipCode: '',
  });

  // Pre-fill billing details from auth user
  useEffect(() => {
    if (user) {
      setBillingAddress(prev => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Proof Image State
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [isShrinking, setIsShrinking] = useState(false);

  // Submission / Flow States
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    amount: number;
    txHash: string;
  } | null>(null);

  // Transactions Filter
  const [txFilter, setTxFilter] = useState<'ALL' | 'DONATION' | 'DEPOSIT'>('ALL');

  // Handle Proof upload with Canvas WebP compression
  const handleProofChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsShrinking(true);
    setErrorMessage(null);
    try {
      const shrunk = await shrinkImage(file, 1280, 0.82);
      setProofFile(shrunk.file);
      setProofPreview(shrunk.dataUrl);
    } catch {
      setProofFile(file);
      const reader = new FileReader();
      reader.onload = () => setProofPreview(reader.result as string);
      reader.readAsDataURL(file);
    } finally {
      setIsShrinking(false);
    }
  };

  const removeProof = () => {
    setProofFile(null);
    setProofPreview(null);
  };

  const copyToClipboard = (text: string, isDeposit = false) => {
    navigator.clipboard.writeText(text);
    if (isDeposit) {
      setDepositCopied(true);
      setTimeout(() => setDepositCopied(false), 2000);
    }
  };

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    if (txFilter === 'ALL') return transactions;
    return transactions.filter(t => t.type === txFilter);
  }, [transactions, txFilter]);

  const depositCryptoRate = depositCrypto.rate || 1;
  const depositCryptoAmount = (depositAmount / depositCryptoRate).toFixed(
    depositCrypto.symbol === 'BTC' ? 6 : depositCrypto.symbol === 'ETH' || depositCrypto.symbol === 'SOL' ? 4 : 2
  );
  const depositQrUri = depositCrypto.symbol === 'BTC'
    ? `bitcoin:${depositCrypto.address}?amount=${depositCryptoAmount}`
    : depositCrypto.symbol === 'ETH'
    ? `ethereum:${depositCrypto.address}?value=${depositCryptoAmount}`
    : depositCrypto.symbol === 'SOL'
    ? `solana:${depositCrypto.address}?amount=${depositCryptoAmount}`
    : depositCrypto.address;

  // Submit Add Funds
  const handleDepositSubmit = async () => {
    if (depositAmount <= 0) {
      setErrorMessage('Please enter a valid deposit amount.');
      return;
    }

    if (!billingAddress.fullName.trim()) {
      setErrorMessage('Please enter your full legal name for billing & tax records.');
      return;
    }

    if (!billingAddress.email.trim() || !billingAddress.email.includes('@')) {
      setErrorMessage('Please enter a valid email address for transaction receipt.');
      return;
    }

    if (!acceptedTerms) {
      setErrorMessage('Please accept the philanthropic terms and conditions.');
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const mockHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      let proofUrl: string | undefined = undefined;

      if (proofFile) {
        try {
          const uploadRes = await api.upload.proof(proofFile);
          proofUrl = uploadRes.url;
        } catch (e) {
          console.warn('Proof upload note:', e);
        }
      }

      await deposit({
        amountUsd: depositAmount,
        cryptoSymbol: depositCrypto.symbol,
        cryptoAmount: depositCryptoAmount,
        txHash: mockHash,
        paymentProof: proofUrl,
      });

      setSuccessInfo({
        amount: depositAmount,
        txHash: mockHash,
      });
      removeProof();
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not credit wallet balance.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetSuccess = () => {
    setSuccessInfo(null);
    removeProof();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar />

      <main className="flex-1 pt-24 pb-20 px-3 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        {/* Top Wallet Overview Bar */}
        <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 mb-8 relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-bold tracking-wider uppercase border border-emerald-500/30">
                  <Wallet className="w-3.5 h-3.5" /> Philanthropic Wallet
                </span>
                <span className="text-[11px] text-slate-400 font-medium">Non-Custodial Escrow Balance</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-5xl font-black tracking-tight text-white font-[var(--font-poppins)]">
                  ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-slate-400">USD Available</span>
              </div>
            </div>

            {/* Quick Action Navigation */}
            <div className="flex items-center gap-2.5 self-start sm:self-center flex-wrap">
              <button
                type="button"
                onClick={() => {
                  resetSuccess();
                  setActiveTab('funds');
                }}
                className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'funds'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Funds</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  resetSuccess();
                  setActiveTab('transactions');
                }}
                className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'transactions'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>History ({transactions.length})</span>
              </button>

              <Link
                href="/donate"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all cursor-pointer"
              >
                <Heart className="w-4 h-4 text-rose-400" />
                <span>Donate to Causes</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Minimalist Segmented Tabs */}
        <div className="flex items-center justify-center mb-8">
          <div className="inline-flex bg-slate-200/80 p-1 rounded-2xl border border-slate-300/80 shadow-xs max-w-full overflow-x-auto">
            <button
              type="button"
              onClick={() => {
                resetSuccess();
                setActiveTab('funds');
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'funds'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PlusCircle className={`w-4 h-4 ${activeTab === 'funds' ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>Add Funds (Deposit)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                resetSuccess();
                setActiveTab('transactions');
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'transactions'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className={`w-4 h-4 ${activeTab === 'transactions' ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>Transaction Ledger</span>
            </button>
          </div>
        </div>

        {/* Global Success View */}
        {successInfo && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm text-center max-w-xl mx-auto my-6 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
              Funds Added Successfully!
            </h2>
            <p className="text-sm text-slate-600 mb-6">
              ${successInfo.amount.toFixed(2)} has been credited to your Philanthropic Wallet balance.
            </p>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left mb-6 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span>Transaction Reference</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Verified</span>
              </div>
              <div className="font-mono text-slate-800 break-all bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                <span>{successInfo.txHash}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(successInfo.txHash)}
                  className="p-1 text-slate-400 hover:text-slate-700 shrink-0 cursor-pointer"
                  title="Copy Hash"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  resetSuccess();
                  setActiveTab('transactions');
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                View in Transactions
              </button>
              <Link
                href="/donate"
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all text-center cursor-pointer"
              >
                Donate from Wallet Now
              </Link>
              <button
                type="button"
                onClick={() => {
                  resetSuccess();
                  setActiveTab('funds');
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Add More Funds
              </button>
            </div>
          </div>
        )}

        {/* TAB 1: ADD FUNDS - CLIENT DROPDOWN SELECTOR FLOW */}
        {!successInfo && activeTab === 'funds' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-600" />
                <span>Add Funds to Philanthropic Wallet</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Top up your non-custodial cryptographic reserve with instant 0% fee settlement.
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 1. PAYMENT METHOD CARD (WITH CLIENT-STYLE DROPDOWN) */}
            <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wider">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>Payment Method</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                  Select Channel
                </span>
              </div>

              <div>
                <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Method
                </span>

                {/* Custom Accessible Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`w-full p-3 sm:p-3.5 bg-white border-2 rounded-2xl text-left flex items-center justify-between transition-all cursor-pointer shadow-xs ${
                      isDropdownOpen
                        ? 'border-emerald-600 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Left: Selected Method Info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        depositMethod === 'crypto'
                          ? 'bg-emerald-600 text-white'
                          : depositMethod === 'card'
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-900 text-white'
                      }`}>
                        {depositMethod === 'crypto' ? (
                          <Coins className="w-4 h-4" />
                        ) : depositMethod === 'card' ? (
                          <CreditCard className="w-4 h-4" />
                        ) : (
                          <Wallet className="w-4 h-4" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-black text-slate-900 truncate flex items-center gap-2">
                          <span>
                            {depositMethod === 'crypto'
                              ? 'Instant Crypto (0% Fee)'
                              : depositMethod === 'card'
                              ? 'Credit / Debit Card (Visa, Mastercard)'
                              : 'Digital Wallets (Apple Pay, PayPal)'}
                          </span>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            depositMethod === 'crypto'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : depositMethod === 'card'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-slate-200 text-slate-700 border border-slate-300'
                          }`}>
                            {depositMethod === 'crypto' ? 'Active 100%' : depositMethod === 'card' ? 'Maintenance' : 'Coming Soon'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {depositMethod === 'crypto'
                            ? 'BTC, USDC, ETH, SOL, USDT • Direct escrow settlement'
                            : depositMethod === 'card'
                            ? 'Visa • Mastercard • AMEX (Scheduled gateway upgrade)'
                            : 'Apple Pay • Google Pay • PayPal (Verification in progress)'}
                        </div>
                      </div>
                    </div>

                    {/* Right: Network Brand Badges + Chevron */}
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {depositMethod === 'card' && (
                        <div className="flex items-center gap-1">
                          <span className="px-1.5 py-0.5 bg-[#1434CB] text-white text-[9px] font-black rounded tracking-wider italic">
                            VISA
                          </span>
                          <div className="flex items-center -space-x-1 px-1 py-0.5 bg-slate-900 rounded">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#EB001B]" />
                            <span className="w-2.5 h-2.5 rounded-full bg-[#F79E1B] opacity-90" />
                          </div>
                        </div>
                      )}

                      {depositMethod === 'crypto' && (
                        <div className="flex items-center -space-x-1">
                          {CRYPTO_OPTIONS.slice(0, 4).map((c) => (
                            <img
                              key={c.symbol}
                              src={c.icon}
                              alt={c.name}
                              className="w-4 h-4 rounded-full border border-white bg-white shrink-0 object-contain shadow-2xs"
                            />
                          ))}
                        </div>
                      )}

                      {depositMethod === 'paypal' && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-700">
                          <span className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-300">Pay</span>
                          <span className="px-1.5 py-0.5 bg-[#003087] text-white rounded font-black italic">P</span>
                        </div>
                      )}

                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {/* Dropdown Menu Options */}
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.99 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.99 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl z-30 overflow-hidden divide-y divide-slate-100"
                      >
                        {/* Option 1: Instant Crypto */}
                        <button
                          type="button"
                          onClick={() => {
                            setDepositMethod('crypto');
                            setIsDropdownOpen(false);
                            setErrorMessage(null);
                          }}
                          className={`w-full p-3.5 text-left flex items-center justify-between transition-colors cursor-pointer ${
                            depositMethod === 'crypto' ? 'bg-emerald-50/60' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                              <Coins className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
                                <span>Instant Crypto (0% Fee)</span>
                                <span className="text-[9px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                                  Active 100%
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500">
                                BTC, USDC, ETH, SOL, USDT • Direct milestone escrow credit
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center -space-x-1">
                              {CRYPTO_OPTIONS.map((c) => (
                                <img
                                  key={c.symbol}
                                  src={c.icon}
                                  alt={c.name}
                                  className="w-4 h-4 rounded-full border border-white bg-white shrink-0 object-contain shadow-2xs"
                                />
                              ))}
                            </div>
                            {depositMethod === 'crypto' && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                          </div>
                        </button>

                        {/* Option 2: Credit / Debit Card */}
                        <button
                          type="button"
                          onClick={() => {
                            setDepositMethod('card');
                            setIsDropdownOpen(false);
                            setErrorMessage(null);
                          }}
                          className={`w-full p-3.5 text-left flex items-center justify-between transition-colors cursor-pointer ${
                            depositMethod === 'card' ? 'bg-amber-50/60' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                              <CreditCard className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
                                <span>Credit / Debit Card (Visa, Mastercard)</span>
                                <span className="text-[9px] font-black uppercase text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                                  Maintenance
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500">
                                Visa • Mastercard • AMEX (Gateway fee optimization in progress)
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <span className="px-1.5 py-0.5 bg-[#1434CB] text-white text-[9px] font-black rounded tracking-wider italic">
                                VISA
                              </span>
                              <div className="flex items-center -space-x-1 px-1 py-0.5 bg-slate-900 rounded">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#EB001B]" />
                                <span className="w-2.5 h-2.5 rounded-full bg-[#F79E1B] opacity-90" />
                              </div>
                            </div>
                            {depositMethod === 'card' && <Check className="w-4 h-4 text-amber-600 shrink-0" />}
                          </div>
                        </button>

                        {/* Option 3: Digital Wallets */}
                        <button
                          type="button"
                          onClick={() => {
                            setDepositMethod('paypal');
                            setIsDropdownOpen(false);
                            setErrorMessage(null);
                          }}
                          className={`w-full p-3.5 text-left flex items-center justify-between transition-colors cursor-pointer ${
                            depositMethod === 'paypal' ? 'bg-slate-100' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                              <Wallet className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
                                <span>Digital Wallets (Apple Pay, PayPal)</span>
                                <span className="text-[9px] font-black uppercase text-slate-700 bg-slate-200 px-2 py-0.5 rounded-full border border-slate-300">
                                  Coming Soon
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500">
                                Apple Pay • Google Pay • PayPal (1-tap biometric giving verification)
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-700">
                              <span className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-300">Pay</span>
                              <span className="px-1.5 py-0.5 bg-[#003087] text-white rounded font-black italic">P</span>
                            </div>
                            {depositMethod === 'paypal' && <Check className="w-4 h-4 text-slate-900 shrink-0" />}
                          </div>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* 2. AMOUNT SELECTION */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Amount (USD)
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  Min $5 · Max $10,000
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[25, 50, 100, 250, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setDepositAmount(amt);
                      setDepositCustom(amt.toString());
                      setErrorMessage(null);
                    }}
                    className={`py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                      depositAmount === amt && depositCustom === amt.toString()
                        ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-500/20'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200'
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">$</span>
                <input
                  type="number"
                  min="5"
                  step="any"
                  value={depositCustom}
                  onChange={(e) => {
                    setDepositCustom(e.target.value);
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val) && val > 0) {
                      setDepositAmount(val);
                      setErrorMessage(null);
                    }
                  }}
                  placeholder="Enter custom deposit amount"
                  className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all shadow-inner"
                />
              </div>
            </div>

            {/* 3. DYNAMIC METHOD DETAILS BASED ON DROPDOWN */}
            {/* BRANCH A: CRYPTO */}
            {depositMethod === 'crypto' && (
              <div className="space-y-4 pt-1">
                {/* Select Asset */}
                <div>
                  <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Deposit Asset
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {CRYPTO_OPTIONS.map((c) => (
                      <button
                        key={c.symbol}
                        type="button"
                        onClick={() => setDepositCrypto(c)}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                          depositCrypto.symbol === c.symbol
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                        }`}
                      >
                        <img src={c.icon} alt={c.name} className="w-4 h-4 object-contain shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs font-bold leading-none">{c.symbol}</div>
                          <div className={`text-[10px] truncate ${depositCrypto.symbol === c.symbol ? 'text-slate-300' : 'text-slate-400'}`}>
                            {c.name}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Escrow Address & QR */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col sm:flex-row items-center gap-6">
                  <div className="bg-white p-2.5 rounded-xl shadow-xs border border-slate-200 shrink-0">
                    <QRCodeWithLogo value={depositQrUri} size={140} logoSize={30} />
                  </div>
                  <div className="flex-1 w-full space-y-3">
                    <div>
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Deposit Equivalent
                      </div>
                      <div className="text-xl font-black text-slate-900">
                        {depositCryptoAmount} {depositCrypto.symbol}{' '}
                        <span className="text-xs font-normal text-slate-500">
                          (= ${depositAmount.toFixed(2)} USD)
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                        <span>Escrow Address ({depositCrypto.network})</span>
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Verified Smart Escrow
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200">
                        <span className="font-mono text-[11px] text-slate-700 truncate select-all">
                          {depositCrypto.address}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(depositCrypto.address, true)}
                          className="p-1 text-slate-500 hover:text-emerald-700 transition-colors shrink-0 cursor-pointer"
                          title="Copy Address"
                        >
                          {depositCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400">
                      Send only {depositCrypto.symbol} via {depositCrypto.network}. Confirmation is automatic.
                    </div>
                  </div>
                </div>

                {/* Proof of Deposit Upload */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <UploadCloud className="w-3.5 h-3.5 text-emerald-600" />
                      Deposit Proof / Screenshot (Optional)
                    </span>
                    {proofPreview && (
                      <button
                        type="button"
                        onClick={removeProof}
                        className="text-[11px] text-rose-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    )}
                  </div>

                  {proofPreview ? (
                    <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200">
                      <img src={proofPreview} alt="Receipt preview" className="w-12 h-12 rounded object-cover border" />
                      <div className="text-xs text-slate-600">
                        <span className="font-bold text-emerald-700">Receipt Compressed</span>
                        <p className="text-[11px] text-slate-400">Attached to your deposit ledger entry.</p>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-300 rounded-xl bg-white hover:bg-slate-50/50 cursor-pointer transition-colors text-center">
                      <UploadCloud className="w-5 h-5 text-slate-400 mb-1" />
                      <span className="text-xs font-semibold text-slate-700">
                        {isShrinking ? 'Compressing receipt...' : 'Upload deposit transaction screenshot'}
                      </span>
                      <span className="text-[10px] text-slate-400">PNG, JPG, or WebP (Automatically compressed)</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isShrinking}
                        onChange={handleProofChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            )}

            {/* BRANCH B: CREDIT / DEBIT CARD (MAINTENANCE) */}
            {depositMethod === 'card' && (
              <div className="space-y-4 pt-1">
                <div className="bg-amber-50/80 border-2 border-amber-200 rounded-2xl p-5 text-center space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center mx-auto shadow-xs">
                    <CreditCard className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full border border-amber-300">
                      Scheduled Gateway Upgrade
                    </span>
                    <h3 className="text-base font-black text-slate-900">
                      Direct Card Processing Temporarily Under Maintenance
                    </h3>
                    <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                      Our international card settlement gateway is undergoing scheduled infrastructure upgrades to eliminate 3.8% banking fees on non-profit gifts.
                    </p>
                  </div>
                </div>

                {/* Channel Comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1 opacity-75">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700 flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                        Debit / Credit Card
                      </span>
                      <span className="text-[9px] font-bold uppercase text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                        Paused
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      3.8% processor fee + bank settlement delay
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-300 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                        <Coins className="w-3.5 h-3.5 text-emerald-600" />
                        Instant Crypto
                      </span>
                      <span className="text-[9px] font-bold uppercase text-emerald-800 bg-emerald-200 px-1.5 py-0.5 rounded">
                        Active 100%
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-700 font-medium">
                      0% intermediary fee • Direct escrow credit
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setDepositMethod('crypto')}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Switch Dropdown to Instant Crypto (0% Fee)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* BRANCH C: DIGITAL WALLETS (COMING SOON) */}
            {depositMethod === 'paypal' && (
              <div className="space-y-4 pt-1">
                <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-5 text-center space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 border border-slate-300 text-slate-700 flex items-center justify-center mx-auto shadow-xs">
                    <Wallet className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-700 bg-slate-200 px-2 py-0.5 rounded-full border border-slate-300">
                      <Clock className="w-3 h-3" /> Coming Soon
                    </span>
                    <h3 className="text-base font-black text-slate-900">
                      Digital Wallets Integration in Progress
                    </h3>
                    <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                      One-touch Apple Pay, Google Pay, and PayPal support is currently in non-profit verification and will be activated shortly.
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-[10px]">✓</div>
                    <div className="min-w-0">
                      <span className="font-bold text-slate-800 block">1-Tap Biometric Giving</span>
                      <span className="text-[10px] text-slate-500">Touch ID & Face ID donor instant verification.</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setDepositMethod('crypto')}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Switch Dropdown to Instant Crypto (Active Now)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* 4. BILLING ADDRESS & CONTRIBUTOR INFORMATION */}
            <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-emerald-600" />
                  Billing Address & Contributor Information
                </span>
                <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                  Tax Exemption & Proof Records
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Full Legal Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={billingAddress.fullName}
                      onChange={(e) => setBillingAddress({ ...billingAddress, fullName: e.target.value })}
                      placeholder="e.g. Eleanor Vance"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={billingAddress.email}
                      onChange={(e) => setBillingAddress({ ...billingAddress, email: e.target.value })}
                      placeholder="name@domain.org"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Street Address
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={billingAddress.street}
                      onChange={(e) => setBillingAddress({ ...billingAddress, street: e.target.value })}
                      placeholder="e.g. 742 Evergreen Terrace"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={billingAddress.city}
                    onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
                    placeholder="e.g. Seattle or Addis Ababa"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    State / Region
                  </label>
                  <input
                    type="text"
                    value={billingAddress.state}
                    onChange={(e) => setBillingAddress({ ...billingAddress, state: e.target.value })}
                    placeholder="e.g. WA or Oromia"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Country
                  </label>
                  <select
                    value={billingAddress.country}
                    onChange={(e) => setBillingAddress({ ...billingAddress, country: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600 cursor-pointer"
                  >
                    <option value="United States">United States</option>
                    <option value="Ethiopia">Ethiopia</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                    <option value="Australia">Australia</option>
                    <option value="United Arab Emirates">United Arab Emirates</option>
                    <option value="Other">Other Country</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Postal / ZIP Code
                  </label>
                  <input
                    type="text"
                    value={billingAddress.zipCode}
                    onChange={(e) => setBillingAddress({ ...billingAddress, zipCode: e.target.value })}
                    placeholder="e.g. 98101"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* 5. TERMS & CONDITIONS CHECKBOX */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <input
                id="terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-slate-600 cursor-pointer font-medium select-none">
                I have read and I accept the philanthropic terms and conditions for reserve funds.
              </label>
            </div>

            {/* 6. PRIMARY SUBMIT CTA */}
            {depositMethod === 'crypto' ? (
              <button
                type="button"
                onClick={handleDepositSubmit}
                disabled={isProcessing || !acceptedTerms}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Crediting Wallet Reserve...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>I Have Sent Payment — Credit ${depositAmount.toFixed(2)} to Wallet</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setDepositMethod('crypto')}
                className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Coins className="w-4 h-4 text-emerald-400" />
                <span>Switch to Instant Crypto to Deposit ${depositAmount.toFixed(2)}</span>
              </button>
            )}

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Adera Foundation issues formal tax certificates for all validated gifts.</span>
            </div>
          </div>
        )}

        {/* TAB 2: TRANSACTIONS PREVIEW */}
        {!successInfo && activeTab === 'transactions' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Transaction Ledger</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ledger of deposits, philanthropic allocations, and on-chain proofs.
                </p>
              </div>

              {/* Filter Pills */}
              <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
                {(['ALL', 'DONATION', 'DEPOSIT'] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setTxFilter(filter)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      txFilter === filter
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {filter === 'ALL' ? 'All' : filter === 'DONATION' ? 'Donations' : 'Deposits'}
                  </button>
                ))}
              </div>
            </div>

            {/* Transactions List */}
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600">No transactions recorded in this view.</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('funds')}
                  className="mt-3 text-xs font-bold text-emerald-700 hover:underline"
                >
                  Deposit funds now →
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredTransactions.map((tx) => (
                  <div key={tx.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          tx.type === 'DEPOSIT'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {tx.type === 'DEPOSIT' ? (
                          <ArrowDownLeft className="w-5 h-5" />
                        ) : (
                          <Heart className="w-5 h-5 fill-rose-500/20" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {tx.type === 'DEPOSIT'
                            ? `Wallet Deposit (${tx.cryptoSymbol || 'USDC'})`
                            : tx.causeTitle || 'Direct Cause Donation'}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span>{new Date(tx.createdAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className="font-mono truncate max-w-[120px] sm:max-w-[180px]">
                            {tx.txHash}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(tx.txHash)}
                            className="hover:text-slate-700"
                            title="Copy Hash"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div
                        className={`text-sm font-black font-[var(--font-poppins)] ${
                          tx.type === 'DEPOSIT' ? 'text-emerald-700' : 'text-slate-900'
                        }`}
                      >
                        {tx.type === 'DEPOSIT' ? '+' : '-'}${tx.amount.toFixed(2)}
                      </div>
                      <div className="flex items-center justify-end gap-1.5 mt-0.5">
                        {tx.paymentProof && (
                          <a
                            href={tx.paymentProof}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-emerald-700 hover:underline font-bold"
                            title="View Payment Proof Screenshot"
                          >
                            Proof Receipt ↗
                          </a>
                        )}
                        <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          tx.status === 'CONFIRMED'
                            ? 'text-emerald-800 bg-emerald-50 border border-emerald-200'
                            : tx.status === 'REJECTED'
                            ? 'text-rose-800 bg-rose-50 border border-rose-200'
                            : 'text-amber-800 bg-amber-50 border border-amber-200'
                        }`}>
                          {tx.status === 'CONFIRMED' ? 'Confirmed' : tx.status === 'REJECTED' ? 'Rejected' : 'Pending Verification'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function WalletPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="flex items-center gap-2 text-slate-500 font-semibold text-xs">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
            <span>Loading Philanthropic Wallet...</span>
          </div>
        </div>
      }
    >
      <PhilanthropicWalletView />
    </Suspense>
  );
}
