'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Bitcoin, Hexagon, Check, Copy, ShieldCheck, Share2, AlertCircle, Layers, Calendar, CheckCircle2, Lock, ArrowUpRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RichCauseStory from '@/components/RichCauseStory';
import { api } from '@/lib/api';
import { useDonate } from '@/context/DonateContext';

interface Post {
  id: number;
  title: string;
  description: string;
  image?: string;
  goal: number;
  raised?: number;
  donationsCount?: number;
  category: string;
  urgency: string;
  beneficiary?: string;
  location?: string;
  cryptoPayoutAddress?: string;
  cryptoPayoutSymbol?: string;
  updates?: any[];
  directDonations?: any[];
  author?: { name: string };
  createdAt: string;
}

const fallbackImages = [
  "/causes/cause_water_1786200462466.jpg",
  "/causes/cause_school_1786200448807.jpg",
  "/causes/cause_clinic_1786200473696.jpg",
  "/causes/cause_farming_1786200495727.jpg",
  "/causes/cause_orphanage_1786200527864.jpg",
  "/causes/cause_women_1786200616826.jpg",
];

const urgencyStyles: Record<string, string> = {
  Urgent: "bg-rose-50 text-rose-700 border-rose-200",
  Critical: "bg-rose-100 text-rose-800 border-rose-300 font-extrabold",
  Featured: "bg-amber-50 text-amber-800 border-amber-200",
  "Almost There": "bg-emerald-50 text-emerald-800 border-emerald-200",
  New: "bg-blue-50 text-blue-800 border-blue-200",
};

