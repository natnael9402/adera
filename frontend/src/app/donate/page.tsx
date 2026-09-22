'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Wallet,
  Heart,
  PlusCircle,
  Clock,
  ArrowRight,
  ArrowUpRight,
  ArrowDownLeft,
  Check,
  Copy,
  Sparkles,
  ShieldCheck,
  Search,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  Trash2,
  RefreshCw,
  Coins,
  ExternalLink,
  Layers,
  SlidersHorizontal,
  ChevronRight,
  Lock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import QRCodeWithLogo from '@/components/QRCodeWithLogo';
import { useWallet, WalletTransaction } from '@/context/WalletContext';
import { useAuth } from '@/context/AuthContext';
import { useDonate, CauseDonationTarget } from '@/context/DonateContext';
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

const PRESET_AMOUNTS = [25, 50, 100, 250, 500, 1000];

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
];

type ActiveTab = 'donate' | 'funds' | 'transactions';
type DonateSource = 'wallet' | 'crypto';

function DonateHub() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const { balance, transactions, deposit, donateFromWallet } = useWallet();
  const { user } = useAuth();
  const { activeCause: contextCause } = useDonate();

  // Tab State
  const initialTab = (searchParams.get('tab') as ActiveTab) || 'donate';
  const [activeTab, setActiveTab] = useState<ActiveTab>(initialTab);

  // Causes List & Selection
  const [causes, setCauses] = useState<CauseDonationTarget[]>(FALLBACK_CAUSES);
  const [selectedCause, setSelectedCause] = useState<CauseDonationTarget | null>(null);
  const [causePickerOpen, setCausePickerOpen] = useState(false);
  const [causeSearch, setCauseSearch] = useState('');

  // Donation Form State
  const [donateSource, setDonateSource] = useState<DonateSource>('wallet');
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoOption>(CRYPTO_OPTIONS[1]); // USDC default
  const [amountUsd, setAmountUsd] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('100');
  const [donorName, setDonorName] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Add Funds State
  const [depositAmount, setDepositAmount] = useState<number>(100);
  const [depositCustom, setDepositCustom] = useState<string>('100');
  const [depositCrypto, setDepositCrypto] = useState<CryptoOption>(CRYPTO_OPTIONS[1]);
  const [depositCopied, setDepositCopied] = useState(false);

  // Proof Image State
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [isShrinking, setIsShrinking] = useState(false);

  // Submission / Flow States
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    type: 'DONATION' | 'DEPOSIT';
    amount: number;
    txHash: string;
    causeTitle?: string;
  } | null>(null);

  // Transactions Filter
  const [txFilter, setTxFilter] = useState<'ALL' | 'DONATION' | 'DEPOSIT'>('ALL');

  // Load causes from backend
  useEffect(() => {
    let mounted = true;
    api.posts.list()
      .then((posts: any[]) => {
        if (!mounted || !Array.isArray(posts) || posts.length === 0) return;
        const mapped: CauseDonationTarget[] = posts.map((p, idx) => ({
          id: p.id,
          title: p.title,
          category: p.category || 'Humanitarian Relief',
          goal: p.goal || 25000,
          raised: p.raised || 0,
          image: p.image || FALLBACK_CAUSES[idx % FALLBACK_CAUSES.length].image,
          description: p.description,
          urgency: p.urgency,
        }));
        setCauses(mapped);

        // Preselect cause from URL or context
        const causeParam = searchParams.get('cause');
        if (causeParam) {
          const found = mapped.find(c => String(c.id) === causeParam);
          if (found) setSelectedCause(found);
        } else if (contextCause) {
          const found = mapped.find(c => String(c.id) === String(contextCause.id));
          setSelectedCause(found || mapped[0]);
        } else if (!selectedCause) {
          setSelectedCause(mapped[0]);
        }
      })
      .catch((err) => {
        console.warn('Using fallback causes on donate hub:', err);
        const causeParam = searchParams.get('cause');
        if (causeParam) {
          const found = FALLBACK_CAUSES.find(c => String(c.id) === causeParam);
          if (found) setSelectedCause(found);
        } else {
          setSelectedCause(FALLBACK_CAUSES[0]);
        }
      });

    return () => {
      mounted = false;
    };
  }, [searchParams, contextCause]);

  // Set default donor name from auth
  useEffect(() => {
    if (user?.name && !donorName) {
      setDonorName(user.name);
    }
  }, [user]);

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
    } else {
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  // Filtered Causes for Picker
  const filteredCauses = useMemo(() => {
    if (!causeSearch.trim()) return causes;
    const q = causeSearch.toLowerCase();
    return causes.filter(
      c => c.title.toLowerCase().includes(q) || (c.category && c.category.toLowerCase().includes(q))
    );
  }, [causes, causeSearch]);

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    if (txFilter === 'ALL') return transactions;
    return transactions.filter(t => t.type === txFilter);
  }, [transactions, txFilter]);

  // Crypto conversion
  const cryptoRate = selectedCrypto.rate || 1;
  const cryptoAmount = (amountUsd / cryptoRate).toFixed(
    selectedCrypto.symbol === 'BTC' ? 6 : selectedCrypto.symbol === 'ETH' || selectedCrypto.symbol === 'SOL' ? 4 : 2
  );
  const cryptoQrUri = selectedCrypto.symbol === 'BTC'
    ? `bitcoin:${selectedCrypto.address}?amount=${cryptoAmount}`
    : selectedCrypto.symbol === 'ETH'
    ? `ethereum:${selectedCrypto.address}?value=${cryptoAmount}`
    : selectedCrypto.symbol === 'SOL'
    ? `solana:${selectedCrypto.address}?amount=${cryptoAmount}`
    : selectedCrypto.address;

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

  // Submit Donation
  const handleDonateSubmit = async () => {
    if (!selectedCause) {
      setErrorMessage('Please select a cause to support.');
      return;
    }
    if (amountUsd <= 0) {
      setErrorMessage('Please enter a valid donation amount.');
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);

    try {
      if (donateSource === 'wallet') {
        // Donate from Philanthropic Balance
        const res = await donateFromWallet({
          causeId: selectedCause.id,
          causeTitle: selectedCause.title,
          amountUsd,
          isAnonymous,
          donorName: donorName.trim() || user?.name || 'Adera Supporter',
        });

        if (!res.success) {
          setErrorMessage(res.error || 'Failed to complete wallet donation.');
          setIsProcessing(false);
          return;
        }

        setSuccessInfo({
          type: 'DONATION',
          amount: amountUsd,
          txHash: res.txHash,
          causeTitle: selectedCause.title,
        });
      } else {
        // Direct Crypto Transfer
        const mockHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
        let uploadedUrl: string | undefined = undefined;

        if (proofFile) {
          try {
            const uploadRes = await api.upload.proof(proofFile);
            uploadedUrl = uploadRes.url;
          } catch (e) {
            console.warn('Proof upload note:', e);
          }
        }

        // Call direct donation backend
        try {
          await api.posts.donate(Number(selectedCause.id), {
            donorName: isAnonymous ? 'Anonymous Supporter' : (donorName.trim() || user?.name || 'Adera Donor'),
            donorEmail: user?.email,
            amountUsd,
            cryptoAmount,
            cryptoSymbol: selectedCrypto.symbol,
            txHash: mockHash,
            isAnonymous,
            paymentProof: uploadedUrl,
          });
        } catch (err) {
          console.warn('Backend sync note:', err);
        }

        setSuccessInfo({
          type: 'DONATION',
          amount: amountUsd,
          txHash: mockHash,
          causeTitle: selectedCause.title,
        });
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong processing your donation.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Submit Add Funds
  const handleDepositSubmit = async () => {
    if (depositAmount <= 0) {
      setErrorMessage('Please enter a valid deposit amount.');
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
        type: 'DEPOSIT',
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
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-bold tracking-wider uppercase border border-emerald-500/30">
                  <Wallet className="w-3.5 h-3.5" /> Philanthropic Wallet
                </span>
                <span className="text-[11px] text-slate-400 font-medium">Non-Custodial Balance</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-5xl font-black tracking-tight text-white font-[var(--font-poppins)]">
                  ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-slate-400">USD Available</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5 self-start sm:self-center">
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
                setActiveTab('donate');
              }}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'donate'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Heart className={`w-4 h-4 ${activeTab === 'donate' ? 'text-emerald-600 fill-emerald-600/20' : 'text-slate-400'}`} />
              <span>Donate to Cause</span>
            </button>

            <button
              type="button"
              onClick={() => {
                resetSuccess();
                setActiveTab('funds');
              }}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'funds'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PlusCircle className={`w-4 h-4 ${activeTab === 'funds' ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>Add Funds</span>
            </button>

            <button
              type="button"
              onClick={() => {
                resetSuccess();
                setActiveTab('transactions');
              }}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'transactions'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className={`w-4 h-4 ${activeTab === 'transactions' ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>Transactions Preview</span>
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
              {successInfo.type === 'DONATION' ? 'Donation Confirmed!' : 'Funds Added Successfully!'}
            </h2>
            <p className="text-sm text-slate-600 mb-6">
              {successInfo.type === 'DONATION'
                ? `You successfully donated $${successInfo.amount.toFixed(2)} to "${successInfo.causeTitle || 'Verified Cause'}". Thank you for making an impact.`
                : `$${successInfo.amount.toFixed(2)} has been credited to your Philanthropic Wallet balance.`}
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
              <button
                type="button"
                onClick={() => {
                  resetSuccess();
                  setActiveTab('donate');
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Make Another Donation
              </button>
            </div>
          </div>
        )}

        {/* TAB 1: DONATE TO CAUSE */}
        {!successInfo && activeTab === 'donate' && (
          <div className="space-y-6">
            {/* Cause Selection Box */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Target Cause
                </span>
                <button
                  type="button"
                  onClick={() => setCausePickerOpen(!causePickerOpen)}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>{causePickerOpen ? 'Close List' : 'Change Cause'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${causePickerOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Selected Cause Preview */}
              {selectedCause ? (
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl relative overflow-hidden shrink-0 bg-slate-200">
                    <Image
                      src={selectedCause.image || FALLBACK_CAUSES[0].image || '/causes/cause_water_1786200462466.jpg'}
                      alt={selectedCause.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80 mb-1">
                      {selectedCause.category || 'Humanitarian'}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                      {selectedCause.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                      <span>Goal: ${selectedCause.goal?.toLocaleString()}</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-semibold">
                        Raised: ${selectedCause.raised?.toLocaleString() || '0'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
                  No cause selected. Click "Change Cause" to select one.
                </div>
              )}

              {/* Cause Picker Drawer */}
              {causePickerOpen && (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search verified causes..."
                      value={causeSearch}
                      onChange={(e) => setCauseSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                    {filteredCauses.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setSelectedCause(c);
                          setCausePickerOpen(false);
                        }}
                        className={`text-left p-2.5 rounded-xl border text-xs flex items-center gap-3 transition-all cursor-pointer ${
                          selectedCause?.id === c.id
                            ? 'bg-emerald-50 border-emerald-400 text-slate-900 font-bold'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-lg relative overflow-hidden shrink-0 bg-slate-200">
                          <Image src={c.image || FALLBACK_CAUSES[0].image || '/causes/cause_water_1786200462466.jpg'} alt={c.title} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="truncate font-semibold text-slate-900">{c.title}</div>
                          <div className="text-[11px] text-slate-500">{c.category}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Donation Amount Selection */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs">
              <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Select Donation Amount (USD)
              </span>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
                {PRESET_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setAmountUsd(amt);
                      setCustomAmount(amt.toString());
                    }}
                    className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      amountUsd === amt
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200'
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>

              {/* Custom Input */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val) && val > 0) setAmountUsd(val);
                  }}
                  placeholder="Custom amount"
                  className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>
            </div>

            {/* Giving Source Switcher: Wallet Balance vs Instant Crypto */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
              <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Giving Source
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Option 1: Philanthropic Wallet */}
                <button
                  type="button"
                  onClick={() => setDonateSource('wallet')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative ${
                    donateSource === 'wallet'
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-600'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase text-emerald-800 flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5" /> Adera Wallet
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      Instant 1-Tap
                    </span>
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    Balance: ${balance.toFixed(2)} USD
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {balance >= amountUsd
                      ? '✓ Fully funded. Zero waiting, zero gas fees.'
                      : `Needs $${(amountUsd - balance).toFixed(2)} more. Click Add Funds to top up.`}
                  </div>
                </button>

                {/* Option 2: Direct Crypto Transfer */}
                <button
                  type="button"
                  onClick={() => setDonateSource('crypto')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative ${
                    donateSource === 'crypto'
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-600'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
                      <Coins className="w-3.5 h-3.5 text-slate-700" /> Direct Crypto
                    </span>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                      QR / On-Chain
                    </span>
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    BTC, USDC, ETH, SOL, USDT
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Direct transfer to foundation multisig escrow.
                  </div>
                </button>
              </div>

              {/* If Direct Crypto is selected: Asset picker, QR, Address, and Proof Upload */}
              {donateSource === 'crypto' && (
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  {/* Select Coin */}
                  <div>
                    <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Choose Asset
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {CRYPTO_OPTIONS.map((c) => (
                        <button
                          key={c.symbol}
                          type="button"
                          onClick={() => setSelectedCrypto(c)}
                          className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                            selectedCrypto.symbol === c.symbol
                              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                          }`}
                        >
                          <img src={c.icon} alt={c.name} className="w-4 h-4 object-contain" />
                          <div className="min-w-0">
                            <div className="text-xs font-bold leading-none">{c.symbol}</div>
                            <div className="text-[10px] text-slate-400 truncate">{c.name}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* QR & Address Card */}
                  <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 flex flex-col sm:flex-row items-center gap-5">
                    <div className="bg-white p-2.5 rounded-xl shadow-xs border border-slate-200 shrink-0">
                      <QRCodeWithLogo value={cryptoQrUri} size={150} logoSize={32} />
                    </div>
                    <div className="flex-1 w-full space-y-3">
                      <div>
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Amount to Send ({selectedCrypto.symbol})
                        </div>
                        <div className="text-lg font-black text-slate-900">
                          {cryptoAmount} {selectedCrypto.symbol}{' '}
                          <span className="text-xs font-normal text-slate-500">
                            (@ ${cryptoRate.toLocaleString()} / {selectedCrypto.symbol})
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Network: {selectedCrypto.network}
                        </div>
                        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200">
                          <span className="font-mono text-[11px] text-slate-700 truncate select-all">
                            {selectedCrypto.address}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedCrypto.address)}
                            className="p-1 text-slate-500 hover:text-emerald-700 transition-colors shrink-0 cursor-pointer"
                            title="Copy Address"
                          >
                            {copiedAddress ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Optional Proof of Payment Screenshot */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <UploadCloud className="w-3.5 h-3.5 text-emerald-600" />
                        Transfer Receipt / Proof (Optional)
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
                          <span className="font-bold text-emerald-700">Compressed WebP Ready</span>
                          <p className="text-[11px] text-slate-400">Attached to donation record.</p>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-300 rounded-xl bg-white hover:bg-slate-50/50 cursor-pointer transition-colors text-center">
                        <UploadCloud className="w-5 h-5 text-slate-400 mb-1" />
                        <span className="text-xs font-semibold text-slate-700">Upload transaction screenshot</span>
                        <span className="text-[10px] text-slate-400">PNG, JPG, or WebP auto-compressed</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProofChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Donor Identity & Anonymous Toggle */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Donor Recognition
                </span>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Donate Anonymously</span>
                </label>
              </div>

              {!isAnonymous && (
                <input
                  type="text"
                  placeholder="Your Name (or public moniker)"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              )}
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Action */}
            <div>
              {donateSource === 'wallet' && balance < amountUsd ? (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('funds')}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-extrabold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Top Up Wallet with ${(amountUsd - balance).toFixed(2)} to Proceed</span>
                  </button>
                  <p className="text-center text-[11px] text-slate-500">
                    Your balance is ${balance.toFixed(2)}. Add funds or switch to Direct Crypto.
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleDonateSubmit}
                  disabled={isProcessing}
                  className="w-full py-4 bg-slate-950 hover:bg-slate-800 active:scale-[0.99] text-white rounded-2xl font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                      <span>Recording Donation...</span>
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4 text-emerald-400 fill-emerald-400/30" />
                      <span>
                        Confirm & Donate ${amountUsd.toFixed(2)}{' '}
                        {donateSource === 'wallet' ? 'from Wallet' : `via ${selectedCrypto.symbol}`}
                      </span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ADD FUNDS (TOP UP) */}
        {!successInfo && activeTab === 'funds' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Add Funds to Philanthropic Wallet</h2>
              <p className="text-xs text-slate-500 mt-1">
                Deposit crypto into your philanthropic reserve. Balance is usable immediately across all causes with 1-tap giving.
              </p>
            </div>

            {/* Deposit Amount Presets */}
            <div>
              <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Deposit Amount (USD)
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
                {[50, 100, 250, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setDepositAmount(amt);
                      setDepositCustom(amt.toString());
                    }}
                    className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      depositAmount === amt
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200'
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                <input
                  type="number"
                  min="10"
                  step="any"
                  value={depositCustom}
                  onChange={(e) => {
                    setDepositCustom(e.target.value);
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val) && val > 0) setDepositAmount(val);
                  }}
                  placeholder="Custom amount"
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>
            </div>

            {/* Select Crypto to Deposit */}
            <div>
              <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
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
                    <img src={c.icon} alt={c.name} className="w-4 h-4 object-contain" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold leading-none">{c.symbol}</div>
                      <div className="text-[10px] text-slate-400 truncate">{c.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Deposit Address & QR */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col sm:flex-row items-center gap-6">
              <div className="bg-white p-2.5 rounded-xl shadow-xs border border-slate-200 shrink-0">
                <QRCodeWithLogo value={depositQrUri} size={150} logoSize={32} />
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
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Escrow Address ({depositCrypto.network})
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
                    <p className="text-[11px] text-slate-400">Ready to submit with deposit.</p>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-300 rounded-xl bg-white hover:bg-slate-50/50 cursor-pointer transition-colors text-center">
                  <UploadCloud className="w-5 h-5 text-slate-400 mb-1" />
                  <span className="text-xs font-semibold text-slate-700">Upload deposit transaction screenshot</span>
                  <span className="text-[10px] text-slate-400">PNG, JPG, or WebP</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProofChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {errorMessage && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleDepositSubmit}
              disabled={isProcessing}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-extrabold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Crediting Wallet...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>I Have Sent Payment — Credit ${depositAmount.toFixed(2)} to Wallet</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* TAB 3: TRANSACTIONS PREVIEW */}
        {!successInfo && activeTab === 'transactions' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Transactions Preview</h2>
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
                  onClick={() => setActiveTab('donate')}
                  className="mt-3 text-xs font-bold text-emerald-700 hover:underline"
                >
                  Make a donation now →
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
                            <Copy className="w-3 h-3" />
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

export default function DonatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="flex items-center gap-2 text-slate-500 font-semibold text-xs">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
            <span>Loading Philanthropic Hub...</span>
          </div>
        </div>
      }
    >
      <DonateHub />
    </Suspense>
  );
}
