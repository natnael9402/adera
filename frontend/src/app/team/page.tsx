'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Users, Lightbulb, Heart, ShieldCheck, Globe, Mail, ExternalLink, ArrowRight } from 'lucide-react';

const teamMembers = [
  {
    name: "Dr. Selamawit Bekele",
    role: "Co-Founder & Executive Director",
    bio: "Former UN Development Program lead with 14+ years pioneering scalable East African humanitarian relief.",
    avatar: "S",
    color: "from-emerald-500 to-teal-700"
  },
  {
    name: "Marcus Vance",
    role: "Chief Technology Officer",
    bio: "Ex-Ethereum Foundation core contributor & multi-sig smart contract security researcher.",
    avatar: "M",
    color: "from-blue-600 to-indigo-800"
  },
  {
    name: "Amina Yusuf",
    role: "Head of Global Field Operations",
    bio: "Oversees ground partnerships, emergency distribution logistics, and on-site cryptographic validator networks.",
    avatar: "A",
    color: "from-purple-500 to-pink-700"
  },
  {
    name: "David Chen",
    role: "Lead Protocol & Backend Architect",
    bio: "Specializes in zero-knowledge identity proofs, transaction indexing, and decentralized storage systems.",
    avatar: "D",
    color: "from-amber-500 to-orange-700"
  },
  {
    name: "Elena Rostova",
    role: "Head of Philanthropic Partnerships",
    bio: "Builds strategic alliances with verified 501(c)(3) charities, NGOs, and Web3 donor DAOs worldwide.",
    avatar: "E",
    color: "from-teal-500 to-emerald-800"
  },
  {
    name: "Kofi Mensah",
    role: "Community & Donor Relations Lead",
    bio: "Guides DAO governance, public transparency audits, and community validator initiatives.",
    avatar: "K",
    color: "from-rose-500 to-red-700"
  }
];

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-28 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>Leadership & Core Contributors</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Meet the <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">Adera Team</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
              A multidisciplinary collective of blockchain researchers, humanitarian field directors, and open-source engineers committed to transparent giving.
            </p>
          </div>

          {/* Hero Team Banner */}
          <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-white p-2">
            <Image
              src="/footer/team_hero.jpg"
              alt="Adera Global Team"
              width={1200}
              height={500}
              className="rounded-2xl object-cover w-full h-[320px] sm:h-[450px]"
              priority
            />
            <div className="absolute inset-x-4 bottom-4 sm:inset-x-6 sm:bottom-6 bg-slate-950/75 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">United by One Mission</h3>
                <p className="text-xs text-slate-300">Distributed across 6 continents and 14 countries.</p>
              </div>
              <Link
                href="/careers"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors shrink-0"
              >
                We&apos;re Hiring →
              </Link>
            </div>
          </div>

          {/* Team Members Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between space-y-6 group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${member.color} text-white font-black text-2xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                      {member.avatar}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                      Core Lead
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-xs font-semibold text-emerald-600 mt-0.5">
                      {member.role}
                    </p>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    {member.bio}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center gap-3 text-slate-400">
                  <span className="text-[11px] font-medium text-slate-500 flex-1">Adera Foundation</span>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 hover:text-emerald-600 cursor-pointer transition-colors" />
                    <Mail className="w-4 h-4 hover:text-emerald-600 cursor-pointer transition-colors" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
