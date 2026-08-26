'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { MapPin, MailOpen, Send, CheckCircle2, MessageSquare, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

const contactChannels = [
  {
    icon: MailOpen,
    title: "General & Donor Inquiries",
    value: "Info@aderafoundation.com",
    detail: "Official Hostinger SMTP • Response within 4-12 hours"
  },
  {
    icon: MessageSquare,
    title: "NGO & Field Partnerships",
    value: "partners@aderafoundation.com",
    detail: "Direct connection with our field alliance coordinators"
  },
  {
    icon: MapPin,
    title: "Headquarters & Global Hub",
    value: "Addis Ababa, Ethiopia",
    detail: "Supporting humanitarian projects across 6 continents"
  }
];

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('General');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please fill out all required fields.');
      return;
    }

    setLoading(true);

    try {
      await api.mail.sendContactMessage({
        name: name.trim(),
        email: email.trim(),
        topic,
        message: message.trim(),
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to deliver message. Please check your network and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-28 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Direct Support & Outreach</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">Touch</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
              Have questions about crypto philanthropy, milestone-gated smart contracts, or submitting a new campaign? Our dedicated team is ready to assist.
            </p>
          </div>

          {/* Contact Layout: Left Info & Right Interactive Form */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left: Contact Info & Direct Channels */}
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Reach Our Global Team
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed font-normal">
                  Whether you are an individual donor, an institutional foundation, or a non-profit organizer, we provide direct assistance.
                </p>
              </div>

              <div className="space-y-4">
                {contactChannels.map((c, idx) => {
                  const Icon = c.icon;
                  return (
                    <div
                      key={idx}
                      className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs flex items-start gap-4"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold shrink-0">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-slate-900">{c.title}</h3>
                        <p className="text-xs font-semibold text-emerald-700 font-mono">{c.value}</p>
                        <p className="text-[11px] text-slate-400">{c.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Trust Badge Card */}
              <div className="p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-lg space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verified Communications</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  All official communications originate exclusively from authenticated <strong>@aderafoundation.com</strong> mail servers. Representatives will never ask for your private keys.
                </p>
              </div>
            </div>

            {/* Right: Interactive Message Form */}
            <div className="lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xl"
              >
                {submitted ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">Message Delivered!</h3>
                    <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                      Thank you for reaching out, <strong className="text-slate-900">{name}</strong>. A confirmation has been dispatched to <strong className="text-emerald-700">{email}</strong> and our team has received your inquiry.
                    </p>
                    <button
                      onClick={() => { 
                        setSubmitted(false); 
                        setMessage(''); 
                        setError('');
                      }}
                      className="mt-4 px-6 py-3 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/20"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Send Us a Direct Message</h2>
                      <p className="text-xs text-slate-500 mt-0.5">Fill out the form below and we will get back to you promptly.</p>
                    </div>

                    {error && (
                      <div className="flex items-center gap-2.5 text-rose-700 text-xs font-semibold bg-rose-50 p-3.5 rounded-xl border border-rose-200 animate-fade-in">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                        <span>{error}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                          Your Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Jordan Smith"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Inquiry Topic
                      </label>
                      <select
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
                      >
                        <option value="General">General Inquiry</option>
                        <option value="Donation">Crypto Donation Assistance</option>
                        <option value="Partnership">Non-Profit / NGO Partnership</option>
                        <option value="Security">Security & Bug Bounty Disclosure</option>
                        <option value="Press">Press & Media Relations</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Your Message *
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Tell us how we can assist you..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Sending via Secure Server...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Send Message</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </motion.div>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
