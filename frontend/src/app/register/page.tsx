'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { 
  Mail, Lock, User, ArrowRight, Eye, EyeOff, 
  ShieldCheck, AlertCircle, Loader2, 
  ArrowLeft, CheckCircle2, KeyRound
} from 'lucide-react';

export default function RegisterPage() {
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupStep, setSignupStep] = useState<'form' | 'verify'>('form');
  const [verificationCode, setVerificationCode] = useState('');
  const [resendingCode, setResendingCode] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { signup, setAuthSession } = useAuth();
  const router = useRouter();

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const res = await signup(signupEmail.trim(), signupName.trim(), signupPassword);
      setSignupStep('verify');
      setSuccess(res.message || 'Verification code sent to your email address.');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await api.auth.verifyCode({
        email: signupEmail.trim(),
        code: verificationCode.trim(),
      });

      if (res && res.token && res.user) {
        setAuthSession(res.token, res.user);
        router.push('/dashboard');
      } else {
        throw new Error('Verification failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid or expired verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendingCode(true);
    setError('');
    try {
      await api.auth.resendVerification(signupEmail.trim());
      setSuccess('A new verification code has been dispatched to your email.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setResendingCode(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* ========================================================================= */}
      {/* LEFT COLUMN (50%): REGISTRATION FORM HUB                                  */}
      {/* ========================================================================= */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-14 xl:p-16 min-h-screen">
        
        {/* Top Header / Brand Logo */}
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 relative overflow-visible group-hover:scale-105 transition-transform">
              <Image 
                src="/logo.png" 
                alt="Adera Logo" 
                fill 
                sizes="40px" 
                className="object-contain" 
                priority 
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-slate-900 tracking-tight leading-none">Adera</span>
              <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest leading-tight mt-0.5">Foundation</span>
            </div>
          </Link>

          <Link 
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
        </div>

        {/* Central Form Container */}
        <div className="w-full max-w-md mx-auto my-auto py-8 space-y-6">
          
          {/* Header Copy */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {signupStep === 'verify' ? 'Verify Your Email' : 'Create an Account'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              {signupStep === 'verify'
                ? `Enter the 6-digit verification code sent to ${signupEmail}.`
                : 'Join the transparent, blockchain-verified humanitarian giving network.'}
            </p>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="flex items-center gap-2.5 text-rose-700 text-xs font-semibold bg-rose-50 p-3.5 rounded-2xl border border-rose-200 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2.5 text-emerald-800 text-xs font-semibold bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          {/* Step 1: Sign Up Form */}
          {signupStep === 'form' && (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Full Name / Organization
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g., Almaz Haile or Global Health Initiative"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Create Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    required
                    placeholder="At least 6 characters"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-emerald-600/20 hover-lift flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Create Free Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 2: Verification Code */}
          {signupStep === 'verify' && (
            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  6-Digit Verification Code
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-lg font-mono font-bold tracking-widest text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || verificationCode.length < 6}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Confirm & Complete Sign In</span>}
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setSignupStep('form')}
                  className="text-slate-500 hover:text-slate-800 font-bold"
                >
                  ← Edit details
                </button>

                <button
                  type="button"
                  disabled={resendingCode}
                  onClick={handleResendCode}
                  className="text-emerald-700 hover:text-emerald-800 font-extrabold disabled:opacity-50"
                >
                  {resendingCode ? 'Sending...' : 'Resend Code'}
                </button>
              </div>
            </form>
          )}

          {/* Bottom Switcher Note */}
          <div className="pt-2 text-center text-xs text-slate-500">
            <p>
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-extrabold text-emerald-700 hover:underline"
              >
                Sign in here
              </Link>
            </p>
          </div>

        </div>

        {/* Footer info */}
        <div className="pt-4 text-center text-[11px] text-slate-400">
          Protected by on-chain verification protocol • Adera Foundation
        </div>

      </div>

      {/* ========================================================================= */}
      {/* RIGHT COLUMN (50%): MINIMALIST ARTWORK & BRAND ETHOS                      */}
      {/* ========================================================================= */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 items-center justify-center p-12 xl:p-16 overflow-hidden border-l border-slate-800">
        
        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/15 rounded-full blur-[100px] pointer-events-none" />
        
        {/* Decorative Grid Mesh */}
        <div 
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.4) 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />

        {/* Central Artwork Showcase Card */}
        <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center space-y-8">
          
          {/* Framed Minimalist Artwork Canvas */}
          <div className="relative w-72 h-96 sm:w-80 sm:h-[420px] rounded-3xl overflow-hidden shadow-2xl border border-white/15 bg-white/5 backdrop-blur-md p-2 group transition-transform duration-500 hover:scale-[1.02]">
            <div className="relative w-full h-full rounded-2xl overflow-hidden bg-slate-900">
              <Image
                src="/auth-hero.jpg"
                alt="Adera Philanthropic Illustration"
                fill
                priority
                className="object-cover object-center"
                sizes="(max-width: 1200px) 50vw, 400px"
              />
            </div>

            {/* Inner Glow Border */}
            <div className="absolute inset-0 rounded-3xl border border-emerald-400/20 pointer-events-none" />
          </div>

          {/* Minimalist Ethos Pills */}
          <div className="space-y-3 max-w-sm">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-emerald-300 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Direct Blockchain Giving</span>
            </div>

            <p className="text-xs text-slate-300/80 leading-relaxed font-medium">
              Empowering communities with transparent on-chain milestones, direct humanitarian aid, and audited crypto philanthropy.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
