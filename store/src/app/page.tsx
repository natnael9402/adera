'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ShoppingCart, User, Menu, X, ChevronRight, Star, Zap, ShieldCheck, Truck, HeadphonesIcon, Smartphone, Laptop, Shirt, Watch, Home, Heart, ArrowRight, Check, Copy, ExternalLink, Filter, ShoppingBag, Lock, RefreshCw, Eye, Layers, CheckCircle2, ArrowUpRight, Award, Compass, Store, Plus } from 'lucide-react';
import ShopTierBanner from '@/components/ShopTierBanner';
import StoreAvatar from '@/components/StoreAvatar';
import TierMedal from '@/components/TierMedal';
import { api } from '@/lib/api';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  brand?: string;
  sku?: string;
  source?: string;
  specs?: Record<string, string>;
  stock?: number;
  rating?: number;
  sold?: number;
}

interface CartItem extends Product {
  quantity: number;
}

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 20,
    name: "Asus ZenBook 14 Flip OLED Touchscreen (16GB RAM / 1TB SSD)",
    description: "Ultra-portable performance laptop with 14-inch WQHD OLED touchscreen, Ryzen 7 processor, and dual-fan cooling system.",
    price: 1694.86,
    originalPrice: 2288.06,
    image: "/products/6a73fc0ddea998e9f3373e83.jpg",
    category: "Computers & Accessories",
    rating: 4.9,
    sold: 142
  },
  {
    id: 19,
    name: "Soy Milk PBT Dye-Sub Customized Mechanical Keycaps (136 Keys)",
    description: "Thick premium PBT keycap set with XDA profile, beautiful retro soy-milk colorway, and broad switch compatibility.",
    price: 25.05,
    originalPrice: 33.82,
    image: "/products/6a73fc53dea998e9f3373ea1.jpg",
    category: "Computers & Accessories",
    rating: 4.8,
    sold: 389
  },
  {
    id: 18,
    name: "Anti-Oxidation Portable Jewelry Storage Case (20 Pcs Set)",
    description: "Dust-proof transparent sealed film organizers for delicate necklaces, rings, and heirloom pieces.",
    price: 1.18,
    originalPrice: 1.59,
    image: "/products/6a740008dea998e9f3373fb3.jpg",
    category: "Jewelry & Accessories",
    rating: 4.6,
    sold: 812
  },
  {
    id: 16,
    name: "SPRING High-Capacity Multi-Stage Water Filter Replacement Cartridge",
    description: "Advanced filtration core removing 99.9% of micro-contaminants, heavy metals, and chlorine.",
    price: 179.86,
    originalPrice: 242.81,
    image: "/products/6a740216dea998e9f337440f.jpg",
    category: "Home & Garden",
    rating: 4.9,
    sold: 215
  },
  {
    id: 15,
    name: "Deep Tissue Percussion Muscle Massage Gun (6 Speeds)",
    description: "Ergonomic handheld therapeutic massager with quiet glide brushless motor and interchangeable attachments.",
    price: 13.99,
    originalPrice: 18.89,
    image: "/products/6a740252dea998e9f3374439.jpg",
    category: "Sports & Outdoors",
    rating: 4.7,
    sold: 520
  },
  {
    id: 14,
    name: "Daiwa BG SW Heavy-Duty Saltwater Spinning Reel",
    description: "Hard-anodized machined aluminum housing, DigiGear system, and waterproof drag for extreme saltwater angling.",
    price: 182.32,
    originalPrice: 246.13,
    image: "/products/6a740264dea998e9f3374466.jpg",
    category: "Sports & Outdoors",
    rating: 4.9,
    sold: 96
  },
  {
    id: 13,
    name: "15.6-inch 1080P Ultra-Slim USB-C & Mini-HDMI Portable Monitor",
    description: "IPS HDR external display with dual stereo speakers for laptops, smartphones, and mobile workstations.",
    price: 140.24,
    originalPrice: 189.32,
    image: "/products/6a7402d3dea998e9f3374496.jpg",
    category: "Computers & Accessories",
    rating: 4.8,
    sold: 340
  },
  {
    id: 12,
    name: "Samsung 24-inch SR350 Bezel-Less IPS LED Monitor",
    description: "75Hz refresh rate with AMD FreeSync, ultra-slim bezel, and flicker-free eye saver mode.",
    price: 119.68,
    originalPrice: 161.57,
    image: "/products/6a7402e6dea998e9f33744c9.jpg",
    category: "Computers & Accessories",
    rating: 4.7,
    sold: 450
  },
  {
    id: 6,
    name: "Nike Air Max 270 Women's Lightweight Comfort Sneakers",
    description: "Engineered mesh upper with large volume Max Air heel unit for responsive all-day cushioning.",
    price: 65.21,
    originalPrice: 87.68,
    image: "/products/6a7525e82ce46d1a75a319c1.jpg",
    category: "Women's Shoes",
    rating: 4.8,
    sold: 630
  },
  {
    id: 4,
    name: "Xiaomi Robot Vacuum X10+ with Smart Auto-Clean Dock",
    description: "Dual-spinning pressurized mop pads, 4000Pa suction power, and S-Cross 3D obstacle avoidance sensor.",
    price: 882.88,
    originalPrice: 1191.89,
    image: "/products/6a7527592ce46d1a75a31a54.jpg",
    category: "Home & Garden",
    rating: 4.9,
    sold: 110
  },
  {
    id: 2,
    name: "PHILIPS 6.2L Digital Airfryer XL with Rapid Air Technology",
    description: "12-in-1 healthy cooking appliance with NutriU app connectivity, touch preset panel, and dishwasher-safe basket.",
    price: 208.49,
    originalPrice: 281.46,
    image: "/products/6a7527fc2ce46d1a75a31aed.jpg",
    category: "Home & Garden",
    rating: 4.8,
    sold: 290
  },
  {
    id: 1,
    name: "LEGO Star Wars Emperor's Throne Room Diorama Set (75352)",
    description: "Detailed collectible building model featuring Darth Vader, Luke Skywalker, and Emperor Palpatine.",
    price: 135.83,
    originalPrice: 183.37,
    image: "/products/6a75284d2ce46d1a75a31b3d.jpg",
    category: "Toys, Hobbies & Robot",
    rating: 4.9,
    sold: 180
  }
];

