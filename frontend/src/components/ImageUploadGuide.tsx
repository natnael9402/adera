'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { UploadCloud, Image as ImageIcon, X, CheckCircle2, AlertCircle, Loader2, Link as LinkIcon, RefreshCw, Eye, Check, Info, Maximize2, ShieldCheck, Grid3X3 } from 'lucide-react';

interface ImageUploadGuideProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

const PRESET_FALLBACKS = [
  { label: 'Clean Water Well', url: '/causes/cause_water_1786200462466.jpg' },
  { label: 'School Lab', url: '/causes/cause_school_1786200448807.jpg' },
  { label: 'Maternal Clinic', url: '/causes/cause_clinic_1786200473696.jpg' },
  { label: 'Farming Co-op', url: '/causes/cause_farming_1786200495727.jpg' },
  { label: 'Orphanage Center', url: '/causes/cause_orphanage_1786200527864.jpg' },
  { label: 'Women Enterprise', url: '/causes/cause_women_1786200616826.jpg' },
];

export default function ImageUploadGuide({
  value,
  onChange,
  label = 'Campaign Cover Image',
}: ImageUploadGuideProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [useUrlInput, setUseUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<{ width: number; height: number; ratio: number; ratioLabel: string; isGoodRatio: boolean } | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [showPresetsDrawer, setShowPresetsDrawer] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Inspect image dimensions and calculate aspect ratio
  useEffect(() => {
    if (!value) {
      setImageMeta(null);
      return;
    }
    const img = new window.Image();
    img.src = value;
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const r = w / (h || 1);
      
      let ratioLabel = '16:9 Landscape (Standard)';
      let isGoodRatio = true;

      if (Math.abs(r - 1.777) <= 0.15) {
        ratioLabel = `16:9 Ideal Landscape (${w} × ${h}px)`;
        isGoodRatio = true;
      } else if (Math.abs(r - 1.333) <= 0.15) {
        ratioLabel = `4:3 Standard Photo (${w} × ${h}px) — slightly cropped on 16:9`;
        isGoodRatio = true;
      } else if (Math.abs(r - 1.0) <= 0.15) {
        ratioLabel = `1:1 Square (${w} × ${h}px) — top & bottom cropped to fit 16:9`;
        isGoodRatio = false;
      } else if (r < 0.9) {
        ratioLabel = `9:16 Portrait (${w} × ${h}px) — center area will be fitted to banner`;
        isGoodRatio = false;
      } else {
        ratioLabel = `Custom Ratio ${r.toFixed(2)}:1 (${w} × ${h}px)`;
        isGoodRatio = r >= 1.4;
      }

      setImageMeta({ width: w, height: h, ratio: r, ratioLabel, isGoodRatio });
    };
  }, [value]);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image file is too large. Maximum size is 10 MB.');
      return;
    }

    setError(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }

      const data = await res.json();
      if (data.url) {
        onChange(data.url);
      } else {
        throw new Error('No URL returned from upload');
      }
    } catch (err: any) {
      console.error('File upload error:', err);
      // Fallback: Read as local data URL so the user is NEVER blocked
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onChange(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    setError(null);
    onChange(customUrl.trim());
    setUseUrlInput(false);
  };

  return (
    <div className="space-y-4">
      
      {/* Header and Toggle Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
            {label} <span className="text-rose-500">*</span>
          </label>
          <span className="text-[11px] text-slate-500">
            High-resolution cover image shown on the public cause page & donor feed.
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setUseUrlInput(!useUrlInput);
              setError(null);
            }}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>{useUrlInput ? 'Upload File' : 'Paste URL'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPresetsDrawer(!showPresetsDrawer)}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>{showPresetsDrawer ? 'Hide Archive' : 'Archive Samples'}</span>
          </button>
        </div>
      </div>

      {/* URL Input Form (if toggled) */}
      {useUrlInput && (
        <form onSubmit={handleApplyUrl} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex gap-2 animate-fade-in">
          <input
            type="url"
            placeholder="https://example.com/images/cause-photo.jpg"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            className="flex-1 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800 font-mono"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all"
          >
            Apply URL
          </button>
        </form>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 16:9 ASPECT RATIO FRAMING CANVAS BOX                                      */}
      {/* ========================================================================= */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>16:9 Aspect Ratio Frame (1200 × 675px Recommended)</span>
          </div>

          {value && (
            <button
              type="button"
              onClick={() => setShowGrid(!showGrid)}
              className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>{showGrid ? 'Hide Rule of Thirds Grid' : 'Show Rule of Thirds Grid'}</span>
            </button>
          )}
        </div>

        {/* 16:9 Framing Container */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`relative w-full aspect-[16/9] rounded-2xl overflow-hidden border-2 transition-all group ${
            dragActive
              ? 'border-emerald-500 bg-emerald-50/50 scale-[1.01] shadow-lg'
              : value
              ? 'border-slate-300 bg-slate-950 shadow-sm'
              : 'border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400'
          }`}
        >
          {/* Uploading Spinner Overlay */}
          {isUploading && (
            <div className="absolute inset-0 z-40 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
              <p className="text-xs font-bold">Uploading & Optimizing Cover Image...</p>
            </div>
          )}

          {value ? (
            /* Uploaded Image Active View inside 16:9 Frame */
            <>
              <img
                src={value}
                alt="Cause Cover Preview"
                className="w-full h-full object-cover"
              />

              {/* Rule of Thirds Framing Grid Overlay */}
              {showGrid && (
                <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 z-10">
                  <div className="border-r border-b border-white/20"></div>
                  <div className="border-r border-b border-white/20"></div>
                  <div className="border-b border-white/20"></div>
                  <div className="border-r border-b border-white/20"></div>
                  <div className="border-r border-b border-white/20"></div>
                  <div className="border-b border-white/20"></div>
                  <div className="border-r border-white/20"></div>
                  <div className="border-r border-white/20"></div>
                  <div></div>
                </div>
              )}

              {/* Aspect Ratio Framing Corners (Camera Framing UI) */}
              <div className="absolute inset-3 pointer-events-none z-10">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white/80 rounded-tl"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white/80 rounded-tr"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white/80 rounded-bl"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white/80 rounded-br"></div>
              </div>

              {/* Top Aspect Ratio Floating Badge */}
              <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg border border-white/10 shadow-sm">
                <Maximize2 className="w-3 h-3 text-emerald-400" />
                <span>16:9 Public Display Frame</span>
              </div>

              {/* Bottom Quick Controls Bar */}
              <div className="absolute inset-x-0 bottom-0 z-20 p-2.5 sm:p-3 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-transparent flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 opacity-95 transition-opacity">
                <div className="text-[10px] sm:text-[11px] text-white font-medium truncate min-w-0 flex-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                  <span className="truncate">{imageMeta ? imageMeta.ratioLabel : 'Cover Photo Attached'}</span>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 sm:px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-900 rounded-lg text-[11px] sm:text-xs font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Change</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onChange('')}
                    className="p-1.5 bg-rose-600/90 hover:bg-rose-600 text-white rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-95"
                    title="Remove Photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Empty State: Drag & Drop Zone with 16:9 Visual Framing */
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3 cursor-pointer"
                 onClick={() => fileInputRef.current?.click()}
            >
              {/* Corner framing brackets */}
              <div className="absolute inset-4 pointer-events-none">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-slate-400 rounded-tl"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-slate-400 rounded-tr"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-slate-400 rounded-bl"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-slate-400 rounded-br"></div>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs group-hover:scale-105 transition-transform">
                <UploadCloud className="w-6 h-6 text-slate-700" />
              </div>

              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-bold text-slate-800">
                  <span className="text-emerald-700 underline underline-offset-2">Click to select image</span> or drag and drop here
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  Landscape 16:9 banner • JPG, PNG, or WEBP up to 10 MB
                </p>
              </div>

              <button
                type="button"
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-slate-800 transition-all pointer-events-none"
              >
                Browse Files from Device
              </button>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
            className="hidden"
          />
        </div>

        {/* Aspect Ratio Validation Feedback Bar */}
        {imageMeta && (
          <div className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-between ${
            imageMeta.isGoodRatio
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-center gap-2">
              {imageMeta.isGoodRatio ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <span className="font-bold text-[11px]">{imageMeta.ratioLabel}</span>
            </div>

            <span className="text-[10px] text-slate-500 font-mono">
              {imageMeta.width}w × {imageMeta.height}h
            </span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* IMAGE GUIDANCE & QUALITY CHECKLIST CARD                                    */}
      {/* ========================================================================= */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-slate-700" />
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Image Quality & Framing Guidelines
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
          
          <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 flex items-center gap-1">
              📐 Aspect Ratio (16:9)
            </span>
            <p className="text-slate-500 leading-normal">
              Optimal: <strong>1200 × 675px</strong> or <strong>1920 × 1080px</strong>. Landscape orientation ensures no unwanted edge clipping.
            </p>
          </div>

          <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 flex items-center gap-1">
              📷 Ground-Level Reality
            </span>
            <p className="text-slate-500 leading-normal">
              Use authentic, clear photos of the project site, infrastructure, or community members in natural daylight.
            </p>
          </div>

          <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 flex items-center gap-1">
              🚫 What to Avoid
            </span>
            <p className="text-slate-500 leading-normal">
              Avoid vertical screenshots, low-resolution pixelated graphics, stock watermarks, or heavy text overlays.
            </p>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* OPTIONAL ARCHIVE SAMPLES DRAWER (IF USER HAS NO PHOTO)                     */}
      {/* ========================================================================= */}
      {showPresetsDrawer && (
        <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2.5 animate-fade-in shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">
              Foundation Photo Archive (Optional Sample Placeholders)
            </span>
            <span className="text-[10px] text-slate-400">Click any photo to apply as draft</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {PRESET_FALLBACKS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  onChange(preset.url);
                  setError(null);
                }}
                className={`group relative aspect-[16/9] rounded-xl overflow-hidden border-2 transition-all ${
                  value === preset.url ? 'border-emerald-600 scale-102 shadow-xs' : 'border-slate-200 hover:border-slate-400'
                }`}
              >
                <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                <span className="absolute inset-x-0 bottom-0 bg-slate-950/80 text-white text-[9px] font-bold py-0.5 truncate px-1 text-center">
                  {preset.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
