'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useBuyerAuth } from '@/context/BuyerAuthContext';
import { Mail, Lock, User, Phone, ArrowRight, ShieldCheck, AlertCircle, RefreshCw, ShoppingBag, Eye, EyeOff } from 'lucide-react';
import AuthImpactSidebar from '@/components/AuthImpactSidebar';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/account';
  const { signup, verifyCode, resendVerification } = useBuyerAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 2: Verification code screen
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    setError(null);
    setIsLoading(true);

    try {
      await signup({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
      });
      setIsVerifying(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.length < 6) return;

    setError(null);
    setVerifyLoading(true);

    try {
      await verifyCode(email.trim(), verificationCode.trim());
      router.push(redirectUrl);
    } catch (err: any) {
      setError(err.message || 'Invalid or expired verification code.');
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
      
      {/* LEFT COLUMN: MINIMALIST REGISTRATION FORM */}
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
        <div className="max-w-md w-full mx-auto my-auto py-3 space-y-4">
          
          {/* Segmented Mode Switcher */}
          <div className="flex bg-slate-200/80 p-1 rounded-2xl border border-slate-200">
            <Link 
              href={`/login${redirectUrl !== '/account' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
              className="flex-1 py-1.5 text-center text-xs font-bold rounded-xl text-slate-600 hover:text-slate-950 transition-colors"
            >
              Sign In
            </Link>
            <div className="flex-1 py-1.5 text-center text-xs font-bold rounded-xl bg-white text-slate-950 shadow-xs">
              Create Account
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {isVerifying ? 'Verify Your Email' : 'Create Account'}
            </h1>
            <p className="text-xs text-slate-500 font-normal">
              {isVerifying 
                ? `Enter the 6-digit confirmation code sent to ${email}`
                : '100% of profits from every purchase fund verified humanitarian causes.'}
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 font-semibold animate-fade-in-up">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          {resendStatus && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold">
              {resendStatus}
            </div>
          )}

          {!isVerifying ? (
            <form onSubmit={handleSignup} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    required
                    placeholder="Alex Johnson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 transition-colors shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
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
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 transition-colors shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
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
                    minLength={6}
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 transition-colors shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="tel"
                    placeholder="+1 (555) 019-2834"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 transition-colors shadow-2xs"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Free Buyer Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider text-center">
                    Enter 6-Digit Code
                  </label>
                  <input 
                    type="text"
                    required
                    maxLength={6}
                    autoFocus
                    placeholder="1 2 3 4 5 6"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center py-3 bg-slate-50 border-2 border-emerald-500 rounded-xl text-2xl font-black font-mono tracking-widest text-slate-900 focus:outline-none focus:bg-white"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={verifyLoading || verificationCode.length < 6}
                  className="w-full py-3.5 bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  {verifyLoading ? 'Verifying...' : 'Confirm & Activate Account'}
                </button>
              </form>

              <div className="text-center pt-1 border-t border-slate-100 flex items-center justify-between text-xs">
                <button 
                  onClick={handleResend}
                  className="font-bold text-emerald-700 hover:text-emerald-800 transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Resend Code</span>
                </button>

                <button 
                  onClick={() => setIsVerifying(false)}
                  className="text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
                >
                  Change Email
                </button>
              </div>
            </div>
          )}

          {/* Alternative Hub Links */}
          <div className="pt-4 border-t border-slate-200/80 flex flex-col gap-2.5 text-center text-xs">
            <p className="text-slate-600">
              Already have an account?{' '}
              <Link 
                href={`/login${redirectUrl !== '/account' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
                className="text-emerald-700 font-bold hover:underline"
              >
                Sign In Instead
              </Link>
            </p>

            <Link 
              href="/reseller/register"
              className="text-slate-400 hover:text-slate-600 font-medium"
            >
              Interested in selling on Adera? Apply for Reseller Account →
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

    </div>
  );
}

export default function BuyerRegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-950 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}
