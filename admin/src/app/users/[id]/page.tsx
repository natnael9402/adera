'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import AdminShell from '@/components/AdminShell';
import { 
  ArrowLeft, CreditCard, ShieldCheck, Mail, Phone, MapPin, 
  ShoppingBag, CheckCircle2, Clock, AlertCircle, Copy, Check, 
  ExternalLink, RefreshCw, Send, Lock, Calendar, Truck, User, 
  Layers, Package, Heart, Eye, X
} from 'lucide-react';

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = use(params);
  const { user: adminUser, loading: authLoading } = useAuth();
  const router = useRouter();

  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Email modal state
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailResultMsg, setEmailResultMsg] = useState<string | null>(null);

  // Order Details Modal state
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const fetchUserDetails = () => {
    setIsLoading(true);
    setError(null);
    api.admin.users.get(id)
      .then((res: any) => {
        setData(res);
      })
      .catch((err: any) => {
        setError(err.message || 'Failed to load user details');
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (!authLoading && !adminUser) router.push('/login');
    if (adminUser) fetchUserDetails();
  }, [adminUser, authLoading, id]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleSendDirectEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.user?.email || !emailSubject.trim() || !emailMessage.trim()) return;

    setIsSendingEmail(true);
    setEmailResultMsg(null);
    try {
      await api.admin.emails.sendDirect({
        recipient: data.user.email,
        recipientName: data.user.name,
        subject: emailSubject.trim(),
        message: emailMessage.trim(),
        category: 'CUSTOM_SUPPORT',
      });
      setEmailResultMsg('Email successfully dispatched to ' + data.user.email);
      setEmailSubject('');
      setEmailMessage('');
      fetchUserDetails();
      setTimeout(() => {
        setEmailModalOpen(false);
        setEmailResultMsg(null);
      }, 2000);
    } catch (err: any) {
      setEmailResultMsg('Failed to send email: ' + err.message);
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <AdminShell>
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Retrieving customer & vault records...</p>
        </div>
      </AdminShell>
    );
  }

  if (error || !data) {
    return (
      <AdminShell>
        <div className="max-w-3xl mx-auto py-12 px-4 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-slate-900">User Not Found</h2>
          <p className="text-xs text-slate-500">{error || 'No customer records match this identifier.'}</p>
          <Link
            href="/users"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Users Directory</span>
          </Link>
        </div>
      </AdminShell>
    );
  }

  const { user, orders = [], savedCards = [], emails = [], walletTransactions = [], donations = [], stats = {} } = data;
  const isDonor = user.role === 'DONOR' || data.donations?.length > 0;
  const isBuyer = user.role === 'BUYER' || orders.length > 0;

  return (
    <AdminShell>
      <div className="max-w-7xl mx-auto space-y-6 font-sans">
        
        {/* Navigation Breadcrumb & Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Link
              href="/users"
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Users Directory</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-bold text-slate-900 truncate">
              {user.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchUserDetails}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => {
                setEmailSubject(`Important Update regarding your Adera Account`);
                setEmailModalOpen(true);
              }}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Write Email to User</span>
            </button>
          </div>
        </div>

        {/* User Profile Header Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black uppercase text-white shadow-md shrink-0 ${
                isDonor 
                  ? 'bg-gradient-to-tr from-rose-600 to-amber-600' 
                  : isBuyer 
                  ? 'bg-gradient-to-tr from-emerald-600 to-teal-700' 
                  : 'bg-gradient-to-tr from-purple-600 to-indigo-700'
              }`}>
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  user.name?.[0] || 'U'
                )}
              </div>

              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {user.name}
                  </h1>
                  {user.verified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Verified
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-700 border border-slate-200">
                    {user.role}
                  </span>
                </div>

                <p className="text-xs text-slate-600 font-mono flex items-center gap-2">
                  <span>{user.email}</span>
                  <button
                    onClick={() => handleCopy(user.email, 'email')}
                    className="text-slate-400 hover:text-slate-700 cursor-pointer"
                    title="Copy Email"
                  >
                    {copiedField === 'email' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </p>

                {user.phone && (
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-0.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{user.phone}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Address / Location pill if saved */}
            {user.savedAddress && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1 max-w-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  Saved Shipping Address
                </span>
                <p className="font-semibold text-slate-800 leading-snug">
                  {user.savedAddress.address} {user.savedAddress.apartment && `Apt ${user.savedAddress.apartment}`}<br />
                  {user.savedAddress.city}, {user.savedAddress.stateProvince} {user.savedAddress.zipCode}<br />
                  {user.savedAddress.country}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 4 Metric Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Store Spend</span>
            <p className="text-xl sm:text-2xl font-black text-emerald-700 font-mono">${(stats.totalSpent || 0).toFixed(2)}</p>
            <p className="text-[10px] text-slate-500">Across {stats.totalOrders || 0} purchase{stats.totalOrders !== 1 ? 's' : ''}</p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block">Payment Cards Vault</span>
            <p className="text-xl sm:text-2xl font-black text-blue-700 font-mono">{savedCards.length}</p>
            <p className="text-[10px] text-slate-500">Captured & authorized cards</p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block">Philanthropic Giving</span>
            <p className="text-xl sm:text-2xl font-black text-rose-700 font-mono">${(stats.totalDonated || 0).toLocaleString()}</p>
            <p className="text-[10px] text-slate-500">Direct cause disbursements</p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block">Member Since</span>
            <p className="text-sm sm:text-base font-bold text-slate-800 font-mono mt-1">
              {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
            </p>
            <p className="text-[10px] text-slate-400">Account #{user.id || 'Buyer'}</p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION: CREDIT CARD DETAILS VAULT (CLIENT FREAKOUT PRIORITY)              */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-700 border border-blue-200 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  Credit Card & Payment Vault ({savedCards.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Full card information entered by this customer during checkout.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Level 1 PCI-DSS Secure Escrow</span>
            </div>
          </div>

          {savedCards.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
              <CreditCard className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No Credit Cards on File</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                This user has not completed checkout with a credit card yet (or processed payments via cryptocurrency).
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {savedCards.map((card: any, idx: number) => {
                const brand = card.brand || 'VISA';
                return (
                  <div 
                    key={idx}
                    className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 border border-slate-800 shadow-xl space-y-5 relative overflow-hidden"
                  >
                    {/* Background subtle glow */}
                    <div className="absolute -top-16 -right-16 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

                    {/* Top Row: Network Logo + Status */}
                    <div className="flex items-center justify-between relative z-10 border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                          Card #{idx + 1}
                        </span>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Active & Authorized
                        </span>
                      </div>

                      <span className="text-xs font-mono font-black text-white px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 uppercase">
                        {brand}
                      </span>
                    </div>

                    {/* Full Card Number Box */}
                    <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-1.5 relative z-10">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                          Full Card Number (PAN)
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(card.cardNumber, `card-num-${idx}`)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                        >
                          {copiedField === `card-num-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedField === `card-num-${idx}` ? 'Copied' : 'Copy Number'}</span>
                        </button>
                      </div>
                      <p className="font-mono font-black text-base sm:text-lg text-emerald-300 tracking-[0.18em] select-all truncate">
                        {card.cardNumber}
                      </p>
                    </div>

                    {/* Details Grid: Cardholder, Expiry, CVC, ZIP */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs relative z-10">
                      {/* Cardholder */}
                      <div className="col-span-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-0.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                          Cardholder Name
                        </span>
                        <p className="font-mono font-bold text-white text-xs truncate">
                          {card.cardholderName || user.name}
                        </p>
                      </div>

                      {/* Expiration Date */}
                      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-0.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                          Expires (MM/YY)
                        </span>
                        <p className="font-mono font-black text-white text-xs">
                          {card.expMonth}/{card.expYear?.slice(-2) || card.expYear}
                        </p>
                      </div>

                      {/* CVC Code */}
                      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                            CVC
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(card.cvc, `cvc-${idx}`)}
                            className="text-emerald-400 hover:text-emerald-300 cursor-pointer"
                            title="Copy CVC"
                          >
                            {copiedField === `cvc-${idx}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                        <p className="font-mono font-black text-emerald-400 text-xs tracking-widest select-all">
                          {card.cvc || '•••'}
                        </p>
                      </div>
                    </div>

                    {/* Meta Row: Origin Source & Auth Code */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs relative z-10">
                      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-0.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                          Captured Source
                        </span>
                        <p className="font-mono font-bold text-emerald-400 text-xs truncate">
                          {card.source || card.orderNumber || 'Online Checkout'}
                        </p>
                      </div>

                      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                            Auth Code / Ref
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(card.authCode || 'AUTH-CARD-SECURE', `auth-${idx}`)}
                            className="text-emerald-400 hover:text-emerald-300 cursor-pointer"
                          >
                            {copiedField === `auth-${idx}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                        <p className="font-mono font-bold text-slate-300 text-xs truncate select-all">
                          {card.authCode || 'AUTH-CARD-SECURE'}
                        </p>
                      </div>
                    </div>

                    {/* Detailed Billing Address Box */}
                    <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs relative z-10">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                          Complete Billing Address
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {card.billingAddress?.country || user.savedAddress?.country || 'United States'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                        <div>
                          <span className="text-[9px] text-slate-500 uppercase block font-sans">Billing Name</span>
                          <span className="text-slate-200 font-bold">
                            {card.billingAddress?.fullName || card.cardholderName || user.name}
                          </span>
                        </div>

                        <div>
                          <span className="text-[9px] text-slate-500 uppercase block font-sans">Billing Email</span>
                          <span className="text-slate-300 truncate block">
                            {card.billingAddress?.email || user.email}
                          </span>
                        </div>

                        <div className="sm:col-span-2">
                          <span className="text-[9px] text-slate-500 uppercase block font-sans">Street Address</span>
                          <span className="text-slate-200">
                            {card.billingAddress?.street || card.billingAddress?.address || user.savedAddress?.street || '742 Evergreen Terrace'}
                          </span>
                        </div>

                        <div>
                          <span className="text-[9px] text-slate-500 uppercase block font-sans">City, State</span>
                          <span className="text-slate-200">
                            {card.billingAddress?.city || 'Seattle'}, {card.billingAddress?.state || 'WA'}
                          </span>
                        </div>

                        <div>
                          <span className="text-[9px] text-slate-500 uppercase block font-sans">Postal / ZIP</span>
                          <span className="text-emerald-400 font-bold">
                            {card.billingZip || card.billingAddress?.zipCode || user.savedAddress?.zipCode || '98101'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Copy All Details Button */}
                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-800 relative z-10">
                      <span className="text-[10px] text-slate-400 font-mono">
                        Last used: {new Date(card.lastUsedAt).toLocaleDateString()}
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          const billingStreet = card.billingAddress?.street || card.billingAddress?.address || user.savedAddress?.street || '';
                          const billingCityState = `${card.billingAddress?.city || ''}, ${card.billingAddress?.state || ''} ${card.billingZip || card.billingAddress?.zipCode || ''}`.trim();
                          const billingCountry = card.billingAddress?.country || user.savedAddress?.country || 'United States';
                          const billingEmail = card.billingAddress?.email || user.email;

                          const dossier = `=== CARD PAYMENT DOSSIER ===\nCardholder: ${card.cardholderName || user.name}\nCard Number: ${card.cardNumber}\nExpiration Date: ${card.expMonth}/${card.expYear}\nSecurity Code (CVC): ${card.cvc}\nCard Brand: ${brand}\nOrigin / Source: ${card.source || 'Online Checkout'}\nAuth Code: ${card.authCode || 'N/A'}\n--- BILLING ADDRESS ---\nName: ${card.billingAddress?.fullName || card.cardholderName || user.name}\nEmail: ${billingEmail}\nStreet: ${billingStreet}\nCity/State/Zip: ${billingCityState}\nCountry: ${billingCountry}`;
                          handleCopy(dossier, `all-${idx}`);
                        }}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-600/20 active:scale-95"
                      >
                        {copiedField === `all-${idx}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedField === `all-${idx}` ? 'Copied Full Card Dossier!' : 'Copy All Card Details'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* SECTION: ORDERS & PURCHASES HISTORY                                       */}
        {/* ========================================================================= */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  Order & Transaction History ({orders.length})
                </h2>
                <p className="text-xs text-slate-500">
                  All store purchases, tracking details, and settlement methods.
                </p>
              </div>
            </div>

            <Link
              href="/orders"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline inline-flex items-center gap-1"
            >
              <span>View Global Orders Catalog</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            {orders.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No orders registered for this user yet.
              </div>
            ) : (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full min-w-[650px] text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-5">Order # / Date</th>
                      <th className="py-3 px-4">Amount & Payment</th>
                      <th className="py-3 px-4">Tracking / Carrier</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-5 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map((ord: any) => {
                      const isCard = ord.paymentMethod === 'CREDIT_CARD' || ord.cardDetails;
                      return (
                        <tr key={ord.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-5">
                            <span className="font-mono font-bold text-slate-900 block">
                              #{ord.orderNumber}
                            </span>
                            <span className="text-[11px] text-slate-400 block">
                              {new Date(ord.createdAt).toLocaleDateString()}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-slate-900 block">
                              ${ord.totalAmount.toFixed(2)}
                            </span>
                            {isCard ? (
                              <span className="inline-flex items-center gap-1 text-[10px] text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded font-bold font-mono">
                                <CreditCard className="w-3 h-3 text-blue-600" />
                                <span>{ord.cardDetails?.brand || ord.cryptoSymbol || 'CARD'} •••• {ord.cardDetails?.last4 || '••••'}</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono text-emerald-600 font-bold">
                                {ord.cryptoAmount} {ord.cryptoSymbol}
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 font-mono text-[11px]">
                            <span className="font-bold text-slate-800 block">{ord.trackingNumber}</span>
                            <span className="text-[10px] text-slate-400 block font-sans">{ord.carrier}</span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-slate-100 text-slate-700 border border-slate-200">
                              {ord.status}
                            </span>
                          </td>

                          <td className="py-3.5 px-5 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(ord)}
                              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION: PHILANTHROPIC DEPOSITS & DONATIONS LEDGER                        */}
        {/* ========================================================================= */}
        {(walletTransactions.length > 0 || donations.length > 0) && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 tracking-tight">
                    Philanthropic Deposits & Direct Donations ({walletTransactions.length + donations.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Reserve deposits and direct cause allocations made with cards or crypto.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full min-w-[650px] text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-5">Type / Date</th>
                      <th className="py-3 px-4">Amount (USD)</th>
                      <th className="py-3 px-4">Payment Method & Card</th>
                      <th className="py-3 px-4">Auth Ref / Tx Hash</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {walletTransactions.map((tx: any) => {
                      const isCard = tx.paymentMethod === 'CREDIT_CARD' || tx.cardDetails;
                      return (
                        <tr key={`tx-${tx.id}`} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-5">
                            <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[10px] uppercase block w-fit font-sans">
                              Wallet Deposit
                            </span>
                            <span className="text-[11px] text-slate-400 block mt-1">
                              {new Date(tx.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-emerald-700">
                            +${tx.amount.toFixed(2)} USD
                          </td>
                          <td className="py-3.5 px-4 font-sans">
                            {isCard ? (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1 text-[10px] text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded font-bold font-mono">
                                  <CreditCard className="w-3 h-3 text-blue-600" />
                                  <span>{tx.cardDetails?.brand || 'CARD'} •••• {tx.cardDetails?.last4 || tx.cardDetails?.cardNumber?.slice(-4) || '••••'}</span>
                                </span>
                                {tx.cardDetails?.cardholderName && (
                                  <span className="text-[10px] text-slate-500 block truncate">
                                    {tx.cardDetails.cardholderName}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-600 font-mono">
                                {tx.cryptoAmount} {tx.cryptoSymbol}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-[11px] text-slate-500 max-w-[150px] truncate select-all">
                            {tx.txHash}
                          </td>
                          <td className="py-3.5 px-4 font-sans">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                              tx.status === 'CONFIRMED'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}

                    {donations.map((don: any) => {
                      const isCard = don.paymentMethod === 'CREDIT_CARD' || don.cardDetails;
                      return (
                        <tr key={`don-${don.id}`} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-5">
                            <span className="font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded text-[10px] uppercase block w-fit font-sans">
                              Direct Donation
                            </span>
                            <span className="text-[11px] text-slate-400 block mt-1">
                              {new Date(don.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-rose-700">
                            ${don.amountUsd.toFixed(2)} USD
                          </td>
                          <td className="py-3.5 px-4 font-sans">
                            {isCard ? (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1 text-[10px] text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded font-bold font-mono">
                                  <CreditCard className="w-3 h-3 text-blue-600" />
                                  <span>{don.cardDetails?.brand || 'CARD'} •••• {don.cardDetails?.last4 || don.cardDetails?.cardNumber?.slice(-4) || '••••'}</span>
                                </span>
                                {don.donorName && (
                                  <span className="text-[10px] text-slate-500 block truncate">
                                    {don.donorName}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-600 font-mono">
                                {don.cryptoAmount} {don.cryptoSymbol}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-[11px] text-slate-500 max-w-[150px] truncate select-all">
                            {don.txHash}
                          </td>
                          <td className="py-3.5 px-4 font-sans">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {don.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION: COMMUNICATION & DISPATCHED EMAILS                                */}
        {/* ========================================================================= */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  Email Delivery Records ({emails.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Transactional receipts and custom messages sent to this address.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setEmailSubject(`Important Notice regarding your order`);
                setEmailModalOpen(true);
              }}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>+ Send New Email</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            {emails.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No outbound emails logged for this customer yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {emails.map((em: any) => (
                  <div key={em.id} className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                    <div className="space-y-0.5 min-w-0">
                      <p className="font-bold text-slate-900 truncate">{em.subject}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Template: {em.template} • {new Date(em.sentAt).toLocaleString()}
                      </p>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                      em.status === 'SENT' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {em.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL: DIRECT EMAIL COMPOSER                                              */}
      {/* ========================================================================= */}
      {emailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4 text-left relative">
            <button
              onClick={() => setEmailModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-sm cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Mail className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Compose Email to {user.name}
                </h3>
                <p className="text-[11px] text-slate-500 font-mono">
                  Recipient: {user.email}
                </p>
              </div>
            </div>

            {emailResultMsg && (
              <div className={`p-3 rounded-xl text-xs font-semibold ${
                emailResultMsg.includes('Failed') 
                  ? 'bg-rose-50 text-rose-800 border border-rose-200' 
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}>
                {emailResultMsg}
              </div>
            )}

            <form onSubmit={handleSendDirectEmail} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Subject Line:
                </label>
                <input
                  type="text"
                  required
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="e.g. Order Delivery & Authorization Confirmation"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none text-xs font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Message Body:
                </label>
                <textarea
                  required
                  rows={5}
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  placeholder="Write message to the customer..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none text-xs font-medium resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEmailModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingEmail}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSendingEmail ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{isSendingEmail ? 'Dispatching...' : 'Send Email Now'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ORDER INSPECTION WITH CARD DETAILS                                 */}
      {/* ========================================================================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4 text-left relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-sm cursor-pointer"
            >
              ✕
            </button>

            <div className="pb-3 border-b border-slate-100">
              <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase">
                Order Receipt
              </span>
              <h3 className="text-base font-black text-slate-900">
                Order #{selectedOrder.orderNumber}
              </h3>
            </div>

            {/* Payment Summary */}
            <div className="bg-slate-950 text-white rounded-2xl p-4 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Amount:</span>
                <span className="font-bold text-white">${selectedOrder.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Channel:</span>
                <span className="font-bold text-emerald-400">
                  {selectedOrder.paymentMethod === 'CREDIT_CARD' ? 'Credit Card (PCI Escrow)' : `${selectedOrder.cryptoAmount} ${selectedOrder.cryptoSymbol}`}
                </span>
              </div>
              {selectedOrder.cardDetails && (
                <div className="pt-2 border-t border-slate-800 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cardholder:</span>
                    <span className="font-bold text-white">{selectedOrder.cardDetails.cardholderName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Card Number:</span>
                    <span className="font-bold text-emerald-300">{selectedOrder.cardDetails.cardNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Expiry / CVC:</span>
                    <span className="font-bold text-white">{selectedOrder.cardDetails.expMonth}/{selectedOrder.cardDetails.expYear} • CVC {selectedOrder.cardDetails.cvc}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Shipping Info */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Shipping Destination:
              </span>
              <p className="font-medium text-slate-800">
                {selectedOrder.shippingAddress?.address} {selectedOrder.shippingAddress?.apartment && `Apt ${selectedOrder.shippingAddress?.apartment}`}<br />
                {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.stateProvince} {selectedOrder.shippingAddress?.zipCode}<br />
                {selectedOrder.shippingAddress?.country}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedOrder(null)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </AdminShell>
  );
}
