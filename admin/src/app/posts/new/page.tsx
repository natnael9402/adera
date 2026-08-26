'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { FilePlus, ArrowLeft, Send, PenTool, CheckCircle2, Shield } from 'lucide-react';
import Navbar from '@/components/Navbar';
import ImageUploadGuide from '@/components/ImageUploadGuide';
import AiStoryWriterModal from '@/components/AiStoryWriterModal';

export default function NewPostPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ 
    title: '', 
    description: '', 
    goal: '', 
    raised: '0',
    category: '', 
    urgency: 'Featured', 
    image: '' 
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  if (loading) return null;
  if (!user) {
    router.push('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await api.admin.posts.create({ 
        ...form, 
        goal: parseFloat(form.goal),
        raised: parseFloat(form.raised || '0')
      });
      setSuccess('Cause initiative created and published to public portal successfully!');
      setForm({ title: '', description: '', goal: '', raised: '0', category: '', urgency: 'Featured', image: '' });
      setTimeout(() => router.push('/posts'), 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 w-full space-y-6">
        
        <div className="flex items-center justify-between">
          <Link 
            href="/posts" 
            className="inline-flex items-center text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl transition-colors shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Causes
          </Link>

          <span className="text-xs font-bold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-md border border-primary-200">
            Instant Admin Publication
          </span>
        </div>

        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          
          <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
            <div className="w-12 h-12 bg-primary-50 border border-primary-200 rounded-2xl flex items-center justify-center text-primary-700">
              <FilePlus className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Create New Philanthropic Cause
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Causes created through the admin console are automatically verified and displayed on the main portal.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-bold">
                {error}
              </div>
            )}
            {success && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{success}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Cause Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Clean Water Infrastructure for 12 Rural Primary Schools"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Description & Mission <span className="text-rose-500">*</span>
                </label>

                <button
                  type="button"
                  onClick={() => setShowAiModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer border border-slate-200"
                >
                  <FilePlus className="w-3.5 h-3.5 text-slate-600" />
                  <span>Draft Assistant</span>
                </button>
              </div>

              <textarea
                required
                rows={6}
                placeholder="Detail the geographic scope, beneficiary communities, milestone deliverables, and budget allocation..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:bg-white transition-all resize-none leading-relaxed"
              />
            </div>

            <ImageUploadGuide
              value={form.image}
              onChange={(url) => setForm({ ...form, image: url })}
              label="Cause Cover Image (16:9 Aspect Ratio)"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Goal Target ($ USD) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  placeholder="e.g., 25000"
                  value={form.goal}
                  onChange={(e) => setForm({ ...form, goal: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:bg-white transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Initial Gathered ($ USD)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g., 5000"
                  value={form.raised}
                  onChange={(e) => setForm({ ...form, raised: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:bg-white transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:outline-none focus:border-primary-500 focus:bg-white transition-all"
                >
                  <option value="" disabled>Select cause category...</option>
                  <option value="Education">Education & School Labs</option>
                  <option value="Healthcare">Healthcare & Maternal Aid</option>
                  <option value="Water & Sanitation">Water & Sanitation Wells</option>
                  <option value="Environment">Environment & Reforestation</option>
                  <option value="Disaster Relief">Disaster Relief</option>
                  <option value="Empowerment">Community Empowerment</option>
                </select>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-md shadow-primary-600/20 hover-lift flex items-center justify-center gap-2 text-sm"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Creating and Publishing Cause...' : 'Publish Verified Cause'}</span>
              </button>
            </div>
          </form>

        </div>
      </main>

      <AiStoryWriterModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        onApply={(text) => setForm((prev) => ({ ...prev, description: text }))}
        initialTitle={form.title}
        initialCategory={form.category || 'Clean Water'}
        initialGoal={Number(form.goal) || 25000}
      />
    </div>
  );
}
