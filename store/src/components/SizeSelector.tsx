'use client';

import React, { useState } from 'react';
import { Check, Ruler, Info } from 'lucide-react';
import { ProductSizeType, SHOE_SIZES, CLOTHING_SIZES } from '@/lib/size-utils';

interface SizeSelectorProps {
  sizeType: ProductSizeType;
  selectedSize: string;
  onSelectSize: (size: string) => void;
  compact?: boolean;
  error?: boolean;
}

export default function SizeSelector({
  sizeType,
  selectedSize,
  onSelectSize,
  compact = false,
  error = false,
}: SizeSelectorProps) {
  const [showGuide, setShowGuide] = useState(false);

  if (!sizeType) return null;

  const sizes = sizeType === 'shoe' ? SHOE_SIZES : CLOTHING_SIZES;
  const isShoe = sizeType === 'shoe';

  return (
    <div className={`space-y-2.5 transition-all ${compact ? 'py-1' : 'py-3'}`}>
      {/* Header Info */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold tracking-wider text-slate-900 uppercase">
            {isShoe ? 'Select Shoe Size' : 'Select Size'}
          </span>
          <span className="text-[10px] text-slate-500 hidden sm:inline-flex items-center gap-1 font-medium bg-slate-100 px-2 py-0.5 rounded-full">
            <Check className="w-2.5 h-2.5 text-emerald-600" /> True to fit
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowGuide(!showGuide)}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-emerald-700 transition-colors"
        >
          <Ruler className="w-3 h-3 text-emerald-600" />
          <span>Size Guide</span>
        </button>
      </div>

      {/* Size Guide Collapsible Helper */}
      {showGuide && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1.5 animate-fadeIn">
          <div className="font-bold text-slate-900 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isShoe ? 'Footwear Sizing Tips' : 'Apparel Sizing Tips'}</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            {isShoe
              ? 'Our footwear uses standard US sizing with matching EU reference. For half-sizes or wide feet, we recommend ordering a half size up.'
              : 'Our garments feature modern athletic & regular tailoring. Fits true to standard US/EU measurements.'}
          </p>
        </div>
      )}

      {/* Touch-Friendly Size Pills Grid */}
      <div
        className={`grid ${
          isShoe
            ? compact
              ? 'grid-cols-3 sm:grid-cols-4 gap-1.5'
              : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2'
            : compact
            ? 'grid-cols-4 sm:grid-cols-7 gap-1.5'
            : 'grid-cols-4 sm:grid-cols-7 gap-2'
        }`}
      >
        {sizes.map((size) => {
          const isSelected = selectedSize === size;
          return (
            <button
              key={size}
              type="button"
              onClick={() => onSelectSize(size)}
              className={`relative flex items-center justify-center text-center rounded-xl transition-all select-none active:scale-95 ${
                compact ? 'min-h-[38px] py-2 px-2 text-xs' : 'min-h-[44px] py-2.5 px-3 text-xs sm:text-sm'
              } ${
                isSelected
                  ? 'bg-slate-950 text-white font-extrabold shadow-md ring-2 ring-emerald-500 ring-offset-2 scale-[1.02]'
                  : error
                  ? 'bg-rose-50 text-rose-900 border-2 border-rose-300 hover:bg-rose-100 font-semibold'
                  : 'bg-white hover:bg-slate-50 text-slate-800 font-bold border border-slate-200 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <span className="truncate">{size}</span>
              {isSelected && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Size Feedback Confirmation */}
      {selectedSize ? (
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <span className="font-medium">Selected:</span>
          <span className="font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            {selectedSize}
          </span>
        </div>
      ) : error ? (
        <p className="text-[11px] font-bold text-rose-600 animate-shake">
          Please select a size to proceed
        </p>
      ) : null}
    </div>
  );
}
