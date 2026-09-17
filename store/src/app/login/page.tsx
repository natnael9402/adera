'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useBuyerAuth } from '@/context/BuyerAuthContext';
import { Mail, Lock, ArrowRight, ShieldCheck, AlertCircle, RefreshCw, ShoppingBag, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import AuthImpactSidebar from '@/components/AuthImpactSidebar';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/account';
  const { login, verifyCode, resendVerification } = useBuyerAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Unverified flow
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setError(null);
    setIsLoading(true);

    try {
      await login(email.trim(), password);
      router.push(redirectUrl);
    } catch (err: any) {
      const msg = err.message || 'Login failed';
      if (msg.toLowerCase().includes('verify your email') || msg.toLowerCase().includes('6-digit code')) {
        setShowVerifyModal(true);
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.length < 6) return;

    setError(null);
    setVerifyLoading(true);

    try {
      await verifyCode(email.trim(), verificationCode.trim());
      setShowVerifyModal(false);
      router.push(redirectUrl);
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check the code.');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResend = async () => {
    setResendStatus('Sending fresh code...');
    try {
      const res = await resendVerification(email.trim());
      setResendStatus(res.message || 'Verification code resent to your email!');
      setTimeout(() => setResendStatus(null), 4000);
    } catch (err: any) {
      setResendStatus(err.message || 'Failed to resend code');
    }
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-slate-50 flex flex-col lg:grid lg:grid-cols-12 font-sans">
      
      {/* LEFT COLUMN: MINIMALIST SIGN IN FORM */}
      <div className="lg:col-span-7 xl:col-span-7 flex flex-col justify-between p-6 sm:p-8 lg:p-10 h-full">
        
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-9 h-9 relative overflow-visible group-hover:scale-105 transition-transform">
              <Image 
                src="/logo.png" 
                alt="Adera Store" 
                fill 
                sizes="36px"
                className="object-contain" 
                priority 
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-lg font-black text-slate-900 tracking-tight">Adera</span>
                <span className="text-[10px] font-bold text-slate-900 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded uppercase tracking-wider">Store</span>
              </div>
              <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest leading-tight mt-0.5">
                Direct Philanthropy
              </span>
            </div>
          </Link>

          <Link 
            href="/"
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors inline-flex items-center gap-1"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Store</span>
          </Link>
        </div>

        {/* Centered Form Area */}
        <div className="max-w-md w-full mx-auto my-auto py-4 space-y-5">
          
          {/* Segmented Mode Switcher */}
          <div className="flex bg-slate-200/80 p-1 rounded-2xl border border-slate-200">
            <div className="flex-1 py-1.5 text-center text-xs font-bold rounded-xl bg-white text-slate-950 shadow-xs">
              Sign In
            </div>
            <Link 
              href={`/register${redirectUrl !== '/account' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
              className="flex-1 py-1.5 text-center text-xs font-bold rounded-xl text-slate-600 hover:text-slate-950 transition-colors"
            >
              Create Account
            </Link>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Sign In
            </h1>
            <p className="text-xs text-slate-500 font-normal">
              Access your orders, shipments, and charity impact receipts.
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 font-semibold animate-fade-in-up">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="email"
                  required
                  placeholder="alex@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 transition-colors shadow-2xs"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer"
                >
                  {showPassword ? (
                    <>
                      <EyeOff className="w-3 h-3" />
                      <span>Hide</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3 h-3" />
                      <span>Show</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 transition-colors shadow-2xs"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Alternative Hub Links */}
          <div className="pt-4 border-t border-slate-200/80 flex flex-col gap-2.5 text-center text-xs">
            <p className="text-slate-600">
              Don&apos;t have an account yet?{' '}
              <Link 
                href={`/register${redirectUrl !== '/account' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
                className="text-emerald-700 font-bold hover:underline"
              >
                Create a Free Account
              </Link>
            </p>

            <Link 
              href="/reseller/login"
              className="text-slate-400 hover:text-slate-600 font-medium"
            >
              Seller or Reseller Partner? Sign in to Merchant Hub →
            </Link>
          </div>

        </div>

        {/* Footer Security Badges */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium pt-4">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>256-Bit SSL Encrypted • Buyer Protection Escrow</span>
        </div>

      </div>

      {/* RIGHT COLUMN: PROFIT FOR CHARITY, CAUSES LIST & HIGH RATINGS */}
      <div className="lg:col-span-5 xl:col-span-5 h-full overflow-hidden">
        <AuthImpactSidebar />
      </div>

      {/* 6-Digit Email Verification Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-8 text-center shadow-2xl space-y-6 relative">
            
            <button 
              onClick={() => setShowVerifyModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold cursor-pointer"
            >
              ✕
            </button>

            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-600/10">
              <Mail className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Verify Your Email
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                We sent a 6-digit verification code to <strong className="text-slate-800">{email}</strong>. Enter it below to complete sign in.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                {error}
              </div>
            )}

            {resendStatus && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-medium">
                {resendStatus}
              </div>
            )}

            <form onSubmit={handleVerifyCode} className="space-y-4">
              <input 
                type="text"
                required
                maxLength={6}
                placeholder="1 2 3 4 5 6"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center py-3 bg-slate-50 border-2 border-emerald-500 rounded-xl text-2xl font-black font-mono tracking-widest text-slate-900 focus:outline-none focus:bg-white"
              />

              <button 
                type="submit"
                disabled={verifyLoading || verificationCode.length < 6}
                className="w-full py-3.5 bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-sm cursor-pointer"
              >
                {verifyLoading ? 'Verifying...' : 'Confirm & Sign In'}
              </button>
            </form>

            <div className="pt-2">
              <button 
                onClick={handleResend}
                className="text-xs font-bold text-slate-500 hover:text-emerald-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Didn&apos;t receive code? Resend Code</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default function BuyerLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-950 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
