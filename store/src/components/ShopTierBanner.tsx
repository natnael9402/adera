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
    <div className="w-full bg-[#059669] text-white shadow-xs select-none">
      
      {/* 1. Main Primary Green Shop Tiers Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3 lg:gap-6">
          
          {/* 4 Shop Tier Cards with Dedicated Medal Seals */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 divide-slate-100/20 sm:divide-x w-full lg:w-auto">
            
            {/* Bronze Shop */}
            <div className="flex items-center gap-2.5 sm:px-3">
              <TierMedal tier="BRONZE" size="sm" />
              <div className="flex flex-col leading-tight">
                <span className="text-xs sm:text-sm font-black text-white tracking-tight">Bronze Shop</span>
                <span className="text-[10px] text-emerald-100 font-medium">Max profit 20%</span>
              </div>
            </div>

            {/* Silver Shop */}
            <div className="flex items-center gap-2.5 sm:px-3">
              <TierMedal tier="SILVER" size="sm" />
              <div className="flex flex-col leading-tight">
                <span className="text-xs sm:text-sm font-black text-white tracking-tight">Silver Shop</span>
                <span className="text-[10px] text-emerald-100 font-medium">Max profit 25%</span>
              </div>
            </div>

            {/* Gold Shop */}
            <div className="flex items-center gap-2.5 sm:px-3">
              <TierMedal tier="GOLD" size="sm" />
              <div className="flex flex-col leading-tight">
                <span className="text-xs sm:text-sm font-black text-white tracking-tight">Gold Shop</span>
                <span className="text-[10px] text-emerald-100 font-medium">Max profit 30%</span>
              </div>
            </div>

            {/* Platinum Shop */}
            <div className="flex items-center gap-2.5 sm:px-3">
              <TierMedal tier="PLATINUM" size="sm" />
              <div className="flex flex-col leading-tight">
                <span className="text-xs sm:text-sm font-black text-white tracking-tight">Platinum Shop</span>
                <span className="text-[10px] text-emerald-100 font-medium">Max profit 35%</span>
              </div>
            </div>

          </div>

          {/* CTA Area: Dynamic based on Signed In state */}
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
            {isClient && signedInShop ? (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Link
                  href="/reseller/dashboard"
                  className="w-full sm:w-auto px-5 py-2 bg-white text-emerald-800 hover:bg-emerald-50 font-black text-xs uppercase tracking-wider rounded-full transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 border border-white"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{signedInShop.name || 'My Shop'} Studio</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-700" />
                </Link>
              </div>
            ) : (
              <Link
                href="/reseller/register"
                className="w-full sm:w-auto px-6 py-2 bg-transparent hover:bg-white text-white hover:text-emerald-700 font-black text-xs uppercase tracking-wider rounded-full border-2 border-white transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Register Shop</span>
              </Link>
            )}
          </div>

        </div>
      </div>

      {/* 2. Micro Navigation Sub-Bar (Language / Currency / Reseller Portal) */}
      <div className="bg-[#047857] text-emerald-100 text-[11px] py-1 px-4 border-t border-emerald-500/30">
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
          <div className="flex items-center gap-3 font-semibold">
            {isClient && signedInShop ? (
              <div className="flex items-center gap-2.5">
                <span className="hidden sm:inline text-emerald-200">Merchant:</span>
                <Link
                  href={`/shop/${signedInShop.handle}`}
                  className="text-white hover:underline flex items-center gap-1 font-bold"
                  title="View Public Store"
                >
                  <Globe className="w-3 h-3 text-emerald-300" />
                  <span>@{signedInShop.handle}</span>
                </Link>
                <span>|</span>
                <Link
                  href="/reseller/dashboard"
                  className="text-white bg-black/20 hover:bg-black/30 px-2.5 py-0.5 rounded-full flex items-center gap-1 transition-colors font-bold"
                >
                  <ShieldCheck className="w-3 h-3 text-yellow-300" />
                  <span>Seller Dashboard</span>
                </Link>
                <span>|</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-emerald-200 hover:text-white flex items-center gap-1 font-semibold transition-colors"
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
                <Link href="/reseller/dashboard" className="hidden sm:inline-flex items-center gap-1 text-white bg-black/20 hover:bg-black/30 px-2.5 py-0.5 rounded-full transition-colors">
                  <ShieldCheck className="w-3 h-3 text-yellow-300" />
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
