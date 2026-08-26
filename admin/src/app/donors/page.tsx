'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Heart, Pencil, Trash2, Plus, X, Save, Award, AlertCircle, Upload, Image as ImageIcon, Check, RefreshCw, Crown, Shield, ExternalLink, HelpCircle, Loader2, ShieldCheck } from 'lucide-react';
import Navbar from '@/components/Navbar';
import DonorAvatar, { THEME_AVATAR_PRESETS } from '@/components/DonorAvatar';

interface DonorRecord {
  id: number;
  name: string;
  amount: number;
  date: string;
  avatar?: string;
  title?: string;
  badge?: string;
}

export default function DonorsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [donors, setDonors] = useState<DonorRecord[]>([]);
  const [isEditing, setIsEditing] = useState<DonorRecord | null | boolean>(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    avatar: '',
    title: 'Emerald Patron',
    badge: '🏆 Top Contributor',
  });

  const [avatarMode, setAvatarMode] = useState<'preset' | 'upload' | 'url' | 'dynamic'>('dynamic');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user) loadDonors();
  }, [user, loading, router]);

  const loadDonors = () => {
    api.admin.donors.list().then(setDonors).catch(console.error);
  };

  const handleOpenAdd = () => {
    setIsEditing(true);
    setFormData({
      name: '',
      amount: '',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      avatar: '',
      title: 'Emerald Patron',
      badge: '🏆 Top Contributor',
    });
    setAvatarMode('dynamic');
  };

  const startEdit = (donor: DonorRecord) => {
    setIsEditing(donor);
    const hasPreset = donor.avatar?.startsWith('preset:');
    const hasCustomUrl = donor.avatar && !hasPreset;
    
    setFormData({
      name: donor.name,
      amount: donor.amount.toString(),
      date: donor.date,
      avatar: donor.avatar || '',
      title: donor.title || 'Emerald Patron',
      badge: donor.badge || '',
    });

    if (hasPreset) {
      setAvatarMode('preset');
    } else if (hasCustomUrl) {
      setAvatarMode('url');
    } else {
      setAvatarMode('dynamic');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size < 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert('Image file size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          setFormData((prev) => ({ ...prev, avatar: data.url }));
          setAvatarMode('upload');
          return;
        }
      }

      // Fallback to local Base64 data URL
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target?.result as string;
        setFormData((prev) => ({ ...prev, avatar: base64Url }));
        setAvatarMode('upload');
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('File upload error:', err);
      // Base64 fallback
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target?.result as string;
        setFormData((prev) => ({ ...prev, avatar: base64Url }));
        setAvatarMode('upload');
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.amount) {
      alert('Please fill out donor name and donation amount.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        amount: parseFloat(formData.amount),
        date: formData.date.trim(),
        avatar: formData.avatar.trim(),
        title: formData.title.trim(),
        badge: formData.badge.trim(),
      };

      if (isEditing && typeof isEditing === 'object' && (isEditing as DonorRecord).id) {
        await api.admin.donors.update((isEditing as DonorRecord).id, payload);
      } else {
        await api.admin.donors.create(payload);
      }

      setIsEditing(null);
      loadDonors();
    } catch (err) {
      console.error(err);
      alert('Failed to save donor record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to remove this donor entry from the leaderboard?')) return;
    try {
      await api.admin.donors.remove(id);
      loadDonors();
    } catch (err) {
      console.error(err);
      alert('Failed to delete donor');
    }
  };

  const filteredDonors = donors.filter((d) =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.title && d.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Heart className="w-8 h-8 text-rose-500 fill-rose-500/15" />
              Donor Leaderboard & Profile Pictures
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Set custom profile photos, choose signature theme illustrations, or use procedural vector avatars for verified contributors.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all shadow-md shadow-primary-600/20 text-xs hover-lift shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Donor Profile</span>
          </button>
        </div>

        {/* Inline Add / Edit Drawer with Live Avatar Studio */}
        {isEditing !== null && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6 animate-fade-in-up">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    {typeof isEditing === 'object' ? `Modify Donor Profile: ${isEditing.name}` : 'Add New Contributor to Leaderboard'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Customize donor details, contribution records, and profile illustration.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsEditing(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              
              {/* TOP: AVATAR CUSTOMIZER STUDIO */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  {/* Live Avatar Preview Card */}
                  <div className="flex items-center gap-4">
                    <DonorAvatar 
                      name={formData.name || 'Anonymous Donor'} 
                      avatar={formData.avatar} 
                      size="xl" 
                      rank={1}
                      showRankBadge={true}
                    />
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Avatar Preview</div>
                      <div className="text-base font-extrabold text-slate-900 truncate max-w-[200px]">
                        {formData.name || 'Donor Name'}
                      </div>
                      <div className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mt-1">
                        <span>{formData.title || 'Donor Tier'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Mode Selector Buttons */}
                  <div className="flex flex-wrap gap-1.5 bg-white p-1.5 rounded-xl border border-slate-200 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarMode('dynamic');
                        setFormData((prev) => ({ ...prev, avatar: '' }));
                      }}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        avatarMode === 'dynamic' ? 'bg-primary-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Dynamic Theme
                    </button>
                    <button
                      type="button"
                      onClick={() => setAvatarMode('preset')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        avatarMode === 'preset' ? 'bg-primary-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Pick Vector Preset
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarMode('upload');
                        fileInputRef.current?.click();
                      }}
                      className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                        avatarMode === 'upload' ? 'bg-primary-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAvatarMode('url')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        avatarMode === 'url' ? 'bg-primary-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Preset Illustration Selector Carousel */}
                {avatarMode === 'preset' && (
                  <div className="pt-2 border-t border-slate-200">
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Select Signature Adera Theme Illustration:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
                      {THEME_AVATAR_PRESETS.map((preset) => {
                        const isSelected = formData.avatar === preset.id;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, avatar: preset.id }))}
                            className={`p-2 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all text-center ${
                              isSelected
                                ? 'border-primary-500 bg-white shadow-sm ring-2 ring-primary-500/20'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
                              <DonorAvatar name={preset.name} avatar={preset.id} size="sm" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-800 truncate w-full">
                              {preset.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Image URL Input */}
                {avatarMode === 'url' && (
                  <div className="pt-2 border-t border-slate-200">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Paste Direct Photo / Avatar URL:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={formData.avatar.startsWith('preset:') ? '' : formData.avatar}
                        onChange={(e) => setFormData((prev) => ({ ...prev, avatar: e.target.value }))}
                        placeholder="https://example.com/avatar.jpg"
                        className="flex-1 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-primary-500"
                      />
                      {formData.avatar && (
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, avatar: '' }))}
                          className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* File Upload Banner */}
                {avatarMode === 'upload' && (
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-slate-600">
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 text-primary-600 animate-spin" />
                          <span>Uploading image...</span>
                        </>
                      ) : formData.avatar ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span className="font-semibold text-emerald-800">Custom photo uploaded & ready!</span>
                        </>
                      ) : (
                        <span>Choose an image from your computer (PNG, JPG, SVG, WebP)</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors shrink-0"
                    >
                      {uploading ? 'Processing...' : 'Browse File...'}
                    </button>
                  </div>
                )}

              </div>

              {/* BOTTOM: FORM INPUT FIELDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                
                {/* Donor Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Donor / Entity Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Satoshi Nakamoto or Dragonfly"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:bg-white text-xs font-semibold"
                  />
                </div>

                {/* Contribution */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Contribution Amount (USDC) *
                  </label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="e.g. 75000"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:bg-white text-xs font-mono font-bold"
                  />
                </div>

                {/* Date Display */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Display Date
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    placeholder="e.g. Aug 19"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:bg-white text-xs font-medium"
                  />
                </div>

                {/* Title / Tier */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Donor Tier / Recognition Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Diamond Patron / Angel Donor"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:bg-white text-xs font-medium"
                  />
                </div>

                {/* Badge Tag */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Special Highlight Badge (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="e.g. 🏆 Top Contributor • 🌟 Founding Philanthropist"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:bg-white text-xs font-medium"
                  />
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(null)}
                  className="py-2.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="py-2.5 px-6 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-primary-600/20 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Donor...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Contributor Profile</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* Data Table with Search & Filter */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm space-y-0">
          
          {/* Table Toolbar */}
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Active Donors ({donors.length})
              </span>
            </div>

            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search donors by name or tier..."
                className="w-full sm:w-64 pl-3.5 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider w-20">Rank</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Donor Profile</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Recognition Tier</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right">Contribution</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right">Date</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredDonors.map((d, index) => (
                  <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Rank */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-black font-mono ${
                        index === 0 
                          ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs' 
                          : index === 1 
                          ? 'bg-slate-200 text-slate-800 border border-slate-300' 
                          : index === 2 
                          ? 'bg-amber-50 text-amber-950 border border-amber-200' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        #{index + 1}
                      </span>
                    </td>

                    {/* Donor Profile (Picture + Name) */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3.5">
                        <DonorAvatar
                          name={d.name}
                          avatar={d.avatar}
                          rank={index + 1}
                          size="md"
                        />
                        <div>
                          <div className="font-extrabold text-slate-900 text-sm">
                            {d.name}
                          </div>
                          {d.badge && (
                            <span className="inline-block text-[10px] font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-200 mt-0.5">
                              {d.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Recognition Tier */}
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {d.title || 'Emerald Contributor'}
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5 font-mono font-bold text-primary-700 text-sm">
                        <Image 
                          src="/crypto/usdc.svg" 
                          alt="USDC" 
                          width={18} 
                          height={18} 
                          className="w-4 h-4 object-contain"
                          style={{ width: "auto", height: "auto" }}
                        />
                        <span>{new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(d.amount)} USDC</span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-right text-slate-500 font-medium font-mono">
                      {d.date}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => startEdit(d)}
                          title="Modify Donor Profile & Picture"
                          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition-all shadow-xs"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(d.id)}
                          title="Delete Donor"
                          className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl border border-rose-200 transition-all shadow-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}

                {filteredDonors.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <AlertCircle className="w-8 h-8 text-slate-400" />
                        <p className="font-bold text-slate-800 text-sm">No donor records found</p>
                        <p className="text-xs text-slate-500">
                          {searchTerm ? 'Try adjusting your search criteria.' : 'Add your first contributor profile to populate the leaderboard.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
