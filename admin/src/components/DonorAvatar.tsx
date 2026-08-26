'use client';

import React, { useState } from 'react';

export interface ThemeAvatarPreset {
  id: string;
  name: string;
  category: string;
  gradient: string;
  ringColor: string;
  svgIcon: React.ReactNode;
}

export const THEME_AVATAR_PRESETS: ThemeAvatarPreset[] = [
  {
    id: 'preset:emerald_prism',
    name: 'Emerald Prism',
    category: 'Gemstones',
    gradient: 'from-emerald-600 via-teal-700 to-slate-950',
    ringColor: 'ring-emerald-400',
    svgIcon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-emerald-300 drop-shadow-md">
        <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5" stroke="currentColor" strokeWidth="1.5" fill="rgba(16, 185, 129, 0.25)" />
        <line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" strokeWidth="1.2" opacity="0.8" />
        <line x1="2" y1="8.5" x2="22" y2="15.5" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
        <line x1="2" y1="15.5" x2="22" y2="8.5" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
      </svg>
    ),
  },
  {
    id: 'preset:golden_crown',
    name: 'Golden Laurel',
    category: 'Crowns',
    gradient: 'from-amber-500 via-yellow-700 to-stone-950',
    ringColor: 'ring-amber-400',
    svgIcon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-amber-300 drop-shadow-md">
        <path d="M5 18L3 7L8.5 12L12 4L15.5 12L21 7L19 18H5Z" stroke="currentColor" strokeWidth="1.5" fill="rgba(245, 158, 11, 0.25)" strokeLinejoin="round" />
        <circle cx="12" cy="4" r="1.5" fill="#fef08a" />
        <circle cx="3" cy="7" r="1.5" fill="#fef08a" />
        <circle cx="21" cy="7" r="1.5" fill="#fef08a" />
        <path d="M5 20H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'preset:cyan_spark',
    name: 'Celestial Spark',
    category: 'Energy',
    gradient: 'from-cyan-500 via-blue-700 to-slate-950',
    ringColor: 'ring-cyan-400',
    svgIcon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-cyan-200 drop-shadow-md">
        <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="rgba(6, 182, 212, 0.3)" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="3" fill="#a5f3fc" />
      </svg>
    ),
  },
  {
    id: 'preset:ruby_heart',
    name: 'Humanitarian Heart',
    category: 'Care',
    gradient: 'from-rose-500 via-pink-800 to-slate-950',
    ringColor: 'ring-rose-400',
    svgIcon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-rose-300 drop-shadow-md">
        <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" fill="rgba(244, 63, 94, 0.25)" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 8V14M9 11H15" stroke="#ffe4e6" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'preset:solar_sun',
    name: 'Solar Impact',
    category: 'Nature',
    gradient: 'from-emerald-500 via-emerald-800 to-slate-950',
    ringColor: 'ring-emerald-300',
    svgIcon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-emerald-200 drop-shadow-md">
        <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" fill="rgba(52, 211, 153, 0.3)" />
        <path d="M12 2V5M12 19V22M2 12H5M19 12H22M4.93 4.93L7.05 7.05M16.95 16.95L19.07 19.07M4.93 19.07L7.05 16.95M16.95 7.05L19.07 4.93" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'preset:teal_shield',
    name: 'Guardian Shield',
    category: 'Protection',
    gradient: 'from-teal-500 via-emerald-900 to-slate-950',
    ringColor: 'ring-teal-300',
    svgIcon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-teal-200 drop-shadow-md">
        <path d="M12 22S20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" fill="rgba(20, 184, 166, 0.25)" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M9 12L11 14L15 10" stroke="#ccfbf1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'preset:violet_orb',
    name: 'Visionary Orb',
    category: 'Innovation',
    gradient: 'from-purple-500 via-indigo-800 to-slate-950',
    ringColor: 'ring-purple-400',
    svgIcon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-purple-200 drop-shadow-md">
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" fill="rgba(168, 85, 247, 0.2)" />
        <ellipse cx="12" cy="12" rx="10" ry="4" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 2" transform="rotate(-25 12 12)" />
        <circle cx="12" cy="12" r="2.5" fill="#f3e8ff" />
      </svg>
    ),
  },
  {
    id: 'preset:tree_life',
    name: 'Acacia Tree of Life',
    category: 'Growth',
    gradient: 'from-green-600 via-emerald-800 to-slate-950',
    ringColor: 'ring-green-400',
    svgIcon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-green-200 drop-shadow-md">
        <path d="M12 22V13M12 13C12 8 6 9 6 4C9 4 12 7 12 13ZM12 13C12 8 18 9 18 4C15 4 12 7 12 13Z" stroke="currentColor" strokeWidth="1.5" fill="rgba(34, 197, 94, 0.25)" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 22H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

interface DonorAvatarProps {
  name: string;
  avatar?: string | null;
  rank?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showRankBadge?: boolean;
  className?: string;
}

const sizeClasses = {
  xs: 'w-7 h-7 text-[10px]',
  sm: 'w-9 h-9 text-xs',
  md: 'w-11 h-11 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-18 h-18 text-xl',
  '2xl': 'w-24 h-24 text-2xl',
};

const iconSizes = {
  xs: 'w-3.5 h-3.5',
  sm: 'w-4.5 h-4.5',
  md: 'w-5.5 h-5.5',
  lg: 'w-7 h-7',
  xl: 'w-9 h-9',
  '2xl': 'w-12 h-12',
};

export default function DonorAvatar({
  name,
  avatar,
  rank,
  size = 'md',
  showRankBadge = false,
  className = '',
}: DonorAvatarProps) {
  const [imgError, setImgError] = useState(false);

  // Compute deterministic hash from name
  const computeHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  };

  const nameHash = computeHash(name || 'Adera Donor');
  const presetIndex = nameHash % THEME_AVATAR_PRESETS.length;
  const autoPreset = THEME_AVATAR_PRESETS[presetIndex];

  // Match if avatar is a preset ID
  const selectedPreset = THEME_AVATAR_PRESETS.find((p) => p.id === avatar);

  // Get Initials
  const getInitials = (str: string) => {
    if (!str) return 'AD';
    const parts = str.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const isCustomImage = avatar && !avatar.startsWith('preset:') && !imgError;

  // Rank Halo Border Styling
  const getRankRing = () => {
    if (rank === 1) return 'ring-2 ring-amber-400 ring-offset-2 ring-offset-white shadow-amber-400/20 shadow-lg';
    if (rank === 2) return 'ring-2 ring-slate-300 ring-offset-2 ring-offset-white shadow-slate-400/20 shadow-md';
    if (rank === 3) return 'ring-2 ring-amber-600 ring-offset-2 ring-offset-white shadow-amber-600/20 shadow-md';
    if (rank && rank <= 10) return 'ring-1.5 ring-emerald-400 ring-offset-1 ring-offset-white';
    return 'ring-1 ring-slate-200';
  };

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-2xl overflow-hidden flex items-center justify-center font-bold tracking-tight select-none transition-transform group-hover:scale-105 duration-200 ${getRankRing()}`}
      >
        {isCustomImage ? (
          <img
            src={avatar!}
            alt={name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover rounded-2xl"
          />
        ) : selectedPreset ? (
          <div
            className={`w-full h-full bg-gradient-to-br ${selectedPreset.gradient} p-2 flex items-center justify-center relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]" />
            <div className={`${iconSizes[size]} relative z-10 flex items-center justify-center`}>
              {selectedPreset.svgIcon}
            </div>
          </div>
        ) : (
          // Procedural Generated Theme Avatar
          <div
            className={`w-full h-full bg-gradient-to-br ${autoPreset.gradient} p-1.5 flex flex-col items-center justify-center relative overflow-hidden text-white`}
          >
            <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white/10 blur-sm pointer-events-none" />
            <div className={`${iconSizes[size]} opacity-90 relative z-10 flex items-center justify-center mb-0.5`}>
              {autoPreset.svgIcon}
            </div>
            <span className="font-mono font-black text-[9px] uppercase tracking-wider relative z-10 opacity-90 leading-none">
              {getInitials(name)}
            </span>
          </div>
        )}
      </div>

      {/* Optional Rank Badge Floating Chip */}
      {showRankBadge && rank && (
        <div
          className={`absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md text-[9px] font-black font-mono shadow-xs border ${
            rank === 1
              ? 'bg-amber-400 text-amber-950 border-amber-300'
              : rank === 2
              ? 'bg-slate-200 text-slate-900 border-slate-300'
              : rank === 3
              ? 'bg-amber-600 text-white border-amber-500'
              : 'bg-emerald-600 text-white border-emerald-500'
          }`}
        >
          #{rank}
        </div>
      )}
    </div>
  );
}
