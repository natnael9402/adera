'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { Store, Award, ShoppingCart, CheckCircle2, ShieldCheck, Star, Heart, ArrowLeft, Globe, RefreshCw, Layers, ExternalLink, Truck, Lock, ArrowUpRight, MessageSquare } from 'lucide-react';
import { api } from '@/lib/api';
import ShopTierBanner from '@/components/ShopTierBanner';
import TierMedal from '@/components/TierMedal';
import StoreAvatar from '@/components/StoreAvatar';

export default function ResellerStorefrontPage() {
  const params = useParams();
  const router = useRouter();
  const handle = params?.handle as string;

  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cart & Wishlist state
  const [cart, setCart] = useState<any[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Message modal state
  const [showMsgModal, setShowMsgModal] = useState(false);
  const [msgSender, setMsgSender] = useState('');
  const [msgSubject, setMsgSubject] = useState('');
  const [msgContent, setMsgContent] = useState('');
  const [isSendingMsg, setIsSendingMsg] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgSender || !msgSubject || !msgContent) return;
    setIsSendingMsg(true);
    try {
      await api.resellers.sendMessage({
        handle: shop.handle,
        sender: msgSender.trim(),
        subject: msgSubject.trim(),
        content: msgContent.trim(),
      });
      setShowMsgModal(false);
      setMsgSender('');
      setMsgSubject('');
      setMsgContent('');
      showToast('Message sent to store owner successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to send message');
    } finally {
      setIsSendingMsg(false);
    }
  };

  useEffect(() => {
    const savedCart = localStorage.getItem('adera_store_cart');
    if (savedCart) {
      try { setCart(JSON.parse(savedCart)); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (handle) {
      loadShopData(handle);
    }
  }, [handle]);

  const loadShopData = async (shopHandle: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.resellers.getPublicShopByHandle(shopHandle);
      setShop(data);
    } catch (err: any) {
      setError(err.message || 'Shop not found');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const addToCart = (product: any, customPrice: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      let updated;
      if (existing) {
        updated = prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        updated = [...prev, { ...product, price: customPrice, resellerShop: shop?.name, quantity: 1 }];
      }
      localStorage.setItem('adera_store_cart', JSON.stringify(updated));
      return updated;
    });
    showToast(`Added ${product.name} to cart!`);
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-bold text-emerald-400">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading Storefront...</span>
        </div>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-4 max-w-md shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <Store className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-black text-slate-900">Shop Not Found</h2>
          <p className="text-xs text-slate-500">{error || 'The requested reseller shop does not exist or is inactive.'}</p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors"
          >
            Return to Main Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <ShopTierBanner />

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-fade-in-up">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-xl" title="Back to All Goods">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 relative">
                <Image src="/logo.png" alt="Logo" fill className="object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black text-slate-900 leading-tight">Adera Store</span>
                <span className="text-[10px] font-bold text-emerald-700 uppercase">Verified Reseller</span>
              </div>
            </Link>
          </div>

          {/* Cart Button */}
          <Link
            href="/checkout"
            className="inline-flex items-center gap-2.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <div className="relative">
              <ShoppingCart className="w-4 h-4" />
              {cartTotalItems > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-slate-900 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {cartTotalItems}
                </span>
              )}
            </div>
            <span className="font-mono">${cartSubtotal.toFixed(2)}</span>
          </Link>

        </div>
      </header>

      {/* Branded Storefront Hero Banner */}
      <section className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white py-10 sm:py-14 px-4 sm:px-6 border-b border-slate-800 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <StoreAvatar
              name={shop.name}
              avatar={shop.logo}
              tier={shop.tier}
              size="xl"
            />

            <div className="space-y-2.5">
              
              {/* Tier Pill */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase bg-slate-800 border border-slate-700 text-white shadow-xs">
                  <TierMedal tier={shop.tier} size="xs" />
                  <span>{shop.tier} Level Reseller</span>
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Philanthropic Reseller</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                {shop.name}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-normal leading-relaxed">
                {shop.description || 'Welcome to our official curated catalog. Every purchase is protected by smart-contract crypto escrow and directly finances clean water and education causes.'}
              </p>

              <div className="flex items-center gap-4 text-xs text-slate-400 pt-1 font-medium">
                <span>📦 <strong>{shop.products?.length || 0}</strong> Items Listed</span>
                <span>•</span>
                <span>⚡ <strong>{shop.totalSales || 0}</strong> Orders Dispatched</span>
                <span>•</span>
                <span>🛡️ Multi-Chain Crypto Escrow</span>
              </div>

            </div>
          </div>

            {/* Tier Seal Showcase & Quick Reseller Action Link */}
            <div className="bg-slate-800/80 p-5 rounded-3xl border border-slate-700 space-y-3 text-xs text-center shrink-0 w-full sm:w-auto flex flex-col items-center">
              <TierMedal tier={shop.tier} size="lg" />
              <div className="space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Verified Storefront</span>
                <code className="text-emerald-400 font-mono font-bold bg-slate-900 px-3 py-1 rounded-lg block">
                  @{shop.handle}
                </code>
              </div>
              <button
                type="button"
                onClick={() => setShowMsgModal(true)}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Contact Store</span>
              </button>
            </div>

          </div>
        </section>

        {/* CONTACT SELLER MODAL */}
        {showMsgModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-fade-in-up text-left">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-black text-slate-900">Message {shop.name}</h3>
                </div>
                <button onClick={() => setShowMsgModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  ✕
                </button>
              </div>

              <form onSubmit={handleSendMessage} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Your Name / Handle</label>
                  <input
                    required
                    type="text"
                    value={msgSender}
                    onChange={(e) => setMsgSender(e.target.value)}
                    placeholder="e.g. Alex (Buyer)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Subject</label>
                  <input
                    required
                    type="text"
                    value={msgSubject}
                    onChange={(e) => setMsgSubject(e.target.value)}
                    placeholder="Inquiry about item specifications or bulk delivery"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Message Content</label>
                  <textarea
                    required
                    rows={4}
                    value={msgContent}
                    onChange={(e) => setMsgContent(e.target.value)}
                    placeholder="Write your message to the merchant here..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 resize-none font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSendingMsg}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  {isSendingMsg ? <span>Sending Message...</span> : <span>Send Message to Store</span>}
                </button>
              </form>
            </div>
          </div>
        )}

      {/* Catalog Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-6">
        
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900">Curated Goods by {shop.name}</h2>
            <p className="text-xs text-slate-500">
              Showing {shop.products?.length || 0} verified items available for instant multi-chain crypto delivery.
            </p>
          </div>
        </div>

        {(!shop.products || shop.products.length === 0) ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
            <p className="text-sm font-bold text-slate-700">No active products listed in this storefront yet.</p>
            <Link href="/" className="text-xs font-bold text-emerald-700 hover:underline">
              Browse Main Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {shop.products.map((item: any) => {
              const product = item.product;
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md hover:border-emerald-300 transition-all group"
                >
                  <div>
                    {/* Image */}
                    <div className="relative w-full h-48 bg-slate-100 overflow-hidden">
                      <Image
                        src={product.image || '/logo.png'}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-xs">
                        {product.category}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{product.rating || 4.9}</span>
                        <span className="text-slate-400 font-normal">({product.sold || 40}+ sold)</span>
                      </div>

                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                        {product.name}
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-2">
                        {product.description}
                      </p>

                      <div className="pt-2 flex items-baseline gap-2">
                        <span className="text-base sm:text-lg font-black text-slate-900 font-mono">
                          ${item.customPrice.toFixed(2)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs text-slate-400 line-through font-mono">
                            ${product.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Add to Cart */}
                  <div className="p-4 pt-0">
                    <button
                      onClick={() => addToCart(product, item.customPrice)}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-extrabold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Add to Cart</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
}
