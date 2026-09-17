'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useBuyerAuth } from '@/context/BuyerAuthContext';
import { api } from '@/lib/api';
import { 
  ShoppingBag, Truck, Package, ShieldCheck, 
  User, MapPin, Key, Heart, LogOut, ArrowRight, 
  CheckCircle2, Copy, Check, ExternalLink, RefreshCw, AlertCircle 
} from 'lucide-react';

export default function BuyerAccountPage() {
  const router = useRouter();
  const { buyer, token, isLoading, logout, updateProfile } = useBuyerAuth();

  const [activeTab, setActiveTab] = useState<'orders' | 'address' | 'profile' | 'impact'>('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [copiedTracking, setCopiedTracking] = useState<string | null>(null);

  // Address form
  const [streetAddress, setStreetAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [stateProvince, setStateProvince] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('United States');
  const [addressSaved, setAddressSaved] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);

  // Profile form
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && !buyer) {
      router.push('/login?redirect=/account');
    }
  }, [buyer, isLoading, router]);

  useEffect(() => {
    if (buyer) {
      setProfileName(buyer.name || '');
      setProfilePhone(buyer.phone || '');

      if (buyer.savedAddress) {
        setStreetAddress(buyer.savedAddress.address || '');
        setApartment(buyer.savedAddress.apartment || '');
        setCity(buyer.savedAddress.city || '');
        setStateProvince(buyer.savedAddress.stateProvince || '');
        setZipCode(buyer.savedAddress.zipCode || '');
        setCountry(buyer.savedAddress.country || 'United States');
      }

      // Fetch buyer orders
      api.buyer.getOrders()
        .then((data) => {
          if (Array.isArray(data)) setOrders(data);
        })
        .catch((err) => console.error('Failed to load orders:', err))
        .finally(() => setOrdersLoading(false));
    }
  }, [buyer]);

  const handleCopyTracking = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedTracking(num);
    setTimeout(() => setCopiedTracking(null), 2500);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressLoading(true);
    setAddressSaved(false);

    try {
      await updateProfile({
        savedAddress: {
          address: streetAddress.trim(),
          apartment: apartment.trim() || undefined,
          city: city.trim(),
          stateProvince: stateProvince.trim(),
          zipCode: zipCode.trim(),
          country: country.trim(),
        },
      });
      setAddressSaved(true);
      setTimeout(() => setAddressSaved(false), 3500);
    } catch (err: any) {
      console.error(err);
    } finally {
      setAddressLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage(null);
    setProfileError(null);

    try {
      const payload: any = {
        name: profileName.trim(),
        phone: profilePhone.trim() || null,
      };

      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      await updateProfile(payload);
      setProfileMessage('Profile settings updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setProfileMessage(null), 4000);
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  if (isLoading || !buyer) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* Top Bar Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-3 group">
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
                  Buyer Account
                </span>
              </div>
            </Link>

            {/* Top Right Controls */}
            <div className="flex items-center gap-3">
              <Link 
                href="/"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors border border-slate-200"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Store Catalog</span>
              </Link>

              <button
                onClick={() => {
                  logout();
                  router.push('/');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-colors border border-rose-200"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full space-y-8">
        
        {/* User Hero Banner */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 text-white flex items-center justify-center font-mono font-bold text-2xl uppercase shadow-xs">
              {buyer.name?.[0] || 'B'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {buyer.name}
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Verified Buyer
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {buyer.email} {buyer.phone && `• ${buyer.phone}`}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
            <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-2xl text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Orders Placed</span>
              <span className="text-lg font-black text-slate-900 font-mono">{orders.length}</span>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-2xl text-center">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Impact Generated</span>
              <span className="text-lg font-black text-emerald-800 font-mono">${totalSpent.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'orders'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>My Orders & Tracking ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('address')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'address'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Saved Shipping Address</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'profile'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile & Security</span>
          </button>

          <button
            onClick={() => setActiveTab('impact')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'impact'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Heart className="w-4 h-4 text-rose-500" />
            <span>On-Chain Impact Proofs</span>
          </button>
        </div>

        {/* TAB 1: ORDERS & TRACKING */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {ordersLoading ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
                <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-500">Loading your orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 space-y-4">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">No Orders Placed Yet</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    When you purchase merchandise, your package tracking, courier dispatch, and blockchain impact receipts will appear here.
                  </p>
                </div>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-primary-600/20"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Start Shopping Catalog</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const items: any[] = Array.isArray(order.items) ? order.items : [];
                  const isDelivered = order.status === 'DELIVERED';
                  const isInTransit = order.status === 'IN_TRANSIT';

                  return (
                    <div 
                      key={order.id} 
                      className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 hover:border-slate-300 transition-all"
                    >
                      {/* Order Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-black text-slate-900 font-mono">
                              #{order.orderNumber}
                            </span>
                            <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                              isDelivered 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                : isInTransit 
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">
                            Ordered on {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        </div>

                        {/* Total Amount */}
                        <div className="text-left sm:text-right">
                          <div className="text-lg font-black text-slate-900 font-mono">
                            ${order.totalAmount.toFixed(2)} USD
                          </div>
                          <span className="text-xs text-emerald-600 font-mono font-bold">
                            {order.cryptoAmount} {order.cryptoSymbol}
                          </span>
                        </div>
                      </div>

                      {/* Package Courier & Tracking Box */}
                      <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                            <Truck className="w-4 h-4 text-emerald-600" />
                            <span>{order.carrier}</span>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-500 font-normal">{order.estimatedDelivery}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 select-all">
                              {order.trackingNumber}
                            </span>
                            <button
                              onClick={() => handleCopyTracking(order.trackingNumber)}
                              className="p-1.5 text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                              title="Copy Tracking Number"
                            >
                              {copiedTracking === order.trackingNumber ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        <Link
                          href={`/track?id=${encodeURIComponent(order.trackingNumber)}`}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Track Live Shipment</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                      {/* Itemized List */}
                      <div className="space-y-3">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Purchased Merchandise ({items.length} item{items.length > 1 ? 's' : ''})
                        </span>
                        
                        <div className="divide-y divide-slate-100">
                          {items.map((item, idx) => (
                            <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-3">
                                {item.image && (
                                  <img 
                                    src={item.image} 
                                    alt={item.name} 
                                    className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0 bg-slate-50"
                                  />
                                )}
                                <div>
                                  <span className="font-bold text-slate-900 truncate max-w-sm block">
                                    {item.name}
                                  </span>
                                  <span className="text-[11px] text-slate-400">
                                    Qty: {item.quantity} • ${item.price?.toFixed(2)} each
                                  </span>
                                </div>
                              </div>

                              <span className="font-mono font-bold text-slate-900">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Designated Cause Proof Footer */}
                      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                          <Heart className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                          <span>100% Proceeds Allocated: <strong>{order.causeTitle}</strong></span>
                        </div>

                        {order.txHash && (
                          <div className="font-mono text-[11px] text-slate-400 truncate max-w-xs">
                            Tx: {order.txHash.slice(0, 16)}...
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SAVED ADDRESS */}
        {activeTab === 'address' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm max-w-2xl space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900">
                Default Shipping Address
              </h2>
              <p className="text-xs text-slate-500">
                This address will be automatically filled during checkout for fast, 1-click orders.
              </p>
            </div>

            {addressSaved && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800 font-medium animate-fade-in-up">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Shipping address saved successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveAddress} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Street Address
                </label>
                <input 
                  type="text"
                  required
                  placeholder="742 Evergreen Terrace"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Apt / Suite
                  </label>
                  <input 
                    type="text"
                    placeholder="Apt 4B"
                    value={apartment}
                    onChange={(e) => setApartment(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    City
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="Springfield"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Postal / Zip Code
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="97477"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    State / Province
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="Oregon"
                    value={stateProvince}
                    onChange={(e) => setStateProvince(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Country
                  </label>
                  <select 
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:outline-none focus:border-primary-500 focus:bg-white transition-all"
                  >
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Germany">Germany</option>
                    <option value="Ethiopia">Ethiopia</option>
                    <option value="Australia">Australia</option>
                    <option value="Singapore">Singapore</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={addressLoading}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-primary-600/20 cursor-pointer"
              >
                {addressLoading ? 'Saving Address...' : 'Save Default Address'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: PROFILE & SECURITY */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm max-w-2xl space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900">
                Account Details & Password
              </h2>
              <p className="text-xs text-slate-500">
                Update your contact details or set a new account password.
              </p>
            </div>

            {profileMessage && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800 font-medium animate-fade-in-up">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{profileMessage}</span>
              </div>
            )}

            {profileError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs text-rose-700 font-medium animate-fade-in-up">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Full Name
                </label>
                <input 
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-primary-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Phone Number
                </label>
                <input 
                  type="tel"
                  placeholder="+1 (555) 019-2834"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-primary-500 focus:bg-white"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Change Password (Optional)
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    Current Password
                  </label>
                  <input 
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-primary-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    New Password
                  </label>
                  <input 
                    type="password"
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-primary-500 focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={profileLoading}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-primary-600/20 cursor-pointer"
              >
                {profileLoading ? 'Updating Profile...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: IMPACT PROOFS */}
        {activeTab === 'impact' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900">
                Your Humanitarian Giving Footprint
              </h2>
              <p className="text-xs text-slate-500">
                Every purchase made with your buyer account is cryptographically escrowed to fund transparent on-chain charity initiatives.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                <span className="text-2xl">💧</span>
                <h4 className="font-bold text-sm text-slate-900">Clean Water Wells</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Funding solar-powered community borehole pumps across East Africa.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 space-y-2">
                <span className="text-2xl">📚</span>
                <h4 className="font-bold text-sm text-slate-900">Education & Digital Labs</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Equipping rural elementary schools with laptops, connectivity, and scholarships.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-teal-50 border border-teal-200 space-y-2">
                <span className="text-2xl">🏥</span>
                <h4 className="font-bold text-sm text-slate-900">Emergency Healthcare</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Direct medical supplies and maternal health kits dispatched to remote clinics.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider block">
                  Transparency Guarantee
                </span>
                <p className="text-xs text-slate-300">
                  All platform disbursement proofs are audited via multi-signature smart contracts on Ethereum & Polygon.
                </p>
              </div>

              <a
                href={`${process.env.NEXT_PUBLIC_APP_URL || "https://aderafoundation.com"}/causes`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl whitespace-nowrap shadow-sm"
              >
                <span>Explore All Causes</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
