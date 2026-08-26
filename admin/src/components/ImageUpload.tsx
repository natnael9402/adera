'use client';

import { useState, useRef } from 'react';
import { UploadCloud, X, Link as LinkIcon, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUpload({ value, onChange, label = 'Upload Cover Photo' }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [useUrlInput, setUseUrlInput] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, WEBP, SVG)');
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadNotice(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload?filename=' + encodeURIComponent(file.name), {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }

      const data = await res.json();
      onChange(data.url);
      setUploadNotice('Cloud storage upload complete!');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Image upload failed');
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

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">{label}</label>
        <button
          type="button"
          onClick={() => {
            setUseUrlInput(!useUrlInput);
            setError(null);
          }}
          className="text-xs font-semibold text-primary-700 hover:text-primary-800 transition-colors flex items-center gap-1"
        >
          <LinkIcon className="w-3.5 h-3.5" />
          {useUrlInput ? 'Use File Upload' : 'Paste Image URL'}
        </button>
      </div>

      {value ? (
        <div className="relative bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center gap-4 group">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative">
            <img src={value} alt="Uploaded Preview" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 mb-0.5">
              <CheckCircle2 className="w-4 h-4" /> Image Attached
            </p>
            <p className="text-xs text-slate-500 font-mono truncate">{value}</p>
            {uploadNotice && <p className="text-[11px] text-emerald-700 mt-0.5 font-medium">{uploadNotice}</p>}
          </div>
          <button
            type="button"
            onClick={() => {
              onChange('');
              setUploadNotice(null);
            }}
            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl border border-rose-200 transition-all shrink-0"
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : useUrlInput ? (
        <div className="space-y-2">
          <input
            type="url"
            placeholder="https://images.unsplash.com/..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:bg-white text-xs"
          />
          <p className="text-[11px] text-slate-500">Paste any direct public image URL.</p>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-slate-300 bg-slate-50/50 hover:border-primary-500 hover:bg-slate-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />

          <div className="flex flex-col items-center justify-center gap-1.5">
            {isUploading ? (
              <div className="flex flex-col items-center gap-2 py-2">
                <Loader2 className="w-7 h-7 text-primary-600 animate-spin" />
                <p className="text-xs font-semibold text-slate-700">Uploading image to storage...</p>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-primary-50 border border-primary-200 flex items-center justify-center text-primary-600 mb-1">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-900">
                  Click to upload photo or drag & drop
                </p>
                <p className="text-[11px] text-slate-500">
                  PNG, JPG, WEBP, SVG
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
