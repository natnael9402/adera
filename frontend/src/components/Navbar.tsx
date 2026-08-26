"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Heart, LayoutDashboard, LogOut, PlusCircle, Globe, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useAuth } from "@/context/AuthContext";
import { useDonate } from "@/context/DonateContext";

const navLinks = [
  { label: "Explore Causes", href: "/causes" },
  { label: "Donor Wall", href: "/donors" },
  { label: "Transparency", href: "/blockchain-transparency" },
  { label: "How It Works", href: "/how-it-works" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const { openDonateModal } = useDonate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-3 sm:px-6 lg:px-8 ${scrolled ? "pt-2 sm:pt-3" : "pt-2"}`}>
      <nav className={`max-w-7xl mx-auto rounded-3xl transition-all duration-300 border ${
        scrolled 
          ? "bg-white/90 backdrop-blur-xl shadow-md border-slate-200/80 py-2.5 px-4 sm:px-6" 
          : "bg-white/70 backdrop-blur-md border-slate-200/60 py-3.5 px-4 sm:px-6"
      }`}>
        <div className="flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 relative overflow-visible group-hover:scale-105 transition-transform">
              <Image src="/logo.png" alt="Adera Logo" fill sizes="36px" className="object-contain" priority />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-none">Adera</span>
              <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-widest leading-tight">Foundation</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-xs sm:text-sm font-bold text-slate-700 hover:text-emerald-700 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Action Hub: Shop, List a Cause, Instant Donate & Sign In */}
          <div className="hidden md:flex items-center gap-2.5 shrink-0">
            
            {/* Dedicated Shop Button */}
            <a
              href={process.env.NEXT_PUBLIC_STORE_URL || "http://localhost:3003"}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all"
              title="Shop Verified Products & Goods"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-slate-700" />
              <span>Shop</span>
            </a>

            {/* Start a Campaign (For Organizers) */}
            <Link
              href={user ? "/causes/new" : "/login?redirect=/causes/new"}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-emerald-800 bg-slate-100 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-xl transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>List a Cause</span>
            </Link>

            {/* Instant Donate Button */}
            <button
              type="button"
              onClick={() => openDonateModal()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5 fill-white/30" />
              <span>Instant Donate</span>
            </button>

            {/* Creator / User Session Profile */}
            {user ? (
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="max-w-[100px] truncate">{user.name || "Studio"}</span>
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-950 bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200 rounded-xl transition-colors"
              >
                Sign In
              </Link>
            )}

          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => openDonateModal()}
              className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs"
              title="Instant Donate"
            >
              <Heart className="w-4 h-4 fill-white/30" />
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileOpen && (
          <div className="md:hidden pt-4 pb-2 border-t border-slate-200/80 mt-3 space-y-2 animate-fade-in">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  openDonateModal();
                }}
                className="w-full py-2.5 bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2"
              >
                <Heart className="w-4 h-4 fill-white/30" />
                <span>Instant Crypto Donation</span>
              </button>

              <a
                href={process.env.NEXT_PUBLIC_STORE_URL || "http://localhost:3003"}
                target="_blank"
                rel="noreferrer"
                onClick={() => setMobileOpen(false)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-200 transition-colors"
              >
                <ShoppingBag className="w-4 h-4 text-slate-700" />
                <span>Visit Impact Shop (Storefront)</span>
              </a>

              <Link
                href="/causes/new"
                onClick={() => setMobileOpen(false)}
                className="w-full py-2.5 bg-slate-100 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-200"
              >
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>List a New Cause</span>
              </Link>

              {user ? (
                <div className="flex gap-2 pt-1">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 py-2 text-center bg-emerald-50 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200"
                  >
                    Campaign Studio
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileOpen(false);
                    }}
                    className="px-4 py-2 bg-rose-50 text-rose-600 font-bold text-xs rounded-xl border border-rose-200"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-2 text-center text-slate-600 font-bold text-xs"
                >
                  Fundraiser Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}
