'use client';

import React, { useState } from 'react';
import { 
  CreditCard, Lock, Calendar, ShieldCheck, AlertCircle, 
  MapPin, Check, HelpCircle, Eye, EyeOff, X, ArrowRight,
  Coins, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface BillingAddressState {
  fullName: string;
  email: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

interface CreditCardTerminalProps {
  amountUsd: number;
  cardNumber: string;
  setCardNumber: (val: string) => void;
  cardHolder: string;
  setCardHolder: (val: string) => void;
  cardExpMonth: string;
  setCardExpMonth: (val: string) => void;
  cardExpYear: string;
  setCardExpYear: (val: string) => void;
  cardCvc: string;
  setCardCvc: (val: string) => void;
  detectedBrand: string;
  billingAddress: BillingAddressState;
  setBillingAddress: React.Dispatch<React.SetStateAction<BillingAddressState>>;
  cardError: string | null;
  setCardError: (val: string | null) => void;
}

export function detectCardBrand(num: string): string {
  const clean = num.replace(/\s+/g, '');
  if (/^4/.test(clean)) return 'VISA';
  if (/^(5[1-5]|2[2-7])/.test(clean)) return 'MASTERCARD';
  if (/^3[47]/.test(clean)) return 'AMEX';
  if (/^(6011|65|64[4-9])/.test(clean)) return 'DISCOVER';
  if (/^35/.test(clean)) return 'JCB';
  return 'GENERIC';
}

export function formatCardNumber(val: string): { formatted: string; brand: string } {
  const clean = val.replace(/\D/g, '');
  const brand = detectCardBrand(clean);

  let formatted = clean;
  if (brand === 'AMEX') {
    // 4-6-5 format (max 15)
    const trimmed = clean.slice(0, 15);
    const parts = [trimmed.slice(0, 4), trimmed.slice(4, 10), trimmed.slice(10, 15)].filter(Boolean);
    formatted = parts.join(' ');
  } else {
    // 4-4-4-4 format (max 16)
    const trimmed = clean.slice(0, 16);
    const parts = trimmed.match(/.{1,4}/g) || [];
    formatted = parts.join(' ');
  }

  return { formatted, brand };
}

export default function CreditCardTerminal({
  amountUsd,
  cardNumber,
  setCardNumber,
  cardHolder,
  setCardHolder,
  cardExpMonth,
  setCardExpMonth,
  cardExpYear,
  setCardExpYear,
  cardCvc,
  setCardCvc,
  detectedBrand,
  billingAddress,
  setBillingAddress,
  cardError,
  setCardError,
}: CreditCardTerminalProps) {
  const [showCvc, setShowCvc] = useState(false);

  const handleCardNumberChange = (raw: string) => {
    const { formatted } = formatCardNumber(raw);
    setCardNumber(formatted);
    if (cardError) setCardError(null);
  };

  const handleCvcChange = (raw: string) => {
    const clean = raw.replace(/\D/g, '');
    const maxLen = detectedBrand === 'AMEX' ? 4 : 3;
    setCardCvc(clean.slice(0, maxLen));
    if (cardError) setCardError(null);
  };

  return (
    <div className="space-y-6 pt-1 animate-fade-in">
      {/* 1. Header with Accepted Brands */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900 leading-tight">
              Direct Bank Card Terminal
            </h4>
            <p className="text-[11px] text-slate-500">
              Zero-fee instant settlement • 256-bit encrypted vault
            </p>
          </div>
        </div>

        {/* Brand Logos */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100/80 px-2.5 py-1 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 mr-1 uppercase">Accepted</span>
          <img src="/payments/visa.svg" alt="Visa" className="h-3.5 object-contain" />
          <img src="/payments/mastercard.svg" alt="Mastercard" className="h-3.5 object-contain" />
          <img src="/payments/amex.svg" alt="Amex" className="h-3.5 object-contain" />
          <span className="text-[9px] font-black text-amber-700 bg-amber-50 px-1 py-0.5 rounded border border-amber-200">
            DISCOVER
          </span>
        </div>
      </div>

      {/* 2. Interactive 3D Virtual Card Preview */}
      <div className="relative w-full max-w-sm mx-auto h-48 sm:h-52 rounded-2xl p-5 text-white shadow-xl overflow-hidden bg-gradient-to-tr from-slate-950 via-slate-900 to-emerald-950 border border-slate-700/60 transition-all select-none">
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-emerald-500/15 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />

        {/* Card Top Row: EMV Chip + Brand Badge */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-10 h-7 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 border border-amber-300/40 shadow-inner flex items-center justify-center relative overflow-hidden">
              <div className="w-full h-[1px] bg-amber-800/40 absolute top-2" />
              <div className="w-full h-[1px] bg-amber-800/40 absolute bottom-2" />
              <div className="h-full w-[1px] bg-amber-800/40 absolute left-3" />
              <div className="h-full w-[1px] bg-amber-800/40 absolute right-3" />
            </div>
            <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8.5 16.5a5 5 0 0 1 0-9" />
              <path d="M12 19a9 9 0 0 0 0-14" />
              <path d="M15.5 21.5a13 13 0 0 0 0-19" />
            </svg>
          </div>

          <div className="h-7 px-2.5 py-1 bg-white/95 rounded-lg flex items-center justify-center shadow-xs">
            {detectedBrand === 'VISA' && <img src="/payments/visa.svg" alt="Visa" className="h-4 object-contain" />}
            {detectedBrand === 'MASTERCARD' && <img src="/payments/mastercard.svg" alt="MasterCard" className="h-4 object-contain" />}
            {detectedBrand === 'AMEX' && <img src="/payments/amex.svg" alt="Amex" className="h-4 object-contain" />}
            {detectedBrand === 'DISCOVER' && <span className="text-[10px] font-black text-amber-700 tracking-wider">DISCOVER</span>}
            {detectedBrand === 'JCB' && <span className="text-[10px] font-black text-blue-700 tracking-wider">JCB</span>}
            {detectedBrand === 'GENERIC' && <CreditCard className="w-5 h-5 text-slate-800" />}
          </div>
        </div>

        {/* Live Formatted Card Number */}
        <div className="mt-6 sm:mt-7 relative z-10">
          <div className="font-mono text-base sm:text-lg tracking-[0.18em] font-bold drop-shadow-sm text-slate-100 truncate">
            {cardNumber || "•••• •••• •••• ••••"}
          </div>
        </div>

        {/* Card Bottom: Holder & Expiry */}
        <div className="mt-5 sm:mt-6 flex items-end justify-between relative z-10 text-xs">
          <div className="min-w-0 pr-2">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-sans">
              Cardholder Name
            </span>
            <span className="font-bold uppercase tracking-wider text-slate-200 text-xs truncate max-w-[180px] block font-mono">
              {cardHolder.trim() || billingAddress.fullName.trim() || "CARDHOLDER NAME"}
            </span>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-sans">
              Expires
            </span>
            <span className="font-mono font-bold text-slate-200 text-xs">
              {cardExpMonth}/{cardExpYear ? cardExpYear.slice(-2) : '28'}
            </span>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {cardError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-800 animate-shake">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{cardError}</span>
        </div>
      )}

      {/* 3. Card Input Fields */}
      <div className="space-y-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        {/* Cardholder Full Name */}
        <div className="space-y-1">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
            Cardholder Full Name:
          </label>
          <input
            type="text"
            value={cardHolder}
            onChange={(e) => {
              setCardHolder(e.target.value);
              if (!billingAddress.fullName) {
                setBillingAddress(prev => ({ ...prev, fullName: e.target.value }));
              }
              if (cardError) setCardError(null);
            }}
            placeholder="Johnathan Doe"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none text-xs sm:text-sm font-medium transition-all"
            autoComplete="cc-name"
          />
        </div>

        {/* Card Number */}
        <div className="space-y-1">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
            Card Number:
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 pointer-events-none text-slate-400">
              <CreditCard className="w-4 h-4" />
            </div>
            <input
              type="text"
              inputMode="numeric"
              value={cardNumber}
              onChange={(e) => handleCardNumberChange(e.target.value)}
              placeholder="4000 1234 5678 9010"
              className="w-full pl-10 pr-14 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none font-mono text-xs sm:text-sm font-bold tracking-wide transition-all"
              autoComplete="cc-number"
            />
            <div className="absolute right-3 pointer-events-none">
              {detectedBrand === 'VISA' && <img src="/payments/visa.svg" alt="Visa" className="h-4 object-contain" />}
              {detectedBrand === 'MASTERCARD' && <img src="/payments/mastercard.svg" alt="MasterCard" className="h-4 object-contain" />}
              {detectedBrand === 'AMEX' && <img src="/payments/amex.svg" alt="Amex" className="h-4 object-contain" />}
              {detectedBrand === 'DISCOVER' && <span className="text-[9px] font-black text-amber-700">DISCOVER</span>}
            </div>
          </div>
        </div>

        {/* Expiration Date & CVC */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Expiration Date Selector */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              Expiration Date:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={cardExpMonth}
                onChange={(e) => setCardExpMonth(e.target.value)}
                className="w-full px-2.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none text-xs font-semibold bg-white cursor-pointer"
              >
                <option value="01">01 - Jan</option>
                <option value="02">02 - Feb</option>
                <option value="03">03 - Mar</option>
                <option value="04">04 - Apr</option>
                <option value="05">05 - May</option>
                <option value="06">06 - Jun</option>
                <option value="07">07 - Jul</option>
                <option value="08">08 - Aug</option>
                <option value="09">09 - Sep</option>
                <option value="10">10 - Oct</option>
                <option value="11">11 - Nov</option>
                <option value="12">12 - Dec</option>
              </select>

              <select
                value={cardExpYear}
                onChange={(e) => setCardExpYear(e.target.value)}
                className="w-full px-2.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none text-xs font-semibold bg-white cursor-pointer"
              >
                {Array.from({ length: 14 }, (_, i) => 2025 + i).map((yr) => (
                  <option key={yr} value={yr.toString()}>{yr}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Security Code (CVC) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                Security Code (CVC):
              </label>
              <span className="text-[10px] text-slate-500 font-mono">
                {detectedBrand === 'AMEX' ? '4 digits front' : '3 digits back'}
              </span>
            </div>
            <div className="relative flex items-center">
              <input
                type={showCvc ? 'text' : 'password'}
                inputMode="numeric"
                maxLength={detectedBrand === 'AMEX' ? 4 : 3}
                value={cardCvc}
                onChange={(e) => handleCvcChange(e.target.value)}
                placeholder={detectedBrand === 'AMEX' ? "••••" : "•••"}
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none font-mono text-xs sm:text-sm font-bold tracking-widest transition-all"
                autoComplete="cc-csc"
              />
              <button
                type="button"
                onClick={() => setShowCvc(!showCvc)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                title={showCvc ? 'Hide CVC' : 'Show CVC'}
              >
                {showCvc ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Billing Address Section */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-800">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Cardholder Billing Address</span>
          </div>
          <span className="text-[10px] font-bold text-slate-400">AVS Verification</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600">
              Billing Full Legal Name
            </label>
            <input
              type="text"
              value={billingAddress.fullName}
              onChange={(e) => setBillingAddress(prev => ({ ...prev, fullName: e.target.value }))}
              placeholder="Full Legal Name"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none text-xs font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600">
              Receipt Email
            </label>
            <input
              type="email"
              value={billingAddress.email}
              onChange={(e) => setBillingAddress(prev => ({ ...prev, email: e.target.value }))}
              placeholder="donor@example.com"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none text-xs font-medium"
            />
          </div>

          <div className="sm:col-span-2 space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600">
              Street Address
            </label>
            <input
              type="text"
              value={billingAddress.street}
              onChange={(e) => setBillingAddress(prev => ({ ...prev, street: e.target.value }))}
              placeholder="123 Financial Way, Suite 400"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none text-xs font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600">
              City
            </label>
            <input
              type="text"
              value={billingAddress.city}
              onChange={(e) => setBillingAddress(prev => ({ ...prev, city: e.target.value }))}
              placeholder="New York"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none text-xs font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600">
                State / Region
              </label>
              <input
                type="text"
                value={billingAddress.state}
                onChange={(e) => setBillingAddress(prev => ({ ...prev, state: e.target.value }))}
                placeholder="NY"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none text-xs font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600">
                ZIP / Postal Code
              </label>
              <input
                type="text"
                value={billingAddress.zipCode}
                onChange={(e) => setBillingAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                placeholder="10001"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none text-xs font-medium font-mono"
              />
            </div>
          </div>

          <div className="sm:col-span-2 space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600">
              Country
            </label>
            <select
              value={billingAddress.country}
              onChange={(e) => setBillingAddress(prev => ({ ...prev, country: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none text-xs font-semibold bg-white cursor-pointer"
            >
              <option value="United States">United States</option>
              <option value="Canada">Canada</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Australia">Australia</option>
              <option value="Germany">Germany</option>
              <option value="France">France</option>
              <option value="Switzerland">Switzerland</option>
              <option value="Japan">Japan</option>
              <option value="Singapore">Singapore</option>
              <option value="International Other">International / Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Security Guarantee Footer */}
      <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-center gap-2.5 text-xs text-emerald-900">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
        <span className="leading-snug">
          <strong>Bank-Grade Authorization:</strong> Encrypted with TLS 1.3 and PCI-DSS Level 1 specifications. Zero surcharge for charitable contributions.
        </span>
      </div>
    </div>
  );
}

interface DigitalWalletsModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletName: string;
  onSwitchToCard: () => void;
}

export function DigitalWalletsModal({
  isOpen,
  onClose,
  walletName,
  onSwitchToCard,
}: DigitalWalletsModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-2xl space-y-5 relative"
        >
          {/* Close X */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Warning Icon & Badge */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center mx-auto shadow-xs">
              <AlertCircle className="w-6 h-6 stroke-[2]" />
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded-full border border-amber-300">
              Gateway Notice
            </span>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              {walletName} Under Scheduled Maintenance
            </h3>
          </div>

          {/* Body message */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-slate-600 leading-relaxed space-y-2">
            <p>
              The biometric tokenization server for <strong>{walletName}</strong> is undergoing scheduled infrastructure upgrades and compliance verification.
            </p>
            <p className="text-emerald-700 font-semibold flex items-center gap-1.5 pt-1 border-t border-slate-200">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Direct Credit & Debit Card processing is 100% active and operational.</span>
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                onClose();
                onSwitchToCard();
              }}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Pay With Credit / Debit Card Instead</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 text-slate-500 hover:text-slate-800 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

interface CardMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToCrypto: () => void;
  title?: string;
  contextText?: string;
}

export function CardMaintenanceModal({
  isOpen,
  onClose,
  onSwitchToCrypto,
  title = 'Credit Card Gateway Under Maintenance',
  contextText = 'Our card settlement clearinghouse is undergoing scheduled infrastructure upgrades and PCI-DSS compliance verification.',
}: CardMaintenanceModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-2xl space-y-5 relative"
        >
          {/* Close X */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Warning Icon & Badge */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center mx-auto shadow-xs">
              <ShieldAlert className="w-6 h-6 stroke-[2]" />
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded-full border border-amber-300">
              Scheduled Gateway Maintenance
            </span>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              {title}
            </h3>
          </div>

          {/* Reassuring zero charge statement */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold text-xs">
              ✓
            </div>
            <div className="text-xs text-emerald-900 font-bold">
              No charges have been made to your card.
            </div>
          </div>

          {/* Body message */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-slate-600 leading-relaxed space-y-2">
            <p>{contextText}</p>
            <p className="text-slate-700 font-medium">
              No funds have been debited from your account. Please complete your transaction with <strong>Instant Crypto</strong> (USDC, USDT, BTC, ETH, SOL) with <strong>0% processing fees</strong> and immediate confirmation.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                onClose();
                onSwitchToCrypto();
              }}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Coins className="w-4 h-4" />
              <span>Complete with Instant Crypto (0% Fee)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 text-slate-500 hover:text-slate-800 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
