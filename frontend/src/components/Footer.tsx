"use client";

import { useState } from "react";
import { Mail, ArrowRight, Bitcoin, Wallet, Shield, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";

const footerLinks: Record<string, {name: string, href: string}[]> = {
  "Get Involved": [
    { name: "Start a Fundraiser", href: "/causes/new" },
    { name: "Donate Crypto", href: "/causes" },
    { name: "Volunteer", href: "/volunteer" },
    { name: "Corporate Partnerships", href: "/partners" },
    { name: "Become a Validator", href: "/validators" }
  ],
  Causes: [
    { name: "Education", href: "/causes?category=Education" },
    { name: "Healthcare", href: "/causes?category=Healthcare" },
    { name: "Clean Water", href: "/causes?category=Water" },
    { name: "Disaster Relief", href: "/causes?category=Relief" },
    { name: "Environment", href: "/causes?category=Environment" },
    { name: "Empowerment", href: "/causes?category=Empowerment" }
  ],
  Resources: [
    { name: "How It Works", href: "/how-it-works" },
    { name: "Impact & Verification", href: "/trust-and-safety" },
    { name: "Success Stories", href: "/success-stories" },
    { name: "Help Center", href: "/help-center" },
    { name: "Trust & Safety", href: "/trust-and-safety" }
  ],
  Company: [
    { name: "About Us", href: "/about" },
    { name: "Our Team", href: "/team" },
    { name: "Careers", href: "/careers" },
    { name: "Press", href: "/press" },
    { name: "Contact", href: "/contact" }
  ],
};

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus("error");
      setFeedback("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    setFeedback("");

    try {
      const res = await api.mail.subscribeNewsletter(email.trim());
      setStatus("success");
      setFeedback(res.message || "Thank you for subscribing! Check your inbox for our impact overview.");
      setEmail("");
    } catch (err: any) {
      setStatus("error");
      setFeedback(err.message || "Failed to subscribe. Please try again later.");
    }
  };

  return (
    <footer className="bg-white text-slate-900 relative overflow-hidden mt-12 rounded-t-[3rem] shadow-[0_-10px_40px_rgb(0,0,0,0.02)]">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4wNSkiLz48L3N2Zz4=')] opacity-5" />

      <div className="border-b border-slate-100 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="space-y-3 text-center lg:text-left">
              <h3 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Stay <span className="text-emerald-600">Connected</span>
              </h3>
              <p className="text-slate-500 text-lg">Get impact updates and new cause alerts delivered directly to your inbox.</p>
            </div>
            
            <div className="w-full max-w-lg">
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row w-full gap-2 sm:gap-0">
                <div className="relative flex-1">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status !== "idle") setStatus("idle");
                    }}
                    placeholder="Enter your email address" 
                    required
                    disabled={status === "loading"}
                    className="w-full pl-13 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl sm:rounded-r-none sm:rounded-l-2xl text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all disabled:opacity-60 font-medium" 
                  />
                </div>
                <button 
                  type="submit"
                  disabled={status === "loading"}
                  className="px-8 py-4 text-base font-bold text-white rounded-2xl sm:rounded-l-none sm:rounded-r-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition-colors flex items-center justify-center gap-3 shrink-0 disabled:opacity-70 shadow-md shadow-emerald-600/20"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Subscribing...</span>
                    </>
                  ) : (
                    <>
                      <span>Subscribe</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              {status === "success" && (
                <div className="mt-3.5 flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-200 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{feedback}</span>
                </div>
              )}

              {status === "error" && (
                <div className="mt-3.5 flex items-center gap-2 text-xs font-semibold text-rose-800 bg-rose-50 px-4 py-2.5 rounded-xl border border-rose-200 animate-fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{feedback}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10 lg:gap-16">
          <div className="col-span-2 space-y-6">
            <div className="flex items-center gap-3 group">
              <div className="w-12 h-12 relative overflow-visible">
                <Image src="/logo.png" alt="Adera Foundation Logo" fill sizes="48px" className="object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold tracking-tight text-slate-900 leading-none">Adera</span>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest leading-tight mt-1">Foundation</span>
              </div>
            </div>
            <p className="text-base text-slate-500 leading-relaxed">
              The first blockchain-powered philanthropy platform. Donate crypto, change lives, track every transaction on-chain.
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                { icon: Bitcoin, label: "BTC" },
                { icon: Wallet, label: "ETH" },
                { icon: Shield, label: "USDC" },
                { icon: Wallet, label: "SOL" },
              ].map((item) => (
                <span key={item.label} className="inline-flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg text-xs font-bold text-slate-600 border border-slate-200">
                  <item.icon className="w-4 h-4 text-emerald-600" />
                  {item.label}
                </span>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="col-span-1">
              <h4 className="font-bold text-base mb-6 text-slate-900 tracking-wide">{title}</h4>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 bg-slate-50/50 mt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-500 font-medium">
            <p>&copy; {new Date().getFullYear()} Adera Foundation. All rights reserved.</p>
            <div className="flex flex-wrap items-center justify-center gap-8">
              <Link href="/trust-and-safety" className="hover:text-emerald-600 transition-colors">Privacy Policy</Link>
              <Link href="/trust-and-safety" className="hover:text-emerald-600 transition-colors">Terms of Service</Link>
              <Link href="/trust-and-safety" className="hover:text-emerald-600 transition-colors">Security & Trust</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
