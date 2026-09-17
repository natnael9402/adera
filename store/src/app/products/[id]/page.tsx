'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Heart, ShoppingBag, ShoppingCart, Star, ShieldCheck, 
  Truck, CheckCircle2, ArrowRight, Award, Check, 
  Share2, ArrowUpRight
} from 'lucide-react';
import ShopTierBanner from '@/components/ShopTierBanner';
import { MASTER_CATALOG_PRODUCTS, Product } from '@/lib/products-catalog';

interface CartItem extends Product {
  quantity: number;
}

interface CausePreview {
  id: number;
  title: string;
  category: string;
  goal: number;
  raised: number;
  image: string;
  urgency: string;
}

const FEATURED_CAUSES_SAMPLE: CausePreview[] = [
  {
    id: 19,
    title: "Build a Rural School in Tigray",
    category: "Education",
    goal: 45000,
    raised: 38250,
    image: "/causes/cause_school_1786200448807.jpg",
    urgency: "Urgent"
  },
  {
    id: 25,
    title: "Clean Water Well for Somali Region",
    category: "Clean Water",
    goal: 60000,
    raised: 49200,
    image: "/causes/cause_water_1786200462466.jpg",
    urgency: "Critical"
  },
  {
    id: 33,
    title: "Solar Water Filtration Well in Dire Dawa",
    category: "Clean Water",
    goal: 18000,
    raised: 12500,
    image: "/causes/cause_clinic_1786200473696.jpg",
    urgency: "Almost There"
  }
];

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = Number(params?.id);

  const [product, setProduct] = useState<Product | null>(() => {
    if (productId) {
      return MASTER_CATALOG_PRODUCTS.find((p) => p.id === productId) || MASTER_CATALOG_PRODUCTS[0];
    }
    return MASTER_CATALOG_PRODUCTS[0];
  });
  const [quantity, setQuantity] = useState(1);
  const [copiedLink, setCopiedLink] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [featuredCauses, setFeaturedCauses] = useState<CausePreview[]>(FEATURED_CAUSES_SAMPLE);
  const [portalUrl, setPortalUrl] = useState(process.env.NEXT_PUBLIC_APP_URL || 'https://aderafoundation.com');

  useEffect(() => {
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      setPortalUrl('http://localhost:3005');
    }

    const apiBase = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:5001/api'
      : (process.env.NEXT_PUBLIC_API_URL || 'https://api.aderafoundation.com/api');

    fetch(`${apiBase}/posts`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: CausePreview[] = data.slice(0, 3).map((p: any) => ({
            id: p.id,
            title: p.title,
            category: p.category || 'Humanitarian',
            goal: Number(p.goal) || 20000,
            raised: p.raised !== undefined ? Number(p.raised) : Math.round((Number(p.goal) || 20000) * 0.45),
            image: p.image || '/causes/cause_water_1786200462466.jpg',
            urgency: p.urgency || 'Urgent'
          }));
          setFeaturedCauses(mapped);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    // 1. Locate product from Master Catalog or Backend API
    const found = MASTER_CATALOG_PRODUCTS.find((p) => p.id === productId);
    if (found) {
      setProduct(found);
    } else {
      const apiBase = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:5001/api'
        : (process.env.NEXT_PUBLIC_API_URL || 'https://api.aderafoundation.com/api');

      fetch(`${apiBase}/products/${productId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data && data.id && data.name) {
            setProduct(data);
          } else if (MASTER_CATALOG_PRODUCTS.length > 0) {
            setProduct(MASTER_CATALOG_PRODUCTS[0]);
          }
        })
        .catch(() => {
          if (MASTER_CATALOG_PRODUCTS.length > 0) {
            setProduct(MASTER_CATALOG_PRODUCTS[0]);
          }
        });
    }

    // 2. Sync cart count from localStorage
    try {
      const savedCart = localStorage.getItem('reseller_cart');
      if (savedCart) {
        const parsed: CartItem[] = JSON.parse(savedCart);
        const total = parsed.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(total);
      }
    } catch {
      setCartCount(0);
    }

    // 3. Sync wishlist
    try {
      const savedWishlist = localStorage.getItem('store_wishlist');
      if (savedWishlist) {
        const ids: number[] = JSON.parse(savedWishlist);
        setIsWishlisted(ids.includes(productId));
      }
    } catch {}
  }, [productId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddToCart = () => {
    if (!product) return;
    try {
      const existing = localStorage.getItem('reseller_cart');
      let cart: CartItem[] = existing ? JSON.parse(existing) : [];
      const index = cart.findIndex((i) => i.id === product.id);

      if (index > -1) {
        cart[index].quantity += quantity;
      } else {
        cart.push({ ...product, quantity });
      }

      localStorage.setItem('reseller_cart', JSON.stringify(cart));
      const total = cart.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(total);
      showToast(`${product.name} added to cart!`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  const toggleWishlist = () => {
    if (!product) return;
    try {
      const saved = localStorage.getItem('store_wishlist');
      let list: number[] = saved ? JSON.parse(saved) : [];
      if (list.includes(product.id)) {
        list = list.filter((id) => id !== product.id);
        setIsWishlisted(false);
        showToast('Removed from saved items');
      } else {
        list.push(product.id);
        setIsWishlisted(true);
        showToast('Saved to wishlist');
      }
      localStorage.setItem('store_wishlist', JSON.stringify(list));
    } catch {}
  };

  const copyShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-sm w-full">
          <ShoppingBag className="w-10 h-10 text-slate-400 mx-auto animate-pulse" />
          <p className="text-sm font-bold text-slate-700">Loading product details...</p>
        </div>
      </div>
    );
  }

  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-950 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Shop Tier Ribbon */}
      <ShopTierBanner />

      {/* Sticky Main Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 px-3 py-2 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Store</span>
            </Link>

            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
              <span>/</span>
              <span className="text-slate-600 font-medium">{product.category}</span>
              <span>/</span>
              <span className="text-slate-900 font-bold truncate max-w-[200px]">{product.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={copyShare}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              title="Share Link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>

            <Link
              href="/checkout"
              className="relative inline-flex items-center gap-2 bg-slate-950 hover:bg-slate-800 text-white px-4 py-2 rounded-xl font-bold text-xs transition-colors shadow-xs"
            >
              <ShoppingCart className="w-4 h-4 text-emerald-400" />
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="bg-emerald-500 text-slate-950 text-[10px] font-black rounded-full px-1.5 py-0.2">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full space-y-12">
        
        {/* Product Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Product Imagery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-sm">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />

              {discountPercent > 0 && (
                <div className="absolute top-4 left-4 bg-rose-600 text-white font-mono font-bold text-xs px-2.5 py-1 rounded-lg shadow-sm">
                  Save {discountPercent}%
                </div>
              )}

              <button
                onClick={toggleWishlist}
                className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isWishlisted 
                    ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-sm' 
                    : 'bg-white/90 backdrop-blur-md text-slate-600 hover:text-rose-600 shadow-sm'
                }`}
                title="Save to Wishlist"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-600' : ''}`} />
              </button>
            </div>

            {/* Quality Seals Strip */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white p-3 rounded-2xl border border-slate-200 text-center space-y-1">
                <Truck className="w-4 h-4 text-emerald-600 mx-auto" />
                <p className="text-[11px] font-bold text-slate-900 leading-tight">Priority Shipping</p>
                <p className="text-[10px] text-slate-400">3-5 Business Days</p>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-slate-200 text-center space-y-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto" />
                <p className="text-[11px] font-bold text-slate-900 leading-tight">Factory Sealed</p>
                <p className="text-[10px] text-slate-400">Full Warranty</p>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-slate-200 text-center space-y-1">
                <Award className="w-4 h-4 text-emerald-600 mx-auto" />
                <p className="text-[11px] font-bold text-slate-900 leading-tight">100% Impact</p>
                <p className="text-[10px] text-slate-400">Direct Cause Funds</p>
              </div>
            </div>
          </div>

          {/* Right Column: Product Meta & Purchase Box */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                {product.category}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                Verified Authentic
              </span>
              {product.sku && (
                <span className="text-[10px] font-mono text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                  {product.sku}
                </span>
              )}
            </div>

            {/* Title & Brand */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                {product.name}
              </h1>
              {product.brand && (
                <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-medium">
                  Manufactured by <strong className="text-slate-800">{product.brand}</strong>
                </p>
              )}
            </div>

            {/* Star Rating & Social Proof */}
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1 text-amber-500 font-bold font-mono">
                <Star className="w-4 h-4 fill-amber-500" />
                <span>{product.rating || 4.8}</span>
              </div>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600 font-medium font-mono">{product.sold || 340} verified deliveries</span>
              <span className="text-slate-300">•</span>
              <span className="text-emerald-700 font-bold">In Stock</span>
            </div>

            {/* Price Box */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono">
                  ${product.price.toFixed(2)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-base text-slate-400 line-through font-mono">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  100% Profits Fund Causes
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Taxes included. Free insured international priority shipping applied at checkout.
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Overview</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {product.description}
              </p>
            </div>

            {/* Quantity Selector & Action Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-slate-200 bg-white rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-slate-600 hover:bg-slate-100 font-bold text-sm"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 font-mono font-bold text-xs text-slate-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-slate-600 hover:bg-slate-100 font-bold text-sm"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-3 bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4 text-slate-900" />
                  <span>Add to Cart</span>
                </button>
              </div>

              <button
                onClick={handleBuyNow}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Buy Now with Direct Cause Funding</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Technical Specifications */}
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div className="pt-4 border-t border-slate-200 space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Specifications</h3>
                <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 text-xs overflow-hidden">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2.5 px-4 font-mono">
                      <span className="text-slate-500 font-medium">{key}</span>
                      <span className="text-slate-900 font-bold text-right truncate max-w-[240px]">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* ========================================================================= */}
        {/* DIRECT DONATION CALLOUT: CONNECT SHOPPING DIRECTLY TO FOUNDATION CAUSES  */}
        {/* ========================================================================= */}
        <section className="bg-slate-950 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 space-y-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-emerald-400 border border-slate-800 text-[11px] font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Direct Humanitarian Giving</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Want to Support Causes Directly?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
                Buying from this shop contributes 100% of profits to verified humanitarian projects. If you prefer to make a direct contribution, browse active causes on the Adera Foundation portal.
              </p>
            </div>

            <a
              href={`${portalUrl}/causes`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white text-slate-950 hover:bg-slate-100 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs shrink-0 active:scale-95"
            >
              <span>Explore All Causes</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>

          {/* Featured Causes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {featuredCauses.map((cause) => {
              const pct = Math.min(100, Math.round((cause.raised / cause.goal) * 100));
              return (
                <div
                  key={cause.id}
                  className="bg-slate-900 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between hover:border-emerald-500/50 transition-all space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase">
                      <span className="text-emerald-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {cause.category}
                      </span>
                      <span className="text-slate-400 font-mono">
                        {pct}% Funded
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-2">
                      {cause.title}
                    </h3>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] font-mono text-slate-400">
                        <span className="text-emerald-400 font-bold">${cause.raised.toLocaleString()}</span>
                        <span>Goal: ${cause.goal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <a
                    href={`${portalUrl}/causes/${cause.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs rounded-xl border border-slate-800 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Heart className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Donate to This Cause</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                </div>
              );
            })}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Adera Store. Verified E-Commerce for Direct Philanthropy.</p>
      </footer>
    </div>
  );
}
