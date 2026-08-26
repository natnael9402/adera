"use client";

import { Quote, Star, ShieldCheck, Heart, CheckCircle2 } from 'lucide-react';
import Image from "next/image";

const testimonials = [
  {
    name: "0xSarah.eth",
    role: "Verified Web3 Donor",
    avatar: "0xS",
    avatarBg: "bg-primary-600 text-white",
    rating: 5,
    quote: "Finally, a philanthropy platform that respects blockchain transparency. I can track every satoshi of my donations on-chain. This is how giving should work in Web3.",
    cause: "Clean Water Initiative",
    cryptoGiven: "0.45 BTC Donated",
    cryptoLogo: "/crypto/btc.svg",
    badge: "Verified Donor",
  },
  {
    name: "Dr. James Okafor",
    role: "Education Initiative Lead",
    avatar: "JO",
    avatarBg: "bg-slate-900 text-white",
    rating: 5,
    quote: "We funded a full computer lab and solar power for our school in 3 weeks. The global crypto community gave with zero bureaucracy, and smart contracts guaranteed our milestones.",
    cause: "Solar for Rural Schools",
    cryptoGiven: "1.25 BTC Raised",
    cryptoLogo: "/crypto/btc.svg",
    badge: "Verified Campaign",
  },
  {
    name: "Amara Tesfaye",
    role: "Community Director",
    avatar: "AT",
    avatarBg: "bg-primary-700 text-white",
    rating: 5,
    quote: "Donors worldwide sent USDC and Solana to construct our solar well. Now 1,200 villagers have fresh water without walking hours each day. Cryptographic proof made it accountable.",
    cause: "Clean Water Infrastructure",
    cryptoGiven: "34,000 USDC Delivered",
    cryptoLogo: "/crypto/usdc.svg",
    badge: "Verified Impact",
  },
];

export default function Testimonials() {
  return (
    <section id="stories" className="py-24 sm:py-28 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16 sm:mb-20">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-primary-50 text-primary-700 text-xs font-bold uppercase tracking-wider border border-primary-200">
            <Heart className="w-3.5 h-3.5 text-primary-600" />
            Real Impact Stories
          </span>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            Voices of <span className="text-primary-600">Change</span>
          </h2>
          
          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Real people, verifiable on-chain impact. Hear from our global community of crypto donors, campaign creators, and beneficiaries.
          </p>
        </div>

        {/* 3 Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div 
              key={t.name} 
              className="bg-white rounded-2xl p-7 sm:p-8 border border-slate-200 hover:border-primary-500 transition-all duration-200 hover:shadow-md flex flex-col justify-between group relative"
            >
              <div>
                {/* Header: Stars & Verification Badge */}
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                    ))}
                  </div>

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary-50 text-primary-700 border border-primary-200 text-xs font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary-600" />
                    {t.badge}
                  </span>
                </div>

                {/* Quote Content */}
                <p className="text-slate-700 text-sm leading-relaxed mb-6 font-normal">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              {/* Cause and Crypto Tag */}
              <div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 mb-6">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Target Cause
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {t.cause}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-900 font-mono">
                    <Image 
                      src={t.cryptoLogo} 
                      alt="crypto" 
                      width={14} 
                      height={14} 
                      className="w-3.5 h-3.5 object-contain"
                      style={{ width: "auto", height: "auto" }}
                    />
                    <span className="text-[11px]">{t.cryptoGiven}</span>
                  </div>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-3.5 pt-4 border-t border-slate-100">
                  <div className={`w-11 h-11 rounded-xl ${t.avatarBg} flex items-center justify-center text-sm font-bold shadow-sm shrink-0`}>
                    {t.avatar}
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-sm text-slate-900 group-hover:text-primary-700 transition-colors truncate">
                      {t.name}
                    </p>
                    <p className="text-xs text-slate-500 font-medium truncate">
                      {t.role}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
