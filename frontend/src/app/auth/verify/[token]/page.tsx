'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2, XCircle, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TokenVerifyPage() {
  const params = useParams();
  const token = params?.token as string;
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided in URL');
      return;
    }
    const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.aderafoundation.com/api';
    fetch(API + '/auth/verify/' + token)
      .then((r) => r.json())
      .then((data) => {
        setStatus('success');
        setMessage(data.message || 'Your email address has been verified!');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.message || 'Verification token expired or invalid');
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 relative overflow-visible">
              <Image src="/logo.png" alt="Adera Logo" fill sizes="48px" className="object-contain" priority />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-2xl font-black text-slate-900 leading-none">Adera</span>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">Foundation</span>
            </div>
          </Link>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white/95 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl text-center"
        >
          {status === 'loading' && (
            <div className="py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">Verifying Email Address...</h1>
              <p className="text-xs text-slate-500">Checking your cryptographic token on the server.</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Account Verified!</h1>
              <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
              <div className="pt-4 flex flex-col gap-3">
                <Link 
                  href="/login" 
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  <span>Sign In Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-200">
                <XCircle className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Verification Failed</h1>
              <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
              <div className="pt-4 flex flex-col gap-3">
                <Link 
                  href="/login" 
                  className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-all"
                >
                  Return to Sign In
                </Link>
                <Link 
                  href="/" 
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                >
                  Back to Homepage
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