const CRYPTO_PAYMENT_OPTIONS = [
  {
    name: "Bitcoin",
    symbol: "BTC",
    network: "Bitcoin Network",
    address: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
    logo: "/crypto/btc.svg"
  },
  {
    name: "Ethereum",
    symbol: "ETH",
    network: "Ethereum (ERC-20)",
    address: "0x71C88147d3B85229211C473fC4223A44d71FaCbe",
    logo: "/crypto/eth.svg"
  },
  {
    name: "Solana",
    symbol: "SOL",
    network: "Solana Mainnet",
    address: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    logo: "/crypto/sol.svg"
  },
  {
    name: "USD Coin",
    symbol: "USDC",
    network: "Multi-Chain (ERC20 / SPL)",
    address: "0x71C88147d3B85229211C473fC4223A44d71FaCbe",
    logo: "/crypto/usdc.svg"
  },
  {
    name: "Tether",
    symbol: "USDT",
    network: "Tether (TRC20 / ERC20)",
    address: "0x71C88147d3B85229211C473fC4223A44d71FaCbe",
    logo: "/crypto/usdt.svg"
  },
  {
    name: "Polygon",
    symbol: "POL",
    network: "Polygon PoS",
    address: "0x71C88147d3B85229211C473fC4223A44d71FaCbe",
    logo: "/crypto/matic.svg"
  }
];

