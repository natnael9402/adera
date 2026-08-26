'use client';

import React from 'react';

export type ShopTierType = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

interface TierMedalProps {
  tier: ShopTierType | string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  className?: string;
}

const SIZE_MAP = {
  xs: { box: 'w-7 h-7', text: 'text-[9px]' },
  sm: { box: 'w-9 h-9', text: 'text-[10px]' },
  md: { box: 'w-12 h-12', text: 'text-xs' },
  lg: { box: 'w-16 h-16', text: 'text-sm' },
  xl: { box: 'w-24 h-24', text: 'text-base' },
};

export default function TierMedal({
  tier = 'BRONZE',
  size = 'md',
  showLabel = false,
  className = '',
}: TierMedalProps) {
  const normalizedTier = (tier || 'BRONZE').toUpperCase() as ShopTierType;
  const sizeClasses = SIZE_MAP[size] || SIZE_MAP.md;

  const renderMedalSVG = () => {
    switch (normalizedTier) {
      case 'BRONZE':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md select-none">
            <defs>
              <linearGradient id="fe_bronzeRim" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="30%" stopColor="#b45309" />
                <stop offset="70%" stopColor="#78350f" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
              <linearGradient id="fe_bronzeCenter" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fffbeb" />
                <stop offset="50%" stopColor="#fef3c7" />
                <stop offset="100%" stopColor="#fde68a" />
              </linearGradient>
              <filter id="fe_bronzeGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#78350f" floodOpacity="0.4" />
              </filter>
            </defs>

            {/* Outer Laurel Beaded Ring */}
            <circle cx="50" cy="50" r="47" fill="url(#fe_bronzeRim)" filter="url(#fe_bronzeGlow)" />
            <circle cx="50" cy="50" r="44" fill="none" stroke="#fef3c7" strokeWidth="1" strokeDasharray="3 2" />
            
            {/* Inner Bronze Inset */}
            <circle cx="50" cy="50" r="40" fill="#92400e" stroke="#fef3c7" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="35" fill="url(#fe_bronzeCenter)" />

            {/* Laurel Leaves Wreath Outline */}
            <path
              d="M26 50 C26 36 34 26 50 25 C66 26 74 36 74 50 C74 64 66 74 50 75 C34 74 26 64 26 50 Z"
              fill="none"
              stroke="#b45309"
              strokeWidth="0.8"
              opacity="0.4"
            />

            {/* Center Typography & Emblem */}
            <text x="50" y="42" textAnchor="middle" fill="#78350f" fontSize="8.5" fontWeight="900" letterSpacing="0.8" fontFamily="sans-serif">
              BRONZE
            </text>
            <text x="50" y="52" textAnchor="middle" fill="#92400e" fontSize="7" fontWeight="800" letterSpacing="1.2" fontFamily="sans-serif">
              LEVEL
            </text>
            
            {/* Stars Accent */}
            <polygon points="50,57 51.5,60.5 55,61 52.5,63.5 53,67 50,65 47,67 47.5,63.5 45,61 48.5,60.5" fill="#d97706" />
            <circle cx="41" cy="62" r="1" fill="#b45309" />
            <circle cx="59" cy="62" r="1" fill="#b45309" />

            <text x="50" y="74" textAnchor="middle" fill="#b45309" fontSize="6.5" fontWeight="900" fontFamily="monospace">
              20%
            </text>
          </svg>
        );

      case 'SILVER':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md select-none">
            <defs>
              <linearGradient id="fe_silverRim" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="25%" stopColor="#cbd5e1" />
                <stop offset="50%" stopColor="#64748b" />
                <stop offset="75%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#f8fafc" />
              </linearGradient>
              <linearGradient id="fe_silverCenter" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#f1f5f9" />
                <stop offset="100%" stopColor="#e2e8f0" />
              </linearGradient>
              <filter id="fe_silverGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#334155" floodOpacity="0.3" />
              </filter>
            </defs>

            {/* Outer Silver Ring */}
            <circle cx="50" cy="50" r="47" fill="url(#fe_silverRim)" filter="url(#fe_silverGlow)" />
            <circle cx="50" cy="50" r="44" fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="3 2" />
            
            {/* Inner Silver Inset */}
            <circle cx="50" cy="50" r="40" fill="#475569" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="35" fill="url(#fe_silverCenter)" />

            {/* Center Typography & Star Emblem */}
            <text x="50" y="42" textAnchor="middle" fill="#1e293b" fontSize="8.5" fontWeight="900" letterSpacing="0.8" fontFamily="sans-serif">
              SILVER
            </text>
            <text x="50" y="52" textAnchor="middle" fill="#475569" fontSize="7" fontWeight="800" letterSpacing="1.2" fontFamily="sans-serif">
              LEVEL
            </text>

            <polygon points="50,57 51.5,60.5 55,61 52.5,63.5 53,67 50,65 47,67 47.5,63.5 45,61 48.5,60.5" fill="#64748b" />
            <circle cx="41" cy="62" r="1" fill="#94a3b8" />
            <circle cx="59" cy="62" r="1" fill="#94a3b8" />

            <text x="50" y="74" textAnchor="middle" fill="#475569" fontSize="6.5" fontWeight="900" fontFamily="monospace">
              25%
            </text>
          </svg>
        );

      case 'GOLD':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md select-none">
            <defs>
              <linearGradient id="fe_goldRim" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="25%" stopColor="#eab308" />
                <stop offset="50%" stopColor="#ca8a04" />
                <stop offset="75%" stopColor="#a16207" />
                <stop offset="100%" stopColor="#fde047" />
              </linearGradient>
              <linearGradient id="fe_goldCenter" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fffbeb" />
                <stop offset="50%" stopColor="#fef9c3" />
                <stop offset="100%" stopColor="#fef08a" />
              </linearGradient>
              <filter id="fe_goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#854d0e" floodOpacity="0.4" />
              </filter>
            </defs>

            {/* Outer Royal Gold Ring */}
            <circle cx="50" cy="50" r="47" fill="url(#fe_goldRim)" filter="url(#fe_goldGlow)" />
            <circle cx="50" cy="50" r="44" fill="none" stroke="#ffffff" strokeWidth="1.2" strokeDasharray="3 2" />
            
            {/* Inner Gold Inset */}
            <circle cx="50" cy="50" r="40" fill="#854d0e" stroke="#fef08a" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="35" fill="url(#fe_goldCenter)" />

            {/* Royal Crown Accent */}
            <path d="M42 33 L45 36 L50 30 L55 36 L58 33 L57 37 H43 Z" fill="#ca8a04" />

            {/* Center Typography */}
            <text x="50" y="44" textAnchor="middle" fill="#713f12" fontSize="9" fontWeight="900" letterSpacing="0.8" fontFamily="sans-serif">
              GOLD
            </text>
            <text x="50" y="53" textAnchor="middle" fill="#854d0e" fontSize="7" fontWeight="800" letterSpacing="1.2" fontFamily="sans-serif">
              LEVEL
            </text>

            <polygon points="50,58 51.5,61.5 55,62 52.5,64.5 53,68 50,66 47,68 47.5,64.5 45,62 48.5,61.5" fill="#ca8a04" />
            <circle cx="40" cy="63" r="1.2" fill="#ca8a04" />
            <circle cx="60" cy="63" r="1.2" fill="#ca8a04" />

            <text x="50" y="75" textAnchor="middle" fill="#854d0e" fontSize="7" fontWeight="900" fontFamily="monospace">
              30%
            </text>
          </svg>
        );

      case 'PLATINUM':
      default:
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md select-none">
            <defs>
              <linearGradient id="fe_platRim" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ecfeff" />
                <stop offset="25%" stopColor="#67e8f9" />
                <stop offset="50%" stopColor="#0891b2" />
                <stop offset="75%" stopColor="#164e63" />
                <stop offset="100%" stopColor="#a5f3fc" />
              </linearGradient>
              <linearGradient id="fe_platCenter" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#ecfeff" />
                <stop offset="100%" stopColor="#cffafe" />
              </linearGradient>
              <filter id="fe_platGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#0891b2" floodOpacity="0.4" />
              </filter>
            </defs>

            {/* Outer Diamond Platinum Ring */}
            <circle cx="50" cy="50" r="47" fill="url(#fe_platRim)" filter="url(#fe_platGlow)" />
            <circle cx="50" cy="50" r="44" fill="none" stroke="#ecfeff" strokeWidth="1.2" strokeDasharray="3 2" />
            
            {/* Inner Cyan Inset */}
            <circle cx="50" cy="50" r="40" fill="#155e75" stroke="#a5f3fc" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="35" fill="url(#fe_platCenter)" />

            {/* Faceted Diamond Icon */}
            <polygon points="50,29 57,34 50,39 43,34" fill="#06b6d4" />
            <polygon points="50,29 43,34 46,36" fill="#67e8f9" />
            <polygon points="50,29 57,34 54,36" fill="#a5f3fc" />

            {/* Center Typography */}
            <text x="50" y="46" textAnchor="middle" fill="#0e7490" fontSize="7.5" fontWeight="900" letterSpacing="0.6" fontFamily="sans-serif">
              PLATINUM
            </text>
            <text x="50" y="55" textAnchor="middle" fill="#155e75" fontSize="7" fontWeight="800" letterSpacing="1.2" fontFamily="sans-serif">
              LEVEL
            </text>

            <polygon points="50,60 51.5,63.5 55,64 52.5,66.5 53,70 50,68 47,70 47.5,66.5 45,64 48.5,63.5" fill="#0891b2" />
            <circle cx="40" cy="65" r="1.2" fill="#0891b2" />
            <circle cx="60" cy="65" r="1.2" fill="#0891b2" />

            <text x="50" y="77" textAnchor="middle" fill="#0e7490" fontSize="7" fontWeight="900" fontFamily="monospace">
              35%
            </text>
          </svg>
        );
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className={`${sizeClasses.box} relative shrink-0`}>
        {renderMedalSVG()}
      </div>
      {showLabel && (
        <div className="flex flex-col leading-tight">
          <span className="font-extrabold text-slate-900 text-xs">{normalizedTier} Shop</span>
          <span className="text-[10px] text-slate-500 font-mono font-semibold">
            {normalizedTier === 'BRONZE' ? '20%' : normalizedTier === 'SILVER' ? '25%' : normalizedTier === 'GOLD' ? '30%' : '35%'} Max Margin
          </span>
        </div>
      )}
    </div>
  );
}
