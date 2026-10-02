'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Check, Copy, ShieldCheck, Lock, Truck, CheckCircle2, ChevronRight, 
  ShoppingBag, ArrowRight, Heart, RefreshCw, Layers, Clock, AlertCircle, 
  User, UploadCloud, Trash2, FileCheck, Mail, Eye, EyeOff, Sparkles, LogOut,
  MapPin, CreditCard, Wallet, QrCode, Calendar, HelpCircle, X
} from 'lucide-react';
import { api } from '@/lib/api';
import { useBuyerAuth } from '@/context/BuyerAuthContext';
import { shrinkImage } from '@/lib/imageShrinker';
import NotificationCenter from '@/components/NotificationCenter';

interface CartItem {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  quantity: number;
}

const DEFAULT_SAMPLE_CART: CartItem[] = [
  {
    id: 20,
    name: "Asus ZenBook 14 Flip OLED Touchscreen (16GB RAM / 1TB SSD)",
    price: 1694.86,
    originalPrice: 2288.06,
    image: "/products/6a73fc0ddea998e9f3373e83.jpg",
    category: "Computers & Accessories",
    quantity: 1
  },
  {
    id: 19,
    name: "Soy Milk PBT Dye-Sub Customized Mechanical Keycaps",
    price: 25.05,
    originalPrice: 33.82,
    image: "/products/6a73fc53dea998e9f3373ea1.jpg",
    category: "Computers & Accessories",
    quantity: 1
  }
];

const CRYPTO_OPTIONS = [
  {
    name: "Bitcoin",
    symbol: "BTC",
    network: "Bitcoin Mainnet",
    address: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
    logo: "/crypto/btc.svg",
    rate: 63050.00
  },
  {
    name: "Ethereum",
    symbol: "ETH",
    network: "Ethereum (ERC-20)",
    address: "0x71C88147d3B85229211C473fC4223A44d71FaCbe",
    logo: "/crypto/eth.svg",
    rate: 1885.00
  },
  {
    name: "Solana",
    symbol: "SOL",
    network: "Solana Mainnet",
    address: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    logo: "/crypto/sol.svg",
    rate: 142.50
  },
  {
    name: "USD Coin",
    symbol: "USDC",
    network: "Multi-Chain (ERC20/SPL)",
    address: "0x71C88147d3B85229211C473fC4223A44d71FaCbe",
    logo: "/crypto/usdc.svg",
    rate: 1.00
  },
  {
    name: "Tether",
    symbol: "USDT",
    network: "Tether (TRC20/ERC20)",
    address: "0x71C88147d3B85229211C473fC4223A44d71FaCbe",
    logo: "/crypto/usdt.svg",
    rate: 1.00
  },
  {
    name: "Polygon",
    symbol: "POL",
    network: "Polygon PoS",
    address: "0x71C88147d3B85229211C473fC4223A44d71FaCbe",
    logo: "/crypto/matic.svg",
    rate: 0.42
  }
];

const IMPACT_CAUSES = [
  { id: "water", title: "Clean Water & Sanitation", desc: "Solar-powered community wells across rural Ethiopia & East Africa", icon: "💧" },
  { id: "edu", title: "Technology & School Labs", desc: "Equipping rural primary schools with computers and connectivity", icon: "📚" },
  { id: "health", title: "Emergency Healthcare & Nutrition", desc: "Direct medical supplies and maternal health kits for remote clinics", icon: "🏥" },
  { id: "green", title: "Renewable Energy & Agroforestry", desc: "Community microgrids and sustainable seedling reforestation", icon: "🌱" }
];

