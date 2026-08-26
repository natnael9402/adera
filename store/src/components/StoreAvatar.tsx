'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import TierMedal, { ShopTierType } from './TierMedal';

export interface StoreAvatarPreset {
  id: string;
  name: string;
  category: string;
  gradient: string;
  ringColor: string;
  svgIcon: React.ReactNode;
}

export const STORE_AVATAR_PRESETS: StoreAvatarPreset[] = [
  {
    id: 'preset:store_apex',
    name: 'Apex Cyber Matrix',
    category: 'Technology',
    gradient: 'from-indigo-600 via-cyan-700 to-slate-950',
    ringColor: 'ring-cyan-400',
    svgIcon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-cyan-300 drop-shadow-md">
        <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5" stroke="currentColor" strokeWidth="1.5" fill="rgba(6, 182, 212, 0.25)" />
        <line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" strokeWidth="1.2" opacity="0.8" />
        <circle cx="12" cy="12" r="3" fill="#a5f3fc" />
      </svg>
    ),
  },
  {
    id: 'preset:store_horizon',
    name: 'Horizon Peak & Field',
    category: 'Athletics & Outdoors',
    gradient: 'from-amber-600 via-stone-700 to-stone-950',
    ringColor: 'ring-emerald-400',
    svgIcon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-amber-200 drop-shadow-md">
        <path d="M4 18L10 8L15 14L20 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="17" cy="6" r="2" fill="#fed7aa" />
        <path d="M2 20H22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'preset:store_nordic',
    name: 'Nordic EcoLiving',
    category: 'Home & Living',
    gradient: 'from-emerald-500 via-teal-800 to-slate-950',
    ringColor: 'ring-emerald-400',
    svgIcon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-emerald-200 drop-shadow-md">
        <path d="M12 2L4 7V17L12 22L20 17V7L12 2Z" fill="rgba(16, 185, 129, 0.25)" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 7V17M7 10L17 14M7 14L17 10" stroke="#a7f3d0" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'preset:store_diamond',
    name: 'Diamond Vault',
    category: 'Luxury & Jewelry',
    gradient: 'from-cyan-400 via-blue-600 to-slate-950',
    ringColor: 'ring-cyan-300',
    svgIcon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-cyan-200 drop-shadow-md">
        <path d="M6 3H18L22 9L12 22L2 9L6 3Z" fill="rgba(34, 211, 238, 0.25)" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M2 9H22M12 22L8 9L11 3M12 22L16 9L13 3" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    id: 'preset:store_crown',
    name: 'Imperial Sovereign',
    category: 'Exclusive',
    gradient: 'from-amber-400 via-yellow-600 to-stone-950',
    ringColor: 'ring-yellow-300',
    svgIcon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-yellow-200 drop-shadow-md">
        <path d="M5 18L3 7L8.5 12L12 4L15.5 12L21 7L19 18H5Z" stroke="currentColor" strokeWidth="1.5" fill="rgba(250, 204, 21, 0.25)" strokeLinejoin="round" />
        <circle cx="12" cy="4" r="1.5" fill="#fef08a" />
        <circle cx="3" cy="7" r="1.5" fill="#fef08a" />
        <circle cx="21" cy="7" r="1.5" fill="#fef08a" />
        <path d="M5 20H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'preset:store_shield',
    name: 'Verified Escrow Shield',
    category: 'Trust & Safety',
    gradient: 'from-teal-400 via-emerald-700 to-slate-950',
    ringColor: 'ring-teal-300',
    svgIcon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-teal-200 drop-shadow-md">
        <path d="M12 22S20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" fill="rgba(20, 184, 166, 0.25)" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M9 12L11 14L15 10" stroke="#ccfbf1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'preset:store_spark',
    name: 'Quantum Commerce',
    category: 'Innovation',
    gradient: 'from-purple-500 via-pink-700 to-slate-950',
    ringColor: 'ring-purple-400',
    svgIcon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-pink-200 drop-shadow-md">
        <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="rgba(236, 72, 153, 0.3)" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="3" fill="#fbcfe8" />
      </svg>
    ),
  },
  {
    id: 'preset:store_globe',
    name: 'Global Express Air',
    category: 'Logistics',
    gradient: 'from-blue-500 via-cyan-700 to-slate-950',
    ringColor: 'ring-blue-400',
    svgIcon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-cyan-200 drop-shadow-md">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="rgba(6, 182, 212, 0.2)" />
        <path d="M3.6 9H20.4M3.6 15H20.4M12 3C14.5 7 14.5 17 12 21C9.5 17 9.5 7 12 3Z" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
  },
];

