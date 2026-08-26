'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, Lock, ArrowRight, Eye, EyeOff, ShieldCheck, AlertCircle, Loader2, CheckCircle2, ArrowLeft, MailCheck, RefreshCw, Edit3, HelpCircle, Inbox } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // 6-Digit OTP State
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [verifying, setVerifying] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  // Resend State
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState('');

  const { signup, setAuthSession } = useAuth();
  const router = useRouter();

  // Handle Cooldown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Focus first digit when verification screen appears
  useEffect(() => {
    if (submitted && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [submitted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await signup(email.trim(), name.trim(), password);
      setSubmitted(true);
      setResendCooldown(45);
    } catch (err: any) {
      setError(err.message || 'Account registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDigitChange = (index: number, val: string) => {
    setVerifyError('');
    // Allow only numeric input
    const cleanVal = val.replace(/\D/g, '');

    const newDigits = [...digits];
    if (cleanVal.length > 1) {
      // If user typed/pasted multi-character string
      const chars = cleanVal.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newDigits[i] = chars[i] || '';
      }
      setDigits(newDigits);
      const nextFocus = Math.min(cleanVal.length, 5);
      inputRefs.current[nextFocus]?.focus();

      if (cleanVal.length >= 6) {
        submitVerification(cleanVal.slice(0, 6));
      }
      return;
    }

    newDigits[index] = cleanVal;
    setDigits(newDigits);

    // Auto advance focus
    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // If 6th digit entered, auto submit
    const fullCode = newDigits.join('');
    if (fullCode.length === 6 && !newDigits.includes('')) {
      submitVerification(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pastedData[i] || '';
    }
    setDigits(newDigits);

    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();

    if (pastedData.length === 6) {
      submitVerification(pastedData);
    }
  };

  const submitVerification = async (codeOverride?: string) => {
    const codeToVerify = codeOverride || digits.join('');
    if (codeToVerify.length !== 6) {
      setVerifyError('Please enter all 6 digits of your verification code.');
      return;
    }

    setVerifying(true);
    setVerifyError('');

    try {
      const res = await api.auth.verifyCode({
        email: email.trim(),
        code: codeToVerify,
      });

      setVerifySuccess(true);

      if (res.token && res.user) {
        setAuthSession(res.token, res.user);
      }

      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err: any) {
      setVerifyError(err.message || 'Invalid or expired verification code. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    setResendMessage('');
    setVerifyError('');

    try {
      const res = await api.auth.resendVerification(email.trim());
      setResendCooldown(60);
      setResendMessage(res.message || 'A fresh 6-digit code has been sent to your email.');
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setVerifyError(err.message || 'Failed to resend code. Please wait a moment.');
    } finally {
      setResending(false);
    }
  };

  // ----------------------------------------------------
  // VERIFICATION CODE SCREEN
  // ----------------------------------------------------
  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[400px] pointer-events-none -z-10">
          <div className="absolute top-0 left-10 w-72 h-72 bg-emerald-400/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-10 w-72 h-72 bg-teal-400/15 rounded-full blur-3xl" />
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-lg">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="bg-white/95 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-2xl space-y-6"
          >
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-200 shadow-sm">
                <MailCheck className="w-8 h-8" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Enter Verification Code
              </h1>

              <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                We sent a 6-digit code to <br />
                <span className="font-bold text-slate-900 font-mono text-sm">{email}</span>
              </p>

              <button
                onClick={() => {
                  setSubmitted(false);
                  setDigits(['', '', '', '', '', '']);
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline pt-1"
              >
                <Edit3 className="w-3 h-3" />
                <span>Wrong email address? Change it</span>
              </button>
            </div>

            {/* Success State */}
            {verifySuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2"
              >
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="text-lg font-bold text-emerald-900">Email Verified Successfully!</h3>
                <p className="text-xs text-emerald-700">Redirecting you to your account dashboard...</p>
              </motion.div>
            ) : (
              /* Verification Inputs */
              <div className="space-y-5">
                {verifyError && (
                  <div className="flex items-center gap-2.5 text-rose-700 text-xs font-semibold bg-rose-50 p-3.5 rounded-xl border border-rose-200 animate-fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{verifyError}</span>
                  </div>
                )}

                {resendMessage && !verifyError && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-200 animate-fade-in">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{resendMessage}</span>
                  </div>
                )}

                {/* 6-Digit Box Group */}
                <div>
                  <label className="block text-center text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    6-Digit Security Code
                  </label>
                  
                  <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
                    {digits.map((digit, idx) => (
                      <div key={idx} className="flex items-center">
                        <input
                          ref={(el) => { inputRefs.current[idx] = el; }}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleDigitChange(idx, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(idx, e)}
                          disabled={verifying}
                          className="w-11 h-14 sm:w-13 sm:h-16 text-center text-2xl font-black font-mono text-slate-900 bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 outline-none transition-all disabled:opacity-60 shadow-xs"
                        />
                        {idx === 2 && (
                          <span className="text-slate-300 font-black text-xl px-1 sm:px-1.5">&ndash;</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] text-slate-400 text-center mt-2.5">
                    Tip: You can paste (Ctrl+V) the code directly into the boxes.
                  </p>
                </div>

                {/* Submit Verification Button */}
                <button
                  onClick={() => submitVerification()}
                  disabled={verifying || digits.join('').length !== 6}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify & Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Resend Action */}
                <div className="text-center pt-1">
                  {resendCooldown > 0 ? (
                    <span className="text-xs text-slate-400 font-medium">
                      Resend code available in <strong className="text-slate-700 font-mono">{resendCooldown}s</strong>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={resending}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                      <span>{resending ? 'Sending Code...' : "Didn't receive code? Resend Email"}</span>
                    </button>
                  )}
                </div>

                {/* SPAM / JUNK FOLDER HELPER BOX */}
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-amber-900 font-bold">
                    <Inbox className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Can&apos;t find the email in your inbox?</span>
                  </div>
                  <ul className="text-slate-600 space-y-1 pl-6 list-disc text-[11px] leading-relaxed">
                    <li>Check your <strong>Spam</strong>, <strong>Junk</strong>, or <strong>Promotions</strong> folder.</li>
                    <li>Click <strong>&quot;Report Not Spam&quot;</strong> or drag to Primary inbox so you receive future donation receipts.</li>
                    <li>Add <strong>Info@aderafoundation.com</strong> to your safe sender list.</li>
                  </ul>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // INITIAL REGISTRATION FORM
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] pointer-events-none -z-10">
        <div className="absolute top-0 left-10 w-72 h-72 bg-emerald-400/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-10 w-72 h-72 bg-teal-400/15 rounded-full blur-3xl" />
      </div>

      {/* Dot matrix background */}
      <div 
        className="absolute inset-0 opacity-[0.4] pointer-events-none -z-10"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(15, 23, 42, 0.08) 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}
      />

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 relative overflow-visible group-hover:scale-105 transition-transform">
              <Image 
                src="/logo.png" 
                alt="Adera Logo" 
                fill 
                sizes="48px" 
                className="object-contain" 
                priority 
              />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                Adera
              </span>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest leading-tight mt-0.5">
                Foundation
              </span>
            </div>
          </Link>
          
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-6">
            Join the Movement
          </h1>
          <p className="text-sm text-slate-500 mt-1.5">
            Create your account to start donating and proposing verified causes.
          </p>
        </div>

        {/* Signup Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white/95 backdrop-blur-xl py-8 px-6 sm:px-10 rounded-3xl border border-slate-200/90 shadow-[0_10px_35px_rgba(0,0,0,0.05)]"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center gap-2.5 text-rose-700 text-xs font-semibold bg-rose-50 p-3.5 rounded-xl border border-rose-200"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Name Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  required 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm text-slate-900 placeholder:text-slate-400 font-medium" 
                  placeholder="e.g. Alex Morgan" 
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="email" 
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm text-slate-900 placeholder:text-slate-400 font-medium" 
                  placeholder="name@example.com" 
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required 
                  minLength={6}
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm text-slate-900 placeholder:text-slate-400 font-medium" 
                  placeholder="Minimum 6 characters" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Terms reminder */}
            <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
              By creating an account, you agree to the{' '}
              <Link href="/trust-and-safety" className="text-emerald-700 font-semibold hover:underline">
                Terms of Service
              </Link>{' '}
              and Privacy Policy.
            </p>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/30 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-0.5 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Verification Code...</span>
                </>
              ) : (
                <>
                  <span>Create Account & Get Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Login Link */}
            <div className="pt-2 text-center text-xs text-slate-500 font-medium">
              Already have an account?{' '}
              <Link 
                href="/login" 
                className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline ml-1"
              >
                Sign In →
              </Link>
            </div>
          </form>

          {/* Security Marker */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Instant 6-Digit Email Verification</span>
          </div>
        </motion.div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link 
            href="/" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Main Portal</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
