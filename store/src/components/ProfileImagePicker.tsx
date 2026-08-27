'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, Link2, Image as ImageIcon, X, Check, Camera, ShieldCheck } from 'lucide-react';
import StoreAvatar, { STORE_AVATAR_PRESETS } from './StoreAvatar';
import { ShopTierType } from './TierMedal';

interface ProfileImagePickerProps {
  value: string;
  onChange: (value: string) => void;
  shopName: string;
  tier?: ShopTierType;
}

export default function ProfileImagePicker({
  value,
  onChange,
  shopName,
  tier = 'BRONZE',
}: ProfileImagePickerProps) {
  const isPreset = value?.startsWith('preset:') || !value;
  const [activeMode, setActiveMode] = useState<'upload' | 'preset' | 'url'>(
    isPreset ? 'upload' : 'upload'
  );
  const [urlInput, setUrlInput] = useState(isPreset ? '' : value);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WebP, SVG, GIF).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds the 10MB limit.');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        onChange(data.url);
        setUrlInput('');
        return;
      }
    } catch (err) {
      console.warn('API upload fallback to dataURL:', err);
    } finally {
      setIsUploading(false);
    }

    // Fallback to data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onChange(result);
        setUrlInput('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
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
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleUrlApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      onChange(urlInput.trim());
    }
  };

  const handleRemoveCustom = () => {
    onChange('preset:store_apex');
    setUrlInput('');
  };

  const isCustomUploaded = !isPreset;

  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Camera className="w-4 h-4 text-emerald-600" />
            <span>Store Profile & Brand Logo</span>
          </h3>
          <p className="text-xs text-slate-500">
            Upload your custom storefront logo, enter an image URL, or choose a signature emblem.
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
          <button
            type="button"
            onClick={() => setActiveMode('upload')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeMode === 'upload'
                ? 'bg-white text-emerald-700 shadow-xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload File</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('url')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeMode === 'url'
                ? 'bg-white text-emerald-700 shadow-xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Image URL</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('preset')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeMode === 'preset'
                ? 'bg-white text-emerald-700 shadow-xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Vector Emblems</span>
          </button>
        </div>
      </div>

      {/* MODE 1: FILE DRAG & DROP UPLOAD */}
      {activeMode === 'upload' && (
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
            onChange={handleFileChange}
            className="hidden"
          />

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all flex flex-col items-center justify-center gap-3 ${
              dragActive
                ? 'border-emerald-500 bg-emerald-50/50 scale-[1.01]'
                : 'border-slate-300 bg-slate-50/70 hover:bg-emerald-50/30 hover:border-emerald-400'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
              <Upload className="w-6 h-6" />
            </div>

            <div>
              <span className="text-xs sm:text-sm font-extrabold text-slate-900 block">
                Click to browse or drag & drop your store logo
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                PNG, JPG, WebP, SVG (Recommended square ratio, min 400x400)
              </span>
            </div>

            <button
              type="button"
              disabled={isUploading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {isUploading ? 'Uploading...' : 'Choose Image File'}
            </button>
          </div>
        </div>
      )}

      {/* MODE 2: DIRECT IMAGE URL */}
      {activeMode === 'url' && (
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase text-slate-700">
            Paste Direct Image Web Link (HTTPS)
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 focus-within:bg-white focus-within:border-emerald-500">
              <Link2 className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/my-shop-logo.png"
                className="w-full py-2.5 bg-transparent text-xs font-semibold text-slate-900 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleUrlApply}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl shadow-xs transition-colors shrink-0"
            >
              Apply URL
            </button>
          </div>
        </div>
      )}

      {/* MODE 3: VECTOR PRESETS PICKER */}
      {activeMode === 'preset' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {STORE_AVATAR_PRESETS.map((preset) => {
            const isSelected = value === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => onChange(preset.id)}
                className={`cursor-pointer p-2.5 rounded-2xl border-2 transition-all flex items-center gap-2.5 ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-2 ring-emerald-600/20'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300'
                }`}
              >
                <StoreAvatar
                  name={shopName || 'Shop'}
                  avatar={preset.id}
                  tier={tier}
                  size="sm"
                  showTierBadge={false}
                />
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-slate-900 truncate">{preset.name}</div>
                  <span className="text-[9px] text-slate-400 block">{preset.category}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LIVE PREVIEW & SELECTION SUMMARY STRIP */}
      <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <StoreAvatar
            name={shopName || 'Your Store'}
            avatar={value}
            tier={tier}
            size="lg"
          />
          <div>
            <div className="text-xs font-black text-slate-900 flex items-center gap-2">
              <span>{shopName || 'Your Store Display Name'}</span>
              {isCustomUploaded && (
                <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>Custom Logo Active</span>
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Live Preview of your verified storefront profile & medal badge
            </span>
          </div>
        </div>

        {isCustomUploaded && (
          <button
            type="button"
            onClick={handleRemoveCustom}
            className="text-xs font-bold text-slate-500 hover:text-rose-600 flex items-center gap-1 self-start sm:self-center transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset to Default</span>
          </button>
        )}
      </div>

    </div>
  );
}
