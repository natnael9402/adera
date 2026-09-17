'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, Store, ArrowRight, LogOut, LayoutDashboard, Globe, ShieldCheck } from 'lucide-react';
import TierMedal from './TierMedal';
import StoreAvatar from './StoreAvatar';

export default function ShopTierBanner() {
  const [signedInShop, setSignedInShop] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const token = localStorage.getItem('reseller_token');
    const shopStr = localStorage.getItem('reseller_shop');
    if (token && shopStr) {
      try {
        setSignedInShop(JSON.parse(shopStr));
      } catch (e) {
        setSignedInShop(null);
      }
    } else {
      setSignedInShop(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('reseller_token');
    localStorage.removeItem('reseller_shop');
    setSignedInShop(null);
    window.location.reload();
  };

  return (
    <div className="w-full bg-slate-950 text-white select-none border-b border-slate-800">
      
      {/* 1. Main Shop Tiers Bar - Luxury Obsidian */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3 lg:gap-6">
          
          {/* 4 Shop Tier Cards with Dedicated Medal Seals */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 divide-slate-800 sm:divide-x w-full lg:w-auto">
            
            {/* Bronze Shop */}
            <div className="flex items-center gap-2.5 sm:px-3">
              <TierMedal tier="BRONZE" size="sm" />
              <div className="flex flex-col leading-tight">
                <span className="text-xs sm:text-sm font-bold text-white tracking-tight">Bronze Shop</span>
                <span className="text-[10px] text-slate-400 font-medium font-mono">20% profit margin</span>
              </div>
            </div>

            {/* Silver Shop */}
            <div className="flex items-center gap-2.5 sm:px-3">
              <TierMedal tier="SILVER" size="sm" />
              <div className="flex flex-col leading-tight">
                <span className="text-xs sm:text-sm font-bold text-white tracking-tight">Silver Shop</span>
                <span className="text-[10px] text-slate-400 font-medium font-mono">25% profit margin</span>
              </div>
            </div>

            {/* Gold Shop */}
            <div className="flex items-center gap-2.5 sm:px-3">
              <TierMedal tier="GOLD" size="sm" />
              <div className="flex flex-col leading-tight">
                <span className="text-xs sm:text-sm font-bold text-white tracking-tight">Gold Shop</span>
                <span className="text-[10px] text-slate-400 font-medium font-mono">30% profit margin</span>
              </div>
            </div>

            {/* Platinum Shop */}
            <div className="flex items-center gap-2.5 sm:px-3">
              <TierMedal tier="PLATINUM" size="sm" />
              <div className="flex flex-col leading-tight">
                <span className="text-xs sm:text-sm font-bold text-white tracking-tight">Platinum Shop</span>
                <span className="text-[10px] text-slate-400 font-medium font-mono">35% profit margin</span>
              </div>
            </div>

          </div>

          {/* CTA Area: Dynamic based on Signed In state */}
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
            {isClient && signedInShop ? (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Link
                  href="/reseller/dashboard"
                  className="w-full sm:w-auto px-4 py-1.5 bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-xs flex items-center justify-center gap-2 active:scale-95"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-slate-900" />
                  <span>{signedInShop.name || 'My Shop'} Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <Link
                href="/reseller/register"
                className="w-full sm:w-auto px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-xs uppercase tracking-wider rounded-lg border border-slate-700 transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Store className="w-3.5 h-3.5 text-emerald-400" />
                <span>Open Reseller Store</span>
              </Link>
            )}
          </div>

        </div>
      </div>

      {/* 2. Micro Navigation Sub-Bar (Language / Currency / Reseller Portal) */}
      <div className="bg-slate-900/90 text-slate-400 text-[11px] py-1 px-4 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors">
              <span>🇺🇸 English</span>
              <ChevronDown className="w-3 h-3" />
            </div>
            <div className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors">
              <span>USD $</span>
              <ChevronDown className="w-3 h-3" />
            </div>
          </div>

          {/* Right Sub-Bar: Dynamic based on Signed In status */}
          <div className="flex items-center gap-3 font-medium">
            {isClient && signedInShop ? (
              <div className="flex items-center gap-2.5">
                <span className="hidden sm:inline text-slate-500">Merchant:</span>
                <Link
                  href={`/shop/${signedInShop.handle}`}
                  className="text-white hover:underline flex items-center gap-1 font-bold"
                  title="View Public Store"
                >
                  <Globe className="w-3 h-3 text-slate-400" />
                  <span>@{signedInShop.handle}</span>
                </Link>
                <span>|</span>
                <Link
                  href="/reseller/dashboard"
                  className="text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-0.5 rounded-md flex items-center gap-1 transition-colors font-semibold"
                >
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Seller Dashboard</span>
                </Link>
                <span>|</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-white flex items-center gap-1 font-medium transition-colors"
                  title="Sign Out of Reseller Account"
                >
                  <LogOut className="w-3 h-3" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <>
                <Link href="/reseller/login" className="hover:text-white transition-colors">
                  Shop Sign In
                </Link>
                <span>/</span>
                <Link href="/reseller/register" className="hover:text-white transition-colors">
                  Reseller Registration
                </Link>
                <span className="hidden sm:inline">|</span>
                <Link href="/reseller/dashboard" className="hidden sm:inline-flex items-center gap-1 text-slate-300 bg-slate-800 hover:bg-slate-700 px-2.5 py-0.5 rounded-md transition-colors">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Reseller Dashboard</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