export default function CauseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);

  const { openDonateModal } = useDonate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    if (params?.id === 'new') {
      router.replace('/causes/new');
      return;
    }
    if (!id || isNaN(id)) return;
    
    setLoading(true);
    api.posts.get(id)
      .then(setPost)
      .catch((err) => {
        console.error(err);
        setPost(null);
      })
      .finally(() => setLoading(false));

    api.paymentMethods.list().then(setPaymentMethods).catch(console.error);
  }, [id]);

  const copyAddress = (methodId: number, address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedId(methodId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const copyShareLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <div className="pt-36 pb-20 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-sm font-semibold text-slate-500">Loading Cause Details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <div className="pt-36 pb-20 max-w-xl mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-200">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Cause Not Found</h1>
          <p className="text-slate-500 mt-2 text-sm">The cause you are looking for does not exist or has been archived.</p>
          <Link 
            href="/causes" 
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Causes
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const raisedUsd = (post as any).raised !== undefined ? (post as any).raised : (post.goal * 0.35);
  const raisedPercentage = Math.min(Math.round((raisedUsd / post.goal) * 100), 100);
  const btcEquivalent = (post.goal / 65000).toFixed(3);
  const imageUrl = post.image && (post.image.startsWith('http') || post.image.startsWith('/')) ? post.image : fallbackImages[post.id % fallbackImages.length];
  const urgencyStyle = urgencyStyles[post.urgency] || "bg-slate-100 text-slate-700 border-slate-200";
  const updates = Array.isArray((post as any).updates) ? (post as any).updates : [];
  const directDonations = Array.isArray((post as any).directDonations) ? (post as any).directDonations : [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-28 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top Breadcrumb & Share Actions */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-between gap-4 mb-8"
          >
            <Link 
              href="/causes" 
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-emerald-700 transition-colors bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Causes</span>
            </Link>

            <button
              onClick={copyShareLink}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedShare ? 'Link Copied!' : 'Share Cause'}</span>
            </button>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left Column: Details, Image, Story, Milestones, Field Updates */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-7 space-y-8"
            >
              {/* Header Badges & Title */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-extrabold uppercase tracking-wider rounded-full">
                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                    {post.category}
                  </span>
                  <span className={`px-3 py-1 text-xs font-extrabold rounded-full border ${urgencyStyle}`}>
                    {post.urgency}
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Anti-Spam Staking Verified
                  </span>
                  {(post as any).location && (
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                      📍 {(post as any).location}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                  {post.title}
                </h1>

                <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-500 pt-1">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs border border-emerald-200 uppercase">
                    {post.author?.name?.[0] || 'A'}
                  </div>
                  <div>
                    <span className="font-bold text-slate-800">{post.author?.name || 'Adera Foundation Team'}</span>
                    <span className="mx-2">•</span>
                    <span>Created {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>

              {/* Cover Image Container */}
              <div className="relative w-full h-[320px] sm:h-[450px] rounded-3xl overflow-hidden shadow-lg border border-slate-200 bg-slate-100">
                <Image
                  src={imageUrl}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
              </div>

              {/* Beneficiary & Direct Route Info */}
              {(post as any).beneficiary && (
                <div className="bg-emerald-50/50 p-5 rounded-3xl border border-emerald-100 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 block">Direct Beneficiary</span>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">{(post as any).beneficiary}</p>
                  </div>
                  {(post as any).cryptoPayoutAddress && (
                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Target Payout Wallet</span>
                      <span className="font-mono text-xs font-bold text-emerald-700 bg-white px-2.5 py-1 rounded border border-emerald-200 inline-block mt-0.5">
                        {(post as any).cryptoPayoutSymbol || 'USDC'} Wallet
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Story & Description */}
              <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs space-y-6">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-lg border-b border-slate-100 pb-4">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h2>Cause Mission & Strategy</h2>
                </div>
                <RichCauseStory content={post.description} />
              </div>

              {/* Field Impact Evidence Updates (Posted by Creator) */}
              {updates.length > 0 && (
                <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      <span>Verified Field Updates ({updates.length})</span>
                    </h3>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      Proof of Delivery
                    </span>
                  </div>

                  <div className="space-y-6">
                    {updates.map((u: any, idx: number) => (
                      <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-black text-slate-900">{u.title}</h4>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {u.date ? new Date(u.date).toLocaleDateString() : 'Recent'}
                          </span>
                        </div>
                        {u.image && (
                          <div className="w-full h-56 rounded-xl overflow-relative relative bg-slate-200 overflow-hidden">
                            <Image src={u.image} alt={u.title} fill className="object-cover" />
                          </div>
                        )}
                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                          {u.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Verified Execution Milestones */}
              <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    Impact Milestones & Verification
                  </h3>
                  <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 font-bold">
                    Smart Escrow
                  </span>
                </div>

                <div className="space-y-4">
                  {[
                    { step: "Phase 1: Project Setup & Initial Capital", status: "Completed", date: "Month 1", completed: true },
                    { step: "Phase 2: Equipment Sourcing & Local Mobilization", status: "In Progress", date: "Month 2-3", completed: true },
                    { step: "Phase 3: On-the-Ground Implementation & Fieldwork", status: "Upcoming", date: "Month 4", completed: false },
                    { step: "Phase 4: Impact Audit & On-Chain Proof Publishing", status: "Upcoming", date: "Month 5", completed: false },
                  ].map((m, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                        m.completed ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {m.completed ? '✓' : i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-slate-900">{m.step}</h4>
                          <span className={`text-xs font-semibold ${m.completed ? 'text-emerald-700' : 'text-slate-400'}`}>
                            {m.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">Target timeline: {m.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right Column: Sticky Crypto Donation Card */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="lg:col-span-5 space-y-6"
            >
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6 sticky top-28">
                
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Live Progress Tracker
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 font-mono">
                    <Bitcoin className="w-3.5 h-3.5 text-amber-600" />
                    ~{btcEquivalent} BTC Goal
                  </span>
                </div>

                {/* Raised Numbers */}
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight">
                      ${raisedUsd.toLocaleString()}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-slate-500">raised</span>
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-slate-500">
                    Target Goal: <span className="font-bold text-slate-900">${post.goal.toLocaleString()} USD</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                    <div 
                      style={{ width: `${raisedPercentage}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 shadow-xs"
                    />
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                    <span className="text-emerald-700">{raisedPercentage}% Funded</span>
                    <span>100% Direct Impact</span>
                  </div>
                </div>

                <div className="h-px bg-slate-100 my-4" />

                {/* Direct Instant Donation Modal Trigger */}
                <button
                  type="button"
                  onClick={() => openDonateModal(post)}
                  className="w-full py-4 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-[0.99] text-white font-extrabold text-xs sm:text-sm rounded-2xl transition-all shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Heart className="w-4 h-4 fill-white/30" />
                  <span>Donate with Card, PayPal, or Crypto</span>
                </button>

                {/* Accepted Payment Badges */}
                <div className="flex items-center justify-center gap-2 py-1 flex-wrap border-b border-slate-100 pb-3">
                  <img src="/payments/visa.svg" alt="Visa" className="h-4 object-contain" />
                  <img src="/payments/mastercard.svg" alt="MasterCard" className="h-4 object-contain" />
                  <img src="/payments/paypal.svg" alt="PayPal" className="h-4 object-contain" />
                  <img src="/payments/applepay.svg" alt="Apple Pay" className="h-4 object-contain" />
                  <span className="text-[10px] font-bold text-slate-400">|</span>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                    <img src="/crypto/btc.svg" alt="Crypto" className="h-3 w-3 object-contain" />
                    <span>Instant Crypto</span>
                  </div>
                </div>

                {/* Direct Deposit Wallets */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Lock className="w-4 h-4 text-emerald-600" />
                      Direct Multi-Chain Wallets
                    </h3>
                    <span className="text-[11px] text-slate-400 font-medium">Instant Indexing</span>
                  </div>

                  {paymentMethods.length === 0 ? (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-500 italic">
                      No active deposit addresses found. Please reach out to support.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {paymentMethods.map((method) => (
                        <div 
                          key={method.id}
                          className="p-4 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-2xl transition-all space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-slate-900">{method.network}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono">
                              {method.symbol}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 shadow-2xs">
                            <span className="truncate select-all">{method.address}</span>
                            <button
                              onClick={() => copyAddress(method.id, method.address)}
                              className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-extrabold text-xs font-sans whitespace-nowrap pl-2 border-l border-slate-200"
                            >
                              {copiedId === method.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Copied</span>
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
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-2xl text-xs text-emerald-900 leading-relaxed font-medium space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Non-Custodial Transparency</span>
                  </div>
                  <p>
                    Transactions sent to the above addresses are automatically indexed and published to the donor leaderboard in real time.
                  </p>
                </div>

                {/* Recent Verified On-Chain Donors */}
                {directDonations.length > 0 && (
                  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Recent Supporters ({directDonations.length})</span>
                      </h4>
                    </div>

                    <div className="space-y-2.5">
                      {directDonations.slice(0, 5).map((d: any) => (
                        <div key={d.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-900 block">{d.donorName || 'Anonymous Supporter'}</span>
                            {d.message && <p className="text-[10px] text-slate-500 italic mt-0.5">&ldquo;{d.message}&rdquo;</p>}
                          </div>
                          <div className="text-right shrink-0 font-mono font-bold text-emerald-700">
                            +${d.amountUsd}
                            <span className="block text-[9px] text-slate-400 font-sans">{d.cryptoSymbol}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

          </div>
        </div>
      </main>

      {/* Floating Mobile Sticky Donation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 p-3 shadow-2xl animate-fade-in-up">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5 font-mono text-xs">
              <span className="font-black text-emerald-700">${raisedUsd.toLocaleString()}</span>
              <span className="text-slate-400">/ ${post.goal.toLocaleString()}</span>
            </div>
            <div className="w-28 sm:w-36 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1 border border-slate-200">
              <div style={{ width: `${raisedPercentage}%` }} className="h-full bg-emerald-500 rounded-full" />
            </div>
          </div>

          <button
            type="button"
            onClick={() => openDonateModal(post)}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-600/25 flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Heart className="w-4 h-4 fill-white/30" />
            <span>Donate Now</span>
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