interface StoreAvatarProps {
  name: string;
  avatar?: string | null;
  tier?: ShopTierType | string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTierBadge?: boolean;
  className?: string;
}

const SIZE_CLASSES = {
  sm: {
    container: 'w-9 h-9 text-xs',
    halo: 'ring-1',
    badgeSize: 'xs' as const,
    badgePos: '-bottom-1 -right-1 w-4 h-4',
  },
  md: {
    container: 'w-12 h-12 text-sm',
    halo: 'ring-2',
    badgeSize: 'xs' as const,
    badgePos: '-bottom-1 -right-1 w-5 h-5',
  },
  lg: {
    container: 'w-16 h-16 text-lg',
    halo: 'ring-2',
    badgeSize: 'sm' as const,
    badgePos: '-bottom-1.5 -right-1.5 w-6 h-6',
  },
  xl: {
    container: 'w-24 h-24 text-2xl',
    halo: 'ring-4',
    badgeSize: 'md' as const,
    badgePos: '-bottom-2 -right-2 w-8 h-8',
  },
};

const TIER_HALO_COLORS: Record<string, string> = {
  BRONZE: 'ring-amber-500 shadow-amber-500/20',
  SILVER: 'ring-slate-300 shadow-slate-300/20',
  GOLD: 'ring-yellow-400 shadow-yellow-400/25',
  PLATINUM: 'ring-cyan-400 shadow-cyan-400/30',
};

export default function StoreAvatar({
  name,
  avatar,
  tier = 'BRONZE',
  size = 'md',
  showTierBadge = true,
  className = '',
}: StoreAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const sizeConfig = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const normalizedTier = (tier || 'BRONZE').toUpperCase() as ShopTierType;
  const haloClass = TIER_HALO_COLORS[normalizedTier] || 'ring-emerald-500';

  // Check preset match
  const matchedPreset = avatar?.startsWith('preset:')
    ? STORE_AVATAR_PRESETS.find((p) => p.id === avatar)
    : null;

  // Fallback hash for deterministic gradient
  const hash = (name || 'Shop').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const fallbackPreset = STORE_AVATAR_PRESETS[hash % STORE_AVATAR_PRESETS.length];
  const activePreset = matchedPreset || fallbackPreset;

  const initials = (name || 'Shop')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const isRealImage = avatar && !avatar.startsWith('preset:') && !imgError;

  return (
    <div className={`relative inline-block shrink-0 ${className}`}>
      <div
        className={`${sizeConfig.container} rounded-2xl overflow-hidden flex items-center justify-center font-black relative select-none shadow-md ${sizeConfig.halo} ${haloClass}`}
      >
        {isRealImage ? (
          avatar?.startsWith('data:') ? (
            <img
              src={avatar}
              alt={name}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <Image
              src={avatar!}
              alt={name}
              fill
              unoptimized
              className="object-cover"
              onError={() => setImgError(true)}
            />
          )
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${activePreset.gradient} p-2.5 flex items-center justify-center relative overflow-hidden`}>
            {/* Background SVG Icon Accent */}
            <div className="absolute inset-0 opacity-40 p-1.5 flex items-center justify-center">
              {activePreset.svgIcon}
            </div>

            {/* Initials Text */}
            <span className="relative z-10 font-mono font-black text-white drop-shadow-md">
              {initials}
            </span>
          </div>
        )}
      </div>

      {/* Mini Tier Medal Overlay */}
      {showTierBadge && (
        <div className={`absolute ${sizeConfig.badgePos} z-20`}>
          <TierMedal tier={normalizedTier} size={sizeConfig.badgeSize} />
        </div>
      )}
    </div>
  );
}
