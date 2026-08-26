'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, FileText, PhoneCall, Mail, Search, HelpCircle, ChevronDown, ShieldCheck, Zap, ArrowRight } from 'lucide-react';

const supportOptions = [
  { icon: MessageCircle, title: "Community Discord", desc: "Get real-time answers from community moderators & devs.", link: "/contact", action: "Join Discord" },
  { icon: FileText, title: "Knowledge Base", desc: "Step-by-step guides on smart contracts and wallet connections.", link: "/how-it-works", action: "Browse Docs" },
  { icon: Mail, title: "Email Support", desc: "Direct email assistance from our non-profit operations team.", link: "/contact", action: "Send Email" },
  { icon: ShieldCheck, title: "Trust & Safety", desc: "Report campaign issues or submit verification inquiries.", link: "/trust-and-safety", action: "View Policies" },
];

const faqs = [
  {
    category: "Crypto Donations",
    questions: [
      {
        q: "How do I donate crypto to a cause?",
        a: "Navigate to any active cause, click 'Donate Crypto', and copy the verified wallet address for your preferred cryptocurrency (BTC, ETH, SOL, USDC, USDT). Send funds directly from your non-custodial wallet (such as MetaMask, Phantom, or Coinbase Wallet)."
      },
      {
        q: "How fast are donations processed?",
        a: "Crypto transactions settle in seconds to minutes depending on network block time (Solana & Polygon: seconds; Ethereum & Bitcoin: 5-15 minutes). As soon as the transaction is confirmed on-chain, your contribution is logged."
      },
      {
        q: "What is the minimum donation amount?",
        a: "There is no minimum donation limit on Adera Foundation. You can contribute any amount supported by network gas limits."
      }
    ]
  },
  {
    category: "Smart Contracts & Proofs",
    questions: [
      {
        q: "How do I know my donation actually reached the cause?",
        a: "Every transaction generates a public blockchain hash. You can view real-time funds in the cause's multi-signature vault on public block explorers (Etherscan, Polygonscan, Solscan) and track milestone disbursement proofs."
      },
      {
        q: "Can I receive a tax deduction receipt?",
        a: "Yes. When donating, you can register your supporter account to receive official cryptographic donation receipts containing the transaction hash, fair market value in USD at time of donation, and partner NGO registration details."
      }
    ]
  },
  {
    category: "Campaign Organizers",
    questions: [
      {
        q: "How do I submit a new cause for funding?",
        a: "Sign in with your supporter account, click 'Submit a Cause', fill in the campaign objectives, budget requirements, and local partner verification documents. Our review board typically processes applications within 48-72 hours."
      },
      {
        q: "How are funds released to field coordinators?",
        a: "Funds are released in tranches based on predetermined milestones verified by ground reports, photo evidence, and multi-sig council sign-off."
      }
    ]
  }
];

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<string | null>("0-0");

  const toggleAccordion = (id: string) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-28 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* Header & Search */}
          <div className="text-center max-w-3xl mx-auto space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Adera Knowledge Base & Support</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              How can we <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">help you?</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
              Find instant answers to common questions about on-chain giving, tax receipts, smart escrow, and campaign submission.
            </p>

            <div className="max-w-xl mx-auto relative pt-2">
              <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 mt-1" />
              <input
                type="text"
                placeholder="Search guides, FAQs, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white rounded-2xl border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
              />
            </div>
          </div>

          {/* Support Channels Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportOptions.map((opt, i) => {
              const Icon = opt.icon;
              return (
                <div
                  key={i}
                  className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold border border-emerald-100 group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {opt.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {opt.desc}
                    </p>
                  </div>

                  <Link
                    href={opt.link}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline pt-2"
                  >
                    <span>{opt.action}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>

          {/* FAQ Accordions Section */}
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Detailed breakdowns of the most common user inquiries.
              </p>
            </div>

            <div className="space-y-8 max-w-4xl mx-auto">
              {faqs.map((cat, catIdx) => (
                <div key={catIdx} className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 px-1">
                    {cat.category}
                  </h3>

                  <div className="space-y-3">
                    {cat.questions
                      .filter(q => 
                        !searchQuery || 
                        q.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        q.a.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((item, qIdx) => {
                        const id = `${catIdx}-${qIdx}`;
                        const isOpen = openIndex === id;

                        return (
                          <div 
                            key={qIdx}
                            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition-all"
                          >
                            <button
                              onClick={() => toggleAccordion(id)}
                              className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-900 hover:text-emerald-700 transition-colors"
                            >
                              <span>{item.q}</span>
                              <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                            </button>

                            <AnimatePresence>
                              {isOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                                    {item.a}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Need More Assistance Banner */}
          <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm text-center max-w-2xl mx-auto space-y-4">
            <h3 className="text-xl font-bold text-slate-900">Still have questions?</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Our team of blockchain researchers and philanthropy specialists are here to assist you 24/7.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/20"
            >
              <Mail className="w-4 h-4" />
              <span>Contact Direct Support</span>
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
