'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useBuyerAuth } from '@/context/BuyerAuthContext';
import { 
  Mail, Lock, User, Phone, ArrowRight, ArrowLeft, ShieldCheck, 
  AlertCircle, RefreshCw, ShoppingBag, Eye, EyeOff, MapPin, 
  Building, Globe, Sparkles, CheckCircle2 
} from 'lucide-react';
import AuthImpactSidebar from '@/components/AuthImpactSidebar';

const COUNTRIES = [
  'United States',
  'Canada',
  'United Kingdom',
  'Ethiopia',
  'Australia',
  'Germany',
  'France',
  'Netherlands',
  'Sweden',
  'Switzerland',
  'Norway',
  'Italy',
  'Spain',
  'Japan',
  'United Arab Emirates',
  'Singapore',
  'South Africa',
  'Kenya',
  'Nigeria',
  'Other',
];

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/account';
  const { buyer, signup, verifyCode, resendVerification } = useBuyerAuth();

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (buyer) {
      router.replace(redirectUrl);
    }
  }, [buyer, redirectUrl, router]);

  // Step 1: Credentials
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Step 2: Shipping Destination
  const [address, setAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [stateProvince, setStateProvince] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('United States');

  // Step 3: Verification code screen
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  // General UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1 handler
  const handleStep1Continue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide your full name.');
      return;
    }
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError(null);
    setStep(2);
  };

  // Helper to execute signup with or without address
  const executeSignup = async (addressData?: {
    address?: string;
    apartment?: string;
    city?: string;
    stateProvince?: string;
    zipCode?: string;
    country?: string;
  }) => {
    setError(null);
    setIsLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const res = await signup({
        name: name.trim(),
        email: cleanEmail,
        password,
        phone: phone.trim() || undefined,
        savedAddress: addressData,
      });

      if (res?.token || res?.user) {
        router.push(redirectUrl);
      } else {
        setStep(3);
      }
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('already exists')) {
        setError('An account with this email already exists. Please sign in instead.');
      } else {
        setError(msg || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2 handler
  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) {
      setError('Please enter your street address.');
      return;
    }
    if (!city.trim()) {
      setError('Please enter your city.');
      return;
    }
    if (!zipCode.trim()) {
      setError('Please enter your ZIP or postal code.');
      return;
    }

    executeSignup({
      address: address.trim(),
      apartment: apartment.trim() || undefined,
      city: city.trim(),
      stateProvince: stateProvince.trim() || undefined,
      zipCode: zipCode.trim(),
      country: country.trim() || 'United States',
    });
  };

  const handleSkipAddress = () => {
    executeSignup(undefined);
  };

  // Step 3: Verification
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.length < 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

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
      <div className="lg:col-span-7 xl:col-span-7 flex flex-col justify-between p-6 sm:p-8 lg:p-10 h-full overflow-y-auto">
        
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

          {/* Step Progress Pill */}
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 px-0.5">
            <span>
              {step === 1 && 'Step 1 of 3: Account Credentials'}
              {step === 2 && 'Step 2 of 3: Permanent Shipping Address'}
              {step === 3 && 'Step 3 of 3: Email Verification'}
            </span>
            <div className="flex items-center gap-1.5">
              <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 1 ? 'w-6 bg-emerald-600' : 'w-2 bg-emerald-400'}`} />
              <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 2 ? 'w-6 bg-emerald-600' : step > 2 ? 'w-2 bg-emerald-400' : 'w-2 bg-slate-200'}`} />
              <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 3 ? 'w-6 bg-emerald-600' : 'w-2 bg-slate-200'}`} />
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {step === 1 && 'Create Buyer Account'}
              {step === 2 && 'Shipping Destination'}
              {step === 3 && 'Verify Your Email'}
            </h1>
            <p className="text-xs text-slate-500 font-normal">
              {step === 1 && '100% of profits from every purchase fund verified humanitarian causes.'}
              {step === 2 && 'Saved permanently so you never have to re-type it. Always editable at checkout.'}
              {step === 3 && `Enter the 6-digit confirmation code sent to ${email}`}
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

          {/* ======================================================== */}
          {/* STEP 1: CREDENTIALS */}
          {/* ======================================================== */}
          {step === 1 && (
            <form onSubmit={handleStep1Continue} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Full Name *
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
                  Email Address *
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
                    Password *
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
                  className="w-full py-3.5 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <span>Continue to Shipping Address</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* STEP 2: PERMANENT SHIPPING ADDRESS */}
          {/* ======================================================== */}
          {step === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-3.5">
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-[11px] text-emerald-900 leading-relaxed">
                  <strong className="block text-emerald-950 font-bold">One-Time Setup</strong>
                  Your delivery address is saved once to your account and automatically populated on every checkout. You can modify it anytime.
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Street Address *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    required
                    placeholder="123 Philanthropy Way"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 transition-colors shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Apt, Suite, Unit <span className="text-slate-400 font-normal lowercase">(optional)</span>
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Apt 4B / Suite 200"
                    value={apartment}
                    onChange={(e) => setApartment(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 transition-colors shadow-2xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    City *
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="Seattle"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 transition-colors shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    State / Province
                  </label>
                  <input 
                    type="text"
                    placeholder="WA"
                    value={stateProvince}
                    onChange={(e) => setStateProvince(e.target.value)}
                    className="w-full px-3.5 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 transition-colors shadow-2xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    ZIP / Postal Code *
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="98101"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 transition-colors shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Country *
                  </label>
                  <div className="relative">
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full pl-3.5 pr-8 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-emerald-600 transition-colors shadow-2xs appearance-none cursor-pointer"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <Globe className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setStep(1);
                  }}
                  className="px-4 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving Address...</span>
                    </>
                  ) : (
                    <>
                      <span>Save Address & Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={handleSkipAddress}
                  disabled={isLoading}
                  className="text-slate-400 hover:text-slate-600 text-xs font-medium underline underline-offset-4 cursor-pointer"
                >
                  Skip address for now
                </button>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* STEP 3: 6-DIGIT EMAIL VERIFICATION */}
          {/* ======================================================== */}
          {step === 3 && (
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
                  type="button"
                  onClick={handleResend}
                  className="font-bold text-emerald-700 hover:text-emerald-800 transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Resend Code</span>
                </button>

                <button 
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
                >
                  Edit Details
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