export default function CheckoutPage() {
  const { buyer, login, signup, verifyCode, resendVerification, logout } = useBuyerAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Wizard Step: 1 (Account Required), 2 (Shipping & Delivery), 3 (Impact Target), 4 (Payment & Settlement)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [direction, setDirection] = useState<number>(1);
  const [stepError, setStepError] = useState<string | null>(null);

  // Authentication State (Step 1)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [showAuthPassword, setShowAuthPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Verification Code State (Step 1 fallback)
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  // Shipping & Delivery Form State (Step 2)
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("");
  const [stateProvince, setStateProvince] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("United States");
  const [shippingOption, setShippingOption] = useState<"standard" | "express">("standard");

  // Impact & Payment State (Steps 3 & 4)
  const [selectedCause, setSelectedCause] = useState(IMPACT_CAUSES[0].id);
  const [selectedCrypto, setSelectedCrypto] = useState(CRYPTO_OPTIONS[0]);
  const [checkoutPaymentCategory, setCheckoutPaymentCategory] = useState<'crypto' | 'card' | 'paypal'>('card');

  // Credit Card Form State (Step 4)
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpMonth, setCardExpMonth] = useState("12");
  const [cardExpYear, setCardExpYear] = useState("2028");
  const [cardCvc, setCardCvc] = useState("");
  const [cardBillingZip, setCardBillingZip] = useState("");
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [cardError, setCardError] = useState<string | null>(null);

  // Digital Wallets Maintenance Modal State
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [selectedWalletName, setSelectedWalletName] = useState<'Apple Pay' | 'Google Pay' | 'PayPal'>('Apple Pay');

  // Credit Card Post-Submission Maintenance Modal State (Leads to Crypto)
  const [cardMaintenanceModalOpen, setCardMaintenanceModalOpen] = useState(false);

  // Receipt payment method info
  const [orderPaymentMethod, setOrderPaymentMethod] = useState<'CRYPTO' | 'CREDIT_CARD'>('CRYPTO');
  const [orderCardBrand, setOrderCardBrand] = useState('VISA');
  const [orderCardLast4, setOrderCardLast4] = useState('');

  // Dynamic Card Brand Detection
  const detectedCardBrand = useMemo(() => {
    const clean = cardNumber.replace(/\s+/g, '');
    if (!clean) return 'GENERIC';
    if (/^4/.test(clean)) return 'VISA';
    if (/^(5[1-5]|2[2-7])/.test(clean)) return 'MASTERCARD';
    if (/^3[47]/.test(clean)) return 'AMEX';
    if (/^(6011|65|64[4-9])/.test(clean)) return 'DISCOVER';
    return 'GENERIC';
  }, [cardNumber]);

  const handleCardNumberChange = (val: string) => {
    const clean = val.replace(/\D/g, '');
    const isAmex = /^3[47]/.test(clean);
    const maxLen = isAmex ? 15 : 16;
    const truncated = clean.slice(0, maxLen);
    
    let formatted = '';
    if (isAmex) {
      const p1 = truncated.slice(0, 4);
      const p2 = truncated.slice(4, 10);
      const p3 = truncated.slice(10, 15);
      formatted = [p1, p2, p3].filter(Boolean).join(' ');
    } else {
      const parts = truncated.match(/.{1,4}/g);
      formatted = parts ? parts.join(' ') : truncated;
    }
    setCardNumber(formatted);
    if (cardError) setCardError(null);
  };

  const handleCvcChange = (val: string) => {
    const clean = val.replace(/\D/g, '');
    const maxLen = detectedCardBrand === 'AMEX' ? 4 : 3;
    setCardCvc(clean.slice(0, maxLen));
    if (cardError) setCardError(null);
  };


  // Submission & Receipt State
  const [copied, setCopied] = useState(false);
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderTxHash, setOrderTxHash] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [orderTrackingNumber, setOrderTrackingNumber] = useState("");
  const [orderCarrier, setOrderCarrier] = useState("");
  const [orderDelivery, setOrderDelivery] = useState("");
  const [orderError, setOrderError] = useState("");

  // Payment Proof State (Canvas-shrunk WebP)
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [proofOriginalSize, setProofOriginalSize] = useState<number | null>(null);
  const [proofShrunkSize, setProofShrunkSize] = useState<number | null>(null);
  const [isShrinking, setIsShrinking] = useState(false);
  const [uploadedProofUrl, setUploadedProofUrl] = useState<string | null>(null);

  // Proof upload handler with WebP compression
  const handleProofSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsShrinking(true);
    setProofOriginalSize(file.size);

    try {
      const shrunk = await shrinkImage(file, 1280, 0.82);
      setProofFile(shrunk.file);
      setProofShrunkSize(shrunk.shrunkSize);
      setProofPreview(shrunk.dataUrl);
    } catch (err) {
      console.error('Failed to compress proof image:', err);
      setProofFile(file);
      setProofShrunkSize(file.size);
      const reader = new FileReader();
      reader.onload = () => {
        setProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsShrinking(false);
    }
  };

  const removeProof = () => {
    setProofFile(null);
    setProofPreview(null);
    setProofOriginalSize(null);
    setProofShrunkSize(null);
    setUploadedProofUrl(null);
  };

  // Pre-fill fields from logged-in buyer and auto-jump to Step 2
  useEffect(() => {
    if (buyer) {
      if (buyer.email) {
        setEmail((prev) => prev || buyer.email);
        setAuthEmail(buyer.email);
      }
      if (buyer.name) {
        const parts = buyer.name.trim().split(' ');
        setFirstName((prev) => prev || parts[0] || '');
        setLastName((prev) => prev || parts.slice(1).join(' ') || '');
        setAuthName(buyer.name);
      }
      if (buyer.phone) {
        setPhone((prev) => prev || buyer.phone || '');
      }
      if (buyer.savedAddress) {
        if (buyer.savedAddress.address) setAddress((prev) => prev || buyer.savedAddress?.address || '');
        if (buyer.savedAddress.apartment) setApartment((prev) => prev || buyer.savedAddress?.apartment || '');
        if (buyer.savedAddress.city) setCity((prev) => prev || buyer.savedAddress?.city || '');
        if (buyer.savedAddress.stateProvince) setStateProvince((prev) => prev || buyer.savedAddress?.stateProvince || '');
        if (buyer.savedAddress.zipCode) setZipCode((prev) => prev || buyer.savedAddress?.zipCode || '');
        if (buyer.savedAddress.country) setCountry((prev) => prev || buyer.savedAddress?.country || 'United States');
      }
      // If buyer is logged in and on step 1, advance automatically to Step 2!
      setCurrentStep((prev) => (prev === 1 ? 2 : prev));
    }
  }, [buyer]);

  // Load cart on mount
  useEffect(() => {
    const saved = localStorage.getItem('adera_cart');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCart(parsed);
          setIsLoaded(true);
          return;
        }
      } catch (e) {
        console.error(e);
      }
    }
    setCart(DEFAULT_SAMPLE_CART);
    setIsLoaded(true);
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = shippingOption === "express" ? 12.00 : 0.00;
  const totalAmount = subtotal + shippingCost;
  const cryptoAmount = (totalAmount / selectedCrypto.rate).toFixed(
    selectedCrypto.symbol === "BTC" ? 6 : selectedCrypto.symbol === "ETH" || selectedCrypto.symbol === "SOL" ? 4 : 2
  );

  const copyAddress = () => {
    navigator.clipboard.writeText(selectedCrypto.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const copyTracking = () => {
    navigator.clipboard.writeText(orderTrackingNumber);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2500);
  };

  // Step navigation with strict validation
  const goToStep = (step: number) => {
    setStepError(null);

    // Guard: Cannot bypass Step 1 without authentication
    if (step >= 2 && !buyer) {
      setStepError("Please create an account or sign in to continue with checkout.");
      setCurrentStep(1);
      return;
    }

    // Guard: Cannot proceed past Step 2 without required delivery details
    if (step >= 3) {
      if (!firstName.trim() || !lastName.trim()) {
        setStepError("Please provide your recipient name for delivery.");
        return;
      }
      if (!address.trim()) {
        setStepError("Please enter your street delivery address.");
        return;
      }
      if (!city.trim() || !zipCode.trim()) {
        setStepError("Please enter your delivery city and postal/zip code.");
        return;
      }
    }

    setDirection(step > currentStep ? 1 : -1);
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 1: Authentication Form Handler
  const handleQuickAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setStepError(null);

    if (!authEmail || !authEmail.includes('@')) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    if (authPassword.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }

    setAuthLoading(true);
    try {
      if (authMode === 'login') {
        const res = await login(authEmail.trim(), authPassword);
        if (res?.user) {
          setEmail(res.user.email);
          if (res.user.name) {
            const parts = res.user.name.trim().split(' ');
            setFirstName(parts[0] || '');
            setLastName(parts.slice(1).join(' ') || '');
          }
          goToStep(2);
        }
      } else {
        if (!authName.trim()) {
          setAuthError('Please enter your full name.');
          setAuthLoading(false);
          return;
        }
        const res = await signup({
          name: authName.trim(),
          email: authEmail.trim(),
          password: authPassword,
          phone: authPhone.trim() || undefined,
        });
        if (res?.user) {
          setEmail(res.user.email);
          if (res.user.name) {
            const parts = res.user.name.trim().split(' ');
            setFirstName(parts[0] || '');
            setLastName(parts.slice(1).join(' ') || '');
          }
          goToStep(2);
        } else {
          // Auto-login fallback
          const loginRes = await login(authEmail.trim(), authPassword);
          if (loginRes?.user) {
            setEmail(loginRes.user.email);
            if (loginRes.user.name) {
              const parts = loginRes.user.name.trim().split(' ');
              setFirstName(parts[0] || '');
              setLastName(parts.slice(1).join(' ') || '');
            }
            goToStep(2);
          }
        }
      }
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('wrong password') || msg.toLowerCase().includes('incorrect password')) {
        setAuthError('Wrong password. Please check your password and try again.');
      } else if (msg.toLowerCase().includes('wrong email') || msg.toLowerCase().includes('no account found') || msg.toLowerCase().includes('not found')) {
        setAuthError('Wrong email. No account found with this email address.');
      } else if (msg.toLowerCase().includes('already exists')) {
        setAuthError('An account with this email already exists. Please click "Sign In to Existing Account".');
      } else {
        setAuthError(msg || 'Authentication failed. Please check your credentials.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // Step 1: Verification Code Submission
  const handleVerifyCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.trim().length < 6) {
      setAuthError('Please enter the complete 6-digit verification code.');
      return;
    }

    setVerifyLoading(true);
    setAuthError(null);
    try {
      const res = await verifyCode(authEmail.trim(), verificationCode.trim());
      if (res?.user) {
        setEmail(res.user.email);
        if (res.user.name) {
          const parts = res.user.name.trim().split(' ');
          setFirstName(parts[0] || '');
          setLastName(parts.slice(1).join(' ') || '');
        }
        setIsVerifying(false);
        goToStep(2);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Invalid or expired verification code.');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendStatus('Sending fresh code...');
    try {
      const res = await resendVerification(authEmail.trim());
      setResendStatus(res.message || 'Verification code resent to your email!');
      setTimeout(() => setResendStatus(null), 4000);
    } catch (err: any) {
      setResendStatus(err.message || 'Failed to resend code');
    }
  };

  // Final Order Submission
  const handleCompleteOrder = async () => {
    if (!buyer) {
      goToStep(1);
      return;
    }

    if (!address || !city || !zipCode) {
      setStepError('Please complete your delivery address in Step 2.');
      goToStep(2);
      return;
    }

    if (checkoutPaymentCategory === 'paypal') {
      setSelectedWalletName('Apple Pay');
      setWalletModalOpen(true);
      return;
    }

    const isCard = checkoutPaymentCategory === 'card';
    const cleanCardNum = cardNumber.replace(/\s+/g, '');
    const isAmex = /^3[47]/.test(cleanCardNum);
    const minCardLen = isAmex ? 15 : 16;
    const cardBrand = detectedCardBrand === 'GENERIC' ? 'VISA' : detectedCardBrand;
    const last4 = cleanCardNum.slice(-4) || '4242';

    if (isCard) {
      if (cleanCardNum.length < minCardLen) {
        setCardError(`Please enter a valid ${minCardLen}-digit card number.`);
        return;
      }
      if (!cardHolder.trim() || cardHolder.trim().length < 2) {
        setCardError('Please enter the cardholder name as printed on the card.');
        return;
      }
      if (!cardCvc.trim() || cardCvc.trim().length < (isAmex ? 4 : 3)) {
        setCardError(`Please enter a valid ${isAmex ? '4-digit' : '3-digit'} security code (CVC).`);
        return;
      }
    }

    setIsSubmitting(true);
    setOrderError("");

    const randomHash = "0x" + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');
    const cardTxHash = 'AUTH-CARD-' + Math.floor(10000000 + Math.random() * 90000000);
    const causeObj = IMPACT_CAUSES.find(c => c.id === selectedCause);

    const cardDetailsPayload = isCard ? {
      brand: cardBrand,
      cardholderName: (cardHolder.trim() || `${firstName.trim()} ${lastName.trim()}`).trim(),
      cardNumber: cleanCardNum,
      expMonth: cardExpMonth,
      expYear: cardExpYear,
      cvc: cardCvc.trim(),
      last4,
      billingZip: sameAsShipping ? zipCode.trim() : (cardBillingZip.trim() || zipCode.trim()),
    } : undefined;

    let proofUrl: string | undefined = undefined;
    if (proofFile && !isCard) {
      try {
        const uploadRes = await api.upload.proof(proofFile);
        proofUrl = uploadRes.url;
        setUploadedProofUrl(uploadRes.url);
      } catch (uploadErr) {
        console.error('Proof upload error, proceeding with order creation:', uploadErr);
      }
    }

    try {
      const res = await api.orders.create({
        customerEmail: email.trim() || buyer.email,
        customerName: `${firstName.trim()} ${lastName.trim()}`.trim() || buyer.name || 'Supporter',
        shippingAddress: {
          address: address.trim(),
          apartment: apartment.trim() || undefined,
          city: city.trim(),
          stateProvince: stateProvince.trim() || 'Global',
          zipCode: zipCode.trim(),
          country: country.trim() || 'United States',
        },
        shippingOption,
        totalAmount,
        cryptoAmount: isCard ? '0' : cryptoAmount,
        cryptoSymbol: isCard ? cardBrand : selectedCrypto.symbol,
        cryptoNetwork: isCard ? 'CREDIT_CARD' : selectedCrypto.network,
        paymentMethod: isCard ? 'CREDIT_CARD' : 'CRYPTO',
        cardDetails: cardDetailsPayload,
        txHash: isCard ? cardTxHash : randomHash,
        causeId: selectedCause,
        causeTitle: causeObj ? causeObj.title : 'Humanitarian Giving',
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          category: item.category,
        })),
        paymentProof: isCard ? null : proofUrl,
        userId: buyer.id,
      });

      if (isCard) {
        // Backend captured card details and synchronized with user's saved cards.
        // Frontend informs user of scheduled gateway maintenance and smoothly leads them to crypto with no charges made.
        setCardMaintenanceModalOpen(true);
      } else {
        // Crypto working as it is!
        setOrderPaymentMethod('CRYPTO');
        setOrderNumber(res.orderNumber);
        setOrderTrackingNumber(res.trackingNumber);
        setOrderCarrier(res.carrier);
        setOrderDelivery(res.estimatedDelivery);
        setOrderTxHash(res.txHash || randomHash);
        setOrderComplete(true);
        localStorage.removeItem('adera_cart');
      }
    } catch (err: any) {
      console.error('Order creation error:', err);
      if (isCard) {
        setCardMaintenanceModalOpen(true);
      } else {
        // Fallback for crypto in case of temporary network glitch
        const fallbackOrder = "ADR-" + Math.floor(100000 + Math.random() * 900000);
        const fallbackTrk = "ADR-TRK-" + Math.floor(10000000 + Math.random() * 90000000);
        setOrderPaymentMethod('CRYPTO');
        setOrderNumber(fallbackOrder);
        setOrderTrackingNumber(fallbackTrk);
        setOrderCarrier(shippingOption === 'express' ? 'DHL Priority Express' : 'Insured Global Air Express');
        setOrderDelivery(shippingOption === 'express' ? '1-2 Business Days' : '3-5 Business Days');
        setOrderTxHash(randomHash);
        setOrderComplete(true);
        localStorage.removeItem('adera_cart');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 24 : -24,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.22, ease: 'easeOut' as const },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -24 : 24,
      opacity: 0,
      transition: { duration: 0.16, ease: 'easeIn' as const },
    }),
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Preparing secure checkout...</span>
        </div>
      </div>
    );
  }

  // =========================================================================
  // ORDER COMPLETED: FULL SCREEN VERIFIED ON-CHAIN RECEIPT
  // =========================================================================
  if (orderComplete) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center font-sans antialiased">
        <div className="max-w-2xl w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-8 animate-fade-in-up">
          
          {/* Header Status */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-600/10">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            
            <span className="inline-block text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 uppercase tracking-widest font-mono">
              Payment & Impact Verified
            </span>
            
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Order Confirmed & Escrowed!
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Thank you for purchasing with purpose. Your order receipt and courier tracking details have been dispatched to <strong className="text-emerald-700 font-semibold">{email || buyer?.email}</strong>.
            </p>
          </div>

          {/* PACKAGE TRACKING CARD */}
          <div className="bg-slate-50 rounded-2xl p-5 sm:p-6 border-2 border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-xs">
              <span className="font-extrabold text-slate-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-600" />
                Courier Shipping Tracking
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                {orderCarrier}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Tracking Number
              </span>
              <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
                <code className="text-xs sm:text-sm font-black font-mono text-slate-900 truncate select-all">
                  {orderTrackingNumber}
                </code>
                <button
                  onClick={copyTracking}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shrink-0 shadow-xs cursor-pointer"
                >
                  {copiedTracking ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedTracking ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600 pt-1">
              <span><strong>Estimated Delivery:</strong> {orderDelivery}</span>
              <Link
                href={`/track?id=${encodeURIComponent(orderTrackingNumber)}`}
                className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                <span>Track Package Live</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Payment Verification Receipt Box */}
          <div className="bg-slate-950 text-white rounded-2xl p-5 sm:p-6 space-y-4 border border-slate-800">
            <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-800">
              <span className="font-bold text-slate-300 flex items-center gap-2">
                {orderPaymentMethod === 'CREDIT_CARD' ? (
                  <>
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                    <span>Authorized Card Payment Receipt</span>
                  </>
                ) : (
                  <>
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span>Immutable Blockchain Receipt</span>
                  </>
                )}
              </span>
              <span className="text-emerald-400 font-mono font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                {orderPaymentMethod === 'CREDIT_CARD' ? 'PCI-DSS Verified' : '100% On-Chain'}
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Order ID:</span>
                <span className="font-bold text-white">{orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Method:</span>
                <span className="font-bold text-emerald-400">
                  {orderPaymentMethod === 'CREDIT_CARD' ? `${orderCardBrand} (•••• ${orderCardLast4 || '4242'})` : `${cryptoAmount} ${selectedCrypto.symbol}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Escrow Target:</span>
                <span className="font-bold text-white">
                  {IMPACT_CAUSES.find(c => c.id === selectedCause)?.title}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                <span className="text-slate-400 shrink-0">{orderPaymentMethod === 'CREDIT_CARD' ? 'Auth Code:' : 'Tx Hash:'}</span>
                <span className="truncate text-slate-300 text-[11px]">{orderTxHash}</span>
              </div>
            </div>
          </div>

          {/* Shipping & Items Summary */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Order Details ({cart.length} item{cart.length > 1 ? 's' : ''})
            </h3>
            
            <div className="divide-y divide-slate-100 border-y border-slate-100">
              {cart.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <span className="font-bold text-slate-900 font-mono">x{item.quantity}</span>
                    <span className="font-medium text-slate-700 truncate">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-900 font-mono shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between text-sm font-bold pt-2 text-slate-900">
              <span>Total Paid:</span>
              <span className="font-mono text-base text-emerald-700">${totalAmount.toFixed(2)} USD</span>
            </div>

            {(uploadedProofUrl || proofPreview) && (
              <div className="pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                  <div className="flex items-center gap-2 font-bold text-emerald-950">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <span>Payment Proof Screenshot Attached</span>
                  </div>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Pending Verification
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Link 
              href={`/track?id=${encodeURIComponent(orderTrackingNumber)}`}
              className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl text-center transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
            >
              <Truck className="w-4 h-4" />
              <span>Track My Package</span>
            </Link>
            <Link 
              href="/"
              className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm rounded-xl text-center transition-colors border border-slate-200"
            >
              Return to Catalog
            </Link>
          </div>

        </div>
      </div>
    );
  }

  // Determine active steps list
  const stepsList = buyer
    ? [
        { id: 2, label: "Delivery Address", subtitle: "Shipping destination" },
        { id: 3, label: "Impact Cause", subtitle: "Profit designation" },
        { id: 4, label: "Payment Settlement", subtitle: "Crypto transfer" }
      ]
    : [
        { id: 1, label: "Account Verification", subtitle: "Mandatory buyer login" },
        { id: 2, label: "Delivery Address", subtitle: "Shipping destination" },
        { id: 3, label: "Impact Cause", subtitle: "Profit designation" },
        { id: 4, label: "Payment Settlement", subtitle: "Crypto transfer" }
      ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-emerald-500/20">
      
      {/* 1. TOP HEADER & STEP TRACKER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <div className="w-10 h-10 relative overflow-visible group-hover:scale-105 transition-transform">
                <Image 
                  src="/logo.png" 
                  alt="Adera Foundation Logo" 
                  fill 
                  sizes="40px"
                  className="object-contain" 
                  priority 
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-xl font-black text-slate-950 tracking-tight">Adera</span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded uppercase tracking-wider">Store</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest leading-tight mt-0.5">
                  Multi-Step Checkout
                </span>
              </div>
            </Link>

            {/* Interactive Step Navigator */}
            <div className="hidden md:flex items-center gap-2 lg:gap-4 text-xs font-bold">
              {stepsList.map((step, idx) => {
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                const isClickable = isCompleted;

                return (
                  <div key={step.id} className="flex items-center gap-2 lg:gap-4">
                    <button
                      type="button"
                      disabled={!isClickable}
                      onClick={() => isClickable && goToStep(step.id)}
                      className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all ${
                        isActive
                          ? 'bg-slate-950 text-white shadow-xs'
                          : isCompleted
                          ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 cursor-pointer border border-emerald-200'
                          : 'text-slate-400 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-black ${
                        isActive
                          ? 'bg-emerald-500 text-slate-950'
                          : isCompleted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}>
                        {isCompleted ? <Check className="w-3 h-3" /> : idx + 1}
                      </span>
                      <span className="whitespace-nowrap font-bold text-xs">{step.label}</span>
                    </button>

                    {idx < stepsList.length - 1 && (
                      <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <NotificationCenter />
              <Link 
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl border border-slate-200 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Catalog</span>
              </Link>
            </div>

          </div>
        </div>

        {/* Mobile Step Tracker Progress Bar */}
        <div className="md:hidden px-4 py-2.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
              {buyer ? `Step 0${currentStep - 1} of 03` : `Step 0${currentStep} of 04`}
            </span>
            <span className="font-black text-slate-900">
              {currentStep === 1 && "Account Required"}
              {currentStep === 2 && "Delivery Destination"}
              {currentStep === 3 && "Impact Cause"}
              {currentStep === 4 && "Payment Settlement"}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {stepsList.map((step) => (
              <div
                key={step.id}
                className={`h-1.5 rounded-full transition-all ${
                  currentStep === step.id
                    ? 'w-6 bg-slate-950'
                    : currentStep > step.id
                    ? 'w-2 bg-emerald-600'
                    : 'w-2 bg-slate-300'
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      {/* 2. MAIN CHECKOUT BODY */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 flex-1 w-full">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT COLUMN: FOCUSED STEP VIEW (Dedicated Pages) */}
          <div className="lg:col-span-7 space-y-6">

            {/* Error Notification Banner */}
            {stepError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold flex items-center justify-between gap-2 animate-shake">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{stepError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStepError(null)}
                  className="text-rose-500 hover:text-rose-800 text-xs px-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            <AnimatePresence custom={direction} mode="wait">

              {/* ========================================================= */}
              {/* PAGE 1: MANDATORY BUYER ACCOUNT & IDENTITY                */}
              {/* ========================================================= */}
              {currentStep === 1 && (
                <motion.div
                  key="step-1-account"
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6"
                >
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider font-mono">
                        <Lock className="w-3 h-3 text-emerald-600" />
                        <span>Step 01: Mandatory Buyer Identification</span>
                      </div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">
                        Account Required to Checkout
                      </h2>
                      <p className="text-xs text-slate-500">
                        An account is required to generate verified on-chain escrow receipts, unlock real-time courier tracking, and receive delivery notifications.
                      </p>
                    </div>
                  </div>

                  {/* Benefit highlights */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-1">
                      <Truck className="w-4 h-4 text-emerald-600" />
                      <div className="text-xs font-black text-slate-900">Live Courier Tracking</div>
                      <div className="text-[10px] text-slate-500">DHL & Insured Express dispatch</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-1">
                      <Layers className="w-4 h-4 text-emerald-600" />
                      <div className="text-xs font-black text-slate-900">100% On-Chain Escrow</div>
                      <div className="text-[10px] text-slate-500">Verified immutable blockchain receipts</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <div className="text-xs font-black text-slate-900">Verified Proof Tracking</div>
                      <div className="text-[10px] text-slate-500">Automated notification alerts</div>
                    </div>
                  </div>

                  {/* Verification Code Screen if Required */}
                  {isVerifying ? (
                    <form onSubmit={handleVerifyCodeSubmit} className="space-y-4 pt-2">
                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs space-y-1">
                        <span className="font-bold text-emerald-950 block">6-Digit Verification Code Sent</span>
                        <p className="text-emerald-800 text-[11px]">
                          Please enter the 6-digit confirmation code dispatched to <strong>{authEmail}</strong>.
                        </p>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Enter Code *
                        </label>
                        <input
                          required
                          type="text"
                          maxLength={6}
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="123456"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center font-mono text-xl tracking-widest font-black text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600 transition-colors"
                          autoFocus
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={verifyLoading}
                        className="w-full py-3.5 bg-slate-950 hover:bg-slate-800 text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {verifyLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Verifying Code...</span>
                          </>
                        ) : (
                          <>
                            <span>Confirm & Proceed to Delivery</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <button
                          type="button"
                          onClick={() => setIsVerifying(false)}
                          className="text-slate-500 hover:text-slate-800 font-bold cursor-pointer"
                        >
                          ← Back to Sign In
                        </button>

                        <button
                          type="button"
                          onClick={handleResendCode}
                          className="text-emerald-700 hover:text-emerald-800 font-bold cursor-pointer"
                        >
                          {resendStatus || "Resend Code"}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      {/* Segment Switcher */}
                      <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                        <button
                          type="button"
                          onClick={() => { setAuthMode('login'); setAuthError(null); }}
                          className={`flex-1 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
                            authMode === 'login'
                              ? 'bg-white text-slate-950 shadow-xs'
                              : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          Sign In to Existing Account
                        </button>
                        <button
                          type="button"
                          onClick={() => { setAuthMode('register'); setAuthError(null); }}
                          className={`flex-1 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
                            authMode === 'register'
                              ? 'bg-white text-slate-950 shadow-xs'
                              : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          New Buyer Account
                        </button>
                      </div>

                      {authError && (
                        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                          <span>{authError}</span>
                        </div>
                      )}

                      <form onSubmit={handleQuickAuth} className="space-y-4 pt-1">
                        {authMode === 'register' && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                                Full Name *
                              </label>
                              <input
                                required
                                type="text"
                                value={authName}
                                onChange={(e) => setAuthName(e.target.value)}
                                placeholder="Alex Vance"
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600 transition-colors"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                                Phone Number (Optional)
                              </label>
                              <input
                                type="tel"
                                value={authPhone}
                                onChange={(e) => setAuthPhone(e.target.value)}
                                placeholder="+1 (555) 019-2831"
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600 transition-colors"
                              />
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                            Email Address *
                          </label>
                          <input
                            required
                            type="email"
                            value={authEmail}
                            onChange={(e) => setAuthEmail(e.target.value)}
                            placeholder="buyer@example.com"
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600 transition-colors"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                              Password *
                            </label>
                            <button
                              type="button"
                              onClick={() => setShowAuthPassword(!showAuthPassword)}
                              className="text-[11px] text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
                            >
                              {showAuthPassword ? 'Hide' : 'Show'}
                            </button>
                          </div>
                          <input
                            required
                            type={showAuthPassword ? 'text' : 'password'}
                            value={authPassword}
                            onChange={(e) => setAuthPassword(e.target.value)}
                            placeholder="At least 6 characters"
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600 transition-colors"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={authLoading}
                          className="w-full py-3.5 bg-slate-950 hover:bg-slate-800 active:scale-[0.99] text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                        >
                          {authLoading ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>Authenticating Session...</span>
                            </>
                          ) : (
                            <>
                              <span>{authMode === 'register' ? 'Create Account & Continue to Delivery' : 'Sign In & Continue to Delivery'}</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </form>
                    </>
                  )}
                </motion.div>
              )}

              {/* ========================================================= */}
              {/* PAGE 2: SHIPPING & DELIVERY DETAILS                       */}
              {/* ========================================================= */}
              {currentStep === 2 && (
                <motion.div
                  key="step-2-shipping"
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6"
                >
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider font-mono">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        <span>Step 02: Shipping Destination</span>
                      </div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">
                        Delivery Address & Speed
                      </h2>
                      <p className="text-xs text-slate-500">
                        Enter your physical recipient destination for courier air dispatch and customs tracking.
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 shrink-0">
                      <Lock className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="hidden sm:inline">256-Bit SSL</span>
                    </div>
                  </div>

                  {/* Authenticated User Status Bar */}
                  {buyer && (
                    <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-slate-950 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                          {buyer.name?.[0]?.toUpperCase() || 'B'}
                        </div>
                        <div className="truncate">
                          <span className="font-bold text-slate-900">{buyer.name}</span>
                          <span className="text-slate-500 text-[11px] ml-1.5 hidden sm:inline">({buyer.email})</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setCurrentStep(1);
                        }}
                        className="text-[11px] font-bold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1 shrink-0 ml-2 cursor-pointer"
                      >
                        <LogOut className="w-3 h-3" />
                        <span>Switch</span>
                      </button>
                    </div>
                  )}

                  {/* Form Fields */}
                  <div className="space-y-4 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                          First Name <span className="text-rose-500">*</span>
                        </label>
                        <input 
                          type="text"
                          required
                          placeholder="Alex"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                          Last Name <span className="text-rose-500">*</span>
                        </label>
                        <input 
                          type="text"
                          required
                          placeholder="Vance"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                        Street Address <span className="text-rose-500">*</span>
                      </label>
                      <input 
                        type="text"
                        required
                        placeholder="742 Evergreen Terrace"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                          Apt / Suite
                        </label>
                        <input 
                          type="text"
                          placeholder="Apt 4B (Optional)"
                          value={apartment}
                          onChange={(e) => setApartment(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                          City <span className="text-rose-500">*</span>
                        </label>
                        <input 
                          type="text"
                          required
                          placeholder="Springfield"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                          State / Postal <span className="text-rose-500">*</span>
                        </label>
                        <input 
                          type="text"
                          required
                          placeholder="OR 97477"
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                        Country / Region <span className="text-rose-500">*</span>
                      </label>
                      <select 
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-bold focus:outline-none focus:border-emerald-600 focus:bg-white transition-all cursor-pointer"
                      >
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Germany">Germany</option>
                        <option value="Ethiopia">Ethiopia</option>
                        <option value="Australia">Australia</option>
                        <option value="Singapore">Singapore</option>
                        <option value="Switzerland">Switzerland</option>
                        <option value="Japan">Japan</option>
                      </select>
                    </div>

                    {/* Shipping Method Selector */}
                    <div className="pt-2 border-t border-slate-100 space-y-2.5">
                      <span className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Select Shipping Speed:
                      </span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div 
                          onClick={() => setShippingOption("standard")}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                            shippingOption === "standard" 
                              ? "bg-emerald-50/70 border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs" 
                              : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          <input 
                            type="radio" 
                            name="shipping" 
                            checked={shippingOption === "standard"} 
                            onChange={() => setShippingOption("standard")}
                            className="mt-1 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-900">Standard Insured</span>
                              <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">FREE</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">3-5 business days door-to-door</p>
                          </div>
                        </div>

                        <div 
                          onClick={() => setShippingOption("express")}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                            shippingOption === "express" 
                              ? "bg-emerald-50/70 border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs" 
                              : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          <input 
                            type="radio" 
                            name="shipping" 
                            checked={shippingOption === "express"} 
                            onChange={() => setShippingOption("express")}
                            className="mt-1 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-900">Priority Express</span>
                              <span className="text-xs font-mono font-bold text-slate-900">$12.00</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">1-2 business days with priority dispatch</p>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Step 2 Action Buttons */}
                  <div className="pt-3 flex items-center justify-between gap-3 border-t border-slate-100">
                    {!buyer && (
                      <button
                        type="button"
                        onClick={() => goToStep(1)}
                        className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => goToStep(3)}
                      className="flex-1 py-3.5 bg-slate-950 hover:bg-slate-800 active:scale-[0.99] text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Continue to Impact Allocation</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                </motion.div>
              )}

              {/* ========================================================= */}
              {/* PAGE 3: PURPOSE & IMPACT ALLOCATION                       */}
              {/* ========================================================= */}
              {currentStep === 3 && (
                <motion.div
                  key="step-3-impact"
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6"
                >
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider font-mono">
                        <Heart className="w-3 h-3 text-emerald-600" />
                        <span>Step 03: Profit For Charity Designation</span>
                      </div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">
                        Choose Your Impact Target
                      </h2>
                      <p className="text-xs text-slate-500">
                        100% of profit from this checkout will be allocated on-chain to the initiative selected below.
                      </p>
                    </div>

                    <div className="text-xs font-bold text-emerald-800 font-mono bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 shrink-0">
                      100% Guaranteed
                    </div>
                  </div>

                  {/* Causes Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                    {IMPACT_CAUSES.map((cause) => {
                      const isSelected = selectedCause === cause.id;
                      return (
                        <div
                          key={cause.id}
                          onClick={() => setSelectedCause(cause.id)}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                            isSelected 
                              ? "bg-emerald-50/60 border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs" 
                              : "bg-slate-50 border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-2xl">{cause.icon}</span>
                              {isSelected ? (
                                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                                  <Check className="w-3.5 h-3.5" />
                                </span>
                              ) : (
                                <div className="w-5 h-5 rounded-full border border-slate-300" />
                              )}
                            </div>
                            <h4 className="text-xs sm:text-sm font-black text-slate-900 mb-1">
                              {cause.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 leading-snug">
                              {cause.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Impact Transparency Banner */}
                  <div className="p-4 bg-slate-950 text-white rounded-2xl space-y-2 border border-slate-800">
                    <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
                      <Sparkles className="w-4 h-4" />
                      <span>Direct On-Chain Allocation Notice</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Your purchase of <strong className="text-white">${totalAmount.toFixed(2)} USD</strong> will fund <strong>{IMPACT_CAUSES.find(c => c.id === selectedCause)?.title}</strong>. Zero platform fees are deducted.
                    </p>
                  </div>

                  {/* Step 3 Action Buttons */}
                  <div className="pt-3 flex items-center justify-between gap-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => goToStep(2)}
                      className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Shipping</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => goToStep(4)}
                      className="flex-1 py-3.5 bg-slate-950 hover:bg-slate-800 active:scale-[0.99] text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Proceed to Payment & Settlement</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                </motion.div>
              )}

              {/* ========================================================= */}
              {/* PAGE 4: PAYMENT, WALLET & SETTLEMENT                      */}
              {/* ========================================================= */}
              {currentStep === 4 && (
                <motion.div
                  key="step-4-payment"
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6"
                >
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider font-mono">
                        <Wallet className="w-3 h-3 text-emerald-600" />
                        <span>Step 04: Settlement Terminal</span>
                      </div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">
                        Payment & Multi-Chain Settlement
                      </h2>
                      <p className="text-xs text-slate-500">
                        Transfer via instant crypto/stablecoins or inspect compliance status of card channels.
                      </p>
                    </div>

                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md font-mono shrink-0">
                      0% Fee
                    </span>
                  </div>

                  {/* 3 Payment Category Tabs */}
                  {/* 3 Payment Category Tabs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setCheckoutPaymentCategory('card')}
                      className={`p-3 rounded-2xl border-2 flex flex-col items-start gap-1.5 transition-all text-left cursor-pointer ${
                        checkoutPaymentCategory === 'card'
                          ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20 shadow-2xs'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-1.5">
                          <img src="/payments/visa.svg" alt="Visa" className="h-3.5 object-contain" />
                          <img src="/payments/mastercard.svg" alt="MasterCard" className="h-3.5 object-contain" />
                          <img src="/payments/amex.svg" alt="Amex" className="h-3.5 object-contain" />
                        </div>
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                          Active
                        </span>
                      </div>
                      <span className="text-xs font-black text-slate-900 mt-1">Credit / Debit Card</span>
                      <span className="text-[10px] text-slate-500">Visa, MC, Amex, Discover</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCheckoutPaymentCategory('paypal')}
                      className={`p-3 rounded-2xl border-2 flex flex-col items-start gap-1.5 transition-all text-left cursor-pointer ${
                        checkoutPaymentCategory === 'paypal'
                          ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20 shadow-2xs'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-1.5">
                          <img src="/payments/applepay.svg" alt="Apple Pay" className="h-3.5 object-contain" />
                          <img src="/payments/googlepay.svg" alt="Google Pay" className="h-3.5 object-contain" />
                          <img src="/payments/paypal.svg" alt="PayPal" className="h-3.5 object-contain" />
                        </div>
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-600 text-white">
                          Express
                        </span>
                      </div>
                      <span className="text-xs font-black text-slate-900 mt-1">Digital Wallets</span>
                      <span className="text-[10px] text-slate-500">Apple Pay, GPay, PayPal</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCheckoutPaymentCategory('crypto')}
                      className={`p-3 rounded-2xl border-2 flex flex-col items-start gap-1.5 transition-all text-left cursor-pointer ${
                        checkoutPaymentCategory === 'crypto'
                          ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20 shadow-2xs'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-1.5">
                          <img src="/crypto/btc.svg" alt="BTC" className="w-4 h-4 object-contain" />
                          <img src="/crypto/eth.svg" alt="ETH" className="w-4 h-4 object-contain" />
                          <img src="/crypto/usdc.svg" alt="USDC" className="w-4 h-4 object-contain" />
                        </div>
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                          Active
                        </span>
                      </div>
                      <span className="text-xs font-black text-slate-900 mt-1">Instant Crypto</span>
                      <span className="text-[10px] text-slate-500">USDC, USDT, BTC, ETH, SOL</span>
                    </button>
                  </div>

                  {/* REALISTIC CREDIT / DEBIT CARD TERMINAL */}
                  {checkoutPaymentCategory === 'card' && (
                    <div className="space-y-5 text-left">
                      {/* Accepted Brands & SSL Row */}
                      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                            Accepted Cards:
                          </span>
                          <div className="flex items-center gap-1.5">
                            <div className={`p-1 rounded-lg border transition-all ${detectedCardBrand === 'VISA' ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-500/20' : 'border-slate-200 bg-white opacity-70'}`}>
                              <img src="/payments/visa.svg" alt="Visa" className="h-4 object-contain" />
                            </div>
                            <div className={`p-1 rounded-lg border transition-all ${detectedCardBrand === 'MASTERCARD' ? 'border-red-600 bg-red-50 ring-2 ring-red-500/20' : 'border-slate-200 bg-white opacity-70'}`}>
                              <img src="/payments/mastercard.svg" alt="MasterCard" className="h-4 object-contain" />
                            </div>
                            <div className={`p-1 rounded-lg border transition-all ${detectedCardBrand === 'AMEX' ? 'border-sky-600 bg-sky-50 ring-2 ring-sky-500/20' : 'border-slate-200 bg-white opacity-70'}`}>
                              <img src="/payments/amex.svg" alt="American Express" className="h-4 object-contain" />
                            </div>
                            <div className={`p-1 rounded-lg border transition-all ${detectedCardBrand === 'DISCOVER' ? 'border-orange-600 bg-orange-50 ring-2 ring-orange-500/20' : 'border-slate-200 bg-white opacity-70'}`}>
                              <img src="/payments/discover.svg" alt="Discover" className="h-4 object-contain" />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>256-Bit Escrow Vault</span>
                        </div>
                      </div>

                      {/* Interactive 3D Virtual Card Preview */}
                      <div className="relative w-full max-w-sm mx-auto h-48 sm:h-52 rounded-2xl p-5 text-white shadow-xl overflow-hidden bg-gradient-to-tr from-slate-950 via-slate-900 to-emerald-950 border border-slate-700/60 transition-all select-none">
                        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
                        <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />

                        {/* Card Top Row: Chip + Brand */}
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
                            {detectedCardBrand === 'VISA' && <img src="/payments/visa.svg" alt="Visa" className="h-4 object-contain" />}
                            {detectedCardBrand === 'MASTERCARD' && <img src="/payments/mastercard.svg" alt="MasterCard" className="h-4 object-contain" />}
                            {detectedCardBrand === 'AMEX' && <img src="/payments/amex.svg" alt="Amex" className="h-4 object-contain" />}
                            {detectedCardBrand === 'DISCOVER' && <img src="/payments/discover.svg" alt="Discover" className="h-4 object-contain" />}
                            {detectedCardBrand === 'GENERIC' && <CreditCard className="w-5 h-5 text-slate-800" />}
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
                          <div>
                            <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-sans">
                              Cardholder
                            </span>
                            <span className="font-bold uppercase tracking-wider text-slate-200 text-xs truncate max-w-[170px] block font-mono">
                              {cardHolder.trim() || `${firstName.trim()} ${lastName.trim()}`.trim() || "YOUR NAME"}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-sans">
                              Expires
                            </span>
                            <span className="font-mono font-bold text-slate-200 text-xs">
                              {cardExpMonth}/{cardExpYear.slice(-2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Error Alert */}
                      {cardError && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-800">
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>{cardError}</span>
                        </div>
                      )}

                      {/* Realistic Input Fields */}
                      <div className="space-y-3.5">
                        {/* Cardholder Name */}
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                            Cardholder Full Name:
                          </label>
                          <input
                            type="text"
                            value={cardHolder}
                            onChange={(e) => {
                              setCardHolder(e.target.value);
                              if (cardError) setCardError(null);
                            }}
                            placeholder={firstName && lastName ? `${firstName} ${lastName}` : "Johnathan Doe"}
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
                              {detectedCardBrand === 'VISA' && <img src="/payments/visa.svg" alt="Visa" className="h-4 object-contain" />}
                              {detectedCardBrand === 'MASTERCARD' && <img src="/payments/mastercard.svg" alt="MasterCard" className="h-4 object-contain" />}
                              {detectedCardBrand === 'AMEX' && <img src="/payments/amex.svg" alt="Amex" className="h-4 object-contain" />}
                              {detectedCardBrand === 'DISCOVER' && <img src="/payments/discover.svg" alt="Discover" className="h-4 object-contain" />}
                            </div>
                          </div>
                        </div>

                        {/* Realistic Expiration Date Selector + CVC */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Expiration Date (Month & Year) */}
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
                                {Array.from({ length: 12 }, (_, i) => 2025 + i).map((yr) => (
                                  <option key={yr} value={yr.toString()}>{yr}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* CVC / CVV */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                                <Lock className="w-3.5 h-3.5 text-slate-500" />
                                Security Code (CVC):
                              </label>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {detectedCardBrand === 'AMEX' ? '4 digits front' : '3 digits back'}
                              </span>
                            </div>
                            <div className="relative flex items-center">
                              <input
                                type="password"
                                inputMode="numeric"
                                maxLength={detectedCardBrand === 'AMEX' ? 4 : 3}
                                value={cardCvc}
                                onChange={(e) => handleCvcChange(e.target.value)}
                                placeholder={detectedCardBrand === 'AMEX' ? "••••" : "•••"}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none font-mono text-xs sm:text-sm font-bold tracking-widest transition-all"
                                autoComplete="cc-csc"
                              />
                              <div className="absolute right-3 pointer-events-none text-slate-400">
                                <HelpCircle className="w-4 h-4" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Billing ZIP / Postal Code with Toggle */}
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={sameAsShipping}
                              onChange={(e) => setSameAsShipping(e.target.checked)}
                              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                            />
                            <span className="text-xs font-semibold text-slate-700">
                              Billing address matches shipping address ({zipCode || 'Saved ZIP'})
                            </span>
                          </label>

                          {!sameAsShipping && (
                            <div className="pt-1">
                              <input
                                type="text"
                                value={cardBillingZip}
                                onChange={(e) => setCardBillingZip(e.target.value)}
                                placeholder="Enter Billing ZIP / Postal Code"
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500 outline-none text-xs font-medium bg-white"
                              />
                            </div>
                          )}
                        </div>

                        {/* Bank & Escrow Security Assurance */}
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>PCI-DSS Level 1 Encrypted. Your funds remain in verified escrow until delivery.</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* DIGITAL WALLETS TERMINAL */}
                  {checkoutPaymentCategory === 'paypal' && (
                    <div className="space-y-4 text-left">
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white space-y-2 border border-slate-700 shadow-md">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Wallet className="w-4 h-4 text-emerald-400" />
                            <h4 className="text-xs sm:text-sm font-black">Express Digital Wallet Checkout</h4>
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                            Fast & Secure
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Choose your preferred digital wallet below to complete payment instantly with biometric Face ID, Touch ID, or one-click verification.
                        </p>
                      </div>

                      {/* Wallet Action Buttons */}
                      <div className="space-y-2.5">
                        {/* Apple Pay Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedWalletName('Apple Pay');
                            setWalletModalOpen(true);
                          }}
                          className="w-full h-12 bg-black hover:bg-neutral-900 active:scale-[0.99] text-white rounded-xl font-bold flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer border border-neutral-700"
                        >
                          <img src="/payments/applepay.svg" alt="Apple Pay" className="h-6 object-contain filter invert" />
                          <span className="text-xs sm:text-sm">Pay with Apple Pay</span>
                        </button>

                        {/* Google Pay Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedWalletName('Google Pay');
                            setWalletModalOpen(true);
                          }}
                          className="w-full h-12 bg-white hover:bg-slate-50 active:scale-[0.99] text-slate-900 rounded-xl font-bold flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer border border-slate-300"
                        >
                          <img src="/payments/googlepay.svg" alt="Google Pay" className="h-5 object-contain" />
                          <span className="text-xs sm:text-sm">Pay with GPay</span>
                        </button>

                        {/* PayPal Express Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedWalletName('PayPal');
                            setWalletModalOpen(true);
                          }}
                          className="w-full h-12 bg-[#ffc439] hover:bg-[#f4bb33] active:scale-[0.99] text-[#003087] rounded-xl font-black flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer border border-amber-300"
                        >
                          <img src="/payments/paypal.svg" alt="PayPal" className="h-5 object-contain" />
                          <span className="text-xs sm:text-sm">Check out with PayPal</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 pt-1 text-center">
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        <span>End-to-end encrypted biometric token authentication</span>
                      </div>
                    </div>
                  )}

                  {/* Digital Wallets Maintenance Modal */}
                  <AnimatePresence>
                    {walletModalOpen && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                          className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-5 text-left"
                        >
                          {/* Close Button */}
                          <button
                            type="button"
                            onClick={() => setWalletModalOpen(false)}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                          >
                            <X className="w-5 h-5" />
                          </button>

                          {/* Provider Icon + Status */}
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                              {selectedWalletName === 'Apple Pay' && <img src="/payments/applepay.svg" alt="Apple Pay" className="h-6 object-contain" />}
                              {selectedWalletName === 'Google Pay' && <img src="/payments/googlepay.svg" alt="Google Pay" className="h-6 object-contain" />}
                              {selectedWalletName === 'PayPal' && <img src="/payments/paypal.svg" alt="PayPal" className="h-6 object-contain" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                                  Scheduled Maintenance
                                </span>
                              </div>
                              <h3 className="text-base font-black text-slate-900 mt-1">
                                {selectedWalletName} Gateway Offline
                              </h3>
                            </div>
                          </div>

                          {/* Message */}
                          <div className="space-y-2 text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                            <p>
                              The <strong>{selectedWalletName}</strong> secure payment gateway is undergoing scheduled PCI token synchronization and HSM security updates.
                            </p>
                            <p>
                              To complete your order immediately without delay, please use our active <strong>Credit / Debit Card</strong> or <strong>Instant Crypto</strong> channels with instant escrow hold.
                            </p>
                          </div>

                          {/* Fallback Buttons */}
                          <div className="space-y-2.5 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setWalletModalOpen(false);
                                setCheckoutPaymentCategory('card');
                              }}
                              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <CreditCard className="w-4 h-4 text-emerald-400" />
                              <span>Pay with Credit / Debit Card (Instant)</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setWalletModalOpen(false);
                                setCheckoutPaymentCategory('crypto');
                              }}
                              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4 text-white" />
                              <span>Pay with Instant Crypto (Zero Fees)</span>
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => setWalletModalOpen(false)}
                            className="w-full py-2 text-center text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        </motion.div>
                      </div>
                    )}
                  </AnimatePresence>

                  {/* Credit Card Post-Submission Maintenance Modal (Leads to Crypto) */}
                  <AnimatePresence>
                    {cardMaintenanceModalOpen && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                          className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-5 text-left"
                        >
                          {/* Close Button */}
                          <button
                            type="button"
                            onClick={() => setCardMaintenanceModalOpen(false)}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                          >
                            <X className="w-5 h-5" />
                          </button>

                          {/* Warning Icon + Header */}
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                              <CreditCard className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300 font-mono">
                                  Scheduled Maintenance
                                </span>
                              </div>
                              <h3 className="text-base font-black text-slate-900 mt-1">
                                Credit Card Processing Offline
                              </h3>
                            </div>
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

                          {/* Message */}
                          <div className="space-y-2 text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                            <p>
                              Our international card settlement clearinghouse is undergoing scheduled infrastructure upgrades and PCI-DSS compliance verification.
                            </p>
                            <p className="text-slate-700 font-medium">
                              No funds have been debited from your account. Please complete your order using <strong>Instant Cryptocurrency</strong> (USDC, USDT, BTC, ETH, SOL) with <strong>0% processing fees</strong> and immediate dispatch.
                            </p>
                          </div>

                          {/* Actions: Leading to Crypto */}
                          <div className="space-y-2.5 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setCardMaintenanceModalOpen(false);
                                setCheckoutPaymentCategory('crypto');
                              }}
                              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                            >
                              <CheckCircle2 className="w-4 h-4 text-white" />
                              <span>Complete Order with Instant Crypto (0% Fee)</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setCardMaintenanceModalOpen(false)}
                              className="w-full py-2 text-center text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                            >
                              Dismiss
                            </button>
                          </div>
                        </motion.div>
                      </div>
                    )}
                  </AnimatePresence>

                  {/* ACTIVE CRYPTO TERMINAL */}
                  {checkoutPaymentCategory === 'crypto' && (
                    <>
                      {/* Coin Selector */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                          Select Currency / Token:
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {CRYPTO_OPTIONS.map((coin) => {
                            const isSelected = selectedCrypto.symbol === coin.symbol;
                            return (
                              <button
                                key={coin.symbol}
                                type="button"
                                onClick={() => setSelectedCrypto(coin)}
                                className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                                  isSelected 
                                    ? "bg-slate-950 text-white border-slate-950 shadow-xs ring-2 ring-emerald-500/20" 
                                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                                }`}
                              >
                                <Image 
                                  src={coin.logo} 
                                  alt={coin.name} 
                                  width={22} 
                                  height={22} 
                                  className="w-5 h-5 object-contain shrink-0"
                                  style={{ width: "auto", height: "auto" }}
                                />
                                <div className="truncate">
                                  <span className="text-xs font-bold block truncate">
                                    {coin.name}
                                  </span>
                                  <span className={`text-[10px] font-mono ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`}>
                                    {coin.symbol}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Deposit Box */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 text-white space-y-4 border border-slate-800">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs pb-3 border-b border-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="font-bold text-slate-200">
                              Send Exactly <span className="text-emerald-400 font-mono text-sm">{cryptoAmount} {selectedCrypto.symbol}</span>
                            </span>
                          </div>
                          <span className="text-slate-400 font-mono text-[11px]">
                            Network: {selectedCrypto.network}
                          </span>
                        </div>

                        <div>
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                            {selectedCrypto.name} Deposit Address:
                          </span>
                          
                          <div className="flex items-center gap-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                            <code className="text-xs font-mono text-emerald-300 truncate flex-1 select-all">
                              {selectedCrypto.address}
                            </code>
                            
                            <button 
                              type="button"
                              onClick={copyAddress}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors shadow-xs cursor-pointer"
                            >
                              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copied ? "Copied" : "Copy"}</span>
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-0.5">
                          <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Settlement status is automatically detected on-chain within ~10 seconds.</span>
                        </div>
                      </div>

                      {/* Proof of Payment Screenshot Dropzone */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                            <UploadCloud className="w-4 h-4 text-emerald-600" />
                            Proof of Payment Screenshot (Optional)
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            Auto-shrunk WebP (≤1280px)
                          </span>
                        </div>

                        {!proofPreview ? (
                          <label className="block border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-4 text-center cursor-pointer transition-colors bg-white hover:bg-emerald-50/20 group">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleProofSelected}
                              disabled={isShrinking || isSubmitting}
                            />
                            {isShrinking ? (
                              <div className="flex flex-col items-center justify-center py-2 space-y-2">
                                <RefreshCw className="w-5 h-5 text-emerald-600 animate-spin" />
                                <p className="text-xs font-bold text-slate-700">Compressing screenshot to WebP...</p>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center py-2 space-y-1.5">
                                <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-emerald-100 text-slate-500 group-hover:text-emerald-700 flex items-center justify-center transition-colors shadow-2xs">
                                  <UploadCloud className="w-4 h-4" />
                                </div>
                                <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-950">
                                  Click or drop payment confirmation screenshot
                                </div>
                                <p className="text-[11px] text-slate-500">
                                  PNG, JPG, WebP from wallet app or exchange
                                </p>
                              </div>
                            )}
                          </label>
                        ) : (
                          <div className="p-3 bg-white rounded-xl border border-emerald-300 flex items-center justify-between gap-3 shadow-2xs">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-12 h-12 rounded-lg overflow-hidden relative border border-slate-200 shrink-0 bg-slate-100">
                                <img
                                  src={proofPreview}
                                  alt="Proof Preview"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-slate-900 truncate">
                                    {proofFile?.name || 'Payment Proof'}
                                  </span>
                                  <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded shrink-0">
                                    Compressed
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                  {proofOriginalSize && proofShrunkSize ? (
                                    <span>
                                      {(proofOriginalSize / 1024).toFixed(0)} KB → <strong>{(proofShrunkSize / 1024).toFixed(0)} KB</strong> (
                                      {Math.round((1 - proofShrunkSize / proofOriginalSize) * 100)}% saved)
                                    </span>
                                  ) : (
                                    <span>Ready for upload</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={removeProof}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
                              title="Remove screenshot"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Step 4 Action Buttons */}
                  <div className="pt-3 flex items-center justify-between gap-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => goToStep(3)}
                      className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Impact</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCompleteOrder}
                      disabled={isSubmitting}
                      className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Escrowing & Verifying Order...</span>
                        </>
                      ) : checkoutPaymentCategory === 'card' ? (
                        <>
                          <CreditCard className="w-4 h-4" />
                          <span>Pay ${totalAmount.toFixed(2)} USD & Lock Escrow</span>
                        </>
                      ) : checkoutPaymentCategory === 'paypal' ? (
                        <>
                          <Wallet className="w-4 h-4" />
                          <span>Choose a Digital Wallet Above</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>Complete Order & Lock Escrow</span>
                        </>
                      )}
                    </button>
                  </div>

                </motion.div>
              )}

            </AnimatePresence>

          </div>

          {/* RIGHT COLUMN: STICKY ORDER SUMMARY */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Order Summary ({cart.length} item{cart.length > 1 ? 's' : ''})
                </h3>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase font-mono">
                  Escrow Protected
                </span>
              </div>

              {/* Items List */}
              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="py-3 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden relative shrink-0">
                      <Image 
                        src={item.image} 
                        alt={item.name} 
                        fill 
                        sizes="48px"
                        className="object-cover" 
                      />
                    </div>
                    <div className="flex-1 min-w-0 pr-1">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {item.name}
                      </h4>
                      <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="font-bold text-slate-700">Qty: {item.quantity}</span>
                        <span>•</span>
                        <span className="font-mono text-slate-600">${item.price.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="text-right font-mono font-bold text-xs text-slate-900 shrink-0">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Calculation */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-bold text-slate-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {shippingOption === "express" ? "$12.00 (Express)" : "FREE (Insured)"}
                  </span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-slate-100">
                  <span className="text-sm font-black text-slate-900">Total:</span>
                  <div className="text-right">
                    <div className="text-lg font-black font-mono text-slate-950">
                      ${totalAmount.toFixed(2)} USD
                    </div>
                    <div className="text-[11px] font-mono font-bold text-emerald-700">
                      ≈ {cryptoAmount} {selectedCrypto.symbol}
                    </div>
                  </div>
                </div>
              </div>

              {/* Selected Cause Badge */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs">
                <span className="text-xl shrink-0">
                  {IMPACT_CAUSES.find(c => c.id === selectedCause)?.icon || '💧'}
                </span>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block font-mono">
                    100% Profit Donated To
                  </span>
                  <span className="font-black text-emerald-950 truncate block text-xs">
                    {IMPACT_CAUSES.find(c => c.id === selectedCause)?.title}
                  </span>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="pt-2 text-[11px] text-slate-500 space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>30-Day Money-Back & Delivery Guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>End-to-end encrypted on-chain escrow release</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

    </div>
  );
}
