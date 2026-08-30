'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Store, Award, Plus, Edit2, Trash2, ExternalLink, DollarSign, Check, X, AlertCircle, TrendingUp, RefreshCw, Layers, Sliders, CheckCircle2, Lock, Wallet, Globe, ArrowRight, ShieldCheck, LogOut, LayoutDashboard, ShoppingBag, Truck, MessageSquare, RotateCcw, Settings, Menu, Bell, Search, Star, Eye, ChevronRight, ArrowUpRight, Copy, HelpCircle, Loader2, Send } from 'lucide-react';
import { api } from '@/lib/api';
import TierMedal, { ShopTierType } from '@/components/TierMedal';
import StoreAvatar, { STORE_AVATAR_PRESETS } from '@/components/StoreAvatar';
import ProfileImagePicker from '@/components/ProfileImagePicker';
import { MASTER_CATALOG_PRODUCTS } from '@/lib/products-catalog';

export type DashboardTab =
  | 'overview'
  | 'inventory'
  | 'sourcing'
  | 'orders'
  | 'wallet'
  | 'messages'
  | 'refunds'
  | 'settings';

export default function ResellerDashboardPage() {
  const router = useRouter();

  // Core State
  const [shop, setShop] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Data States
  const [inventory, setInventory] = useState<any[]>([]);
  const [catalog, setCatalog] = useState<any[]>(MASTER_CATALOG_PRODUCTS);
  const [walletData, setWalletData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);

  // Sourcing Filters
  const [catalogCategory, setCatalogCategory] = useState('All');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogDisplayLimit, setCatalogDisplayLimit] = useState(48);

  // Inventory Filter
  const [inventorySearch, setInventorySearch] = useState('');

  // Modals
  const [pricingModalItem, setPricingModalItem] = useState<any>(null);
  const [customPriceInput, setCustomPriceInput] = useState<number>(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('250.00');
  const [withdrawCurrency, setWithdrawCurrency] = useState('USDC');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  // Settings Profile Form
  const [profileForm, setProfileForm] = useState({
    name: '',
    description: '',
    walletAddress: '',
    phone: '',
    address: '',
    certificateType: "Driver's License",
    logo: 'preset:store_apex',
  });

  // Message Reply
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [replyText, setReplyText] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('reseller_token');
    if (!storedToken) {
      router.push('/reseller/login');
      return;
    }
    setToken(storedToken);
    loadAllDashboardData(storedToken);
  }, []);

  const loadAllDashboardData = async (jwtToken: string) => {
    setLoading(true);
    try {
      const [profileData, invData, catData, walletRes, ordersRes, msgsRes] = await Promise.all([
        api.resellers.getProfile(jwtToken),
        api.resellers.getInventory(jwtToken),
        api.resellers.getCatalog(jwtToken),
        api.resellers.getWallet(jwtToken),
        api.resellers.getOrders(jwtToken),
        api.resellers.getMessages(jwtToken),
      ]);

      setShop(profileData);
      setInventory(invData || []);
      
      if (Array.isArray(catData) && catData.length > 0) {
        const sanitizedCat = catData.map((p: any, idx: number) => {
          if (!p.image || p.image.includes('/products/') || p.image.includes('banggoods') || p.image.includes('placeholder')) {
            const fallback = MASTER_CATALOG_PRODUCTS[idx % MASTER_CATALOG_PRODUCTS.length];
            return { ...p, image: fallback.image };
          }
          return p;
        });
        setCatalog(sanitizedCat);
      } else {
        const importedIds = new Set((invData || []).map((i: any) => i.productId));
        setCatalog(MASTER_CATALOG_PRODUCTS.map((p) => ({
          ...p,
          isImported: importedIds.has(p.id),
          importedDetails: (invData || []).find((i: any) => i.productId === p.id) || null,
        })));
      }

      setWalletData(walletRes);
      setOrders(ordersRes || []);
      setMessages(msgsRes || []);

      setProfileForm({
        name: profileData.name || '',
        description: profileData.description || '',
        walletAddress: profileData.walletAddress || '',
        phone: profileData.phone || '+1 (555) 349-2810',
        address: profileData.address || '742 Evergreen Terrace, Los Angeles, CA',
        certificateType: profileData.certificateType || "Driver's License",
        logo: profileData.logo || 'preset:store_apex',
      });
      setWithdrawAddress(profileData.walletAddress || '0x71C...49A');
    } catch (err: any) {
      console.error('Error loading reseller data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('reseller_token');
    localStorage.removeItem('reseller_shop');
    router.push('/reseller/login');
  };

  // Sourcing Import & Price
  const openImportModal = (product: any) => {
    const defaultMarkup = (product.price * (1 + (shop?.maxProfitMargin || 20) / 100));
    setPricingModalItem({
      productId: product.id,
      name: product.name,
      basePrice: product.price,
      image: product.image,
      isImported: product.isImported,
    });
    setCustomPriceInput(parseFloat(defaultMarkup.toFixed(2)));
  };

  const openEditPriceModal = (invItem: any) => {
    setPricingModalItem({
      productId: invItem.productId,
      invId: invItem.id,
      name: invItem.product?.name || 'Product',
      basePrice: invItem.basePrice,
      image: invItem.product?.image,
      isImported: true,
    });
    setCustomPriceInput(invItem.customPrice);
  };

  const handleSavePrice = async () => {
    if (!token || !pricingModalItem) return;
    try {
      await api.resellers.importProduct(token, {
        productId: pricingModalItem.productId,
        customPrice: customPriceInput,
      });
      setPricingModalItem(null);
      showToast('Product pricing updated and live on your storefront!');
      loadAllDashboardData(token);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleActive = async (item: any) => {
    if (!token) return;
    try {
      await api.resellers.updateInventoryItem(token, item.id, {
        isActive: !item.isActive,
      });
      showToast(item.isActive ? 'Listing deactivated' : 'Listing active on storefront');
      loadAllDashboardData(token);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    if (!token || !confirm('Remove this product from your shop inventory?')) return;
    try {
      await api.resellers.removeInventoryItem(token, itemId);
      showToast('Item removed from your shop inventory');
      loadAllDashboardData(token);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpgradeTier = async (newTier: string) => {
    if (!token) return;
    try {
      await api.resellers.upgradeTier(token, newTier);
      setShowUpgradeModal(false);
      showToast(`Congratulations! Upgraded to ${newTier} Shop Tier!`);
      loadAllDashboardData(token);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleQuickImport = async (product: any) => {
    if (!token) return;
    try {
      const maxResale = parseFloat((product.price * (1 + (shop?.maxProfitMargin || 20) / 100)).toFixed(2));
      await api.resellers.importProduct(token, {
        productId: product.id,
        customPrice: maxResale,
      });
      showToast(`Added "${product.name.slice(0, 24)}..." to your shop with +${shop?.maxProfitMargin || 20}% profit!`);
      loadAllDashboardData(token);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleBatchImport = async (itemsToImport: any[]) => {
    if (!token || itemsToImport.length === 0) return;
    const unimported = itemsToImport.filter((p) => !p.isImported);
    if (unimported.length === 0) {
      showToast('All items in this view are already in your shop!');
      return;
    }
    if (!confirm(`Import ${unimported.length} products to your shop with +${shop?.maxProfitMargin || 20}% markup?`)) return;

    setLoading(true);
    try {
      let count = 0;
      for (const prod of unimported) {
        const maxResale = parseFloat((prod.price * (1 + (shop?.maxProfitMargin || 20) / 100)).toFixed(2));
        await api.resellers.importProduct(token, {
          productId: prod.id,
          customPrice: maxResale,
        });
        count++;
      }
      showToast(`Successfully added ${count} products to your storefront!`);
      loadAllDashboardData(token);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      await api.resellers.updateProfile(token, profileForm);
      showToast('Shop profile and theme avatar updated successfully!');
      loadAllDashboardData(token);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setWithdrawLoading(true);
    try {
      const res = await api.resellers.requestWithdrawal(token, {
        amount: parseFloat(withdrawAmount),
        currency: withdrawCurrency,
        walletAddress: withdrawAddress,
      });
      setShowWithdrawModal(false);
      showToast(`Success! $${withdrawAmount} ${withdrawCurrency} withdrawal processed via Escrow.`);
      loadAllDashboardData(token);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setWithdrawLoading(false);
    }
  };

  const handleSendMessageReply = (msg: any) => {
    if (!replyText.trim()) return;
    showToast('Reply dispatched to buyer via decentralized message relay.');
    setReplyText('');
    setSelectedMessage(null);
  };

  if (loading && !shop) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-bold text-emerald-400">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading Reseller Studio...</span>
        </div>
      </div>
    );
  }

  // Sourcing Categories
  const categories = ['All', ...Array.from(new Set(catalog.map((p) => p.category || 'General')))];
  
  const categoryCounts = categories.reduce((acc, cat) => {
    if (cat === 'All') {
      acc[cat] = catalog.length;
    } else {
      acc[cat] = catalog.filter((p) => p.category === cat).length;
    }
    return acc;
  }, {} as Record<string, number>);

  const filteredCatalog = catalog.filter((p) => {
    const matchesCat = catalogCategory === 'All' || p.category === catalogCategory;
    const query = catalogSearch.toLowerCase().trim();
    const matchesSearch =
      !query ||
      p.name?.toLowerCase().includes(query) ||
      p.brand?.toLowerCase().includes(query) ||
      p.sku?.toLowerCase().includes(query) ||
      p.category?.toLowerCase().includes(query) ||
      p.description?.toLowerCase().includes(query);
    return matchesCat && matchesSearch;
  });

  const filteredInventory = inventory.filter((item) => {
    return (
      item.product?.name?.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      item.product?.category?.toLowerCase().includes(inventorySearch.toLowerCase())
    );
  });

  const currentTierMargin = shop?.maxProfitMargin || 20;
  const unreadMessagesCount = messages.filter((m) => !m.isRead).length;

  return (
    <div className="h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans overflow-hidden">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-fade-in-up">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}

      {/* Primary Green Top Navigation Bar (Fixed at top) */}
      <header className="bg-white border-b border-slate-200 shrink-0 z-30 shadow-xs">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <Menu className="w-4 h-4" />
            </button>

            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 relative">
                <Image src="/logo.png" alt="Adera Logo" fill className="object-contain" />
              </div>
              <span className="text-sm font-black text-slate-900 hidden sm:inline">
                Adera <span className="text-emerald-700 text-xs font-bold uppercase bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Seller Studio</span>
              </span>
            </Link>
          </div>

          {/* Center Shop Quick Profile Strip */}
          <div className="hidden md:flex items-center gap-4 bg-slate-50 border border-slate-200 px-4 py-1.5 rounded-2xl">
            <div className="flex items-center gap-2">
              <StoreAvatar
                name={shop?.name}
                avatar={shop?.logo}
                tier={shop?.tier}
                size="sm"
                showTierBadge={false}
              />
              <div>
                <span className="text-xs font-extrabold text-slate-900 block leading-none">{shop?.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">@{shop?.handle}</span>
              </div>
            </div>

            <div className="h-4 w-px bg-slate-200" />

            <div className="flex items-center gap-3 text-[11px] font-bold">
              <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span>{(shop?.rating || 5.0).toFixed(1)} Rating</span>
              </span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>{shop?.creditScore || 100} Credit Score</span>
              </span>
              <span className="text-slate-500 flex items-center gap-1">
                <Eye className="w-3 h-3 text-slate-400" />
                <span>{(shop?.visits ?? 0).toLocaleString()} Visits</span>
              </span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2.5">
            <Link
              href={`/shop/${shop?.handle}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">View Public Storefront</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <button
              onClick={() => setActiveTab('messages')}
              className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Customer Inquiries"
            >
              <Bell className="w-4 h-4" />
              {unreadMessagesCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-600 text-white font-mono text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadMessagesCount}
                </span>
              )}
            </button>

            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 rounded-xl transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Main Studio Body with Non-Scrolling Fixed Sidebar & Scrollable Content */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto overflow-hidden">
        
        {/* Sidebar Navigation - Fixed in Place / Non-Scrolling with Page */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 lg:static lg:translate-x-0 flex flex-col justify-between shrink-0 h-full overflow-y-auto ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-4 space-y-6">
            
            {/* Shop Identifier Card */}
            <div className="p-3.5 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <StoreAvatar
                  name={shop?.name}
                  avatar={shop?.logo}
                  tier={shop?.tier}
                  size="md"
                />
                <div className="min-w-0">
                  <div className="text-xs font-black truncate">{shop?.name}</div>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold block">
                    {shop?.tier} Shop (+{shop?.maxProfitMargin}%)
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Reputation:</span>
                <span className="text-emerald-400 font-mono font-bold">{shop?.creditScore || 100} / 100 Score</span>
              </div>
            </div>

            {/* Navigation Menu Links */}
            <nav className="space-y-1">
              {[
                { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'inventory', label: 'My Products', icon: ShoppingBag, count: inventory.length },
                { id: 'sourcing', label: 'Wholesale Sourcing', icon: Plus, badge: '3,927 Goods' },
                { id: 'orders', label: 'Orders & Escrow', icon: Truck, count: orders.length },
                { id: 'wallet', label: 'Wallet & Payouts', icon: Wallet, badge: `$${(walletData?.walletBalance ?? 0).toFixed(0)}` },
                { id: 'messages', label: 'Messages', icon: MessageSquare, count: unreadMessagesCount },
                { id: 'refunds', label: 'Refunds & Returns', icon: RotateCcw },
                { id: 'settings', label: 'Shop Settings', icon: Settings },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as DashboardTab);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-md ${
                        isActive ? 'bg-emerald-700 text-white' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {item.badge}
                      </span>
                    )}

                    {item.count !== undefined && item.count > 0 && (
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                        isActive ? 'bg-white text-emerald-700 font-bold' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

          </div>

          {/* Sidebar Footer Link */}
          <div className="p-4 border-t border-slate-100 space-y-2">
            <Link
              href="/"
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Back to Storefront</span>
            </Link>
          </div>
        </aside>

        {/* Backdrop for Mobile Sidebar */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          />
        )}

        {/* Content Area - Smooth Independent Scrolling */}
        <main className="flex-1 h-full overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-full">
          
          {/* ========================================================================= */}
          {/* TAB 1: DASHBOARD OVERVIEW                                                */}
          {/* ========================================================================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* 4 Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Metric 1: Available Wallet Balance */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Available Balance</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                      ${(walletData?.walletBalance ?? 0.0).toFixed(2)}
                    </div>
                    <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                      <span>• Ready for Instant Crypto Withdrawal</span>
                    </span>
                  </div>
                  <button
                    onClick={() => setShowWithdrawModal(true)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Withdraw Funds</span>
                  </button>
                </div>

                {/* Metric 2: Total Sales & Revenue */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Sales Volume</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                      ${(walletData?.totalRevenue ?? 0.0).toFixed(2)}
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {(shop?.totalSales ?? 0)} Dispatched Orders
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-bold">
                    <span>Pending Escrow:</span>
                    <span className="text-emerald-700 font-mono">${(walletData?.pendingEscrow ?? 0.0).toFixed(2)}</span>
                  </div>
                </div>

                {/* Metric 3: Active Listings vs Limit */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Store Listings</span>
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
                      <Layers className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                      {inventory.length} <span className="text-xs text-slate-400 font-normal">/ {shop?.productLimit || 100} limit</span>
                    </div>
                    <span className="text-[11px] text-blue-600 font-bold">
                      {inventory.filter((i) => i.isActive).length} Products Active
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab('sourcing')}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Source More Goods</span>
                  </button>
                </div>

                {/* Metric 4: Reputation & Tier Level */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reputation & Tier</span>
                    <TierMedal tier={shop?.tier} size="xs" />
                  </div>
                  <div className="flex items-center gap-3">
                    <TierMedal tier={shop?.tier} size="md" />
                    <div>
                      <div className="text-lg font-black text-slate-900">{shop?.tier} Level</div>
                      <div className="text-xs font-bold text-emerald-700 font-mono">
                        +{shop?.maxProfitMargin}% Profit Cap
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-extrabold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Upgrade Tier Level</span>
                  </button>
                </div>

              </div>

              {/* 72h Crypto Escrow Banner */}
              <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 text-white rounded-3xl shadow-sm border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <span>72-Hour Smart-Contract Escrow Protection</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 font-mono">
                        Zero Chargebacks
                      </span>
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Funds are automatically credited to your merchant wallet within 72 hours of international express delivery confirmation.
                    </p>
                  </div>
                </div>

                <Link
                  href={`/shop/${shop?.handle}`}
                  target="_blank"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shrink-0 transition-colors shadow-sm inline-flex items-center gap-1.5"
                >
                  <span>Open Public Store</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Recent Orders Overview */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Recent Customer Orders</h3>
                    <p className="text-xs text-slate-500">Live order fulfillment dispatched through your storefront</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                  >
                    <span>View All Orders</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {orders.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    No customer orders placed yet. Orders made on your public storefront <code>/shop/{shop?.handle}</code> will appear here automatically.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                          <th className="pb-3">Order ID</th>
                          <th className="pb-3">Buyer</th>
                          <th className="pb-3">Product</th>
                          <th className="pb-3 text-right">Retail Total</th>
                          <th className="pb-3 text-right">Your Profit</th>
                          <th className="pb-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {orders.map((ord) => (
                          <tr key={ord.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 font-mono font-bold text-slate-900">{ord.id}</td>
                            <td className="py-3">
                              <span className="font-mono text-slate-700">{ord.buyer}</span>
                            </td>
                            <td className="py-3 max-w-xs truncate text-slate-900 font-semibold">{ord.productName}</td>
                            <td className="py-3 text-right font-mono font-bold text-slate-900">${ord.salePrice.toFixed(2)}</td>
                            <td className="py-3 text-right font-mono font-bold text-emerald-600">+${ord.netProfit.toFixed(2)}</td>
                            <td className="py-3 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                ord.status === 'DELIVERED'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : ord.status === 'IN_TRANSIT'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-purple-50 text-purple-700 border border-purple-200'
                              }`}>
                                {ord.status.replace('_', ' ')}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: MY PRODUCTS & INVENTORY                                           */}
          {/* ========================================================================= */}
          {activeTab === 'inventory' && (
            <div className="space-y-5 animate-fade-in">
              <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-black text-slate-900">My Store Inventory ({inventory.length} Listed)</h2>
                  <p className="text-xs text-slate-500">
                    Manage your active listings, adjust retail markup prices, and view wholesale profit margins.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search inventory..."
                      value={inventorySearch}
                      onChange={(e) => setInventorySearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button
                    onClick={() => setActiveTab('sourcing')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Import New Product</span>
                  </button>
                </div>
              </div>

              {filteredInventory.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
                  <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
                  <h3 className="text-sm font-bold text-slate-900">No items found in your shop inventory</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Source and import goods from the 3,927 wholesale catalog to start selling immediately.
                  </p>
                  <button
                    onClick={() => setActiveTab('sourcing')}
                    className="px-5 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl"
                  >
                    Browse Sourcing Catalog
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredInventory.map((item) => {
                    const profitDollar = item.customPrice - item.basePrice;
                    return (
                      <div
                        key={item.id}
                        className="bg-white rounded-3xl border border-slate-200 p-4.5 flex flex-col justify-between space-y-3 shadow-xs hover:border-emerald-300 transition-all"
                      >
                        <div>
                          <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-slate-50 mb-3 border border-slate-100">
                            <Image
                              src={item.product?.image || '/logo.png'}
                              alt={item.product?.name || 'Product'}
                              fill
                              className="object-cover"
                            />
                            <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-xs">
                              {item.product?.category}
                            </span>
                            <span className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.isActive ? 'bg-emerald-600 text-white' : 'bg-slate-500 text-white'
                            }`}>
                              {item.isActive ? 'Active on Store' : 'Hidden'}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                            {item.product?.name}
                          </h4>

                          {/* Financial Matrix Box */}
                          <div className="mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                            <div>
                              <span className="block text-[9px] font-bold text-slate-400 uppercase">Wholesale</span>
                              <span className="font-mono font-bold text-slate-700">${item.basePrice.toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="block text-[9px] font-bold text-emerald-700 uppercase">Retail Price</span>
                              <span className="font-mono font-black text-emerald-700">${item.customPrice.toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="block text-[9px] font-bold text-emerald-600 uppercase">Profit (+{item.profitMargin}%)</span>
                              <span className="font-mono font-bold text-emerald-600">+${profitDollar.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => openEditPriceModal(item)}
                            className="flex-1 py-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Modify Price</span>
                          </button>

                          <button
                            onClick={() => handleToggleActive(item)}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                            title={item.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {item.isActive ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                          </button>

                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-2 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-colors"
                            title="Remove from Shop"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: WHOLESALE SOURCING STUDIO (1,000+ PRODUCTS)                       */}
          {/* ========================================================================= */}
          {activeTab === 'sourcing' && (
            <div className="space-y-5 animate-fade-in">
              <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <span>Wholesale Master Sourcing Catalog</span>
                      <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        {catalog.length.toLocaleString()} Verified Goods
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Select items to import to your storefront with your tier profit markup up to +{currentTierMargin}%.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                      onClick={() => handleBatchImport(filteredCatalog)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Import All in View ({filteredCatalog.filter(p => !p.isImported).length})</span>
                    </button>

                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search title, brand, SKU..."
                        value={catalogSearch}
                        onChange={(e) => setCatalogSearch(e.target.value)}
                        className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Category Pills Bar with Dynamic Counts */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {categories.map((cat) => {
                    const isActive = catalogCategory === cat;
                    const count = categoryCounts[cat] || 0;
                    return (
                      <button
                        key={cat}
                        onClick={() => setCatalogCategory(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <span>{cat === 'All' ? 'All Catalog' : cat}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                          isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sourcing Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredCatalog.slice(0, catalogDisplayLimit).map((product) => {
                  const maxResale = product.price * (1 + currentTierMargin / 100);
                  const netProfit = maxResale - product.price;

                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-3xl border border-slate-200 p-4 flex flex-col justify-between space-y-3 shadow-xs hover:border-emerald-400 transition-all group"
                    >
                      <div>
                        <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 mb-3 border border-slate-100">
                          <Image
                            src={product.image || '/logo.png'}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          
                          <div className="absolute top-2 left-2 flex flex-col gap-1">
                            <span className="bg-slate-900/85 text-white text-[9px] font-bold px-2 py-0.5 rounded backdrop-blur-xs">
                              {product.category}
                            </span>
                            {product.brand && (
                              <span className="bg-white/90 text-slate-900 text-[9px] font-bold px-2 py-0.5 rounded shadow-2xs">
                                {product.brand}
                              </span>
                            )}
                          </div>

                          <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                            <span className="bg-emerald-700/90 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-xs backdrop-blur-xs">
                              Verified Stock
                            </span>
                            {product.isImported && (
                              <span className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded shadow-xs flex items-center gap-0.5">
                                <Check className="w-2.5 h-2.5" />
                                <span>In Shop</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                          {product.name}
                        </h4>

                        {product.sku && (
                          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                            {product.sku}
                          </span>
                        )}

                        <div className="mt-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-baseline justify-between text-xs">
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold uppercase block">Wholesale</span>
                            <span className="font-mono font-bold text-slate-900">${product.price.toFixed(2)}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] text-emerald-700 font-bold uppercase block">Your Profit (+{currentTierMargin}%)</span>
                            <span className="font-mono font-black text-emerald-700">+${netProfit.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        {!product.isImported ? (
                          <>
                            <button
                              onClick={() => handleQuickImport(product)}
                              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                              title={`Instant add with +${currentTierMargin}% markup`}
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Instant Add</span>
                            </button>
                            <button
                              onClick={() => openImportModal(product)}
                              className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                              title="Set custom markup price"
                            >
                              <Sliders className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => openImportModal(product)}
                            className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Modify Custom Price</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredCatalog.length > catalogDisplayLimit && (
                <div className="pt-4 flex items-center justify-center gap-3">
                  <button
                    onClick={() => setCatalogDisplayLimit((prev) => prev + 48)}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    Load More Goods ({filteredCatalog.length - catalogDisplayLimit} remaining)
                  </button>
                  <button
                    onClick={() => setCatalogDisplayLimit(filteredCatalog.length)}
                    className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Show All ({filteredCatalog.length})
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: ORDERS & ESCROW FULFILLMENT                                       */}
          {/* ========================================================================= */}
          {activeTab === 'orders' && (
            <div className="space-y-5 animate-fade-in">
              <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-black text-slate-900">Customer Orders & Escrow Tracker</h2>
                  <p className="text-xs text-slate-500">
                    Multi-chain crypto order tracking with automated 72-hour delivery release timer.
                  </p>
                </div>
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>On-Chain Escrow Protected</span>
                </span>
              </div>
              {orders.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
                  <Truck className="w-12 h-12 text-slate-300 mx-auto" />
                  <h3 className="text-sm font-bold text-slate-900">No customer orders placed yet</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Orders placed by buyers through your public storefront will appear here with live tracking and 72h escrow protection.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                    >
                      <div className="flex items-start sm:items-center gap-4">
                        <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                          <Image src={ord.productImage} alt={ord.productName} fill className="object-cover" />
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-900 font-mono">{ord.id}</span>
                            <span className="text-[10px] text-slate-400 font-mono">• Buyer: {ord.buyer}</span>
                          </div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900">{ord.productName}</h4>
                          <div className="text-[11px] text-slate-500 font-medium">
                            Air Express Tracking: <code className="font-mono font-bold text-emerald-700">{ord.trackingNumber}</code>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between lg:justify-end gap-6 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Retail Total</span>
                          <span className="font-mono font-black text-slate-900 text-sm">${ord.salePrice.toFixed(2)} ({ord.paymentToken})</span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-emerald-600 font-bold uppercase block">Your Net Profit</span>
                          <span className="font-mono font-black text-emerald-600 text-sm">+${ord.netProfit.toFixed(2)}</span>
                        </div>

                        <div className="text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold block ${
                            ord.status === 'DELIVERED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : ord.status === 'IN_TRANSIT'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}>
                            {ord.status.replace('_', ' ')}
                          </span>
                          {ord.hoursRemaining > 0 && (
                            <span className="text-[10px] text-slate-400 block mt-1">
                              ⏳ {ord.hoursRemaining}h to release
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: WALLET & CRYPTO PAYOUTS                                           */}
          {/* ========================================================================= */}
          {activeTab === 'wallet' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-md space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">
                      Merchant Treasury & Settlement
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-black text-white font-mono mt-1">
                      ${(walletData?.walletBalance ?? 0.0).toFixed(2)} <span className="text-sm font-sans text-slate-400 font-normal">Available</span>
                    </h2>
                  </div>

                  <button
                    onClick={() => setShowWithdrawModal(true)}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>Request Instant Withdrawal</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-700/60 text-xs">
                  <div>
                    <span className="text-slate-400 block">Pending Escrow Settlements</span>
                    <span className="text-lg font-black text-emerald-400 font-mono">${(walletData?.pendingEscrow ?? 0.0).toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Lifetime Dispatched Revenue</span>
                    <span className="text-lg font-black text-white font-mono">${(walletData?.totalRevenue ?? 0.0).toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Connected Payout Method</span>
                    <span className="text-xs font-mono text-cyan-300 font-bold truncate block">
                      {shop?.walletAddress || 'Not configured (add in Settings)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Withdrawals Transaction History */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-sm font-black text-slate-900">Payout & Settlement History</h3>
                
                {(!walletData?.withdrawals || walletData.withdrawals.length === 0) ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    No withdrawals requested yet. When you request a crypto withdrawal, transactions will appear here.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                          <th className="pb-3">Reference</th>
                          <th className="pb-3">Amount</th>
                          <th className="pb-3">Token</th>
                          <th className="pb-3">Payout Address</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {walletData.withdrawals.map((w: any) => (
                          <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 font-mono font-bold text-slate-900">WTH-{w.id}</td>
                            <td className="py-3 font-mono font-bold text-slate-900">${w.amount.toFixed(2)}</td>
                            <td className="py-3 font-bold text-emerald-700">{w.currency}</td>
                            <td className="py-3 font-mono text-slate-500 truncate max-w-xs">{w.walletAddress}</td>
                            <td className="py-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {w.status}
                              </span>
                            </td>
                            <td className="py-3 text-slate-400">{new Date(w.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: MESSAGES & INQUIRIES                                             */}
          {/* ========================================================================= */}
          {activeTab === 'messages' && (
            <div className="space-y-5 animate-fade-in">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-slate-900">Store Communications & Inquiries</h2>
                  <p className="text-xs text-slate-500">Direct message inquiries from buyers and Adera logistics support.</p>
                </div>
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
                  {messages.length} Threads
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-3xl border border-slate-200 space-y-2">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMessage(m)}
                      className={`p-3 rounded-2xl cursor-pointer transition-all border ${
                        selectedMessage?.id === m.id
                          ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400'
                          : 'bg-slate-50 border-slate-100 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-slate-900 truncate">{m.sender}</span>
                        {!m.isRead && <span className="w-2 h-2 rounded-full bg-emerald-600" />}
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 truncate mt-1">{m.subject}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{m.content}</p>
                    </div>
                  ))}
                </div>

                <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
                  {selectedMessage ? (
                    <div className="space-y-4">
                      <div className="pb-3 border-b border-slate-100 flex items-start justify-between">
                        <div>
                          <span className="text-xs font-bold text-emerald-700 block">{selectedMessage.sender}</span>
                          <h3 className="text-sm font-black text-slate-900">{selectedMessage.subject}</h3>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(selectedMessage.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-700 leading-relaxed font-medium">
                        {selectedMessage.content}
                      </div>

                      <div className="space-y-2 pt-2">
                        <textarea
                          rows={3}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Type your response to the buyer..."
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 resize-none font-medium"
                        />
                        <button
                          onClick={() => handleSendMessageReply(selectedMessage)}
                          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Response</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-slate-400 text-xs">
                      Select a message thread on the left to read and respond.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 7: REFUNDS & DISPUTE RESOLUTION                                      */}
          {/* ========================================================================= */}
          {activeTab === 'refunds' && (
            <div className="space-y-5 animate-fade-in">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900">Zero Chargeback Escrow Guarantee</h2>
                    <p className="text-xs text-slate-500">
                      All disputes are settled mathematically on-chain without traditional chargeback fees or payment provider freezes.
                    </p>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h3 className="text-xs font-black text-slate-900">No Open Disputes</h3>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Your shop maintains a 100/100 Credit Score. All historical orders were successfully delivered and verified.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 8: SHOP SETTINGS & KYC VERIFICATION                                  */}
          {/* ========================================================================= */}
          {activeTab === 'settings' && (
            <div className="max-w-3xl bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6 animate-fade-in">
              <div>
                <h2 className="text-base font-black text-slate-900">Shop Customization & KYC Verification</h2>
                <p className="text-xs text-slate-500">
                  Configure your verified storefront branding, signature vector theme avatar, and payout credentials.
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-5">
                
                {/* Shop Name & Handle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Shop Display Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Shop Handle (Public URL)
                    </label>
                    <div className="px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono text-slate-600">
                      adera.store/shop/{shop?.handle}
                    </div>
                  </div>
                </div>

                {/* Store Profile & Brand Logo Uploader / Presets */}
                <ProfileImagePicker
                  value={profileForm.logo}
                  onChange={(newLogo) => setProfileForm({ ...profileForm, logo: newLogo })}
                  shopName={profileForm.name || shop?.name || 'Your Shop'}
                  tier={shop?.tier}
                />

                {/* Contact Phone & Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Business Contact Phone
                    </label>
                    <input
                      type="text"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Business Registered Address
                    </label>
                    <input
                      type="text"
                      value={profileForm.address}
                      onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Payout Method / Address */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Payout Method / Settlement Address (USDC / USDT / Bank)
                  </label>
                  <input
                    type="text"
                    value={profileForm.walletAddress}
                    onChange={(e) => setProfileForm({ ...profileForm, walletAddress: e.target.value })}
                    placeholder="e.g. USDC (ERC20/SPL), USDT, Bank account routing, or payout address"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Shop Bio */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Public Tagline / Bio
                  </label>
                  <textarea
                    rows={3}
                    value={profileForm.description}
                    onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 resize-none font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95"
                >
                  Save Shop Settings
                </button>
              </form>
            </div>
          )}

        </main>

      </div>

      {/* ========================================================================= */}
      {/* PRICE CUSTOMIZER & MARGIN CALCULATOR MODAL                                */}
      {/* ========================================================================= */}
      {pricingModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-fade-in-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-emerald-600" />
                <span>Customize Retail Price & Profit</span>
              </h3>
              <button onClick={() => setPricingModalItem(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                  <Image src={pricingModalItem.image || '/logo.png'} alt="Preview" fill className="object-cover" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-2">{pricingModalItem.name}</h4>
                  <span className="text-[11px] text-slate-500 font-mono">Wholesale: ${pricingModalItem.basePrice.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Your Store Listing Price ($ USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min={pricingModalItem.basePrice}
                  max={pricingModalItem.basePrice * (1 + currentTierMargin / 100)}
                  value={customPriceInput}
                  onChange={(e) => setCustomPriceInput(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Profit Calculation Matrix */}
              <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Wholesale Sourcing Base:</span>
                  <span className="font-mono font-bold">${pricingModalItem.basePrice.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Your Retail Price:</span>
                  <span className="font-mono font-bold">${customPriceInput.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-emerald-700 font-black text-sm">
                  <span>Net Profit to Your Wallet:</span>
                  <span className="font-mono">+${Math.max(0, customPriceInput - pricingModalItem.basePrice).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setPricingModalItem(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePrice}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md"
              >
                Save & List
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INSTANT CRYPTO WITHDRAWAL MODAL                                          */}
      {/* ========================================================================= */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-fade-in-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <span>Request Smart-Contract Payout</span>
              </h3>
              <button onClick={() => setShowWithdrawModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Withdrawal Currency
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['USDC', 'USDT', 'ETH', 'SOL'].map((curr) => (
                    <button
                      type="button"
                      key={curr}
                      onClick={() => setWithdrawCurrency(curr)}
                      className={`py-2 rounded-xl font-bold border transition-all ${
                        withdrawCurrency === curr
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Amount ($ USD)
                </label>
                <input
                  required
                  type="number"
                  step="1"
                  min="1"
                  max={walletData?.walletBalance || 2450}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Destination Address
                </label>
                <input
                  required
                  type="text"
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
                  placeholder="0x... or Solana address"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 text-[11px] space-y-1">
                <div className="flex justify-between font-bold">
                  <span>Network Fee:</span>
                  <span>$0.00 (Gasless Sponsored)</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Settlement Time:</span>
                  <span>~1-3 On-Chain Confirmations</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={withdrawLoading}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                {withdrawLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>Execute On-Chain Payout</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* UPGRADE TIER MODAL                                                       */}
      {/* ========================================================================= */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-fade-in-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Upgrade Reseller Shop Tier</span>
              </h3>
              <button onClick={() => setShowUpgradeModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Higher shop tiers unlock higher maximum profit margins and exclusive storefront perks:
            </p>

            <div className="space-y-2.5">
              {[
                { tier: 'BRONZE', name: 'Bronze Shop', margin: 20, desc: 'Starter Tier • Up to +20% profit margin' },
                { tier: 'SILVER', name: 'Silver Shop', margin: 25, desc: 'Growth Tier • Up to +25% profit margin' },
                { tier: 'GOLD', name: 'Gold Shop', margin: 30, desc: 'Pro Tier • Up to +30% profit margin + Homepage feature' },
                { tier: 'PLATINUM', name: 'Platinum Shop', margin: 35, desc: 'Elite Tier • Up to +35% profit margin + Verified medal' },
              ].map((t) => {
                const isCurrent = shop?.tier === t.tier;
                return (
                  <div
                    key={t.tier}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                      isCurrent ? 'bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-400' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <TierMedal tier={t.tier} size="md" />
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{t.name}</span>
                          <span className="font-mono text-emerald-700 font-black">+{t.margin}%</span>
                        </div>
                        <p className="text-[11px] text-slate-500">{t.desc}</p>
                      </div>
                    </div>

                    {isCurrent ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-white px-2.5 py-1 rounded-md border border-emerald-200">
                        Current Tier
                      </span>
                    ) : (
                      <button
                        onClick={() => handleUpgradeTier(t.tier)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-lg transition-colors shadow-sm"
                      >
                        Select Tier
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="text-xs font-bold text-slate-500 hover:text-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
