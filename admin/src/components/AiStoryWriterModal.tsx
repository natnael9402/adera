'use client';

import { useState } from 'react';
import { 
  FileText, Check, Copy, RefreshCw, 
  X, Loader2, ArrowRight, BookOpen, Layers, ShieldCheck 
} from 'lucide-react';
import { api } from '@/lib/api';

interface AiStoryWriterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (generatedDescription: string) => void;
  initialTitle?: string;
  initialCategory?: string;
  initialGoal?: number;
  initialBeneficiary?: string;
  initialLocation?: string;
}

const TONE_PRESETS = [
  { id: 'inspiring', label: '🌱 Hopeful & Inspiring', desc: 'Focuses on long-term empowerment and hope.' },
  { id: 'urgent', label: '🔥 Urgent & Action-Driven', desc: 'Highlights immediate emergency need and rapid response.' },
  { id: 'transparent', label: '📊 Transparent & Milestone-Focused', desc: 'Emphasizes clear accountability and delivery phases.' },
  { id: 'emotional', label: '❤️ Human-Centered & Emotional', desc: 'Focuses on individual human dignity and life transformation.' },
];

export default function AiStoryWriterModal({
  isOpen,
  onClose,
  onApply,
  initialTitle = '',
  initialCategory = 'Clean Water',
  initialGoal = 25000,
  initialBeneficiary = '',
  initialLocation = '',
}: AiStoryWriterModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const [category, setCategory] = useState(initialCategory);
  const [goal, setGoal] = useState(initialGoal);
  const [beneficiary, setBeneficiary] = useState(initialBeneficiary);
  const [location, setLocation] = useState(initialLocation);
  const [tone, setTone] = useState(TONE_PRESETS[0].label);
  const [additionalDetails, setAdditionalDetails] = useState('');

  const [generating, setGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!title.trim()) {
      setError('Please provide a cause title to give the engine context.');
      return;
    }

    setError('');
    setGenerating(true);

    try {
      const res = await api.admin.posts.generateDescription({
        title: title.trim(),
        category: category.trim(),
        goal: Number(goal) || 25000,
        beneficiary: beneficiary.trim() || undefined,
        location: location.trim() || undefined,
        tone,
        additionalDetails: additionalDetails.trim() || undefined,
      });

      if (res && res.description) {
        setGeneratedResult(res.description);
      } else {
        throw new Error('No description returned from engine.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to synthesize narrative.');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedResult) return;
    navigator.clipboard.writeText(generatedResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    if (!generatedResult) return;
    onApply(generatedResult);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto font-sans">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full border border-slate-200 shadow-2xl space-y-6 my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 border border-slate-200">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  Draft Cause Description
                </h2>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                  Assistant
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Generate a structured description covering mission objectives, direct action plan, and deliverables.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto space-y-5 pr-1 flex-1">
          
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}

          {/* Form Context Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Cause Title / Subject *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Clean Water Infrastructure for 12 Rural Primary Schools"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-800 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-800"
              >
                <option value="Clean Water">Clean Water & Sanitation</option>
                <option value="Education">Education & School Labs</option>
                <option value="Healthcare">Healthcare & Mobile Clinics</option>
                <option value="Emergency Relief">Emergency Relief & Food</option>
                <option value="Agriculture">Sustainable Farming & Tools</option>
                <option value="Women Empowerment">Women & Youth Empowerment</option>
                <option value="Environment">Environmental & Solar Power</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Target Funding Goal ($ USD)
              </label>
              <input
                type="number"
                value={goal}
                onChange={(e) => setGoal(Number(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Direct Beneficiaries (Optional)
              </label>
              <input
                type="text"
                value={beneficiary}
                onChange={(e) => setBeneficiary(e.target.value)}
                placeholder="e.g., 3,400 schoolchildren & local families"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Location / Region (Optional)
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Somali Region, Eastern Ethiopia"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-800"
              />
            </div>

          </div>

          {/* Tone Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Narrative Tone & Angle
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TONE_PRESETS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTone(t.label)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    tone === t.label
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <p className="font-bold text-xs">{t.label}</p>
                  <p className={`text-[11px] mt-0.5 line-clamp-1 ${tone === t.label ? 'text-slate-300' : 'text-slate-500'}`}>
                    {t.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Additional Context Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Key Deliverables & Specific Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={additionalDetails}
              onChange={(e) => setAdditionalDetails(e.target.value)}
              placeholder="e.g., 2 boreholes drilled, 4 solar pumps mounted, water treatment unit certified..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-800 resize-none font-normal"
            />
          </div>

          {/* Action Trigger Button */}
          <div>
            <button
              type="button"
              disabled={generating || !title.trim()}
              onClick={handleGenerate}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Drafting description...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>Generate Description Draft</span>
                </>
              )}
            </button>
          </div>

          {/* Generated Result Output Area */}
          {generatedResult && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Generated Cause Story Preview
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={generating}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Regenerate</span>
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs leading-relaxed text-slate-800 whitespace-pre-line font-normal space-y-2 max-h-60 overflow-y-auto">
                {generatedResult}
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 pt-4 border-t border-slate-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!generatedResult}
            onClick={handleApply}
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 disabled:opacity-40"
          >
            <Check className="w-4 h-4" />
            <span>Apply to Cause Description</span>
          </button>
        </div>

      </div>
    </div>
  );
}