export default function StoreHome() {
  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedSource, setSelectedSource] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCrypto, setSelectedCrypto] = useState(CRYPTO_PAYMENT_OPTIONS[0]);
  const [copied, setCopied] = useState(false);
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [resellerShops, setResellerShops] = useState<any[]>([]);
  const [displayLimit, setDisplayLimit] = useState<number>(48);

  // Load cart from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('adera_cart');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setCart(parsed);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem('adera_cart', JSON.stringify(cart));
  }, [cart]);

  // Fetch backend products & reseller shops
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.aderafoundation.com/api';
    fetch(`${apiUrl}/products`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        const items = Array.isArray(data) ? data : data?.items || [];
        if (items.length > 0) {
          setProducts(items);
        }
      })
      .catch((err) => {
        console.warn('Direct fetch failed, trying api.products.list():', err);
        api.products.list()
          .then(data => {
            const items = Array.isArray(data) ? data : (data as any)?.items || [];
            if (items.length > 0) setProducts(items);
          })
          .catch(() => {});
      });

    api.resellers.getPublicShops()
      .then(shops => {
        if (Array.isArray(shops)) {
          setResellerShops(shops);
        }
      })
      .catch(() => {});
  }, []);

  // Extract unique categories and counts
  const { categories, categoryCounts } = useMemo(() => {
    const counts: Record<string, number> = { All: products.length };
    const set = new Set<string>();
    products.forEach(p => {
      if (p.category) {
        set.add(p.category);
        counts[p.category] = (counts[p.category] || 0) + 1;
      }
    });
    return {
      categories: ["All", ...Array.from(set)],
      categoryCounts: counts,
    };
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return products
      .filter(p => {
        const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
        const matchesSource = selectedSource === "All" || p.source === selectedSource;
        const matchesSearch = !q || 
          p.name.toLowerCase().includes(q) || 
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p.sku && p.sku.toLowerCase().includes(q));

        return matchesCategory && matchesSource && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return a.price - b.price;
        if (sortBy === "price-high") return b.price - a.price;
        if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
        if (sortBy === "popular") return (b.sold || 0) - (a.sold || 0);
        return 0;
      });
  }, [products, selectedCategory, selectedSource, searchQuery, sortBy]);

  // Cart operations
  const addToCart = (product: Product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
    showToast(`Added "${product.name.slice(0, 24)}..." to cart`);
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => 
      prev
        .map(item => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const toggleWishlist = (id: number) => {
    setWishlist(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const estimatedImpactDonation = (cartSubtotal * 1.0).toFixed(2); // 100% of profit/store proceeds

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* 0. Top Shop Tier Reseller Bar (Based on Reference Image) */}
      <ShopTierBanner />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-fade-in-up">
          <CheckCircle2 className="w-5 h-5 text-primary-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* 1. Global Announcement Top Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
            <span className="text-white font-semibold">100% of Store Proceeds</span>
            <span className="hidden md:inline text-slate-400">directly fund verified humanitarian causes</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-primary-400 font-mono font-bold hidden sm:inline">⚡ Direct Multi-Currency Checkout</span>
            <a 
              href={process.env.NEXT_PUBLIC_APP_URL || "https://aderafoundation.com"} 
              className="text-white hover:text-primary-400 font-semibold underline underline-offset-4 transition-colors inline-flex items-center gap-1"
            >
              Main Portal
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* 2. Main Store Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4 sm:gap-8">
            
            {/* Official Logo */}
            <Link href="/" className="flex items-center gap-3 shrink-0 group">
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
                  <span className="text-xl font-bold text-slate-900 tracking-tight">Adera</span>
                  <span className="text-[10px] font-bold text-primary-700 bg-primary-50 border border-primary-200 px-1.5 py-0.5 rounded uppercase tracking-wider">Store</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest leading-tight mt-0.5">
                  Foundation
                </span>
              </div>
            </Link>

            {/* Live Search Bar */}
            <div className="flex-1 max-w-xl hidden md:block">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search laptops, monitors, accessories, home & outdoors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:bg-white transition-all"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs bg-slate-200 w-5 h-5 rounded-full flex items-center justify-center"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Actions: Wishlist, Return to Causes, Cart */}
            <div className="flex items-center gap-3">
              <a 
                href={`${process.env.NEXT_PUBLIC_APP_URL || "https://aderafoundation.com"}/causes`} 
                className="hidden lg:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200"
              >
                <Compass className="w-3.5 h-3.5 text-primary-600" />
                View Causes
              </a>

              {/* Cart Button */}
              <button 
                onClick={() => setIsCartOpen(true)}
                className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-primary-600/20 group"
              >
                <div className="relative">
                  <ShoppingCart className="w-5 h-5 text-white" />
                  {cartTotalItems > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-slate-900 text-white text-[10px] font-black rounded-full flex items-center justify-center border border-white">
                      {cartTotalItems}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline font-mono">
                  ${cartSubtotal.toFixed(2)}
                </span>
              </button>
            </div>

          </div>

          {/* Mobile Search Bar */}
          <div className="pb-4 md:hidden">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-8 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        {/* 3. Category Navigation Strip */}
        <div className="border-t border-slate-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 py-3 overflow-x-auto no-scrollbar">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                const count = categoryCounts[cat] || 0;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      isActive 
                        ? "bg-slate-900 text-white shadow-sm" 
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/90"
                    }`}
                  >
                    <span>{cat === "All" ? "All Products" : cat}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      isActive ? "bg-white/20 text-white" : "bg-slate-200/70 text-slate-600"
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* 4. Mobile-Optimized Hero Banner: Direct-to-Impact E-Commerce */}
      <section className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white border-b border-slate-800 py-6 sm:py-10 lg:py-14 relative overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-6 lg:gap-10 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-3.5 sm:space-y-5">
              
              {/* Micro Status Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>100% Proceeds Fund Causes</span>
              </div>

              {/* Punchy Headline */}
              <h1 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
                Shop Premium Goods. <br className="hidden xs:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                  Fund Global Causes
                </span>.
              </h1>

              {/* Crisp Subtext */}
              <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-xl font-normal leading-relaxed line-clamp-2 sm:line-clamp-none">
                Every purchase automatically routes 100% of proceeds into verified clean water, education, and humanitarian relief projects worldwide.
              </p>

              {/* Action Buttons & Micro Crypto Strip */}
              <div className="pt-1 flex flex-col sm:flex-row sm:items-center gap-3">
                <a
                  href="#catalog"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-emerald-600/25"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Browse Products</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>

                <Link
                  href="/track"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-bold text-xs sm:text-sm rounded-xl transition-colors border border-slate-700"
                >
                  <Truck className="w-4 h-4 text-emerald-400" />
                  <span>Track Package</span>
                </Link>
              </div>

              {/* Accepted Payment Channels */}
              <div className="pt-2 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                  Accepted Payments:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 border border-white/10">
                    <img src="/payments/visa.svg" alt="Visa" className="h-3.5 object-contain" />
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 border border-white/10">
                    <img src="/payments/mastercard.svg" alt="MasterCard" className="h-3.5 object-contain" />
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 border border-white/10">
                    <img src="/payments/paypal.svg" alt="PayPal" className="h-3.5 object-contain" />
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 border border-white/10">
                    <img src="/payments/applepay.svg" alt="Apple Pay" className="h-3.5 object-contain" />
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 text-[11px] font-bold text-slate-200">
                    <span>Multi-Currency</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right: Modern Responsive Spotlight Deal Card */}
            <div className="lg:col-span-5">
              <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-700/80 p-4 sm:p-5 space-y-3 shadow-xl">
                
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                    <Award className="w-3.5 h-3.5 text-emerald-400" />
                    Spotlight Deal
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold text-[10px] font-mono">
                    100% Impact Verified
                  </span>
                </div>

                <div className="flex gap-3 sm:gap-4 items-center bg-slate-900/80 p-3 sm:p-3.5 rounded-xl border border-slate-700/60">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-slate-800 shrink-0 border border-slate-700">
                    <Image 
                      src="/products/6a73fc0ddea998e9f3373e83.jpg" 
                      alt="ZenBook" 
                      fill 
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                      Asus ZenBook 14 Flip OLED Touch
                    </h4>
                    <p className="text-[11px] text-emerald-400 font-medium truncate mt-0.5">
                      Donates ~$1,694 to education
                    </p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-sm sm:text-base font-black text-emerald-400 font-mono">$1,694.86</span>
                      <span className="text-[10px] sm:text-xs text-slate-500 line-through font-mono">$2,288.06</span>
                    </div>
                  </div>

                  {/* Mobile Quick Add Button */}
                  <button
                    onClick={() => {
                      addToCart(FALLBACK_PRODUCTS[0]);
                      showToast("Asus ZenBook added to cart!");
                    }}
                    className="sm:hidden p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md shrink-0 active:scale-95"
                    title="Add to Cart"
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>

                {/* Desktop Quick Add Button */}
                <button 
                  onClick={() => {
                    addToCart(FALLBACK_PRODUCTS[0]);
                    showToast("Asus ZenBook added to cart!");
                  }}
                  className="hidden sm:flex w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md items-center justify-center gap-2 active:scale-95"
                >
                  <ShoppingCart className="w-4 h-4" /> 
                  <span>Quick Add Spotlight Item</span>
                </button>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. Product Catalog & Filter Toolbar */}
      <main id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full scroll-mt-20 space-y-10">
        
        {/* Reseller Verified Storefronts Ribbon */}
        {resellerShops.length > 0 && (
          <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 rounded-3xl p-5 sm:p-6 border border-emerald-200/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-emerald-700" />
                  <h3 className="text-base font-black text-slate-900">Featured Verified Reseller Stores</h3>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full uppercase">
                    Partner Network
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Shop customized product selections directly from certified Bronze, Silver, Gold, and Platinum partner stores.
                </p>
              </div>

              <Link
                href="/reseller/register"
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 hover:text-emerald-800 bg-white hover:bg-emerald-50 border border-emerald-300 px-3.5 py-1.5 rounded-xl shadow-xs transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Open Your Reseller Shop</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {resellerShops.map((s) => {
                return (
                  <Link
                    key={s.id}
                    href={`/shop/${s.handle}`}
                    className="bg-white hover:bg-emerald-50/40 p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-all flex flex-col justify-between space-y-3 shadow-xs group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <StoreAvatar name={s.name} tier={s.tier} size="md" />
                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                              {s.name}
                            </h4>
                            <span className="text-[10px] text-slate-400 font-mono">@{s.handle}</span>
                          </div>
                        </div>

                        <span className="text-[10px] font-bold font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                          +{s.maxProfitMargin}% Cap
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-2.5">
                        {s.description || 'Verified on-chain partner storefront.'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100 font-bold">
                      <span className="text-slate-400">
                        📦 {s._count?.products || 4} Curated Products
                      </span>
                      <span className="text-emerald-700 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        <span>Visit Store</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Controls Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {selectedCategory === "All" ? "All Catalog Goods" : selectedCategory}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Showing <span className="font-bold text-slate-900">{filteredProducts.length.toLocaleString()}</span> verified items available for direct delivery
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Source Filter */}
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Channel:</span>
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer"
              >
                <option value="All">All Channels</option>
                <option value="Amazon Prime">Amazon Prime</option>
                <option value="eBay Top Rated Plus">eBay Top Rated</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 shadow-2xs">
              <Filter className="w-3.5 h-3.5 text-primary-600" />
              <span>Sort by:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured First</option>
                <option value="popular">Best Selling</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900">No products found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No products match &ldquo;{searchQuery}&rdquo; in category &ldquo;{selectedCategory}&rdquo;. Try clearing filters.
            </p>
            <button 
              onClick={() => { setSelectedCategory("All"); setSelectedSource("All"); setSearchQuery(""); }}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-xl text-xs font-bold hover:bg-primary-700 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.slice(0, displayLimit).map((product) => (
                <div 
                  key={product.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-primary-500 p-4 transition-all duration-200 hover:shadow-md flex flex-col justify-between group"
                >
                  <div>
                    {/* Image Container with Badges */}
                    <div className="relative aspect-square w-full bg-slate-50 rounded-xl overflow-hidden mb-4 border border-slate-100">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                        loading="lazy"
                      />

                      {/* Sale Badge */}
                      {product.originalPrice && product.originalPrice > product.price && (
                        <div className="absolute top-3 left-3 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                          -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                        </div>
                      )}

                      {/* Channel Pill Top Right */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md shadow-2xs backdrop-blur-md ${
                          product.source?.includes('Amazon')
                            ? 'bg-amber-500/90 text-slate-950 font-sans'
                            : 'bg-blue-600/90 text-white font-sans'
                        }`}>
                          {product.source?.includes('Amazon') ? 'Amazon Prime' : 'eBay Top Rated'}
                        </span>
                        
                        {/* Wishlist Button */}
                        <button 
                          onClick={() => toggleWishlist(product.id)}
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                            wishlist.includes(product.id)
                              ? "bg-rose-50 text-rose-600 border border-rose-200"
                              : "bg-white/90 text-slate-600 hover:text-rose-600 shadow-sm"
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${wishlist.includes(product.id) ? "fill-rose-600" : ""}`} />
                        </button>
                      </div>

                      {/* Quick View Button on Hover */}
                      <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setSelectedProduct(product)}
                          className="w-full py-2 bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-bold rounded-lg backdrop-blur-sm flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> Quick Preview
                        </button>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-200 uppercase tracking-wider text-[10px]">
                          {product.category}
                        </span>
                        
                        <div className="flex items-center gap-1 text-amber-500 font-bold font-mono">
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                          <span>{product.rating || 4.8}</span>
                          {product.sold && <span className="text-slate-400 text-[10px] font-sans">({product.sold})</span>}
                        </div>
                      </div>

                      <h3 
                        onClick={() => setSelectedProduct(product)}
                        className="font-bold text-sm text-slate-900 line-clamp-2 leading-snug cursor-pointer group-hover:text-primary-700 transition-colors pt-1"
                      >
                        {product.name}
                      </h3>

                      {product.brand && (
                        <p className="text-[11px] text-slate-400 font-medium">
                          by <span className="text-slate-600 font-semibold">{product.brand}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Pricing & Add to Cart */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-baseline justify-between mb-3">
                      <div>
                        <span className="text-xl font-black text-slate-900 font-mono">
                          ${product.price.toFixed(2)}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-xs font-medium text-slate-400 line-through font-mono ml-2">
                            ${product.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        100% Impact
                      </span>
                    </div>

                    <button 
                      onClick={() => addToCart(product)}
                      className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                    </button>
                  </div>

                </div>
              ))}
            </div>

            {/* Load More Pagination Strip */}
            {filteredProducts.length > displayLimit && (
              <div className="pt-6 text-center space-y-2">
                <p className="text-xs text-slate-500 font-medium">
                  Showing <span className="font-bold text-slate-900">{Math.min(displayLimit, filteredProducts.length)}</span> of <span className="font-bold text-slate-900">{filteredProducts.length.toLocaleString()}</span> products
                </p>
                <button
                  onClick={() => setDisplayLimit((prev) => prev + 48)}
                  className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95 inline-flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4 text-emerald-400" />
                  <span>Load More Products ({filteredProducts.length - displayLimit} remaining)</span>
                </button>
              </div>
            )}
          </div>
        )}

      </main>

      {/* 6. Store Values & Trust Strip */}
      <section className="bg-white border-t border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-50 border border-primary-200 text-primary-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900 mb-1">
                  100% Direct Impact
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every cent of store profit is routed directly to verified humanitarian and community initiatives.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-50 border border-primary-200 text-primary-600 flex items-center justify-center shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900 mb-1">
                  Secure Direct Checkout
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Fast, encrypted payments with Credit Card, PayPal, Apple Pay, and digital currencies.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-50 border border-primary-200 text-primary-600 flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900 mb-1">
                  Global Insured Shipping
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Full door-to-door tracking provided with every order to over 140 supported countries.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. Product Preview Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold"
            >
              ✕
            </button>

            <div className="grid sm:grid-cols-2 gap-6 items-center">
              <div className="relative aspect-square w-full bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
                <img 
                  src={selectedProduct.image} 
                  alt={selectedProduct.name} 
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded border border-primary-200 uppercase tracking-wider text-[10px]">
                    {selectedProduct.category}
                  </span>
                  
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                    selectedProduct.source?.includes('Amazon')
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-blue-100 text-blue-900 border border-blue-300'
                  }`}>
                    <ShieldCheck className="w-3 h-3" />
                    {selectedProduct.source || 'Amazon Prime'}
                  </span>

                  {selectedProduct.sku && (
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      {selectedProduct.sku}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
                    {selectedProduct.name}
                  </h3>
                  {selectedProduct.brand && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      Brand: <strong className="text-slate-800">{selectedProduct.brand}</strong>
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1 text-amber-500 font-bold font-mono">
                    <Star className="w-4 h-4 fill-amber-500" />
                    <span>{selectedProduct.rating || 4.8} / 5.0</span>
                  </div>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600 font-medium">({selectedProduct.sold || 120} units sold)</span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {selectedProduct.description}
                </p>

                {/* Specs Highlights */}
                {selectedProduct.specs && typeof selectedProduct.specs === 'object' && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] space-y-1 font-mono">
                    {Object.entries(selectedProduct.specs).slice(0, 3).map(([key, val]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-slate-500">{key}:</span>
                        <span className="font-bold text-slate-800 text-right truncate max-w-[200px]">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-baseline gap-3 pt-1">
                  <span className="text-2xl font-black text-slate-900 font-mono">
                    ${selectedProduct.price.toFixed(2)}
                  </span>
                  {selectedProduct.originalPrice && (
                    <span className="text-sm text-slate-400 line-through font-mono">
                      ${selectedProduct.originalPrice.toFixed(2)}
                    </span>
                  )}
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    100% Impact Proceeds
                  </span>
                </div>

                <div className="pt-2 flex gap-3">
                  <button 
                    onClick={() => {
                      addToCart(selectedProduct);
                      setSelectedProduct(null);
                      showToast(`${selectedProduct.name} added to cart!`);
                    }}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-200 cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4" /> Add to Cart
                  </button>
                  <Link 
                    href="/checkout"
                    onClick={() => {
                      addToCart(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-primary-600/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Proceed to Checkout <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 8. Slide-Over Cart Drawer & Crypto Checkout Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col">
            
            {/* Cart Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary-50 border border-primary-200 text-primary-600 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Your Cart</h2>
                  <p className="text-xs text-slate-500 font-mono">{cartTotalItems} item(s) selected</p>
                </div>
              </div>

              <button 
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Cart Item List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="text-base font-bold text-slate-700">Your cart is currently empty</p>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Explore products in the catalog to generate on-chain verified donations with every purchase.
                  </p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="mt-3 px-5 py-2.5 bg-primary-600 text-white text-xs font-bold rounded-xl hover:bg-primary-700"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div 
                    key={item.id}
                    className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3.5"
                  >
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0 bg-white"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {item.name}
                      </h4>
                      <p className="text-xs font-black text-slate-900 font-mono mt-0.5">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden text-xs">
                          <button 
                            onClick={() => updateQuantity(item.id, -1)}
                            className="px-2 py-0.5 hover:bg-slate-100 font-bold text-slate-600"
                          >
                            -
                          </button>
                          <span className="px-2 font-mono font-bold text-slate-900">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, 1)}
                            className="px-2 py-0.5 hover:bg-slate-100 font-bold text-slate-600"
                          >
                            +
                          </button>
                        </div>

                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer & Checkout */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-slate-200 bg-white space-y-4">
                
                {/* Total and Impact Note */}
                <div className="p-3.5 bg-primary-50 rounded-2xl border border-primary-200 space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold text-primary-800">
                    <span>Direct On-Chain Impact</span>
                    <span className="font-mono">${estimatedImpactDonation} USD</span>
                  </div>
                  <p className="text-[11px] text-primary-700 font-normal leading-snug">
                    ✓ 100% of profit funds verified humanitarian projects with transparent delivery proof.
                  </p>
                </div>

                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-sm font-bold text-slate-600">Total Order Amount:</span>
                  <span className="text-2xl font-black text-slate-900 font-mono">${cartSubtotal.toFixed(2)}</span>
                </div>

                {/* Direct Checkout Selector */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                    Choose Payment Channel:
                  </span>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {CRYPTO_PAYMENT_OPTIONS.map((coin) => (
                      <button
                        key={coin.symbol}
                        onClick={() => setSelectedCrypto(coin)}
                        className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                          selectedCrypto.symbol === coin.symbol
                            ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <Image 
                          src={coin.logo} 
                          alt={coin.name} 
                          width={16} 
                          height={16} 
                          className="w-4 h-4 object-contain"
                          style={{ width: "auto", height: "auto" }}
                        />
                        <span>{coin.symbol}</span>
                      </button>
                    ))}
                  </div>

                  {/* Address Box */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-bold text-slate-700">{selectedCrypto.name} Deposit Address:</span>
                      <span className="text-primary-700 font-mono font-bold">{selectedCrypto.network}</span>
                    </div>

                    <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                      <code className="text-xs font-mono text-slate-800 truncate flex-1">{selectedCrypto.address}</code>
                      <button 
                        onClick={() => copyAddress(selectedCrypto.address)}
                        className="px-2.5 py-1 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded text-xs font-bold flex items-center gap-1 shrink-0"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-primary-600" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </div>

                  {/* Proceed to Checkout Button */}
                  <Link
                    href="/checkout"
                    onClick={() => setIsCartOpen(false)}
                    className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-primary-600/20 flex items-center justify-center gap-2 hover-lift"
                  >
                    Proceed to Checkout <ArrowRight className="w-4 h-4" />
                  </Link>

                  {/* Direct Quick Pay Button */}
                  <button 
                    onClick={() => {
                      setIsOrderConfirmed(true);
                      setCart([]);
                    }}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all border border-slate-200 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-primary-600" /> Instant 1-Click Pay with {selectedCrypto.symbol}
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

      {/* 9. Order Confirmation Modal */}
      {isOrderConfirmed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-8 text-center shadow-2xl space-y-5">
            <div className="w-16 h-16 bg-primary-50 border border-primary-200 text-primary-600 rounded-full flex items-center justify-center mx-auto shadow-md shadow-primary-600/10">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              Order Received!
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              Your transaction is being processed. A verified receipt and tracking updates will be dispatched to your registered address.
            </p>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 font-mono text-left space-y-1">
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span className="font-bold text-slate-900">{selectedCrypto.name} ({selectedCrypto.symbol})</span>
              </div>
              <div className="flex justify-between">
                <span>Order Status:</span>
                <span className="text-primary-700 font-bold">100% Direct Escrow Allocated</span>
              </div>
            </div>

            <button 
              onClick={() => {
                setIsOrderConfirmed(false);
                setIsCartOpen(false);
              }}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}

      {/* 10. Store Footer */}
      <footer className="bg-white text-slate-900 border-t border-slate-200 pt-16 pb-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 relative overflow-visible">
                  <Image 
                    src="/logo.png" 
                    alt="Adera Foundation Logo" 
                    fill 
                    sizes="36px"
                    className="object-contain" 
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-base text-slate-900 leading-none">
                    Adera<span className="text-primary-600">Store</span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest leading-tight mt-0.5">
                    Foundation
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Direct-impact e-commerce platform where 100% of profits fund transparent on-chain charity initiatives globally.
              </p>
            </div>

            <div>
              <h4 className="text-slate-900 font-bold text-xs uppercase tracking-wider mb-4">Shop Categories</h4>
              <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
                <li><button onClick={() => setSelectedCategory("Computers & Accessories")} className="hover:text-primary-600">Computers & Accessories</button></li>
                <li><button onClick={() => setSelectedCategory("Home & Garden")} className="hover:text-primary-600">Home & Appliances</button></li>
                <li><button onClick={() => setSelectedCategory("Sports & Outdoors")} className="hover:text-primary-600">Sports & Outdoors</button></li>
                <li><button onClick={() => setSelectedCategory("Women's Shoes")} className="hover:text-primary-600">Apparel & Footwear</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-slate-900 font-bold text-xs uppercase tracking-wider mb-4">Quick Links</h4>
              <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
                <li><a href={`${process.env.NEXT_PUBLIC_APP_URL || "https://aderafoundation.com"}/causes`} className="hover:text-primary-600">Active Causes Portal</a></li>
                <li><Link href="/track" className="hover:text-primary-600">Order & Package Tracking</Link></li>
                <li><a href={`${process.env.NEXT_PUBLIC_APP_URL || "https://aderafoundation.com"}/how-it-works`} className="hover:text-primary-600">How It Works</a></li>
                <li><a href={`${process.env.NEXT_PUBLIC_APP_URL || "https://aderafoundation.com"}/contact`} className="hover:text-primary-600">Support Center</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-slate-900 font-bold text-xs uppercase tracking-wider mb-4">Store Newsletter</h4>
              <p className="text-xs text-slate-500 mb-3">Get notifications when new philanthropic drops go live.</p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Enter email..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-primary-500"
                />
                <button className="px-3.5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-lg transition-colors">
                  Join
                </button>
              </div>
            </div>

          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} Adera Foundation. All merchandise profits audited on-chain.</p>
            <div className="flex items-center gap-6 font-medium">
              <a href={process.env.NEXT_PUBLIC_APP_URL || "https://aderafoundation.com"} className="hover:text-primary-600">Main Platform</a>
              <a href={`${process.env.NEXT_PUBLIC_APP_URL || "https://aderafoundation.com"}/contact`} className="hover:text-primary-600">Support</a>
              <a href={`${process.env.NEXT_PUBLIC_APP_URL || "https://aderafoundation.com"}/trust-and-safety`} className="hover:text-primary-600">Trust & Safety</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
