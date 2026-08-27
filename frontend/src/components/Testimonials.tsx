"use client";

import { Quote, Star, ShieldCheck, Heart, CheckCircle2 } from 'lucide-react';
import Image from "next/image";

const testimonials = [
  {
    name: "Sarah Jenkins",
    role: "Verified Philanthropist",
    avatar: "SJ",
    avatarBg: "bg-emerald-600 text-white",
    rating: 5,
    quote: "Finally, a philanthropy platform that respects total transparency. I can track every single dollar of my donations with photographic milestone proof. This is how direct giving should work.",
    cause: "Clean Water Initiative",
    amountGiven: "$32,500 Donated",
    paymentLogo: "/payments/visa.svg",
    badge: "Verified Donor",
  },
  {
    name: "Dr. James Okafor",
    role: "Education Initiative Lead",
    avatar: "JO",
    avatarBg: "bg-slate-900 text-white",
    rating: 5,
    quote: "We funded a full computer lab and solar power for our school in 3 weeks. Global donors contributed with zero bureaucracy, and verified milestones guaranteed our progress.",
    cause: "Solar for Rural Schools",
    amountGiven: "$85,000 Raised",
    paymentLogo: "/payments/paypal.svg",
    badge: "Verified Campaign",
  },
  {
    name: "Amara Tesfaye",
    role: "Community Director",
    avatar: "AT",
    avatarBg: "bg-emerald-700 text-white",
    rating: 5,
    quote: "Donors worldwide contributed to construct our solar water well. Now 1,200 villagers have fresh water without walking hours each day. Field proof and receipts made it completely accountable.",
    cause: "Clean Water Infrastructure",
    amountGiven: "$34,000 Delivered",
    paymentLogo: "/payments/mastercard.svg",
    badge: "Verified Impact",
  },
];

export default function Testimonials() {
  return (
    <section id="stories" className="py-24 sm:py-28 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16 sm:mb-20">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider border border-emerald-200">
            <Heart className="w-3.5 h-3.5 text-emerald-600" />
            Real Impact Stories
          </span>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            Voices of <span className="text-emerald-700">Change</span>
          </h2>
          
          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Real people, verifiable direct impact. Hear from our global community of donors, campaign organizers, and verified beneficiaries.
          </p>
        </div>

        {/* 3 Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div 
              key={t.name} 
              className="bg-white rounded-2xl p-7 sm:p-8 border border-slate-200 hover:border-emerald-500 transition-all duration-200 hover:shadow-md flex flex-col justify-between group relative"
            >
              <div>
                {/* Header: Stars & Verification Badge */}
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                    ))}
                  </div>

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    {t.badge}
                  </span>
                </div>

                {/* Quote Content */}
                <p className="text-slate-700 text-sm leading-relaxed mb-6 font-normal">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              {/* Cause and Amount Tag */}
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
                      src={t.paymentLogo} 
                      alt="Payment" 
                      width={16} 
                      height={12} 
                      className="h-3 w-auto object-contain"
                      style={{ width: "auto", height: "auto" }}
                    />
                    <span className="text-[11px]">{t.amountGiven}</span>
                  </div>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-3.5 pt-4 border-t border-slate-100">
                  <div className={`w-11 h-11 rounded-xl ${t.avatarBg} flex items-center justify-center text-sm font-bold shadow-sm shrink-0`}>
                    {t.avatar}
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
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
